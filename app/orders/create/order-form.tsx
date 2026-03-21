"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createOrder } from "@/app/actions/order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Loader2, UploadCloud } from "lucide-react"
import Link from "next/link"

interface ProductProps {
  id: string
  name: string
  basePrice: number
  unit: string
  category: { name: string }
}

export default function OrderForm({ product }: { product: ProductProps }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [qty, setQty] = useState(1)

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const specObj = {
      notes: formData.get("notes") as string,
    }
    
    formData.append("specifications", JSON.stringify(specObj))
    formData.append("productId", product.id)

    const result = await createOrder(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      toast.success("Pesanan berhasil dibuat!")
      router.push(`/orders/${result.orderId}`)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/products">
        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
        </Button>
      </Link>
      
      <Card className="border-0 shadow-lg bg-background">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Buat Pesanan</CardTitle>
          <CardDescription>
            Lengkapi detail spesifikasi pesanan untuk <strong>{product.name}</strong>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Kategori Layanan</Label>
                <Input value={product.category.name} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Harga Dasar</Label>
                <Input value={`${formatRupiah(product.basePrice)} / ${product.unit}`} disabled className="bg-muted/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">Jumlah ({product.unit})</Label>
              <Input 
                id="qty" 
                name="qty" 
                type="number" 
                min="1" 
                value={qty} 
                onChange={(e) => setQty(parseInt(e.target.value) || 1)} 
                required 
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Tenggat Waktu Selesai (Deadline)</Label>
              <Input 
                id="deadline" 
                name="deadline" 
                type="date" 
                required 
                disabled={isLoading}
              />
            </div>

            {/* Bagian Input File yang diubah */}
            <div className="space-y-2">
              <Label htmlFor="file">Upload File Desain</Label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Input 
                    id="file" 
                    name="file" 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    required 
                    disabled={isLoading}
                    className="cursor-pointer file:cursor-pointer file:bg-primary/10 file:text-primary file:font-semibold file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-primary/20"
                  />
                </div>
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Format yang didukung: JPG, PNG, atau PDF. Maksimal ukuran sesuai batas lokal (Tugas Akhir).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Spesifikasi Tambahan</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Contoh: Cetak ukuran 2x3 meter, bahan flexi 280gr, berikan mata ayam di 4 sudut." 
                rows={4}
                required 
                disabled={isLoading}
              />
            </div>

            <div className="p-4 bg-primary/5 rounded-lg flex justify-between items-center border border-primary/20">
              <span className="font-medium">Estimasi Total Biaya</span>
              <span className="text-2xl font-bold text-primary">{formatRupiah(product.basePrice * qty)}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Kirim Pesanan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}