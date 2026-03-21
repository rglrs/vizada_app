import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Tag } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserNav } from "@/components/user-nav"

export default async function CustomerProductsPage() {
  const session = await getServerSession(authOptions)
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  })

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center font-extrabold text-2xl tracking-tighter" href="/">
          VIZADA
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-medium">Daftar</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 mx-auto py-8 md:py-12">
        <div className="flex flex-col space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Katalog Layanan Cetak</h1>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            Pilih layanan cetak yang Anda butuhkan. Kami menyediakan berbagai macam pilihan dengan kualitas terbaik.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-background shadow-sm">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Katalog Masih Kosong</h2>
            <p className="text-muted-foreground mt-2">Belum ada layanan yang ditambahkan saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md border-0 shadow-sm bg-background">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Tag className="mr-1 h-3 w-3" />
                      {product.category.name}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 leading-tight">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-3 mt-2 text-sm h-10">
                    {product.description || "Tidak ada deskripsi tersedia"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Harga mulai dari</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">{formatRupiah(product.basePrice)}</span>
                      <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href={`/orders/create?productId=${product.id}`} className="w-full">
                    <Button className="w-full font-medium" variant="default">
                      Pesan Sekarang
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}