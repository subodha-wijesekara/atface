import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, UserCheck, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 max-w-[1024px] mx-auto w-full font-sans">

      {/* Header */}
      <header className="mb-4 mt-2 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center rounded-full bg-secondary/50 backdrop-blur-xl px-3 py-1 text-[10px] font-semibold text-secondary-foreground mb-3 border border-border/40 shadow-sm ring-1 ring-border/20">
          <span className="mr-2 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <span className="text-blue-600 dark:text-blue-500">
              V 2.0 <span className="mx-1 text-blue-200 dark:text-blue-800">|</span> Enterprise Edition
            </span>
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-foreground leading-tight drop-shadow-sm">
          Secure Access. <br className="hidden md:block" />
          <span className="text-blue-600 dark:text-blue-500">
            Uncompromised.
          </span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground/90 max-w-lg font-medium leading-relaxed">
          Enterprise-grade facial identification.
          <br />
          Instant, frictionless, and secure.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">

        {/* Real Hero Image (Span 7 cols) */}
        <div className="group relative col-span-1 md:col-span-2 lg:col-span-7 row-span-2 overflow-hidden rounded-[1.5rem] bg-black text-white shadow-xl transition-all hover:scale-[1.005] duration-500 ring-1 ring-black/5 dark:ring-white/10 min-h-[300px]">
          <div className="absolute inset-0 z-0">
            {/* Brand Identity Hero Image */}
            <Image
              src="/brand-hero.png"
              alt="Facial Recognition Security"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
              priority
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

          <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight text-white drop-shadow-md">
              AI-Powered Defense
            </h2>
            <p className="text-emerald-100/90 text-sm md:text-base max-w-sm font-medium leading-relaxed">
              State-of-the-art neural networks ensure only authorized personnel gain access.
            </p>
          </div>
        </div>

        {/* My Classes Card (Span 5 cols) */}
        <Link href="/rooms" className="glass-card group relative overflow-hidden p-5 flex flex-col justify-between lg:col-span-5 rounded-[1.5rem] border border-border/50 bg-card/60 hover:bg-card/80 transition-all shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-sm ring-1 ring-indigo-500/20">
              <UserCheck className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold mb-1 tracking-tight">My Classes</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Manage your classrooms, students, and take attendance.
            </p>
          </div>

          <div className="relative z-10 flex items-center text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-3 group-hover:translate-x-1 transition-transform">
            View Classes <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </Link>

        {/* Analytics Card (Span 5 cols) */}
        <Link href="/analytics" className="glass-card group relative overflow-hidden p-5 flex flex-col justify-between lg:col-span-3 rounded-[1.5rem] border border-border/50 bg-card/60 hover:bg-card/80 transition-all shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-sm ring-1 ring-blue-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold mb-1 tracking-tight">Analytics</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              View reports & insights.
            </p>
          </div>

          <div className="relative z-10 flex items-center text-blue-600 dark:text-blue-400 text-xs font-bold mt-3 group-hover:translate-x-1 transition-transform">
            View Reports <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </Link>

        {/* Maintenance Card (Span 2 cols) */}
        <Link href="/maintenance" className="glass-card group relative overflow-hidden p-5 flex flex-col justify-between lg:col-span-2 rounded-[1.5rem] border border-border/50 bg-card/60 hover:bg-card/80 transition-all shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-sm ring-1 ring-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold mb-1 tracking-tight">Maintenance</h3>
            {/* <p className="text-muted-foreground text-sm font-medium leading-relaxed hidden xl:block">
              Manage Data.
            </p> */}
          </div>

          <div className="relative z-10 flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-3 group-hover:translate-x-1 transition-transform">
            Go <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </Link>

        {/* Stats Card (Span 12 cols) */}
        <div className="glass-card relative overflow-hidden p-5 flex flex-col justify-center items-center rounded-[1.5rem] col-span-1 md:col-span-2 lg:col-span-12 bg-card/40 border border-border/30">
          <div className="grid grid-cols-3 gap-6 md:gap-16 w-full max-w-3xl">
            <div className="text-center group cursor-default">
              <div className="text-xl md:text-3xl font-extrabold text-foreground mb-0.5 transition-all group-hover:scale-110 group-hover:text-blue-500">99.9%</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Accuracy</div>
            </div>
            <div className="text-center group cursor-default border-l border-r border-border/40">
              <div className="text-xl md:text-3xl font-extrabold text-foreground mb-0.5 transition-all group-hover:scale-110 group-hover:text-emerald-500">0.2s</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Latency</div>
            </div>
            <div className="text-center group cursor-default">
              <div className="text-xl md:text-3xl font-extrabold text-foreground mb-0.5 transition-all group-hover:scale-110 group-hover:text-purple-500">AES</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Encrypted</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
