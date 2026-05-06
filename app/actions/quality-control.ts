"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { QCChecklistStatus, Prisma } from "@/app/generated/prisma/client"

interface ChecklistItem {
  name: string
  status: QCChecklistStatus
  notes?: string
}

export async function submitQCCheck(formData: FormData) {
  const productionJobId = formData.get("productionJobId") as string
  const checklistJson = formData.get("checklist") as string
  const notes = formData.get("notes") as string
  if (!productionJobId) {
    return { error: "Production job wajib diisi" }
  }
  try {
    const checklist: ChecklistItem[] = JSON.parse(checklistJson || "[]")
    const statuses = checklist.map(item => item.status)
    let overallStatus: QCChecklistStatus = QCChecklistStatus.PASSED
    if (statuses.includes(QCChecklistStatus.REJECTED)) {
      overallStatus = QCChecklistStatus.REJECTED
    } else if (statuses.includes(QCChecklistStatus.NEEDS_REWORK)) {
      overallStatus = QCChecklistStatus.NEEDS_REWORK
    }
    await prisma.$transaction(async (tx) => {
      await Promise.all(
        checklist.map(item =>
          tx.qCChecklistItem.create({
            data: {
              productionJobId,
              checkName: item.name,
              status: item.status,
              notes: item.notes || null
            }
          })
        )
      )
      await tx.productionJob.update({
        where: { id: productionJobId },
        data: { status: "QC_CHECK" }
      })
    })
    revalidatePath("/operator/quality-control")
    return { success: true, overallStatus, notes }
  } catch {
    return { error: "Gagal mengirim QC check" }
  }
}

export async function uploadQCPhoto(formData: FormData) {
  const productionJobId = formData.get("productionJobId") as string
  const photoUrl = formData.get("photoUrl") as string
  const notes = formData.get("notes") as string
  if (!productionJobId || !photoUrl) {
    return { error: "Production job dan foto wajib diisi" }
  }
  try {
    await prisma.photoRecord.create({
      data: { productionJobId, photoUrl, notes }
    })
    revalidatePath("/operator/quality-control")
    return { success: true }
  } catch {
    return { error: "Gagal upload foto QC" }
  }
}

export async function deleteQCPhoto(photoId: string) {
  try {
    await prisma.photoRecord.delete({ where: { id: photoId } })
    revalidatePath("/operator/quality-control")
    return { success: true }
  } catch {
    return { error: "Gagal menghapus foto" }
  }
}

export async function getQCQueue() {
  const jobs = await prisma.productionJob.findMany({
    where: { status: "QC_CHECK" },
    include: {
      orderItem: { include: { order: true, product: true } },
      qcItems: true,
      photos: true
    },
    orderBy: { createdAt: "asc" }
  })
  return jobs
}

export async function getQCStatistics() {
  const [total, passed, rejected, rework] = await Promise.all([
    prisma.qCChecklistItem.count(),
    prisma.qCChecklistItem.count({ where: { status: QCChecklistStatus.PASSED } }),
    prisma.qCChecklistItem.count({ where: { status: QCChecklistStatus.REJECTED } }),
    prisma.qCChecklistItem.count({ where: { status: QCChecklistStatus.NEEDS_REWORK } })
  ])
  return {
    total,
    passed,
    rejected,
    rework,
    passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : "0"
  }
}

export async function getQCHistory(filters?: {
  status?: QCChecklistStatus
  page?: number
  limit?: number
}) {
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const skip = (page - 1) * limit
  const where: Prisma.QCChecklistItemWhereInput = {}
  if (filters?.status) where.status = filters.status
  const [items, total] = await Promise.all([
    prisma.qCChecklistItem.findMany({
      where,
      include: { productionJob: { include: { orderItem: { include: { product: true } } } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.qCChecklistItem.count({ where })
  ])
  return {
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) }
  }
}