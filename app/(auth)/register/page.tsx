"use client"

import { registerUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Loader2, Printer, Sparkles } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await registerUser(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      toast.success("Akun berhasil dibuat! Silakan login.")
      router.push("/login")
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 -right-20 w-[450px] h-[300px] bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-[100px] pointer-events-none animate-glow-breathe" />
      <div className="absolute bottom-1/4 -left-20 w-[450px] h-[300px] bg-cyan-400/15 dark:bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md mb-6 z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-semibold text-xs rounded-xl hover:bg-muted/80">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Kembali ke Beranda
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md border border-border/70 bg-card/85 backdrop-blur-xl shadow-xl shadow-indigo-500/5 rounded-3xl z-10 overflow-hidden">
        {/* Brand Header */}
        <div className="flex flex-col items-center pt-8 pb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 mb-3">
            <Printer className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-foreground">
            Daftar Akun Baru
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Bergabunglah dengan ribuan pelanggan Vizada
          </CardDescription>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5 pt-4 px-6 sm:px-8">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-foreground">Nama Lengkap</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Contoh: Budi Santoso" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-xl bg-background/60 border-border/80 text-sm focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">Alamat Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nama@email.com" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-xl bg-background/60 border-border/80 text-sm focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-foreground">Nomor WhatsApp</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="08123456789" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-xl bg-background/60 border-border/80 text-sm focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">Kata Sandi</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="Minimal 6 karakter" 
                disabled={isLoading} 
                required 
                className="h-10 rounded-xl bg-background/60 border-border/80 text-sm focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2 pb-8 px-6 sm:px-8">
            <Button type="submit" className="w-full h-11 text-sm font-bold btn-gradient rounded-xl shadow-md shadow-indigo-500/25" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Mendaftarkan akun...</span>
                </>
              ) : (
                "Buat Akun Sekarang"
              )}
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Masuk disini
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}