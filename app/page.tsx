import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Printer, Clock, ShieldCheck, ArrowRight, Palette } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserNav } from "@/components/user-nav"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 lg:px-14 h-16 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center font-extrabold text-2xl tracking-tighter" href="/">
          VIZADA
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#layanan">
            Layanan
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#keunggulan">
            Keunggulan
          </Link>
        </nav>
        <div className="ml-6 flex items-center gap-4">
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="font-medium">Daftar</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-muted/50 to-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Solusi Cetak Digital <br className="hidden sm:block" /> Modern & Cepat
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                  Platform manajemen percetakan terpadu untuk segala kebutuhan cetak Anda. 
                  Pesan, pantau, dan terima hasil cetak berkualitas tinggi langsung dari Vizada.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={session?.user ? "/products" : "/register"}>
                  <Button size="lg" className="h-12 px-8 text-base">
                    Mulai Pesanan <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href={session?.user ? "/orders" : "/login"}>
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    Cek Status Pesanan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="layanan" className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Layanan Cetak Unggulan</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-lg">
                Dari kebutuhan personal hingga bisnis skala besar, Vizada menyediakan berbagai macam layanan cetak dengan kualitas mesin terbaik.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Large Format</h3>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Banner, Baliho, Spanduk, dan Sticker dengan resolusi tinggi dan warna presisi.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Printer className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Document & Book</h3>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Cetak buku, modul, majalah, dan dokumen perkantoran dengan berbagai pilihan jilid.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Merchandise</h3>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Mug, Pin, ID Card, dan Lanyard kustom berkualitas untuk kebutuhan promosi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="keunggulan" className="w-full py-16 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Mengapa Memilih Vizada?</h2>
                <p className="text-muted-foreground md:text-lg leading-relaxed">
                  Kami mengintegrasikan teknologi digital ke dalam proses percetakan tradisional untuk memberikan pengalaman terbaik, tercepat, dan transparan bagi pelanggan.
                </p>
                <div className="grid gap-8 mt-8">
                  <div className="flex items-start gap-4">
                    <Clock className="h-8 w-8 text-primary mt-1" />
                    <div>
                      <h3 className="font-bold text-xl">Estimasi Waktu Akurat</h3>
                      <p className="text-muted-foreground mt-1">Sistem penjadwalan cerdas kami menjamin pesanan selesai tepat waktu tanpa keterlambatan.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Printer className="h-8 w-8 text-primary mt-1" />
                    <div>
                      <h3 className="font-bold text-xl">Tracking Real-Time</h3>
                      <p className="text-muted-foreground mt-1">Pantau proses pesanan Anda mulai dari antrean, proses cetak, hingga siap diambil dari mana saja.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[450px] w-full max-w-[500px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border shadow-inner flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-background rounded-full shadow-md mb-2">
                      <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Sistem Terintegrasi</h3>
                    <p className="text-muted-foreground px-8">Menghubungkan pelanggan dan mesin produksi dalam satu pintu.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 sm:flex-row py-8 w-full shrink-0 items-center justify-between px-6 md:px-14 border-t bg-background">
        <p className="text-sm text-muted-foreground font-medium">
          © 2026 Percetakan Vizada Mojokerto. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">
            Syarat & Ketentuan
          </Link>
          <Link className="text-sm text-muted-foreground hover:text-foreground transition-colors" href="#">
            Kebijakan Privasi
          </Link>
        </nav>
      </footer>
    </div>
  )
}