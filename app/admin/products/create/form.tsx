"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct, createCategory } from "@/app/actions/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

interface Category {
  id: string;
  name: string;
}

interface CreateProductFormProps {
  categories: Category[];
}

export default function CreateProductForm({ categories }: CreateProductFormProps) {
  const router = useRouter()
  const [isLoadingProd, setIsLoadingProd] = useState(false)
  const [isLoadingCat, setIsLoadingCat] = useState(false)
  const [categoryId, setCategoryId] = useState("")

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoadingProd(true)
    const formData = new FormData(e.currentTarget)
    
    if (!categoryId) {
      toast.error("Silakan pilih kategori produk terlebih dahulu")
      setIsLoadingProd(false)
      return
    }

    const result = await createProduct(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoadingProd(false)
    } else {
      toast.success("Produk berhasil ditambahkan!")
      router.push("/admin/products")
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoadingCat(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await createCategory(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Kategori baru berhasil ditambahkan!")
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsLoadingCat(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px] items-start">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk Baru</CardTitle>
          <CardDescription>Masukkan detail layanan cetak yang akan ditawarkan ke pelanggan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input id="name" name="name" placeholder="Contoh: Cetak Banner Flexi 280gr" required />
            </div>
            
            <div className="space-y-2">
              <Label>Kategori</Label>
              <input type="hidden" name="categoryId" value={categoryId} />
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value || "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori produk">
                    {categoryId ? categories.find((cat) => cat.id === categoryId)?.name : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <SelectItem value="empty" disabled>Belum ada kategori</SelectItem>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Harga Dasar (Rp)</Label>
                <Input id="basePrice" name="basePrice" type="number" min="0" placeholder="15000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Satuan Hitung</Label>
                <Input id="unit" name="unit" placeholder="Contoh: Meter, Lembar, Pcs" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Input id="description" name="description" placeholder="Penjelasan singkat mengenai produk ini" />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isLoadingProd || categories.length === 0}>
              {isLoadingProd ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Produk"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-lg">Tambah Kategori</CardTitle>
          <CardDescription>Buat kategori baru jika belum tersedia di pilihan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Nama Kategori</Label>
              <Input id="catName" name="name" placeholder="Contoh: Large Format" required />
            </div>
            <Button type="submit" variant="secondary" className="w-full" disabled={isLoadingCat}>
              {isLoadingCat ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Tambah Kategori</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}