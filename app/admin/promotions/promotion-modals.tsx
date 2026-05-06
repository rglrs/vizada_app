"use client"

import { useState } from "react"
import { createPromotion, updatePromotion, deletePromotion } from "@/app/actions/promotion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Loader2, Edit, Trash2 } from "lucide-react"

interface Promotion {
  id: string
  name: string
  type: string
  value: number
  startDate: Date
  endDate: Date
  active: boolean
}

export function CreatePromotionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createPromotion(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Promosi berhasil dibuat")
      setIsOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ className: "gap-2 cursor-pointer" })}>
        <Plus className="h-4 w-4" /> Buat Promosi
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Promosi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Promosi</Label>
            <Input
              id="name"
              name="name"
              placeholder="Diskon Akhir Tahun"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipe Promosi</Label>
            <Select name="type" required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISKON_PERSEN">Diskon Persen (%)</SelectItem>
                <SelectItem value="DISKON_NOMINAL">Diskon Nominal (Rp)</SelectItem>
                <SelectItem value="VOUCHER">Voucher</SelectItem>
                <SelectItem value="BUNDLING">Bundling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Nilai</Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buat Promosi"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditPromotionModal({ promo }: { promo: Promotion }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updatePromotion(promo.id, formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Promosi berhasil diperbarui")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-blue-600 hover:text-blue-800">
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Promosi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Promosi</Label>
            <Input
              id="name"
              name="name"
              defaultValue={promo.name}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipe Promosi</Label>
            <Select name="type" defaultValue={promo.type} required>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISKON_PERSEN">Diskon Persen (%)</SelectItem>
                <SelectItem value="DISKON_NOMINAL">Diskon Nominal (Rp)</SelectItem>
                <SelectItem value="VOUCHER">Voucher</SelectItem>
                <SelectItem value="BUNDLING">Bundling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Nilai</Label>
            <Input
              id="value"
              name="value"
              type="number"
              step="0.01"
              min="0"
              defaultValue={promo.value}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={new Date(promo.startDate).toISOString().split("T")[0]}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={new Date(promo.endDate).toISOString().split("T")[0]}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Perbarui Promosi"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeletePromotionModal({ promoId }: { promoId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deletePromotion(promoId)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Promosi berhasil dihapus")
      setIsOpen(false)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="text-red-600 hover:text-red-800">
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Hapus Promosi</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus promosi ini?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Hapus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
