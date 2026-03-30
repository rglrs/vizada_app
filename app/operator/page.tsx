import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/app/generated/prisma/client"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, Calendar, StickyNote, DownloadCloud, AlertCircle } from "lucide-react"
import { ProductionButton } from "./production-button"

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }> | { q?: string; page?: string; limit?: string }
}

export default async function ProductionQueuePage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams)
  const q = sp?.q || ""
  const page = parseInt(sp?.page || "1")
  const limit = parseInt(sp?.limit || "10")
  const skip = (page - 1) * limit

  const where: Prisma.OrderWhereInput = q ? {
    status: "IN_PRODUCTION",
    OR: [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } }
    ]
  } : {
    status: "IN_PRODUCTION"
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { deadline: "asc" },
      skip,
      take: limit,
      include: {
        items: { include: { product: true } },
        customer: true
      }
    }),
    prisma.order.count({ where })
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Antrean Produksi</h1>
        <p className="text-muted-foreground mt-1">Daftar pesanan yang harus segera dicetak oleh operator mesin.</p>
      </div>

      <form method="GET" className="flex flex-col sm:flex-row gap-2">
        <Input name="q" defaultValue={q} placeholder="Cari invoice atau nama..." className="sm:max-w-[300px]" />
        <select
          name="limit"
          defaultValue={limit.toString()}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="10">10 data per halaman</option>
          <option value="25">25 data per halaman</option>
          <option value="50">50 data per halaman</option>
        </select>
        <Button type="submit" variant="secondary">Cari</Button>
      </form>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
          <Printer className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-bold">Data Tidak Ditemukan</h3>
          <p className="text-muted-foreground mt-1">Belum ada antrean pesanan yang cocok dengan pencarian.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="flex flex-col border-t-4 border-t-purple-500 shadow-md">
                <CardHeader className="pb-3 bg-muted/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold">{order.orderNumber}</CardTitle>
                      <p className="text-sm font-medium text-muted-foreground mt-1">{order.customer.name}</p>
                    </div>
                    {order.deadline && (
                      <div className="flex items-center gap-1.5 bg-red-100 text-red-800 px-2.5 py-1 rounded-md text-xs font-bold">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(order.deadline)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 py-4 space-y-4">
                  {order.items.map((item) => {
                    const specs = item.specifications as { notes?: string } | null
                    
                    return (
                      <div key={item.id} className="space-y-3">
                        <div className="flex justify-between items-start border-b pb-3">
                          <div>
                            <p className="font-bold text-lg">{item.product.name}</p>
                            <p className="text-sm font-medium text-muted-foreground mt-0.5">
                              Jumlah: <span className="text-foreground">{item.qty} {item.product.unit}</span>
                            </p>
                          </div>
                          {item.fileUrl && (
                            <a href={item.fileUrl} download target="_blank" rel="noreferrer">
                              <Button size="icon" variant="secondary" className="h-10 w-10 shrink-0 rounded-full">
                                <DownloadCloud className="h-5 w-5 text-primary" />
                              </Button>
                            </a>
                          )}
                        </div>

                        {specs?.notes ? (
                          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-md border border-yellow-200 dark:border-yellow-900">
                            <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500 flex items-center gap-1.5 mb-1.5">
                              <StickyNote className="h-3.5 w-3.5" /> Instruksi Kerja (SPK):
                            </p>
                            <p className="text-sm text-yellow-900 dark:text-yellow-200 leading-relaxed font-medium">
                              {specs.notes}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                            <AlertCircle className="h-4 w-4" /> Tidak ada catatan spesifikasi khusus.
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
                
                <CardFooter className="pt-0 pb-5 px-6 mt-auto">
                  <ProductionButton orderId={order.id} />
                </CardFooter>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-muted-foreground">
                Menampilkan {orders.length} dari {total} antrean
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
        </>
      )}
    </div>
  )
}