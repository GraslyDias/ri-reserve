import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Flower2, Heart, MessageCircle, Sparkles, ChevronDown, Star,
  Leaf, HandHeart, Brain, Activity, Gift, Users, ShieldCheck,
  Wallet, Phone, Mail, MapPin, Clock, Instagram, Facebook, ArrowRight,
  Award, CalendarCheck, Send, Check,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteNav } from "@/components/site/site-nav";
import { BookingDialog } from "@/components/site/booking-dialog";
import {
  BUSINESS_EMAIL, BUSINESS_HOURS, BUSINESS_LOCATION, BUSINESS_PHONE,
  CATEGORY_COLOR, CATEGORY_LABEL, whatsappUrl,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Landing });

interface Package {
  id: string; name: string; category: string; type: "individual" | "group";
  duration_minutes: number; description: string; benefits: string[];
  price_lkr: number | null; discount_percent: number | null;
  max_capacity: number | null;
}

function Landing() {
  const [bookOpen, setBookOpen] = useState(false);
  const [preselected, setPreselected] = useState<string | null>(null);

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages").select("*").eq("is_active", true).order("display_order");
      if (error) throw error;
      return data as Package[];
    },
  });

  function openBooking(id?: string) {
    setPreselected(id ?? null);
    setBookOpen(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav onBook={() => openBooking()} />

      <Hero onBook={() => openBooking()} />
      <TrustStrip />
      <Services />
      <PackagesSection
        packages={packages} loading={isLoading}
        onBook={openBooking}
      />
      <BankSection />
      <AvailabilitySection />
      <WhyUs />
      <HowItWorks />
      <Testimonials />
      <Contact onBook={() => openBooking()} />
      <Footer />

      <BookingDialog
        open={bookOpen} onOpenChange={setBookOpen}
        packages={packages} preselectedId={preselected}
      />
    </div>
  );
}

/* ---------------- HERO ---------------- */

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section id="home" className="relative isolate overflow-hidden min-h-screen flex items-center bg-hero text-ivory">
      <div className="absolute inset-0 leaf-pattern opacity-80" />
      <div className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-[28rem] w-[28rem] rounded-full bg-[oklch(0.4_0.1_150)]/30 blur-3xl animate-float-slow" />

      <div className="relative mx-auto max-w-5xl px-6 py-32 text-center lg:py-44">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wider text-gold backdrop-blur animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          A LUXURY SRI LANKAN WELLNESS SANCTUARY
        </div>

        <h1 className="mt-7 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl animate-fade-up">
          Relax, heal &<br />
          <span className="italic text-gold">reconnect</span> with your<br />
          body and mind
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-base text-ivory/80 sm:text-lg animate-fade-up" style={{ animationDelay: "120ms" }}>
          Premium yoga, massage, counselling & healing therapy in Sri Lanka — designed for individuals and intimate groups seeking real stillness.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <Button variant="gold" size="xl" asChild>
            <a href="#packages">View Packages</a>
          </Button>
          <Button size="xl" onClick={onBook}
            className="rounded-full bg-white text-primary hover:bg-white/90 shadow-soft">
            Book a Session
          </Button>
          <Button variant="outlineGold" size="xl" asChild>
            <a href={whatsappUrl("Hi Serenity Wellness — I'd like to know more about your packages.")}
              target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
          </Button>
        </div>

        <a href="#trust"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/60 hover:text-gold transition-colors animate-scroll-bounce">
          <ChevronDown className="h-7 w-7" />
        </a>
      </div>
    </section>
  );
}

/* ---------------- TRUST STRIP ---------------- */

function TrustStrip() {
  const stats = [
    { n: "500+", l: "Happy Clients", i: Heart },
    { n: "8", l: "Wellness Services", i: Leaf },
    { n: "5★", l: "Experience", i: Star },
    { n: "WhatsApp", l: "Easy Booking", i: MessageCircle },
  ];
  return (
    <section id="trust" className="relative -mt-20 z-10 px-5 lg:px-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="group flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-secondary">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-primary">
              <s.i className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl text-primary">{s.n}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-3xl text-center">
        <SectionEyebrow>Our Mission</SectionEyebrow>
        <h2 className="mt-3 font-display text-3xl text-primary sm:text-4xl">
          A quiet space to come home to yourself
        </h2>
        <p className="mt-5 text-muted-foreground">
          We blend traditional Sri Lankan healing with modern therapeutic practice — guiding each guest through restorative experiences in a private, unhurried setting.
        </p>
      </div>
    </section>
  );
}

/* ---------------- SERVICE CATEGORIES ---------------- */

function Services() {
  const items = [
    { i: Leaf, t: "Yoga Packages", d: "Individual & group flows — beginner to advanced." },
    { i: HandHeart, t: "Massage Therapy", d: "Relaxation, deep tissue and signature wellness." },
    { i: Brain, t: "Counselling", d: "Confidential one-on-one stress and lifestyle support." },
    { i: Activity, t: "Healing Therapy", d: "Body-mind recovery and energy balance." },
    { i: Gift, t: "Mixed Bundles", d: "Combine services and save up to 25%." },
  ];
  return (
    <section className="px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <SectionEyebrow>What We Offer</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">
            Five paths to <span className="italic text-gold">stillness</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((s) => (
            <div key={s.t}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-gold">
              <div className="absolute inset-x-0 -top-1 h-1 bg-gold-gradient opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-ivory">
                <s.i className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl text-foreground">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PACKAGES ---------------- */

const FILTERS = ["all", "yoga", "massage", "counselling", "therapy", "mixed"] as const;

function PackagesSection({
  packages, loading, onBook,
}: {
  packages: Package[]; loading: boolean;
  onBook: (id?: string) => void;
}) {
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const filtered = useMemo(
    () => filter === "all" ? packages : packages.filter((p) => p.category === filter),
    [filter, packages],
  );
  return (
    <section id="packages" className="relative bg-secondary/40 px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionEyebrow>Full Catalog</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">
              Curated wellness packages
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/70 hover:border-gold hover:text-primary",
                )}
              >
                {f === "all" ? "All" : CATEGORY_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
          {!loading && filtered.map((p) => (
            <PackageCard key={p.id} p={p} onBook={() => onBook(p.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({ p, onBook }: { p: Package; onBook: () => void }) {
  const isMixed = p.category === "mixed";
  const waUrl = whatsappUrl(`Hi! I'm interested in the "${p.name}" package. Could you share more details?`);
  return (
    <article className={cn(
      "group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft",
      isMixed ? "border-gold/60 shadow-gold/30" : "border-border hover:border-gold/60",
    )}>
      {isMixed && p.discount_percent ? (
        <div className="absolute -right-12 top-5 rotate-45 bg-gold-gradient px-12 py-1 text-xs font-bold tracking-wider text-[oklch(0.2_0.03_80)]">
          SAVE {p.discount_percent}%
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn("font-medium uppercase tracking-wider", CATEGORY_COLOR[p.category])}>
          {CATEGORY_LABEL[p.category]}
        </Badge>
        <Badge variant="outline" className="border-border text-foreground/60">
          {p.type === "group" ? `Group · up to ${p.max_capacity ?? 8}` : "Individual"}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground">{p.duration_minutes} min</span>
      </div>

      <h3 className="mt-4 font-display text-2xl text-primary">{p.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.description}</p>

      <ul className="mt-4 space-y-1.5 text-sm">
        {p.benefits.slice(0, 4).map((b) => (
          <li key={b} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span className="text-foreground/80">{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
        <div>
          {p.price_lkr ? (
            <>
              <div className="font-display text-xl text-primary">LKR {p.price_lkr.toLocaleString()}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">All inclusive</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Contact for pricing</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="forest" className="flex-1" onClick={onBook}>
          Book Now <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" asChild className="border-gold text-gold hover:bg-gold hover:text-[oklch(0.2_0.03_80)]">
          <a href={waUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp inquiry">
            <MessageCircle className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
}

/* ---------------- BANK ---------------- */

function BankSection() {
  return (
    <section className="px-5 py-24 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionEyebrow>Secure Your Slot</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl text-primary">
            Simple, flexible <span className="italic text-gold">bank transfer</span> payment
          </h2>
          <p className="mt-4 text-muted-foreground">
            Submit your inquiry first. Once we confirm availability, you can pay an advance via bank transfer to lock in your preferred date — or simply pay on arrival.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Admin confirms availability within 2 hours",
              "Send proof of payment via WhatsApp",
              "Receive your final booking confirmation",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-gradient text-[10px] font-bold text-[oklch(0.2_0.03_80)]">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gold/20 blur-3xl rounded-3xl" />
          <div className="relative rounded-3xl border border-gold/50 bg-card p-8 shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <Wallet className="h-4 w-4" /> Bank transfer details
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              {[
                ["Bank", "Commercial Bank of Ceylon"],
                ["Account Holder", "Serenity Wellness Center"],
                ["Account No.", "8001-2345-6789"],
                ["Branch", "Negombo Main"],
                ["SWIFT", "CCEYLKLX"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Submit your inquiry first. Payment confirms your slot. Admin will contact you within 2 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- AVAILABILITY (simple visual) ---------------- */

function AvailabilitySection() {
  const { data: bookings = [] } = useQuery({
    queryKey: ["confirmed_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("confirmed_bookings").select("booking_date,package_type,participants,max_capacity")
        .gte("booking_date", new Date().toISOString().slice(0, 10));
      if (error) throw error;
      return data as Array<{ booking_date: string; package_type: string; participants: number; max_capacity: number }>;
    },
  });

  const today = new Date();
  const monthDays = useMemo(() => {
    const year = today.getFullYear(); const month = today.getMonth();
    const last = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => i + 1);
  }, [today]);

  function statusForDay(day: number) {
    const dateStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`;
    const dayBookings = bookings.filter((b) => b.booking_date === dateStr);
    if (dayBookings.some((b) => b.package_type === "individual")) return "booked";
    const groupFill = dayBookings.find((b) => b.package_type === "group");
    if (groupFill && groupFill.participants >= groupFill.max_capacity) return "booked";
    if (groupFill) return "filling";
    return "open";
  }

  const colors: Record<string, string> = {
    open: "bg-[oklch(0.92_0.08_150)] text-[oklch(0.3_0.08_150)] border-[oklch(0.7_0.12_150)]",
    filling: "bg-[oklch(0.94_0.1_85)] text-[oklch(0.4_0.12_85)] border-gold",
    booked: "bg-[oklch(0.94_0.05_25)] text-[oklch(0.45_0.15_25)] border-[oklch(0.65_0.18_25)]",
  };

  return (
    <section className="bg-secondary/40 px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <SectionEyebrow>Availability This Month</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl text-primary">
            Live booking calendar
          </h2>
          <p className="mt-3 text-muted-foreground">
            Green = open · Amber = group filling · Red = fully booked
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 text-center font-display text-2xl text-primary">
            {today.toLocaleString("en", { month: "long", year: "numeric" })}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="font-semibold text-muted-foreground">{d}</div>
            ))}
            {Array.from({ length: new Date(today.getFullYear(), today.getMonth(), 1).getDay() }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {monthDays.map((d) => {
              const status = statusForDay(d);
              const isPast = d < today.getDate();
              return (
                <div key={d}
                  className={cn(
                    "aspect-square rounded-lg border p-2 text-sm font-medium",
                    isPast ? "opacity-30 bg-muted text-muted-foreground border-transparent" : colors[status],
                  )}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY US ---------------- */

function WhyUs() {
  const items = [
    { i: Award, t: "Certified professionals", d: "Internationally trained yoga, therapy and counselling team." },
    { i: Users, t: "Individual & group", d: "Private one-on-ones or intimate group sessions up to 8." },
    { i: Sparkles, t: "Luxurious private space", d: "A quiet sanctuary inspired by Sri Lanka's finest resorts." },
    { i: Wallet, t: "Flexible payment", d: "Pay on arrival or via secure bank transfer." },
    { i: CalendarCheck, t: "Personally confirmed", d: "Every booking is reviewed by our admin team." },
    { i: MessageCircle, t: "WhatsApp-first", d: "Real conversations, no impersonal chatbots." },
  ];
  return (
    <section className="px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <SectionEyebrow>Why Serenity</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">
            A luxury wellness experience, <span className="italic text-gold">crafted with care</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-gold hover:shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.i className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl text-foreground">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */

function HowItWorks() {
  const steps = [
    { i: Leaf, t: "Choose Package" },
    { i: Send, t: "Submit Inquiry" },
    { i: ShieldCheck, t: "Admin Reviews" },
    { i: Wallet, t: "Confirm & Pay" },
    { i: Sparkles, t: "Enjoy Session" },
  ];
  return (
    <section id="how" className="bg-primary text-ivory px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold">
            How it works
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">
            Five steps to <span className="italic text-gold">serenity</span>
          </h2>
        </div>
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent lg:block" />
          <ol className="grid gap-10 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.t} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-primary shadow-gold font-display text-lg">
                  {i + 1}
                </div>
                <s.i className="mt-4 h-5 w-5 text-gold" />
                <div className="mt-2 font-display text-lg">{s.t}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */

function Testimonials() {
  const reviews = [
    { n: "Anjali R.", t: "The sunrise yoga session was magical. The space felt like its own little resort.", c: "Yoga guest" },
    { n: "David M.", t: "Best deep tissue massage I've had in Sri Lanka. Booked the bundle for next visit.", c: "Massage" },
    { n: "Priya S.", t: "My counsellor genuinely listened. I left with practical tools and a calm mind.", c: "Counselling" },
    { n: "Tom L.", t: "Booking via WhatsApp was instant. They confirmed within an hour, beautifully personal.", c: "Easy booking" },
    { n: "Hiruni F.", t: "Friendly staff, gorgeous space and the complete wellness package was worth every rupee.", c: "Complete package" },
  ];
  return (
    <section id="testimonials" className="px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <SectionEyebrow>Guest Stories</SectionEyebrow>
          <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">
            Loved by guests across <span className="italic text-gold">the island</span>
          </h2>
        </div>
        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <div key={r.n} className="mb-6 break-inside-avoid rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-ivory font-display text-base">
                  {r.n.split(" ").map((x) => x[0]).join("")}
                </div>
                <div>
                  <div className="font-medium text-foreground">{r.n}</div>
                  <div className="text-xs text-muted-foreground">{r.c}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">"{r.t}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT ---------------- */

function Contact({ onBook }: { onBook: () => void }) {
  return (
    <section id="contact" className="bg-secondary/40 px-5 py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionEyebrow>Get In Touch</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl text-primary sm:text-5xl">
              We'd love to <span className="italic text-gold">host you</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              WhatsApp is the fastest way to reach us — our team replies within minutes.
            </p>

            <Button variant="gold" size="xl" className="mt-8" asChild>
              <a href={whatsappUrl("Hi Serenity Wellness!")} target="_blank" rel="noreferrer">
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>
            </Button>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <ContactRow i={Phone} k="Phone" v={BUSINESS_PHONE} />
              <ContactRow i={Mail} k="Email" v={BUSINESS_EMAIL} />
              <ContactRow i={MapPin} k="Location" v={BUSINESS_LOCATION} />
              <ContactRow i={Clock} k="Hours" v={BUSINESS_HOURS} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <iframe
                title="Map"
                src="https://www.google.com/maps?q=Negombo,Sri+Lanka&output=embed"
                className="h-full w-full"
                loading="lazy"
              />
            </div>
            <button
              onClick={onBook}
              className="group flex w-full items-center justify-between rounded-2xl border border-gold/40 bg-card p-5 text-left transition-all hover:shadow-gold"
            >
              <div>
                <div className="text-xs uppercase tracking-widest text-gold">Quick booking</div>
                <div className="mt-1 font-display text-lg text-primary">Skip the chat — book a session now</div>
              </div>
              <ArrowRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ i: I, k, v }: { i: typeof Phone; k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-primary">
        <I className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{k}</div>
        <div className="text-sm font-medium text-foreground">{v}</div>
      </div>
    </div>
  );
}

/* ---------------- FOOTER ---------------- */

function Footer() {
  return (
    <footer className="bg-primary text-ivory/80">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient">
                <Flower2 className="h-4 w-4 text-[oklch(0.2_0.03_80)]" />
              </span>
              <span className="font-display text-lg text-ivory">Serenity Wellness</span>
            </div>
            <p className="mt-3 text-sm text-ivory/60">
              A luxury Sri Lankan sanctuary for yoga, massage, counselling and healing therapy.
            </p>
          </div>
          <FooterCol title="Explore" links={[
            ["Home", "#home"], ["Packages", "#packages"],
            ["How It Works", "#how"], ["Contact", "#contact"],
          ]} />
          <FooterCol title="Visit" links={[
            ["Negombo, Sri Lanka", "#"],
            ["Mon–Sun 6:00 AM – 9:00 PM", "#"],
            [BUSINESS_PHONE, `tel:${BUSINESS_PHONE}`],
            [BUSINESS_EMAIL, `mailto:${BUSINESS_EMAIL}`],
          ]} />
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Follow</div>
            <div className="mt-4 flex gap-3">
              {[Instagram, Facebook].map((I, i) => (
                <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 hover:border-gold hover:text-gold">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-ivory/10 pt-6 text-xs text-ivory/60 sm:flex-row">
          <div>© {new Date().getFullYear()} Serenity Wellness. All rights reserved.</div>
          <div>Crafted with intention in Sri Lanka 🌿</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-gold">{title}</div>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([l, h]) => (
          <li key={l}><a href={h} className="text-ivory/70 hover:text-gold">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
      <span className="h-px w-8 bg-gold/60" />
      {children}
    </div>
  );
}
