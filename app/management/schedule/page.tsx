import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { getScheduleRange } from "@/app/actions/production-schedule"

type ScheduleItem = Awaited<ReturnType<typeof getScheduleRange>>[number]

export default async function SchedulePage() {
  const today = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30)
  
  const schedules = await getScheduleRange(today, endDate)
  
  const byDate = schedules.reduce((acc, schedule) => {
    const date = schedule.scheduledDate.toISOString().split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(schedule)
    return acc
  }, {} as Record<string, ScheduleItem[]>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jadwal Produksi</h1>
        <p className="text-muted-foreground">Kelola timeline pengerjaan pesanan dan alokasi mesin.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Jadwal 30 Hari ke Depan
          </CardTitle>
          <CardDescription>Pesanan yang terjadwal untuk dikerjakan.</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(byDate).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              Tidak ada jadwal produksi dalam 30 hari ke depan.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byDate).map(([date, dateSchedules]) => (
                <div key={date} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">
                    {new Date(date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </h3>
                  <div className="space-y-2">
                    {dateSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`p-3 rounded border-l-4 ${
                          schedule.priority === "URGENT"
                            ? "border-l-red-500 bg-red-50"
                            : schedule.priority === "NORMAL"
                            ? "border-l-blue-500 bg-blue-50"
                            : "border-l-gray-500 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {schedule.productionJob.orderItem.order.orderNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.productionJob.orderItem.product.name}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-white font-semibold">
                            {schedule.priority}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Qty: {schedule.productionJob.orderItem.qty}
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
          <CardTitle>Ringkasan Jadwal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Total Pekerjaan:</span>
              <span className="font-semibold">{schedules.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Hari dengan Jadwal:</span>
              <span className="font-semibold">{Object.keys(byDate).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Prioritas Urgent:</span>
              <span className="font-semibold text-red-600">
                {schedules.filter(s => s.priority === "URGENT").length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}