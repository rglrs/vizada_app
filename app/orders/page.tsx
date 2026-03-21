import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ExternalLink, PackageX } from "lucide-react"

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">Menunggu Pembayaran</span>
      case "WAITING_APPROVAL":
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">Menunggu Persetujuan</span>
      case "IN_PRODUCTION":
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-semibold">Sedang Diproduksi</span>
      case "READY_FOR_PICKUP":
        return <span className="bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full text-xs font-semibold">Siap Diambil</span>
      case "COMPLETED":
        return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-semibold">Selesai</span>
      case "CANCELLED":
        return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">Dibatalkan</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center font-extrabold text-2xl tracking-tighter" href="/">
          VIZADA
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" /> Katalog Produk
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container px-4 md:px-6 mx-auto py-8 md:py-12 max-w-5xl">
        <div className="flex flex-col space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Riwayat Pesanan Saya</h1>
          <p className="text-muted-foreground md:text-lg">
            Pantau status dan detail seluruh transaksi Anda di Vizada.
          </p>
        </div>

        <Card className="border-0 shadow-sm bg-background">
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
            <CardDescription>Menampilkan semua pesanan dari yang paling baru.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PackageX className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Belum Ada Pesanan</h3>
                <p className="text-muted-foreground mt-2 mb-6">Anda belum pernah membuat pesanan layanan cetak.</p>
                <Link href="/products">
                  <Button>Mulai Pesanan Pertama</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Total Biaya</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{order.items[0]?.product.name}</span>
                            {order.items.length > 1 && (
                              <span className="text-xs text-muted-foreground">+ {order.items.length - 1} item lainnya</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatRupiah(order.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}