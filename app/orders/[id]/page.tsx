import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, CreditCard, Printer, PackageCheck, XCircle } from "lucide-react"
import { PaymentModal } from "./payment-modal"
import { CancelButton } from "./cancel-button"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const resolvedParams = await params
  const orderId = resolvedParams.id
  if (!orderId) redirect("/products")

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: session.user.id },
    include: { items: { include: { product: true } } }
  })

  if (!order) redirect("/products")

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price)
  }

  const steps = [
    { id: "PENDING_PAYMENT", label: "Belum Bayar", icon: CreditCard },
    { id: "WAITING_APPROVAL", label: "Verifikasi", icon: Clock },
    { id: "IN_PRODUCTION", label: "Diproses", icon: Printer },
    { id: "READY_FOR_PICKUP", label: "Siap Ambil", icon: PackageCheck },
    { id: "COMPLETED", label: "Selesai", icon: CheckCircle2 },
  ]

  const getStepIndex = (status: string) => {
    if (status === "CANCELLED") return -1
    return steps.findIndex(s => s.id === status)
  }

  const currentStepIndex = getStepIndex(order.status)
  const isCancelled = order.status === "CANCELLED"

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 min-h-screen">
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Riwayat Pesanan
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="bg-muted/30 px-6 py-8 border-b text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Status Pesanan</CardTitle>
          <CardDescription className="text-base mt-2">
            Invoice: <span className="font-bold text-foreground">{order.orderNumber}</span>
          </CardDescription>

          {!isCancelled ? (
            <div className="relative flex justify-between items-center mt-10 max-w-xl mx-auto px-4">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full z-0"></div>
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500 z-0"
                style={{ width: currentStepIndex > 0 ? `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 2rem)` : '0%' }}
              ></div>
              
              {steps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = currentStepIndex >= index
                const isActive = currentStepIndex === index

                return (
                  <div key={step.id} className="relative flex flex-col items-center gap-3 z-10 bg-muted/30 px-1">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border-4 transition-colors ${
                      isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted-foreground/30 text-muted-foreground"
                    } ${isActive ? "ring-4 ring-primary/20 scale-110" : ""}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`absolute -bottom-8 w-24 text-center text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted ? "text-foreground" : "text-muted-foreground hidden sm:block"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                <XCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-red-600">Pesanan Dibatalkan</h3>
              <p className="text-sm text-muted-foreground mt-1">Transaksi ini telah dibatalkan dan tidak akan diproses lebih lanjut.</p>
            </div>
          )}
        </div>

        <CardContent className="space-y-6 pt-12 pb-6 px-6 sm:px-10">
          <div className="bg-background p-5 rounded-xl border border-muted-foreground/20 space-y-4 shadow-sm">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Rincian Item</h4>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-base">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.qty} {item.product.unit} x {formatRupiah(item.product.basePrice)}</p>
                  </div>
                  <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg mt-2 border border-primary/10">
              <span className="font-bold text-lg">Total Pembayaran</span>
              <span className="font-extrabold text-2xl text-primary">{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-10 px-6 sm:px-10 bg-muted/10 pt-6 border-t">
          {!isCancelled && (
            <PaymentModal orderId={order.id} status={order.status} />
          )}
          {!isCancelled && (
            <CancelButton orderId={order.id} status={order.status} />
          )}
          <Link href="/products" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base font-semibold border-muted-foreground/30">
              Buat Pesanan Lainnya
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}