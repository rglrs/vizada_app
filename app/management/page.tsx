import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Package, Printer, Users, ArrowRight, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ExportButton } from "./export-button"

export default async function ManagementDashboardPage() {
  const [totalOrders, activeProduction, totalCustomers, revenueAgg, recentOrders, allMaterials, ordersLast7Days, allOrdersExport] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "IN_PRODUCTION" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { notIn: ["CANCELLED", "PENDING_PAYMENT"] } }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: { include: { product: true } } }
    }),
    prisma.material.findMany(),
    prisma.order.findMany({
      where: { 
        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
        status: { notIn: ["CANCELLED", "PENDING_PAYMENT"] }
      }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true }
    })
  ])

  const lowStockItems = allMaterials.filter(m => m.stockQty <= m.minStock)
  const totalRevenue = revenueAgg._sum.totalAmount || 0

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split("T")[0]
  }).reverse()

  const chartData = last7Days.map(date => {
    const dayOrders = ordersLast7Days.filter(o => o.createdAt.toISOString().split("T")[0] === date)
    const total = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    return { 
      label: new Intl.DateTimeFormat("id-ID", { weekday: 'short' }).format(new Date(date)), 
      total 
    }
  })

  const maxChartValue = Math.max(...chartData.map(d => d.total), 1)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT": return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-xs font-bold">Menunggu Pembayaran</span>
      case "WAITING_APPROVAL": return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-bold">Menunggu Persetujuan</span>
      case "IN_PRODUCTION": return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-bold">Sedang Diproduksi</span>
      case "READY_FOR_PICKUP": return <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-md text-xs font-bold">Siap Diambil</span>
      case "COMPLETED": return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-bold">Selesai</span>
      case "CANCELLED": return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-bold">Dibatalkan</span>
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-bold">{status}</span>
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Utama</h1>
          <p className="text-muted-foreground mt-1">Ringkasan performa dan aktivitas percetakan Vizada.</p>
        </div>
        <ExportButton data={allOrdersExport} />
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" />
            <div>
              <h3 className="text-red-800 dark:text-red-400 font-bold">Peringatan Stok Menipis</h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                Terdapat {lowStockItems.length} bahan baku yang mencapai batas minimum. Segera lakukan restock.
              </p>
              <Link href="/management/inventory" className="text-red-600 font-bold text-sm mt-2 inline-flex items-center hover:underline">
                Lihat Detail Inventaris <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-900">{formatRupiah(totalRevenue)}</div>
            <p className="text-xs text-blue-600/80 mt-1">Dari pesanan yang diproses</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Sedang Diproduksi</CardTitle>
            <Printer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-900">{activeProduction}</div>
            <p className="text-xs text-purple-600/80 mt-1">Pesanan di ruang mesin</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-green-900">{totalOrders}</div>
            <p className="text-xs text-green-600/80 mt-1">Keseluruhan pesanan masuk</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-orange-900">{totalCustomers}</div>
            <p className="text-xs text-orange-600/80 mt-1">Akun terdaftar di sistem</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="border-0 shadow-sm md:col-span-4 lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">5 pesanan terakhir yang masuk ke sistem.</p>
            </div>
            <Link href="/admin/orders" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-9 px-4 py-2 gap-1">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">Belum ada data transaksi.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Invoice</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customer.name}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{order.items[0]?.product.name}</TableCell>
                        <TableCell className="font-semibold">{formatRupiah(order.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Pendapatan 7 Hari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[250px] items-end gap-2 pt-6">
              {chartData.map((data, idx) => {
                const heightPercentage = (data.total / maxChartValue) * 100
                return (
                  <div key={idx} className="relative flex w-full flex-col items-center justify-end group">
                    <div 
                      className="w-full rounded-t-md bg-primary/20 transition-all duration-500 group-hover:bg-primary" 
                      style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                    ></div>
                    <span className="mt-2 text-[10px] text-muted-foreground font-medium uppercase">{data.label}</span>
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                      {formatRupiah(data.total)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}