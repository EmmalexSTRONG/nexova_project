"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CreditCard,
  GraduationCap,
  Megaphone,
  Monitor,
  ShoppingCart,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrbitFeature {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  image: string;
  href?: string;
  action?: "chat";
}

const FEATURES: OrbitFeature[] = [
  {
    key: "vendors",
    label: "Multi-vendor",
    description: "Shop from trusted vendors",
    icon: Store,
    image: "https://images.unsplash.com/photo-1463860914822-61dc3ee606f7",
    href: "/vendors",
  },
  {
    key: "ai",
    label: "AI Assistant",
    description: "Smart help, anytime you need it",
    icon: Bot,
    image: "https://images.unsplash.com/photo-1694903110330-cc64b7e1d21d",
    action: "chat",
  },
  {
    key: "delivery",
    label: "Delivery Tracking",
    description: "Track your orders in real-time",
    icon: Truck,
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55",
    href: "/account/orders",
  },
  {
    key: "payments",
    label: "Payments",
    description: "Safe, fast & reliable transactions",
    icon: CreditCard,
    image: "https://images.unsplash.com/photo-1509017174183-0b7e0278f1ec",
    href: "/help",
  },
  {
    key: "tech",
    label: "Technology Services",
    description: "Digital solutions for your business",
    icon: Monitor,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    href: "/services",
  },
  {
    key: "training",
    label: "Training",
    description: "Learn new skills, grow your future",
    icon: GraduationCap,
    image: "https://images.unsplash.com/photo-1758612898312-708f2ffdcd53",
    href: "/services",
  },
  {
    key: "advertising",
    label: "Advertising",
    description: "Promote your brand, reach more people",
    icon: Megaphone,
    image: "https://images.unsplash.com/photo-1602189156324-4c5c6c2c02b3",
    href: "/help#advertising",
  },
];

const RING_RADIUS = 168;
const ORBIT_DURATION = 42;
const ANGLE_STEP = 360 / FEATURES.length;

// Pages rendered live inside the phone screen — deliberately excludes "/" so the
// hero never embeds itself inside its own iframe.
const SHOWCASE_PAGES = [
  { path: "/vendors", label: "Shops" },
  { path: "/products/samsung-galaxy-a15-128gb", label: "Product" },
  { path: "/blog", label: "Blog" },
  { path: "/services", label: "Services" },
  { path: "/cart", label: "Cart" },
  { path: "/admin/dashboard", label: "Admin" },
];
const SCREEN_INTERVAL_MS = 4200;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

function OrbitIconButton({ feature, index, reduceMotion }: { feature: OrbitFeature; index: number; reduceMotion: boolean }) {
  const router = useRouter();
  const [zooming, setZooming] = useState(false);

  function handleActivate() {
    if (zooming) return;
    setZooming(true);
    window.setTimeout(() => {
      if (feature.action === "chat") {
        window.dispatchEvent(new CustomEvent("nexora:open-chat"));
        setZooming(false);
      } else if (feature.href) {
        router.push(feature.href);
      }
    }, 240);
  }

  return (
    <motion.button
      type="button"
      onClick={handleActivate}
      aria-label={feature.label}
      className="group relative flex flex-col items-center gap-2 focus-visible:outline-none"
      animate={{
        y: reduceMotion ? 0 : [0, -5, 0],
        scale: zooming ? 1.7 : 1,
        opacity: zooming ? 0 : 1,
      }}
      transition={{
        y: { duration: 2.6 + index * 0.3, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.24 },
      }}
      whileHover={{ scale: 1.15 }}
      whileFocus={{ scale: 1.15 }}
    >
      <motion.span
        className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-primary/60 bg-ink sm:h-16 sm:w-16"
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  "0 0 0 0 rgba(240,169,60,0.35)",
                  "0 0 0 10px rgba(240,169,60,0)",
                  "0 0 0 0 rgba(240,169,60,0)",
                ],
              }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: index * 0.25 }}
      >
        <Image
          src={`${feature.image}?w=128&h=128&fit=crop&q=80&auto=format`}
          alt=""
          fill
          unoptimized
          sizes="64px"
          className="object-cover"
        />
      </motion.span>
      <span className="whitespace-nowrap text-center text-[11px] font-medium leading-tight text-ink-foreground/90 sm:text-xs">
        {feature.label}
      </span>
    </motion.button>
  );
}

function OrbitRing({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="absolute inset-0"
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={reduceMotion ? undefined : { duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
    >
      {FEATURES.map((feature, index) => {
        const angle = index * ANGLE_STEP;
        return (
          <div key={feature.key} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg)` }}>
            {/* circuit spoke connecting the hub to this icon */}
            <div
              className="absolute left-0 top-0 h-px origin-left bg-gradient-to-r from-primary/60 via-primary/25 to-transparent"
              style={{ width: RING_RADIUS - 46 }}
            />
            <span
              className="absolute h-1 w-1 -translate-y-1/2 rounded-full bg-primary/70"
              style={{ left: RING_RADIUS - 46 }}
            />

            <div className="absolute left-0 top-0" style={{ transform: `translate(${RING_RADIUS}px, -50%)` }}>
              <motion.div
                animate={reduceMotion ? undefined : { rotate: [-angle, -angle - 360] }}
                transition={reduceMotion ? undefined : { duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
                style={reduceMotion ? { transform: `rotate(${-angle}deg)` } : undefined}
              >
                <OrbitIconButton feature={feature} index={index} reduceMotion={reduceMotion} />
              </motion.div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function PhoneScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    // Each tick swaps in a fresh live-page iframe, so a backgrounded tab
    // would otherwise keep loading full pages (including /admin/dashboard)
    // every few seconds for no one to see — pause while hidden.
    let id: number | undefined;
    function start() {
      if (id !== undefined) return;
      id = window.setInterval(() => {
        setIndex((current) => (current + 1) % SHOWCASE_PAGES.length);
      }, SCREEN_INTERVAL_MS);
    }
    function stop() {
      if (id === undefined) return;
      window.clearInterval(id);
      id = undefined;
    }
    function handleVisibilityChange() {
      if (document.hidden) stop();
      else start();
    }

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reduceMotion]);

  const page = SHOWCASE_PAGES[index];

  return (
    <div
      className="pointer-events-none absolute inset-x-2 top-4 bottom-4 overflow-hidden rounded-[0.9rem] bg-black ring-1 ring-white/10"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={page.path}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <iframe
            src={page.path}
            title={`Nexora — ${page.label}`}
            tabIndex={-1}
            scrolling="no"
            className="origin-top-left scale-[0.213] sm:scale-[0.256]"
            style={{ width: 375, height: 812, border: 0 }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1 pb-0.5 pt-4">
            <span className="block truncate text-center font-mono text-[6px] font-bold uppercase tracking-widest text-primary sm:text-[7px]">
              {page.label}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OrbitCenter({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* phone/device silhouette showing a live, looping tour of the site */}
      <motion.div
        className="relative h-40 w-24 rounded-[1.4rem] border border-primary/40 bg-gradient-to-b from-white/[0.06] to-black/40 shadow-[0_0_70px_-12px_rgba(240,169,60,0.5)] sm:h-48 sm:w-28"
        animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-x-3 top-2.5 h-1 rounded-full bg-white/10" />
        <PhoneScreen reduceMotion={reduceMotion} />
        <div className="absolute inset-x-2 bottom-2.5 h-1.5 rounded-full bg-white/10" />
      </motion.div>

      {/* glowing cart rising from the device */}
      <motion.div
        className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/50 bg-ink sm:-top-9 sm:h-[4.5rem] sm:w-[4.5rem]"
        style={{ boxShadow: "0 0 55px -6px rgba(240,169,60,0.75)" }}
        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShoppingCart className="h-8 w-8 text-primary sm:h-9 sm:w-9" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}

export function OrbitalHero() {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = Boolean(shouldReduceMotion);

  return (
    <section className="relative overflow-hidden bg-ink py-14 sm:py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

      <div className="container relative grid gap-16 lg:grid-cols-2 lg:items-center">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <motion.span
            custom={0.05}
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-primary"
          >
            The next era of digital commerce
          </motion.span>
          <motion.h1
            custom={0.12}
            variants={fadeUp}
            className="mt-4 max-w-lg text-balance font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink-foreground sm:text-5xl"
          >
            Welcome to <span className="gold-gradient-text">Nexora</span> Marketplace
          </motion.h1>
          <motion.p custom={0.2} variants={fadeUp} className="mt-4 max-w-md text-sm text-ink-muted sm:text-base">
            Your all-in-one platform for shopping, services, tech solutions, and growth.
            <br className="hidden sm:block" /> Shop. Connect. Grow with Nexora.
          </motion.p>
          <motion.div custom={0.28} variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href="/categories">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-ink-border bg-transparent text-ink-foreground hover:bg-ink-border hover:text-ink-foreground"
            >
              <a href="/register/vendor">Sell on Nexora</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto flex h-[380px] w-[380px] items-center justify-center sm:h-[440px] sm:w-[440px]"
        >
          <div className="absolute h-[336px] w-[336px] rounded-full border border-primary/10" />
          <OrbitRing reduceMotion={reduceMotion} />
          <OrbitCenter reduceMotion={reduceMotion} />
        </motion.div>
      </div>

      <div className="container relative mt-14">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-ink-border bg-white/[0.03] p-4 sm:grid-cols-4 sm:p-6 lg:grid-cols-7">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start gap-2 rounded-xl p-2 sm:p-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="text-xs font-semibold text-ink-foreground sm:text-sm">{feature.label}</p>
              <p className="text-[11px] leading-snug text-ink-muted sm:text-xs">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
