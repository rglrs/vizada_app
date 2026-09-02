import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default async function SchedulePage() {
  const orders = await prisma.order.findMany({
    where: { status: "IN_PRODUCTION", deadline: { not: null } },
    include: {
      items: {
        include: { product: true }
      },
      customer: true
    },
    orderBy: { deadline: "asc" }
  })
  
  type OrderWithItems = typeof orders[0]

  const byDate = orders.reduce((acc, order) => {
    if (!order.deadline) return acc
    const date = order.deadline.toISOString().split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(order)
    return acc
  }, {} as Record<string, OrderWithItems[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jadwal Produksi</h1>
        <p className="text-muted-foreground">Tinjau antrean produksi berdasarkan batas waktu pesanan.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Pesanan Sedang Diproduksi
          </CardTitle>
          <CardDescription>Semua pesanan yang sedang berada dalam tahap produksi.</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(byDate).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Tidak ada pesanan produksi yang aktif.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byDate).map(([date, dateOrders]) => (
                <div key={date} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">
                    {new Date(date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </h3>
                  <div className="space-y-3">
                    {dateOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 rounded border-l-4 border-l-purple-500 bg-purple-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-purple-900">
                              {order.orderNumber}
                            </p>
                            <p className="text-sm text-purple-700">
                              Pelanggan: {order.customer.name}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {order.items.map(item => (
                            <div key={item.id} className="text-xs flex justify-between bg-white p-1.5 rounded border border-purple-100">
                              <span>{item.product.name}</span>
                              <span className="font-semibold">{item.qty} {item.product.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Produksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Total Pesanan Aktif:</span>
              <span className="font-semibold">{orders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Hari Tenggat Waktu (Deadline):</span>
              <span className="font-semibold">{Object.keys(byDate).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}