"use client"

import { SharedDashboardLayout } from "@/components/shared-dashboard-layout"
import { Printer } from "lucide-react"

const navItems = [
  { href: "/operator", label: "Antrean Produksi", icon: Printer },
]

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <SharedDashboardLayout title="RUANG MESIN" navItems={navItems}>{children}</SharedDashboardLayout>
}