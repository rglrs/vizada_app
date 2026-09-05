import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Printer, Clock, ShieldCheck, ArrowRight, Palette, Sparkles, CheckCircle2, Zap, Layers, Cpu } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserNav } from "@/components/user-nav"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Glass Header */}
      <header className="px-6 lg:px-14 h-16 flex items-center border-b border-border/70 sticky top-0 glass-header z-50">
        <Link className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tighter group" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Printer className="h-5 w-5" />
          </div>
          <span className="text-gradient font-black tracking-tight">VIZADA</span>
        </Link>
        <nav className="ml-auto hidden md:flex items-center gap-6">
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" href="#layanan">
            Layanan Unggulan
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" href="#fitur">
            Fitur Cerdas
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors" href="#keunggulan">
            Keunggulan
          </Link>
        </nav>
        <div className="ml-auto md:ml-8 flex items-center gap-3">
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-semibold text-sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="btn-gradient font-semibold text-sm px-4 rounded-xl shadow-md shadow-indigo-500/20">
                  Daftar Sekarang
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Ambient Glow and Floating Badges */}
        <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-[110px] pointer-events-none animate-glow-breathe" />
          <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-cyan-400/15 dark:bg-cyan-400/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[350px] h-[250px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[90px] pointer-events-none" />

          <div className="container relative px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              {/* Floating Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-md animate-float-slow">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>Sistem Otomasi Percetakan Digital Terpadu</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              {/* Bold Gradient Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.1]">
                  Solusi Cetak Digital <br />
                  <span className="text-gradient">Modern, Cepat & Presisi</span>
                </h1>
                <p className="mx-auto max-w-[720px] text-muted-foreground text-base sm:text-xl leading-relaxed font-normal">
                  Platform manajemen percetakan generasi baru. Nikmati kemudahan memesan, kalkulasi otomatis, pelacakan real-time, hingga jaminan mutu inspeksi berfoto dalam satu sistem.
                </p>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto justify-center">
                <Link href={session?.user ? "/products" : "/register"}>
                  <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-bold btn-gradient rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all">
                    Pesan Cetakan Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href={session?.user ? "/orders" : "/login"}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-base font-bold rounded-xl border-border/80 bg-card/60 backdrop-blur-md hover:bg-muted/80 shadow-xs">
                    Pantau Status Pesanan
                  </Button>
                </Link>
              </div>

              {/* Realtime Stats Showcase Capsule */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-10 mt-6 border-t border-border/70">
                <div className="flex flex-col items-center p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover-lift">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 mb-2">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-foreground">Hari Ini</span>
                  <span className="text-xs text-muted-foreground font-medium">Layanan Express</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover-lift">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 mb-2">
                    <Palette className="h-5 w-5" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-foreground">Ultra HD</span>
                  <span className="text-xs text-muted-foreground font-medium">Presisi Warna Tajam</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover-lift">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 mb-2">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-foreground">100% QC</span>
                  <span className="text-xs text-muted-foreground font-medium">Verifikasi Berfoto</span>
                </div>
                <div className="flex flex-col items-center p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 hover-lift">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 mb-2">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-foreground">Real-Time</span>
                  <span className="text-xs text-muted-foreground font-medium">Tracking Antrean</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layanan Cetak Unggulan */}
        <section id="layanan" className="w-full py-16 md:py-24 bg-muted/30 border-y border-border/70 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-3 text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                Katalog Lengkap
              </span>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                Layanan Cetak Unggulan
              </h2>
              <p className="max-w-[700px] text-muted-foreground text-sm sm:text-base">
                Didukung mesin industri modern dengan kemampuan cetak presisi untuk segala kebutuhan personal maupun komersial skala besar.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl items-stretch gap-8 md:grid-cols-3">
              {/* Card 1 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-8 shadow-xs hover-lift group">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Palette className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Large Format Printing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Banner flexi, spanduk, backdrop acara, roll-up banner, dan sticker vinil resolusi tinggi tahan air dan cuaca luar ruangan.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Mulai Rp 15.000 / m²</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/30 bg-card p-8 shadow-md shadow-indigo-500/5 hover-lift relative group">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-white text-[11px] font-extrabold shadow-sm">
                  TERPOPULER
                </div>
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Printer className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Document & Publishing</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cetak buku, modul pelatihan, majalah, kartu nama laminasi, brosur promosi, dan dokumen perkantoran dengan jilid profesional.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Mulai Rp 500 / lembar</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-8 shadow-xs hover-lift group">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <Layers className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Merchandise & Souvenir</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Custom mug keramik, pin magnet, ID card PVC karyawan, lanyard sablon, dan kemasan kustom untuk promosi brand Anda.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Mulai Rp 10.000 / pcs</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keunggulan Sistem Terpadu */}
        <section id="keunggulan" className="w-full py-20 md:py-28 relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                  <Cpu className="h-3.5 w-3.5" /> Teknologi Terintegrasi
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                  Mengapa Memilih Ekosistem Vizada?
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                  Kami menggabungkan mesin cetak mutakhir dengan sistem ERP digital yang transparan untuk menghilangkan kendala waktu, keraguan kualitas, dan antrean manual.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 mt-0.5">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">Jadwal Produksi Mesin Akurat</h4>
                      <p className="text-sm text-muted-foreground mt-1">Sistem penjadwalan cerdas mengalokasikan pesanan ke operator & mesin cetak yang tersedia tanpa tumpang tindih.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 mt-0.5">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">Quality Control Berfoto</h4>
                      <p className="text-sm text-muted-foreground mt-1">Setiap hasil cetakan diinspeksi oleh operator QC berfoto sebelum diserahkan ke tangan pelanggan.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 mt-0.5">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-foreground">Pembayaran Instan & Voucher Promo</h4>
                      <p className="text-sm text-muted-foreground mt-1">Unggah bukti transfer langsung terverifikasi, otomatis memotong diskon voucher hemat.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Showcase Card */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-[480px] p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-card to-cyan-500/10 border border-border/80 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border/70">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-rose-500" />
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">VIZADA MONITORING v2.0</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/70 shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-xs font-bold">Mesin Roland TrueVis VG3</span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600">Mencetak #VZ-1082</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/70 shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold">Konica Minolta AccurioPress</span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">Tersedia</span>
                      </div>

                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/70 shadow-xs">
                        <div className="flex items-center gap-3">
                          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold">Inspeksi Quality Control</span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">100% Lolos</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white flex items-center justify-between shadow-lg shadow-indigo-500/25">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider font-semibold opacity-90">Efisiensi Produksi</span>
                          <h4 className="text-lg font-black">99.4% On-Time</h4>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-white/90" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-border/70 bg-card/60 backdrop-blur-md py-10 px-6 lg:px-14">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white font-bold text-xs">
              <Printer className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-gradient">VIZADA</span>
            <span className="text-xs text-muted-foreground ml-2">
              © 2026 Percetakan Digital Vizada. Hak Cipta Dilindungi.
            </span>
          </div>
          <nav className="flex gap-6 text-xs font-semibold text-muted-foreground">
            <Link className="hover:text-primary transition-colors" href="/products">
              Katalog Layanan
            </Link>
            <Link className="hover:text-primary transition-colors" href="/orders">
              Lacak Pesanan
            </Link>
            <Link className="hover:text-primary transition-colors" href="/login">
              Akses Karyawan
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}