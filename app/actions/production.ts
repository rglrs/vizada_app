"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { QCStatus } from "@/app/generated/prisma/client"

export async function finishProduction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Sesi tidak valid atau belum login" }
    }

    const role = session.user.role
    if (role !== "OPERATOR" && role !== "ADMIN" && role !== "MANAGEMENT") {
      return { error: "Anda tidak memiliki akses" }
    }

    const orderId = formData.get("orderId") as string
    const qcStatus = formData.get("qcStatus") as QCStatus
    const qcNotes = formData.get("qcNotes") as string

    if (!orderId || !qcStatus) {
      return { error: "Data Quality Control tidak lengkap" }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: {
          include: {
            product: {
              include: { materials: true }
            }
          }
        }
      }
    })

    if (!order) return { error: "Pesanan tidak ditemukan" }
    if (order.status !== "IN_PRODUCTION") return { error: "Pesanan ini belum disetujui untuk diproduksi" }

    const combinedNotes = `[QC: ${qcStatus}] ${qcNotes ? '- ' + qcNotes : ''}`

    await prisma.$transaction(async (tx) => {
      if (qcStatus === "PASSED") {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "READY_FOR_PICKUP" }
        })
        
        for (const item of order.items) {
          for (const bom of item.product.materials) {
            const totalNeeded = bom.qtyNeeded * item.qty
            
            await tx.material.update({
              where: { id: bom.materialId },
              data: { stockQty: { decrement: totalNeeded } }
            })
            
            await tx.inventoryLog.create({
              data: {
                materialId: bom.materialId,
                type: "OUT",
                qty: totalNeeded,
                notes: `Otomatis: Produksi Order ${order.orderNumber} (${item.product.name})`
              }
            })
          }
        }
      }

      for (const item of order.items) {
        const job = await tx.productionJob.upsert({
          where: { orderItemId: item.id },
          create: {
            orderItemId: item.id,
            operatorId: session.user.id,
            status: "DONE",
            completedAt: new Date()
          },
          update: {
            operatorId: session.user.id,
            status: "DONE",
            completedAt: new Date()
          }
        })

        await tx.qualityControl.upsert({
          where: { productionJobId: job.id },
          create: {
            productionJobId: job.id,
            inspectorId: session.user.id,
            status: qcStatus,
            notes: combinedNotes
          },
          update: {
            inspectorId: session.user.id,
            status: qcStatus,
            notes: combinedNotes
          }
        })
      }
    })

    revalidatePath("/operator")
    revalidatePath("/admin/orders")
    revalidatePath("/management/inventory")

    return { success: true }
  } catch (error: unknown) {
    console.error("DETAIL ERROR PRODUKSI:", error)
    const errMessage = error instanceof Error ? error.message.split('\n').pop() : ""
    
    return { 
      error: errMessage 
        ? `Gagal: ${errMessage}`
        : "Gagal memperbarui status produksi dan memotong stok" 
    }
  }
}