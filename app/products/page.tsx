import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Tag, Printer, Sparkles, ArrowRight } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserNav } from "@/components/user-nav"

export default async function CustomerProductsPage() {
  const session = await getServerSession(authOptions)
  const products = await prisma.product.findMany({
    include: { category: true, designs: true },
    orderBy: { category: { name: "asc" } },
  })

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Glass Header */}
      <header className="px-6 lg:px-14 h-16 flex items-center border-b border-border/70 sticky top-0 glass-header z-50">
        <Link className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tighter group" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-xs group-hover:scale-105 transition-transform">
            <Printer className="h-4 w-4" />
          </div>
          <span className="text-gradient font-black tracking-tight">VIZADA</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="font-semibold text-xs rounded-xl">
                  Riwayat Pesanan
                </Button>
              </Link>
              <UserNav user={session.user} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-xs">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="btn-gradient font-semibold text-xs rounded-xl">Daftar</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 mx-auto py-8 md:py-12">
        <div className="flex flex-col space-y-2 mb-10 pb-4 border-b border-border/70">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">Katalog Layanan Cetak</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Siap Produksi
            </span>
          </div>
          <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base">
            Pilih layanan percetakan yang Anda butuhkan. Tersedia beragam template siap cetak dan opsi unggah desain kustom Anda sendiri.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-border/70 rounded-3xl bg-card shadow-xs">
            <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground mb-4">
              <ShoppingCart className="h-10 w-10 opacity-60" />
            </div>
            <h2 className="text-lg font-bold">Katalog Layanan Belum Tersedia</h2>
            <p className="text-muted-foreground text-xs mt-1">Layanan sedang dalam proses pembaruan oleh pihak admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const displayImage = product.imageUrl || product.designs[0]?.imageUrl

              return (
                <Card 
                  key={product.id} 
                  className="group flex flex-col overflow-hidden transition-all duration-300 hover-lift border border-border/70 bg-card rounded-2xl shadow-xs"
                >
                  {/* Card Cover Image */}
                  <div className="relative w-full h-48 bg-muted overflow-hidden">
                    {displayImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={displayImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/10 via-muted to-cyan-500/10 text-muted-foreground">
                        <Tag className="h-10 w-10 stroke-1 mb-1 text-primary/40" />
                        <span className="text-[11px] font-bold tracking-wider text-muted-foreground/80">VIZADA PRINT</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-background/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-foreground border border-border/60 shadow-xs">
                        {product.category.name}
                      </span>
                    </div>

                    {product.designs.length > 0 && (
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                        <span className="inline-flex items-center rounded-md bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          ✨ {product.designs.length} Pilihan Desain
                        </span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="line-clamp-1 text-base font-bold group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs h-8 text-muted-foreground">
                      {product.description || "Layanan percetakan berkualitas tinggi dengan jaminan mutu presisi."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-4 px-5 flex-1 flex flex-col justify-end">
                    <div className="flex flex-col pt-2 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground font-medium">Harga Dasar</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-foreground">{formatRupiah(product.basePrice)}</span>
                        <span className="text-xs text-muted-foreground font-medium">/ {product.unit}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-5 px-5">
                    <Link href={`/orders/create?productId=${product.id}`} className="w-full">
                      <Button className="w-full font-bold text-xs rounded-xl shadow-xs group-hover:shadow-md transition-all btn-gradient" variant="default">
                        Pesan Layanan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}