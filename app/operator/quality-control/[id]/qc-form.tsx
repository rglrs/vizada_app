"use client"

import { useState } from "react"
import { submitQCCheck } from "@/app/actions/quality-control"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function QCForm({ productionJobId }: { productionJobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checklist, setChecklist] = useState([
    { name: "Kualitas Warna (Sesuai Proof)", status: "PASSED", notes: "" },
    { name: "Presisi Potongan / Finishing", status: "PASSED", notes: "" },
    { name: "Kebersihan (Bebas Noda/Cacat)", status: "PASSED", notes: "" },
  ])
  const [generalNotes, setGeneralNotes] = useState("")

  const updateChecklist = (index: number, field: string, value: string) => {
    const newChecklist = [...checklist]
    newChecklist[index] = { ...newChecklist[index], [field]: value }
    setChecklist(newChecklist)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("productionJobId", productionJobId)
    formData.append("checklist", JSON.stringify(checklist))
    formData.append("notes", generalNotes)

    const result = await submitQCCheck(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Hasil Quality Control berhasil disimpan!")
      router.push("/operator/quality-control")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Checklist Quality Control</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            {checklist.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border rounded-lg items-start">
                <div className="sm:col-span-4">
                  <p className="font-medium">{item.name}</p>
                </div>
                <div className="sm:col-span-3">
                  <Select 
                    value={item.status} 
                    onValueChange={(val) => updateChecklist(index, "status", val || "PASSED")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASSED">Lolos</SelectItem>
                      <SelectItem value="NEEDS_REWORK">Perbaikan</SelectItem>
                      <SelectItem value="REJECTED">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-5">
                  <Textarea 
                    placeholder="Catatan (opsional)" 
                    value={item.notes}
                    onChange={(e) => updateChecklist(index, "notes", e.target.value)}
                    className="min-h-10 resize-y"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Catatan Keseluruhan (Opsional)</label>
            <Textarea 
              placeholder="Berikan ringkasan jika ada hal yang perlu diperhatikan..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Hasil QC"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
