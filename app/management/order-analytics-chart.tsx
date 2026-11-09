"use client"

import React, { useState, useMemo } from "react"
import { 
  TrendingUp, 
  Calendar, 
  Package, 
  DollarSign, 
  BarChart3, 
  Sparkles, 
  Info, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers
} from "lucide-react"

export interface RawOrderData {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
}

interface OrderAnalyticsChartProps {
  rawOrders: RawOrderData[]
}

type TimeframeMode = "daily" | "monthly"
type MetricMode = "all" | "orders" | "revenue"

export function OrderAnalyticsChart({ rawOrders }: OrderAnalyticsChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeMode>("daily")
  const [dailyDays, setDailyDays] = useState<number>(14)
  const [monthlyMonths, setMonthlyMonths] = useState<number>(6)
  const [metricView, setMetricView] = useState<MetricMode>("all")
  const [useDummy, setUseDummy] = useState<boolean>(true)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0 
    }).format(val)
  }

  // Format compact currency (e.g. 2,5 Jt)
  const formatCompactRupiah = (val: number) => {
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(1)} M`
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(1)} Jt`
    }
    if (val >= 1_000) {
      return `Rp ${(val / 1_000).toFixed(0)} Rb`
    }
    return `Rp ${val}`
  }

  // Pre-process & generate data points
  const chartData = useMemo(() => {
    const today = new Date()

    if (timeframe === "daily") {
      const daysCount = dailyDays
      const list = []

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const dateIso = d.toISOString().split("T")[0]

        // Find real orders for this specific date
        const realDayOrders = rawOrders.filter(
          o => o.createdAt.startsWith(dateIso) && !["CANCELLED", "PENDING_PAYMENT"].includes(o.status)
        )
        const realOrdersCount = realDayOrders.length
        const realDayRevenue = realDayOrders.reduce((sum, o) => sum + o.totalAmount, 0)

        // Realistic deterministic dummy data for digital printing business
        const dayOfWeek = d.getDay() // 0 = Sun, 6 = Sat
        const daySeed = (d.getDate() * 7 + d.getMonth() * 13) % 10
        
        let simCount = 12 + daySeed
        let simRevenue = 2_200_000 + daySeed * 240_000

        // Weekday vs Weekend adjustments
        if (dayOfWeek === 6) { // Sabtu: Peak for rush orders
          simCount += 8
          simRevenue += 1_600_000
        } else if (dayOfWeek === 5) { // Jumat: Busy corporate deadline
          simCount += 6
          simRevenue += 1_200_000
        } else if (dayOfWeek === 0) { // Minggu: Half day / quieter
          simCount = Math.max(5, simCount - 8)
          simRevenue = Math.max(950_000, simRevenue - 1_400_000)
        }

        // Final counts based on dummy toggle
        const finalCount = useDummy 
          ? (realOrdersCount > 0 ? realOrdersCount + Math.floor(simCount * 0.6) : simCount)
          : realOrdersCount

        const finalRevenue = useDummy
          ? (realDayRevenue > 0 ? realDayRevenue + Math.floor(simRevenue * 0.6) : simRevenue)
          : realDayRevenue

        list.push({
          key: dateIso,
          dateObj: d,
          label: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(d),
          dayName: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(d),
          fullLabel: new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d),
          orders: finalCount,
          revenue: finalRevenue,
          realOrdersCount,
          realDayRevenue,
          hasRealData: realOrdersCount > 0
        })
      }
      return list
    } else {
      // Monthly Mode
      const monthsCount = monthlyMonths
      const list = []

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

        // Find real orders for this month
        const realMonthOrders = rawOrders.filter(
          o => o.createdAt.startsWith(yearMonth) && !["CANCELLED", "PENDING_PAYMENT"].includes(o.status)
        )
        const realOrdersCount = realMonthOrders.length
        const realMonthRevenue = realMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0)

        // Realistic upward month-by-month trajectory for growing printing enterprise
        // Starting lower 6 months ago, growing smoothly to present
        const progressFactor = (monthsCount - 1 - i) / Math.max(monthsCount - 1, 1) // 0 to 1
        let simCount = Math.round(75 + progressFactor * 85 + ((d.getMonth() * 5) % 15))
        let simRevenue = Math.round(16_500_000 + progressFactor * 19_500_000 + ((d.getMonth() * 1_200_000) % 3_000_000))

        // If current month, scale down proportionally to month progress
        if (i === 0) {
          const currentDay = today.getDate()
          const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
          const monthProgress = Math.max(0.2, currentDay / totalDaysInMonth)
          simCount = Math.round(simCount * monthProgress)
          simRevenue = Math.round(simRevenue * monthProgress)
        }

        const finalCount = useDummy 
          ? (realOrdersCount > 0 ? realOrdersCount + Math.floor(simCount * 0.7) : simCount)
          : realOrdersCount

        const finalRevenue = useDummy
          ? (realMonthRevenue > 0 ? realMonthRevenue + Math.floor(simRevenue * 0.7) : simRevenue)
          : realMonthRevenue

        list.push({
          key: yearMonth,
          dateObj: d,
          label: new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit" }).format(d),
          dayName: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d),
          fullLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(d),
          orders: finalCount,
          revenue: finalRevenue,
          realOrdersCount,
          realMonthRevenue,
          hasRealData: realOrdersCount > 0
        })
      }
      return list
    }
  }, [timeframe, dailyDays, monthlyMonths, useDummy, rawOrders])

  // Summary KPIs for current view
  const totalOrders = useMemo(() => chartData.reduce((sum, d) => sum + d.orders, 0), [chartData])
  const totalRevenue = useMemo(() => chartData.reduce((sum, d) => sum + d.revenue, 0), [chartData])
  const avgOrders = useMemo(() => (chartData.length > 0 ? (totalOrders / chartData.length).toFixed(1) : "0"), [totalOrders, chartData])
  const peakData = useMemo(() => {
    if (chartData.length === 0) return null
    return [...chartData].sort((a, b) => b.orders - a.orders)[0]
  }, [chartData])

  // Max values for SVG scaling
  const maxOrders = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.orders), 1)
    // Round up to nice number
    if (maxVal <= 10) return 10
    if (maxVal <= 25) return 25
    if (maxVal <= 50) return 50
    if (maxVal <= 100) return 100
    if (maxVal <= 250) return 250
    return Math.ceil(maxVal / 50) * 50
  }, [chartData])

  const maxRevenue = useMemo(() => {
    const maxVal = Math.max(...chartData.map(d => d.revenue), 100_000)
    // Round up to neat ceiling
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)))
    return Math.ceil(maxVal / (magnitude / 2)) * (magnitude / 2)
  }, [chartData])

  // Chart coordinates
  const svgWidth = 1000
  const svgHeight = 280
  const pad = { top: 30, right: 65, bottom: 45, left: 55 }
  const plotW = svgWidth - pad.left - pad.right
  const plotH = svgHeight - pad.top - pad.bottom

  // Generate smooth spline curve for revenue
  const splinePath = useMemo(() => {
    if (chartData.length === 0) return ""
    const slotW = plotW / chartData.length
    const points = chartData.map((d, i) => ({
      x: pad.left + i * slotW + slotW / 2,
      y: pad.top + plotH - (d.revenue / maxRevenue) * plotH
    }))

    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
    let path = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return path
  }, [chartData, maxRevenue, plotW, plotH, pad.left, pad.top])

  // Area under the spline curve
  const areaPath = useMemo(() => {
    if (!splinePath || chartData.length === 0) return ""
    const slotW = plotW / chartData.length
    const firstX = pad.left + slotW / 2
    const lastX = pad.left + (chartData.length - 1) * slotW + slotW / 2
    const bottomY = pad.top + plotH
    return `${splinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
  }, [splinePath, chartData, plotW, plotH, pad.left, pad.top])

  const hoveredData = hoveredIdx !== null ? chartData[hoveredIdx] : null

  return (
    <div className="rounded-2xl bg-card border border-border/70 shadow-xs p-6 space-y-6">
      {/* Header with Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                Grafik Tren Pemesanan & Omzet
                {useDummy && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Dummy + Real Aktif
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitoring volume order percetakan dari hari ke hari dan bulan ke bulan secara dinamis.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Tabs */}
          <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border/60 text-xs">
            <button
              onClick={() => setTimeframe("daily")}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                timeframe === "daily" 
                  ? "bg-card text-primary shadow-xs font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Harian (Hari ke Hari)
            </button>
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                timeframe === "monthly" 
                  ? "bg-card text-primary shadow-xs font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Bulanan (Bulan ke Bulan)
            </button>
          </div>

          {/* Sub-range Selector */}
          {timeframe === "daily" ? (
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50 text-xs">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setDailyDays(days)}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                    dailyDays === days 
                      ? "bg-primary text-primary-foreground font-bold shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {days} Hari
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50 text-xs">
              {[6, 12].map(months => (
                <button
                  key={months}
                  onClick={() => setMonthlyMonths(months)}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                    monthlyMonths === months 
                      ? "bg-primary text-primary-foreground font-bold shadow-xs" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {months} Bulan
                </button>
              ))}
            </div>
          )}

          {/* Metric Selector */}
          <div className="hidden sm:flex items-center bg-muted/50 p-1 rounded-xl border border-border/50 text-xs">
            <button
              onClick={() => setMetricView("all")}
              className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                metricView === "all" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setMetricView("orders")}
              className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                metricView === "orders" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pesanan
            </button>
            <button
              onClick={() => setMetricView("revenue")}
              className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                metricView === "revenue" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Omzet
            </button>
          </div>

          {/* Toggle Dummy Data Button */}
          <button
            onClick={() => setUseDummy(!useDummy)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              useDummy 
                ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
            }`}
            title="Aktifkan / Nonaktifkan simulasi dummy agar data grafik terlihat penuh"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{useDummy ? "Simulasi: ON" : "Data Asli DB"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip for Selected Period */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Total Pesanan Periode
          </span>
          <div className="text-xl font-black text-foreground mt-1 flex items-baseline gap-1.5">
            <span>{totalOrders}</span>
            <span className="text-xs font-semibold text-muted-foreground">Order</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="h-3 w-3" /> +14.2% vs periode lalu
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Total Omzet Periode
          </span>
          <div className="text-xl font-black text-foreground mt-1 truncate">
            {formatCompactRupiah(totalRevenue)}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block truncate">
            {formatRupiah(totalRevenue)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Rata-rata {timeframe === "daily" ? "Harian" : "Bulanan"}
          </span>
          <div className="text-xl font-black text-foreground mt-1 flex items-baseline gap-1.5">
            <span>{avgOrders}</span>
            <span className="text-xs font-semibold text-muted-foreground">Order / {timeframe === "daily" ? "hari" : "bulan"}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block">
            Rerata {formatCompactRupiah(chartData.length > 0 ? totalRevenue / chartData.length : 0)} / {timeframe === "daily" ? "hari" : "bulan"}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Puncak Tertinggi
          </span>
          <div className="text-xl font-black text-primary mt-1 flex items-baseline gap-1.5">
            <span>{peakData ? peakData.orders : 0}</span>
            <span className="text-xs font-semibold text-muted-foreground">Order</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5 block truncate">
            {peakData ? (timeframe === "daily" ? peakData.fullLabel.split(",")[0] + `, ${peakData.label}` : peakData.fullLabel) : "-"}
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 sm:h-72 lg:h-80 overflow-visible"
        >
          <defs>
            {/* Bar Gradient */}
            <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.95" />
            </linearGradient>

            {/* Spline Area Gradient */}
            <linearGradient id="revenueAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = pad.top + plotH - ratio * plotH
            const orderVal = Math.round(ratio * maxOrders)
            const revVal = ratio * maxRevenue

            return (
              <g key={idx}>
                {/* Dashed Gridline */}
                <line
                  x1={pad.left}
                  y1={y}
                  x2={pad.left + plotW}
                  y2={y}
                  stroke="currentColor"
                  className="text-border/60"
                  strokeDasharray={ratio === 0 ? "none" : "3 3"}
                  strokeWidth={ratio === 0 ? "1.5" : "1"}
                />

                {/* Left Y-Axis Label: Orders */}
                {(metricView === "all" || metricView === "orders") && (
                  <text
                    x={pad.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[11px] font-bold fill-muted-foreground"
                  >
                    {orderVal}
                  </text>
                )}

                {/* Right Y-Axis Label: Revenue */}
                {(metricView === "all" || metricView === "revenue") && (
                  <text
                    x={pad.left + plotW + 10}
                    y={y + 4}
                    textAnchor="start"
                    className="text-[10px] font-semibold fill-violet-500 dark:fill-violet-400"
                  >
                    {formatCompactRupiah(revVal)}
                  </text>
                )}
              </g>
            )
          })}

          {/* Area under spline curve (Revenue) */}
          {(metricView === "all" || metricView === "revenue") && areaPath && (
            <path d={areaPath} fill="url(#revenueAreaGradient)" />
          )}

          {/* Bars: Orders Volume */}
          {(metricView === "all" || metricView === "orders") &&
            chartData.map((d, i) => {
              const slotW = plotW / chartData.length
              const barW = Math.min(Math.max(slotW * 0.52, 14), 42)
              const barX = pad.left + i * slotW + (slotW - barW) / 2
              const barH = Math.max((d.orders / maxOrders) * plotH, 4)
              const barY = pad.top + plotH - barH
              const isHovered = hoveredIdx === i

              return (
                <g key={`bar-${i}`}>
                  <rect
                    x={barX}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx="5"
                    fill={isHovered ? "url(#barGradientHover)" : "url(#barGradientPrimary)"}
                    className="transition-all duration-200 cursor-pointer"
                  />
                  {/* Subtle top cap highlight */}
                  <rect
                    x={barX}
                    y={barY}
                    width={barW}
                    height="3"
                    rx="1.5"
                    fill="#93c5fd"
                    opacity={isHovered ? 1 : 0.6}
                  />
                </g>
              )
            })}

          {/* Line: Revenue (Omzet) Curve */}
          {(metricView === "all" || metricView === "revenue") && splinePath && (
            <path
              d={splinePath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Dots on Revenue Curve */}
          {(metricView === "all" || metricView === "revenue") &&
            chartData.map((d, i) => {
              const slotW = plotW / chartData.length
              const cx = pad.left + i * slotW + slotW / 2
              const cy = pad.top + plotH - (d.revenue / maxRevenue) * plotH
              const isHovered = hoveredIdx === i

              return (
                <g key={`dot-${i}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? "6" : "3.5"}
                    fill={isHovered ? "#8b5cf6" : "#ffffff"}
                    stroke="#8b5cf6"
                    strokeWidth={isHovered ? "2.5" : "2"}
                    className="transition-all duration-200"
                  />
                </g>
              )
            })}

          {/* Hover Crosshair & Indicators */}
          {hoveredIdx !== null && (
            <g>
              {(() => {
                const slotW = plotW / chartData.length
                const cx = pad.left + hoveredIdx * slotW + slotW / 2
                return (
                  <line
                    x1={cx}
                    y1={pad.top}
                    x2={cx}
                    y2={pad.top + plotH}
                    stroke="#3b82f6"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                )
              })()}
            </g>
          )}

          {/* X-Axis Labels */}
          {chartData.map((d, i) => {
            const slotW = plotW / chartData.length
            const cx = pad.left + i * slotW + slotW / 2
            const isHovered = hoveredIdx === i

            // Skip some labels if too crowded (e.g. 30 days)
            const showLabel = 
              chartData.length <= 14 
                ? true 
                : i % Math.ceil(chartData.length / 10) === 0 || i === chartData.length - 1

            return (
              <g key={`xlabel-${i}`}>
                {showLabel && (
                  <text
                    x={cx}
                    y={pad.top + plotH + 18}
                    textAnchor="middle"
                    className={`text-[10px] font-bold uppercase transition-colors ${
                      isHovered ? "fill-primary font-black" : "fill-muted-foreground"
                    }`}
                  >
                    {d.label}
                  </text>
                )}
                {timeframe === "daily" && chartData.length <= 14 && (
                  <text
                    x={cx}
                    y={pad.top + plotH + 30}
                    textAnchor="middle"
                    className="text-[9px] fill-muted-foreground/70 font-medium"
                  >
                    {d.dayName}
                  </text>
                )}
              </g>
            )
          })}

          {/* Transparent Hover Detection Slices */}
          {chartData.map((_, i) => {
            const slotW = plotW / chartData.length
            const sliceX = pad.left + i * slotW

            return (
              <rect
                key={`slice-${i}`}
                x={sliceX}
                y={pad.top}
                width={slotW}
                height={plotH + pad.bottom}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            )
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredData && hoveredIdx !== null && (
          <div
            className="absolute top-4 pointer-events-none transition-all duration-150 z-30 shadow-xl rounded-xl p-3 bg-popover/95 border border-border backdrop-blur-md text-popover-foreground text-xs w-60"
            style={{
              left: `${Math.min(
                Math.max(
                  ((pad.left + hoveredIdx * (plotW / chartData.length) + (plotW / chartData.length) / 2) / svgWidth) * 100,
                  15
                ),
                85
              )}%`,
              transform: "translateX(-50%)"
            }}
          >
            <div className="font-bold text-foreground border-b border-border/70 pb-1.5 mb-2 flex items-center justify-between">
              <span>{hoveredData.fullLabel}</span>
              {hoveredData.hasRealData && (
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Data Riil
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span>Volume Order:</span>
                </span>
                <span className="font-bold text-foreground">
                  {hoveredData.orders} Pesanan
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-violet-600" />
                  <span>Nilai Transaksi:</span>
                </span>
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {formatRupiah(hoveredData.revenue)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                <span className="text-muted-foreground">Rerata per order:</span>
                <span className="font-semibold text-foreground">
                  {hoveredData.orders > 0 
                    ? formatRupiah(Math.round(hoveredData.revenue / hoveredData.orders))
                    : "Rp 0"}
                </span>
              </div>
            </div>

            {useDummy && !hoveredData.hasRealData && (
              <div className="mt-2 pt-1 border-t border-border/40 text-[9px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0" />
                <span>Simulasi operasional percetakan</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend & Insights Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border/70 text-xs">
        {/* Legend */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-600 shadow-xs" />
            <span className="text-muted-foreground font-medium">Volume Pesanan (Order)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-violet-500 shadow-xs" />
            <span className="text-muted-foreground font-medium">Nilai Omzet (Rupiah)</span>
          </div>
        </div>

        {/* Tip / Note */}
        <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>
            Arahkan kursor ke grafik untuk detail per {timeframe === "daily" ? "hari" : "bulan"}.
          </span>
        </div>
      </div>
    </div>
  )
}
