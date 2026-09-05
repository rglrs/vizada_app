import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ExternalLink, PackageX, Printer, Sparkles } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { StatusBadge } from "@/components/ui/status-badge"

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true }
      }
    }
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
        <div className="ml-auto flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="font-semibold text-xs rounded-xl">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Katalog Layanan
            </Button>
          </Link>
          {session?.user && <UserNav user={session.user} />}
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 mx-auto py-8 md:py-12 max-w-5xl">
        <div className="flex flex-col space-y-2 mb-8 pb-4 border-b border-border/70">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground">Riwayat Pesanan</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {orders.length} Transaksi
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Pantau perkembangan produksi, bukti bayar, dan status pengiriman pesanan percetakan Anda secara real-time.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border/70 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Daftar Transaksi Saya</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Semua pesanan diurutkan dari yang terbaru.</p>
            </div>
            <Link href="/products">
              <Button size="sm" className="btn-gradient text-xs font-semibold rounded-xl">
                + Pesan Baru
              </Button>
            </Link>
          </div>

          <div className="p-2">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-2xl bg-muted/60 text-muted-foreground mb-4">
                  <PackageX className="h-10 w-10 opacity-60" />
                </div>
                <h3 className="text-base font-bold text-foreground">Belum Ada Riwayat Pesanan</h3>
                <p className="text-muted-foreground text-xs mt-1 max-w-sm mb-6">
                  Anda belum memiliki riwayat pesanan. Jelajahi katalog dan pesan kebutuhan cetak Anda sekarang.
                </p>
                <Link href="/products">
                  <Button className="btn-gradient rounded-xl text-sm font-semibold">
                    <Sparkles className="mr-2 h-4 w-4" /> Mulai Pesanan Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold">No. Invoice</TableHead>
                      <TableHead className="text-xs font-bold">Tanggal</TableHead>
                      <TableHead className="text-xs font-bold">Layanan</TableHead>
                      <TableHead className="text-xs font-bold">Total Biaya</TableHead>
                      <TableHead className="text-xs font-bold">Status Pengerjaan</TableHead>
                      <TableHead className="text-right text-xs font-bold">Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-bold text-xs text-primary">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-foreground">
                              {order.items[0]?.product.name || "Layanan Cetak"}
                            </span>
                            {order.items.length > 1 && (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                + {order.items.length - 1} item lainnya
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-foreground">
                          {formatRupiah(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-lg text-xs font-medium gap-1 text-primary hover:bg-primary/10">
                              <span>Buka</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}