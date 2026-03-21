"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      toast.error("Email dan password wajib diisi")
      setIsLoading(false)
      return
    }

    const res = await signIn("credentials", { email, password, redirect: false })

    if (res?.error) {
      toast.error("Email atau password salah")
      setIsLoading(false)
    } else {
      toast.success("Login berhasil!")

      const session = await getSession()
      const role = session?.user?.role

      if (role === "MANAGEMENT") {
        router.push("/management")
      } else if (role === "ADMIN") {
        router.push("/admin")
      } else if (role === "OPERATOR") {
        router.push("/operator")
      } else {
        router.push("/products")
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="w-full max-w-md mb-6">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Beranda
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-extrabold tracking-tight">Masuk</CardTitle>
          <CardDescription className="text-base">Masuk ke akun Vizada Anda</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" disabled={isLoading} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" disabled={isLoading} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Masuk"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Belum punya akun? <Link href="/register" className="text-primary font-medium hover:underline">Daftar disini</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}