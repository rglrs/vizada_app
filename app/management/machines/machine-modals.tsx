"use client"

import { useState } from "react"
import { createMachine, updateMachine, deleteMachine } from "@/app/actions/machine"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Loader2, Edit, Trash2 } from "lucide-react"

interface Machine {
  id: string
  name: string
  status: string
}

export function CreateMachineModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createMachine(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Mesin berhasil ditambahkan")
      setIsOpen(false)
      ;(e.target as HTMLFormElement).reset()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={buttonVariants({ className: "gap-2 cursor-pointer" })}>
        <Plus className="h-4 w-4" /> Tambah Mesin
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Mesin Cetak</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mesin</Label>
            <Input
              id="name"
              name="name"
              placeholder="Mesin Cetak UV 100x60"
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Mesin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditMachineModal({ machine }: { machine: Machine }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateMachine(machine.id, formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Mesin berhasil diperbarui")
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
          <DialogTitle>Edit Mesin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mesin</Label>
            <Input
              id="name"
              name="name"
              defaultValue={machine.name}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={machine.status} required>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                <SelectItem value="IN_USE">Digunakan</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Perbarui Mesin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteMachineModal({ machineId }: { machineId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteMachine(machineId)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Mesin berhasil dihapus")
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
          <DialogTitle>Hapus Mesin</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus mesin ini?</p>
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
