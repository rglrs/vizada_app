"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { LogOut, Menu } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button" 
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

export function SharedDashboardLayout({ 
  children, 
  title, 
  navItems 
}: { 
  children: React.ReactNode
  title: string
  navItems: NavItem[] 
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block h-full overflow-hidden">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-15 lg:px-6">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
              {title}
            </div>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
              {mounted && navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== navItems[0].href && pathname.startsWith(`${item.href}/`))
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-15 lg:px-6">
          {mounted ? (
            <Sheet>
              <SheetTrigger className={`${buttonVariants({ variant: "outline", size: "icon" })} shrink-0 md:hidden`}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle> 
                <nav className="grid gap-2 text-lg font-medium mt-6">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== navItems[0].href && pathname.startsWith(`${item.href}/`))
                    
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-auto">
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="shrink-0 md:hidden w-10 h-10" />
          )}
          <div className="w-full flex justify-end">
            {mounted && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="hidden sm:inline-block">Halo, {session?.user?.name}</span>
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold uppercase">
                  {session?.user?.name?.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}