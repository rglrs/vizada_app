"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string
  if (!name) return { error: "Nama kategori wajib diisi" }
  
  await prisma.category.create({ data: { name } })
  revalidatePath("/admin/products")
  revalidatePath("/admin/products/create")
  return { success: true }
}

export async function updateCategory(id: string, name: string) {
  if (!name) return { error: "Nama kategori wajib diisi" }
  
  try {
    await prisma.category.update({
      where: { id },
      data: { name }
    })
    revalidatePath("/admin/products")
    revalidatePath("/admin/products/create")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui kategori" }
  }
}

export async function deleteCategory(id: string) {
  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    })

    if (productsCount > 0) {
      return { error: "Gagal menghapus: Kategori ini masih digunakan oleh produk." }
    }

    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/products")
    revalidatePath("/admin/products/create")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus kategori" }
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  const description = formData.get("description") as string
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const unit = formData.get("unit") as string
  const bomData = formData.get("bom") as string

  if (!name || !categoryId || isNaN(basePrice) || !unit) {
    return { error: "Semua kolom utama wajib diisi dengan format yang benar" }
  }

  let materialsCreate = []
  if (bomData) {
    try {
      const parsedBom = JSON.parse(bomData)
      materialsCreate = parsedBom.map((b: { materialId: string; qtyNeeded: string | number }) => ({
        materialId: b.materialId,
        qtyNeeded: parseFloat(b.qtyNeeded.toString())
      }))
    } catch {
      return { error: "Format bahan baku tidak valid" }
    }
  }

  await prisma.product.create({
    data: { 
      name, 
      categoryId, 
      description, 
      basePrice, 
      unit,
      materials: { create: materialsCreate }
    }
  })

  revalidatePath("/admin/products")
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  const description = formData.get("description") as string
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const unit = formData.get("unit") as string
  const bomData = formData.get("bom") as string

  if (!name || !categoryId || isNaN(basePrice) || !unit) {
    return { error: "Semua kolom utama wajib diisi dengan format yang benar" }
  }

  let materialsCreate = []
  if (bomData) {
    try {
      const parsedBom = JSON.parse(bomData)
      materialsCreate = parsedBom.map((b: { materialId: string; qtyNeeded: string | number }) => ({
        materialId: b.materialId,
        qtyNeeded: parseFloat(b.qtyNeeded.toString())
      }))
    } catch {
      return { error: "Format bahan baku tidak valid" }
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productMaterial.deleteMany({
        where: { productId: id }
      })
      
      await tx.product.update({
        where: { id },
        data: { 
          name, 
          categoryId, 
          description, 
          basePrice, 
          unit,
          materials: { create: materialsCreate }
        }
      })
    })

    revalidatePath("/admin/products")
    return { success: true }
  } catch {
    return { error: "Gagal memperbarui produk" }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath("/admin/products")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus produk" }
  }
}