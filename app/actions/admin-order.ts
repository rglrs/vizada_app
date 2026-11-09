"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@/app/generated/prisma/client"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

const validTransitions: Record<string, string[]> = {
  PENDING_PAYMENT: ["WAITING_APPROVAL", "CANCELLED"],
  WAITING_APPROVAL: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: []
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGEMENT") {
      return { error: "Anda tidak memiliki akses untuk mengubah status pesanan" }
    }
    const order = await prisma.order.findUnique({ 
      where: { id: orderId },
      include: { customer: true }
    })
    if (!order) {
      return { error: "Pesanan tidak ditemukan" }
    }
    const allowedNextStatuses = validTransitions[order.status] || []
    if (!allowedNextStatuses.includes(newStatus)) {
      return { error: `Perubahan status ilegal. Tidak bisa merubah dari ${order.status} ke ${newStatus}` }
    }
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus }
      })

      if (newStatus === "IN_PRODUCTION") {
        await tx.payment.updateMany({
          where: { orderId },
          data: {
            status: "PAID",
            paidAt: new Date()
          }
        })

        // Otomatis catat kas masuk di Manajemen Keuangan
        let salesCategory = await tx.financialCategory.findFirst({
          where: { type: "PEMASUKAN", name: { contains: "Penjualan", mode: "insensitive" } }
        })
        if (!salesCategory) {
          salesCategory = await tx.financialCategory.findFirst({
            where: { type: "PEMASUKAN" }
          })
        }
        if (!salesCategory) {
          salesCategory = await tx.financialCategory.create({
            data: { name: "Penjualan Layanan Cetak", type: "PEMASUKAN" }
          })
        }

        const paymentRecord = await tx.payment.findUnique({ where: { orderId } })
        const incomingAmount = paymentRecord?.amount ?? order.totalAmount

        await tx.financialTransaction.create({
          data: {
            categoryId: salesCategory.id,
            type: "PEMASUKAN",
            amount: incomingAmount,
            description: `Pendapatan Pesanan #${order.orderNumber}`
          }
        })

        // Inisialisasi ProductionJob untuk setiap item pesanan
        const orderWithItems = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { productionJob: true } } }
        })
        if (orderWithItems) {
          for (const item of orderWithItems.items) {
            if (!item.productionJob) {
              await tx.productionJob.create({
                data: {
                  orderItemId: item.id,
                  status: "QUEUE"
                }
              })
            }
          }
        }
      } else if (newStatus === "CANCELLED") {
        await tx.payment.updateMany({
          where: { orderId, status: "PENDING" },
          data: { status: "FAILED" }
        })
      }
    })

    // Kirim notifikasi WhatsApp pembaruan status ke Customer (non-blocking)
    try {
      if (order.customer?.phone) {
        if (newStatus === "IN_PRODUCTION") {
          sendWhatsAppMessage({
            phone: order.customer.phone,
            message:
`Halo Kak *${order.customer.name}*! 🛠️
Pembayaran pesanan *#${order.orderNumber}* telah kami verifikasi.

Pesanan Anda saat ini sudah masuk ke antrean *PRODUKSI & CETAK*. Kami akan memproses pesanan Anda dengan kualitas terbaik!`
          })
        } else if (newStatus === "READY_FOR_PICKUP") {
          sendWhatsAppMessage({
            phone: order.customer.phone,
            message:
`Kabar gembira Kak *${order.customer.name}*! 🎉
Pesanan cetak Anda *#${order.orderNumber}* telah *SELESAI* dan lolos pengecekan Quality Control.

📍 Pesanan sekarang *SIAP DIAMBIL* di workshop Vizada Printing. Terima kasih atas kepercayaan Anda!`
          })
        } else if (newStatus === "COMPLETED") {
          sendWhatsAppMessage({
            phone: order.customer.phone,
            message:
`Terima kasih banyak Kak *${order.customer.name}*! 🙏
Pesanan *#${order.orderNumber}* telah ditandai *SELESAI / DIAMBIL*.

Senang dapat melayani kebutuhan percetakan Anda. Sampai jumpa di pesanan berikutnya!`
          })
        } else if (newStatus === "CANCELLED") {
          sendWhatsAppMessage({
            phone: order.customer.phone,
            message:
`Pemberitahuan: Pesanan *#${order.orderNumber}* telah berstatus *DIBATALKAN*.
Jika ada kendala atau pertanyaan, silakan hubungi customer support Vizada Printing.`
          })
        }
      }
    } catch (waErr) {
      console.warn("[WhatsApp Notification Error]:", waErr)
    }

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/management")
    revalidatePath("/management/finance")
    revalidatePath("/management/schedule")
    revalidatePath("/operator")
    return { success: true }
  } catch {
    return { error: "Terjadi kesalahan saat memperbarui status" }
  }
}