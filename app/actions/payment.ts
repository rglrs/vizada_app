"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

export async function uploadPaymentProof(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Anda tidak memiliki akses" }
    }
    const orderId = formData.get("orderId") as string
    const method = formData.get("method") as string
    const file = formData.get("file") as File
    if (!orderId || !method || !file || file.size === 0) {
      return { error: "Data pembayaran tidak lengkap" }
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Ukuran file bukti pembayaran maksimal 5MB" }
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Format file tidak didukung, gunakan JPG atau PNG" }
    }
    const order = await prisma.order.findUnique({ 
      where: { id: orderId },
      include: { customer: true }
    })
    if (!order) {
      return { error: "Pesanan tidak ditemukan" }
    }
    const promoUsage = await prisma.promoUsage.findFirst({
      where: { orderId }
    })
    const finalAmount = Math.max(0, order.totalAmount - (promoUsage?.discountAmount || 0))

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = join(process.cwd(), "public", "uploads", "payments")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const fileName = `payment-${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    const proofUrl = `/uploads/payments/${fileName}`

    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        amount: finalAmount,
        method,
        status: "PENDING",
        proofUrl
      },
      update: {
        amount: finalAmount,
        method,
        status: "PENDING",
        proofUrl
      }
    })
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "WAITING_APPROVAL" }
    })

    // Kirim notifikasi WhatsApp upload bukti pembayaran (non-blocking)
    try {
      const formattedAmount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }).format(finalAmount)

      // 1. Notif ke Customer
      if (order.customer?.phone) {
        sendWhatsAppMessage({
          phone: order.customer.phone,
          message:
`Halo Kak *${order.customer.name}*!
Bukti pembayaran Anda untuk pesanan *#${order.orderNumber}* sejumlah *${formattedAmount}* via *${method}* berhasil diunggah.

Status pesanan saat ini: *Menunggu Verifikasi Admin*. Kami akan segera mengonfirmasi dan memulai proses produksi.`
        })
      }

      // 2. Notif ke Admin
      const adminPhone = process.env.WHATSAPP_ADMIN_PHONE
      if (adminPhone) {
        sendWhatsAppMessage({
          phone: adminPhone,
          message:
`💳 *BUKTI PEMBAYARAN MASUK!*
No. Invoice: #${order.orderNumber}
Customer: ${order.customer?.name || "Pelanggan"} (${order.customer?.phone || "-"})
Nominal: ${formattedAmount}
Metode: ${method}

Silakan periksa dan verifikasi pembayaran di dashboard admin.`
        })
      }
    } catch (waErr) {
      console.warn("[WhatsApp Notification Error]:", waErr)
    }

    revalidatePath(`/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true }
  } catch {
    return { error: "Gagal mengunggah bukti pembayaran" }
  }
}