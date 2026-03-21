"use client"

import { SharedDashboardLayout } from "@/components/shared-dashboard-layout"
import { LayoutDashboard, Package } from "lucide-react"

const navItems = [
  { href: "/management", label: "Dashboard Utama", icon: LayoutDashboard },
  { href: "/management/inventory", label: "Manajemen Inventaris", icon: Package },
]

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  return <SharedDashboardLayout title="PANEL OWNER" navItems={navItems}>{children}</SharedDashboardLayout>
}