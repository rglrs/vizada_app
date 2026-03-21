"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@/app/generated/prisma/client"

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

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { error: "Pesanan tidak ditemukan" }

    const allowedNextStatuses = validTransitions[order.status] || []
    
    if (!allowedNextStatuses.includes(newStatus)) {
      return { error: `Perubahan status ilegal. Tidak bisa merubah dari ${order.status} ke ${newStatus}` }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    })

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    
    return { success: true }
  } catch {
    return { error: "Terjadi kesalahan saat memperbarui status" }
  }
}