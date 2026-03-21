"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateProduct } from "@/app/actions/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  categoryId: string
  description: string | null
  basePrice: number
  unit: string
}

interface EditProductFormProps {
  product: Product
  categories: Category[]
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categoryId, setCategoryId] = useState(product.categoryId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    
    if (!categoryId) {
      toast.error("Silakan pilih kategori produk")
      setIsLoading(false)
      return
    }

    const result = await updateProduct(product.id, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success("Produk berhasil diperbarui!")
      router.push("/admin/products")
      router.refresh()
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" name="name" defaultValue={product.name} required />
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
              <Input 
                id="basePrice" 
                name="basePrice" 
                type="number" 
                min="0" 
                defaultValue={product.basePrice} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan Hitung</Label>
              <Input 
                id="unit" 
                name="unit" 
                defaultValue={product.unit} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Input 
              id="description" 
              name="description" 
              defaultValue={product.description || ""} 
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}