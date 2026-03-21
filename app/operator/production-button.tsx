"use client"

import { useState } from "react"
import { finishProduction } from "@/app/actions/production"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"

export function ProductionButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    const result = await finishProduction(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Produksi selesai dan stok telah dipotong otomatis")
      setOpen(false)
    }
  }

  return (
    <div className="w-full">
      <Button 
        className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white" 
        onClick={() => setOpen(true)}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Selesai Cetak & Input QC
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Laporan Quality Control (QC)</DialogTitle>
          </DialogHeader>
          
          <form action={onSubmit} className="space-y-6 mt-4">
            <input type="hidden" name="orderId" value={orderId} />
            
            <div className="space-y-2">
              <label htmlFor="qcStatus" className="text-sm font-medium">Status Pengecekan</label>
              <Select name="qcStatus" required defaultValue="PASSED">
                <SelectTrigger id="qcStatus" className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="PASSED">Lolos QC (Sempurna)</SelectItem>
                  <SelectItem value="NEEDS_REWORK">Perlu Perbaikan (Ada cacat minor)</SelectItem>
                  <SelectItem value="REJECTED">Gagal / Tolak (Cetak ulang)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="qcNotes" className="text-sm font-medium">Catatan Tambahan</label>
              <Textarea 
                id="qcNotes"
                name="qcNotes" 
                placeholder="Berikan catatan jika ada warna meleset, bahan rusak, dll..." 
                className="w-full min-h-25"
              />
            </div>

            <div className="flex justify-end pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? "Menyimpan..." : "Simpan & Potong Stok"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}