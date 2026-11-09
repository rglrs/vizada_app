import { prisma } from "@/lib/prisma"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DollarSign, 
  Package, 
  Printer, 
  Users, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  BarChart3, 
  Calendar,
  Layers
} from "lucide-react"
import Link from "next/link"
import { ExportButton } from "./export-button"
import { StatusBadge } from "@/components/ui/status-badge"
import { OrderAnalyticsChart } from "./order-analytics-chart"

export default async function ManagementDashboardPage() {
  const [
    totalOrders, 
    activeProduction, 
    totalCustomers, 
    revenueAgg, 
    recentOrders, 
    allMaterials, 
    allOrdersForAnalytics,
    completedOrdersCount,
    waitingApprovalCount,
    allOrdersExport
  ] = await Promise.all([
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
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "WAITING_APPROVAL" } }),
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

  const serializedOrders = allOrdersForAnalytics.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString()
  }))

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard Eksekutif</h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Data
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Ringkasan performa finansial, utilisasi mesin, dan aktivitas pesanan Vizada.</p>
        </div>
        <ExportButton data={allOrdersExport} />
      </div>

      {/* Warning Stok Bahan */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl shadow-xs backdrop-blur-xs">
          <div className="flex items-start">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 mr-3 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-rose-700 dark:text-rose-400 font-bold text-sm">Peringatan Inventaris: Stok Menipis</h3>
              <p className="text-rose-600/90 dark:text-rose-300/90 text-xs mt-0.5">
                Terdapat {lowStockItems.length} bahan baku yang telah menyentuh batas minimum persediaan. Segera lakukan pengadaan.
              </p>
              <Link href="/management/inventory" className="text-rose-700 dark:text-rose-300 font-bold text-xs mt-2 inline-flex items-center hover:underline">
                Buka Manajemen Inventaris <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4 Executive Metric Widgets */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="p-6 rounded-xl bg-card border border-border/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pendapatan</span>
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">{formatRupiah(totalRevenue)}</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
              <span>Pendapatan sah terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-xl bg-card border border-border/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sedang Diproduksi</span>
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
              <Printer className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">{activeProduction} Pesanan</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-700 dark:text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-700" />
              <span>Di ruang mesin & QC</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-xl bg-card border border-border/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pesanan</span>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">{totalOrders} Transaksi</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-muted-foreground">
              <span>Keseluruhan siklus order</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-xl bg-card border border-border/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pelanggan Aktif</span>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-foreground">{totalCustomers} Akun</div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-muted-foreground">
              <span>Customer terdaftar</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Comprehensive Order & Revenue Trends Chart (Day-to-day & Month-to-month) */}
      <OrderAnalyticsChart rawOrders={serializedOrders} />

      {/* Bottom Grid: Recent Orders & Operational Summary */}
      <div className="grid gap-6 md:grid-cols-7 items-start">
        {/* Table Transaksi Terbaru */}
        <div className="rounded-2xl bg-card border border-border/70 shadow-xs md:col-span-4 lg:col-span-5 overflow-hidden">
          <div className="p-6 flex flex-row items-center justify-between border-b border-border/70">
            <div>
              <h2 className="text-base font-bold text-foreground">Transaksi Pesanan Terbaru</h2>
              <p className="text-xs text-muted-foreground mt-0.5">5 pesanan terakhir yang masuk ke alur produksi.</p>
            </div>
            <Link href="/admin/orders" className="inline-flex items-center justify-center rounded-xl text-xs font-semibold hover:bg-muted text-primary h-8 px-3 gap-1 transition-colors">
              Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-2">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Belum ada data transaksi.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-bold">No. Invoice</TableHead>
                      <TableHead className="text-xs font-bold">Pelanggan</TableHead>
                      <TableHead className="text-xs font-bold">Layanan</TableHead>
                      <TableHead className="text-xs font-bold">Nominal</TableHead>
                      <TableHead className="text-xs font-bold">Status Pengerjaan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-bold text-xs text-primary">{order.orderNumber}</TableCell>
                        <TableCell className="text-xs font-medium">{order.customer.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                          {order.items[0]?.product.name || "Layanan Cetak"}
                        </TableCell>
                        <TableCell className="font-bold text-xs">{formatRupiah(order.totalAmount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} size="sm" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Operational Status Breakdown & Quick Access */}
        <div className="rounded-2xl bg-card border border-border/70 shadow-xs md:col-span-3 lg:col-span-2 p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span>Status & Alur Pesanan</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Operasional
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <Printer className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-foreground">Dalam Produksi</div>
                    <div className="text-[10px] text-muted-foreground">Mesin cetak & finishing</div>
                  </div>
                </div>
                <span className="text-sm font-black text-foreground">{activeProduction}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-foreground">Menunggu Persetujuan</div>
                    <div className="text-[10px] text-muted-foreground">Verifikasi file & antrean</div>
                  </div>
                </div>
                <span className="text-sm font-black text-foreground">{waitingApprovalCount}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-foreground">Pesanan Selesai</div>
                    <div className="text-[10px] text-muted-foreground">Telah diambil / dikirim</div>
                  </div>
                </div>
                <span className="text-sm font-black text-foreground">{completedOrdersCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/70 space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Navigasi Cepat
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/management/schedule"
                className="p-2 rounded-xl bg-muted/30 hover:bg-muted/70 border border-border/60 text-xs font-semibold text-foreground flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Jadwal
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Link>
              <Link
                href="/management/reports"
                className="p-2 rounded-xl bg-muted/30 hover:bg-muted/70 border border-border/60 text-xs font-semibold text-foreground flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" /> Laporan
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}