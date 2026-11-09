"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

export async function createOrder(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Anda belum login" }
    }
    const productId = formData.get("productId") as string
    const qty = parseInt(formData.get("qty") as string)
    const deadline = new Date(formData.get("deadline") as string)
    const specifications = JSON.parse(formData.get("specifications") as string)
    const file = formData.get("file") as File
    if (!productId || isNaN(qty) || qty < 1 || !deadline) {
      return { error: "Data pesanan tidak lengkap" }
    }
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return { error: "Produk tidak ditemukan" }
    }
    const designMode = (formData.get("designMode") as string) || "CUSTOM"
    let fileUrl: string | null = null

    if (designMode === "TEMPLATE") {
      const templateDesignId = formData.get("templateDesignId") as string
      if (!templateDesignId) {
        return { error: "Silakan pilih salah satu template desain yang disediakan" }
      }
      const templateDesign = await prisma.productDesign.findUnique({
        where: { id: templateDesignId }
      })
      if (!templateDesign) {
        return { error: "Template desain tidak ditemukan" }
      }
      fileUrl = templateDesign.imageUrl
      specifications.designMode = "TEMPLATE"
      specifications.templateTitle = templateDesign.title
      specifications.templateDesignId = templateDesign.id
    } else {
      specifications.designMode = "CUSTOM"
      if (!file || file.size === 0) {
        return { error: "Silakan upload file desain Anda untuk mode Custom Desain" }
      }
      const MAX_FILE_SIZE = 10 * 1024 * 1024
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (file.size > MAX_FILE_SIZE) {
        return { error: "Ukuran file desain maksimal 10MB" }
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return { error: "Format file desain tidak didukung, gunakan JPG, PNG, atau PDF" }
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadDir = join(process.cwd(), "public", "uploads", "designs")
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      const fileName = `design-${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      fileUrl = `/uploads/designs/${fileName}`
    }
    const subtotal = product.basePrice * qty
    const now = new Date()
    const orderNumber = `VZ-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        totalAmount: subtotal,
        deadline,
        items: {
          create: {
            productId,
            qty,
            specifications,
            subtotal,
            fileUrl
          }
        }
      }
    })

    // Kirim notifikasi WhatsApp otomatis (non-blocking)
    try {
      const customer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, phone: true }
      })

      const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }).format(subtotal)

      const formattedDeadline = deadline.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      })

      // 1. Notifikasi WhatsApp ke Customer
      if (customer?.phone) {
        sendWhatsAppMessage({
          phone: customer.phone,
          message:
`Halo Kak *${customer.name}*! 👋
Terima kasih telah memesan di *Vizada Digital Printing*.

📄 *No. Invoice:* #${orderNumber}
📦 *Layanan:* ${product.name} (${qty} ${product.unit || "pcs"})
💰 *Total Tagihan:* ${formattedTotal}
⏰ *Estimasi Deadline:* ${formattedDeadline}
📌 *Status:* Menunggu Pembayaran

Silakan transfer dan upload bukti pembayaran di detail pesanan Anda melalui website.
Terima kasih!`
        })
      }

      // 2. Notifikasi WhatsApp ke Admin
      const adminPhone = process.env.WHATSAPP_ADMIN_PHONE
      if (adminPhone) {
        sendWhatsAppMessage({
          phone: adminPhone,
          message:
`🔔 *PESANAN BARU MASUK!*
No. Invoice: #${orderNumber}
Customer: ${customer?.name || "Pelanggan"} (${customer?.phone || "Tanpa No. HP"})
Layanan: ${product.name} (${qty} ${product.unit || "pcs"})
Total: ${formattedTotal}
Deadline: ${formattedDeadline}

Segera cek dashboard admin untuk detail pesanan.`
        })
      }
    } catch (waErr) {
      console.warn("[WhatsApp Notification Error]:", waErr)
    }

    revalidatePath("/orders")
    revalidatePath("/admin/orders")
    return { success: true, orderId: order.id }
  } catch {
    return { error: "Gagal membuat pesanan" }
  }
}