"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, FileText, LayoutDashboard, Shield, Printer, Package, Sparkles } from "lucide-react"

export function UserNav({ user }: { user: { name?: string | null; role?: string } }) {
  const router = useRouter()

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
      case "MANAGEMENT":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "OPERATOR":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
    }
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border/80 bg-background/80 backdrop-blur-md hover:bg-muted/80 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white font-bold text-xs shadow-xs">
          {initial}
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold text-foreground max-w-[120px] truncate">
          {user.name}
        </span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-xl border-border/80 backdrop-blur-xl bg-card/95">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground truncate">{user.name || "Pengguna"}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                {user.role || "CUSTOMER"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" /> Akun Terverifikasi
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1.5" />

          {user.role === "ADMIN" && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              onClick={() => router.push("/admin")}
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <Shield className="h-4 w-4" />
              </div>
              <span>Panel Admin</span>
            </DropdownMenuItem>
          )}

          {user.role === "MANAGEMENT" && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              onClick={() => router.push("/management")}
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <span>Panel Owner</span>
            </DropdownMenuItem>
          )}

          {user.role === "OPERATOR" && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
              onClick={() => router.push("/operator")}
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Printer className="h-4 w-4" />
              </div>
              <span>Ruang Mesin</span>
            </DropdownMenuItem>
          )}

          {(user.role === "ADMIN" || user.role === "MANAGEMENT" || user.role === "OPERATOR") && (
            <DropdownMenuSeparator className="my-1.5" />
          )}

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            onClick={() => router.push("/products")}
          >
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <Package className="h-4 w-4" />
            </div>
            <span>Katalog Layanan Cetak</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            onClick={() => router.push("/orders")}
          >
            <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span>Riwayat Pesanan Saya</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator className="my-1.5" />
        
        <DropdownMenuItem 
          className="cursor-pointer text-rose-600 focus:text-rose-600 hover:bg-rose-500/10 flex items-center gap-2.5 py-2 px-2.5 rounded-xl text-sm font-medium transition-colors" 
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
            <LogOut className="h-4 w-4" />
          </div>
          <span>Keluar dari Akun</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}