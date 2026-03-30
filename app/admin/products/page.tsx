import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { ProductActions } from "./product-actions"
import { CategoryManagement } from "./category-management"

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }> | { q?: string; page?: string; limit?: string }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams)
  const q = sp?.q || ""
  const page = parseInt(sp?.page || "1")
  const limit = parseInt(sp?.limit || "10")
  const skip = (page - 1) * limit

  const where = q ? { name: { contains: q, mode: "insensitive" as const } } : {}

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
  ])

  const totalPages = Math.ceil(total / limit)

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Katalog Produk</h1>
          <p className="text-muted-foreground">Kelola daftar layanan percetakan Vizada.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryManagement categories={categories} />
          <Link href="/admin/products/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      <form method="GET" className="flex flex-col sm:flex-row gap-2">
        <Input name="q" defaultValue={q} placeholder="Cari nama produk..." className="sm:max-w-[300px]" />
        <select
          name="limit"
          defaultValue={limit.toString()}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="10">10 data per baris</option>
          <option value="25">25 data per baris</option>
          <option value="50">50 data per baris</option>
        </select>
        <Button type="submit" variant="secondary">Cari</Button>
      </form>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Layanan Tersedia</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Data tidak ditemukan.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga Dasar</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="w-[100px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>{formatRupiah(product.basePrice)}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      <ProductActions productId={product.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-muted-foreground">
                Menampilkan {products.length} dari {total} data
              </span>
              <div className="flex gap-2">
                <Link
                  href={`?q=${q}&limit=${limit}&page=${page - 1}`}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                  Sebelumnya
                </Link>
                <Link
                  href={`?q=${q}&limit=${limit}&page=${page + 1}`}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                  Selanjutnya
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}