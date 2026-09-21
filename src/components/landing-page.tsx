import { Link } from "@tanstack/react-router";
import {
  animate,
  cubicBezier,
  type MotionValue,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  FileCheck2,
  FileText,
  Laptop,
  Monitor,
  MoreHorizontal,
  PackageCheck,
  Refrigerator,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tv,
  Wrench,
} from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const EASE_FN = cubicBezier(...EASE);
const HEADLINE = "Know what’s covered. Before it’s too late.".split(" ");

// Scroll-linked values use the same curve as the timed entrance animations.
function useEased(progress: MotionValue<number>, input: number[], output: number[]) {
  return useTransform(progress, input, output, { ease: EASE_FN });
}

// True on touch-first devices (phones, tablets), regardless of viewport width. Client-only, so the
// server render and first client render both assume a mouse and it updates right after mount.
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: none) and (pointer: coarse)");
    const sync = () => setCoarse(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return coarse;
}

function MagneticLink({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22 });
  const springY = useSpring(y, { stiffness: 280, damping: 22 });

  const move = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.16);
  };

  return (
    <motion.div
      onMouseMove={move}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: reduceMotion ? 0 : springX, y: reduceMotion ? 0 : springY }}
      className="inline-flex"
    >
      <Button asChild size="lg" className={cn("h-12 px-6", className)}>
        <Link to="/auth">
          {children}
          <ArrowRight />
        </Link>
      </Button>
    </motion.div>
  );
}

function MiniDonut() {
  return (
    <div className="relative grid size-24 shrink-0 place-items-center rounded-full bg-[conic-gradient(var(--color-success)_0_64%,var(--color-warning)_64%_82%,var(--color-danger)_82%)]">
      <div className="grid size-[68px] place-items-center rounded-full bg-card text-center">
        <span className="text-xl font-semibold">12</span>
        <span className="-mt-5 text-[9px] text-muted-foreground">DEVICES</span>
      </div>
    </div>
  );
}

function DashboardScene({ compact = false }: { compact?: boolean }) {
  const devices = [
    ["MacBook Air", "Apple", "Active", "text-success"],
    ["OLED Television", "Sony", "73 days", "text-warning"],
    ["Double-door Fridge", "Samsung", "Expired", "text-danger"],
  ];

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-2xl", compact ? "p-3" : "p-4 md:p-5")}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground"><ShieldCheck className="size-3.5" /></span>
          Warrantify
        </div>
        <div className="flex items-center gap-2 text-muted-foreground"><Bell className="size-3.5" /><span className="size-5 rounded-full bg-primary-soft" /></div>
      </div>
      <div className="pt-4">
        <p className="text-[10px] text-muted-foreground">SATURDAY, 19 SEPTEMBER</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div><h3 className="text-lg font-semibold">Good evening, Nishanth.</h3><p className="text-[10px] text-muted-foreground">Your household coverage at a glance.</p></div>
          <span className="rounded-md bg-primary px-2.5 py-1.5 text-[9px] font-medium text-primary-foreground">+ Register device</span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[["12", "Devices"], ["9", "Active"], ["2", "Expiring"], ["1", "Expired"]].map(([value, label], index) => (
            <div key={label} className="landing-hover relative overflow-hidden rounded-md border border-border bg-card p-2 hover:border-primary/40">
              <span className={cn("absolute inset-x-0 top-0 h-0.5", index === 1 ? "bg-success" : index === 2 ? "bg-warning" : index === 3 ? "bg-danger" : "bg-primary")} />
              <p className="text-base font-semibold">{value}</p><p className="text-[8px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 rounded-md border border-border bg-card p-3">
          <div>
            <p className="text-[9px] font-medium text-muted-foreground">MY DEVICES</p>
            <div className="mt-2 divide-y divide-border">
              {devices.map(([name, brand, status, tone]) => (
                <div key={name} className="landing-hover-row flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-md bg-primary-soft text-primary"><Monitor className="size-3" /></span><div><p className="text-[9px] font-medium">{name}</p><p className="text-[7px] text-muted-foreground">{brand}</p></div></div>
                  <span className={cn("text-[8px] font-medium", tone)}>{status}</span>
                </div>
              ))}
            </div>
          </div>
          {!compact && <MiniDonut />}
        </div>
      </div>
    </div>
  );
}

function HeroPreview() {
  const reduceMotion = useReducedMotion();
  const coarse = useCoarsePointer();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const rotateX = useMotionValue(3);
  const rotateY = useMotionValue(-6);
  const smoothX = useSpring(rotateX, { stiffness: 120, damping: 18 });
  const smoothY = useSpring(rotateY, { stiffness: 120, damping: 18 });
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);
  const smoothDriftX = useSpring(driftX, { stiffness: 40, damping: 20 });
  const smoothDriftY = useSpring(driftY, { stiffness: 40, damping: 20 });
  const tiltX = useTransform<number, number>(
    [smoothX, smoothDriftX],
    ([tilt = 0, drift = 0]) => tilt + drift,
  );
  const tiltY = useTransform<number, number>(
    [smoothY, smoothDriftY],
    ([tilt = 0, drift = 0]) => tilt + drift,
  );

  // Slow autonomous drift (~11s / ~9s periods) layered over the pointer tilt, so the card
  // keeps breathing before the mouse moves. The spring smooths the jump when it re-enters view.
  useAnimationFrame((time) => {
    if (reduceMotion || coarse || !inView) return;
    driftX.set(Math.sin(time / 1750) * 1.4);
    driftY.set(Math.sin(time / 1430) * 2);
  });

  // Touch devices have no cursor to follow (and a tap fires a stray mousemove that would leave the
  // card stuck tilted), so sweep it through roughly the same range a cursor would.
  useEffect(() => {
    if (!coarse || reduceMotion || !inView) return;
    driftX.set(0);
    driftY.set(0);
    const sweepX = animate(rotateX, [null, 7, 3, -1, 3], { duration: 11, ease: "easeInOut", repeat: Infinity });
    const sweepY = animate(rotateY, [null, -1, -6, -11, -6], { duration: 9, ease: "easeInOut", repeat: Infinity });
    return () => {
      sweepX.stop();
      sweepY.stop();
    };
  }, [coarse, reduceMotion, inView, rotateX, rotateY, driftX, driftY]);

  const move = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || coarse) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 10);
    rotateX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 8);
  };

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, x: 60, rotate: 2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 1.1, delay: 0.55, ease: EASE }}
      className="relative mx-auto w-full max-w-[680px] lg:translate-x-[8%]"
      style={{ perspective: 1200 }}
      onMouseMove={move}
      onMouseLeave={() => { if (coarse) return; rotateX.set(3); rotateY.set(-6); }}
    >
      <motion.div style={{ rotateX: reduceMotion ? 0 : tiltX, rotateY: reduceMotion ? 0 : tiltY, transformStyle: "preserve-3d" }}>
        <div className="landing-preview-glow absolute inset-[8%] -z-10" />
        <DashboardScene />
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden px-5 pb-20 pt-24 md:px-10 lg:px-16">
      <div className="mx-auto grid w-full max-w-[1480px] items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 max-w-3xl lg:pb-20">
          <p className="mb-8 flex items-center gap-3 text-xs font-medium uppercase text-muted-foreground">
            <span className="h-px w-10 bg-landing-amber" /> Household coverage, made clear
          </p>
          <h1 aria-label="Know what’s covered. Before it’s too late." className="text-[clamp(3.4rem,7.2vw,7.8rem)] font-bold leading-[0.88] text-foreground">
            {HEADLINE.map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 42, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.75, delay: index * 0.055, ease: EASE }}
                aria-hidden="true"
                className="mr-[0.22em] inline-block"
              >{word}</motion.span>
            ))}
          </h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62, ease: EASE }}
            className="mt-8 max-w-xl text-base leading-7 text-muted-foreground md:text-lg"
          >
            One calm place for every device, invoice, expiry date, and repair claim in your home.
          </motion.p>
          <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticLink>Start tracking free</MagneticLink>
            <Button asChild variant="ghost" size="lg" className="h-12 px-5 text-muted-foreground hover:text-foreground"><Link to="/auth">Sign in</Link></Button>
          </motion.div>
        </div>
        <HeroPreview />
      </div>
      <motion.a href="#problem" aria-label="Scroll to the next section" className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase text-muted-foreground" animate={reduceMotion ? {} : { y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        Explore <ChevronDown className="size-4" />
      </motion.a>
    </section>
  );
}

const PAPERS = [
  { title: "RECEIPT", line: "Croma · ₹94,990", icon: FileText },
  { title: "WARRANTY", line: "Expires 04/2027", icon: ShieldCheck },
  { title: "ORDER #1827", line: "Samsung India", icon: PackageCheck },
  { title: "INVOICE", line: "Sony Bravia OLED", icon: FileCheck2 },
];

type Paper = (typeof PAPERS)[number];

function PaperFace({ title, line, icon: Icon }: Paper) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Icon className="size-5 text-primary" />
        <MoreHorizontal className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-8 text-[10px] font-semibold text-muted-foreground">{title}</p>
      <p className="mt-2 text-sm font-semibold">{line}</p>
      <div className="mt-4 h-px bg-border" />
      <div className="mt-3 h-1.5 w-3/4 rounded-full bg-muted" />
      <div className="mt-2 h-1.5 w-1/2 rounded-full bg-muted" />
    </>
  );
}

const PROBLEM_COPIES = ["Receipts.", "Email.", "A drawer.", "Your memory."];

// Wide screens (lg+): the receipts scatter and assemble while the section stays pinned.
function ProblemPinned() {
  const target = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const progress = useTransform(scrollYProgress, [0.18, 0.72], [0, 1]);
  const starts = [
    { x: -85, y: 30, r: -13 },
    { x: 70, y: -45, r: 9 },
    { x: -48, y: 95, r: 16 },
    { x: 88, y: 92, r: -8 },
  ];

  return (
    <div ref={target} className="relative hidden min-h-[150vh] px-16 py-28 lg:block">
      <div className="sticky top-0 mx-auto grid min-h-screen-dvh max-w-[1320px] items-center gap-16 py-20 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <motion.p
            style={{ opacity: useEased(progress, [0, 0.15], [0.3, 1]) }}
            className="text-xs font-medium uppercase text-landing-amber"
          >
            The problem
          </motion.p>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.02] md:text-6xl">
            Warranties end up everywhere.
          </h2>
          <div className="mt-8 space-y-1 text-2xl font-medium text-muted-foreground md:text-3xl">
            {PROBLEM_COPIES.map((copy, index) => (
              <motion.p
                key={copy}
                style={
                  reduceMotion
                    ? {}
                    : {
                        opacity: useEased(progress, [index * 0.17, index * 0.17 + 0.18], [0.14, 1]),
                        x: useEased(progress, [index * 0.17, index * 0.17 + 0.18], [-22, 0]),
                      }
                }
              >
                {copy}
              </motion.p>
            ))}
          </div>
          <motion.p
            style={reduceMotion ? {} : { opacity: useEased(progress, [0.72, 0.92], [0, 1]) }}
            className="mt-8 max-w-sm text-sm leading-6 text-foreground"
          >
            Warrantify turns the mess into a record you can actually use.
          </motion.p>
        </div>
        <div className="relative h-[480px]">
          {PAPERS.map((paper, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const start = starts[index] ?? { x: 0, y: 0, r: 0 };
            return (
              <motion.div
                key={paper.title}
                style={
                  reduceMotion
                    ? { left: `${col * 50 + 2}%`, top: `${row * 45 + 4}%` }
                    : {
                        x: useEased(progress, [0, 1], [start.x, col * 245]),
                        y: useEased(progress, [0, 1], [start.y, row * 205]),
                        rotate: useEased(progress, [0, 1], [start.r, 0]),
                        scale: useEased(progress, [0, 1], [0.92, 1]),
                      }
                }
                className="absolute left-[8%] top-[8%] h-44 w-[min(42%,220px)] overflow-hidden rounded-lg border border-border bg-card p-5 shadow-xl"
              >
                <PaperFace {...paper} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Offsets are small on purpose: they must stay inside the 20px page gutter so no card is ever cut by the screen edge.
const STACKED_STARTS = [
  { x: -8, y: 28, r: -6 },
  { x: 8, y: -20, r: 5 },
  { x: -6, y: 44, r: 7 },
  { x: 8, y: 48, r: -5 },
];

function StackedPaper({
  paper,
  index,
  progress,
  reduceMotion,
}: {
  paper: Paper;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const start = STACKED_STARTS[index] ?? { x: 0, y: 0, r: 0 };
  const x = useEased(progress, [0, 1], [start.x, 0]);
  const y = useEased(progress, [0, 1], [start.y, 0]);
  const rotate = useEased(progress, [0, 1], [start.r, 0]);
  const scale = useEased(progress, [0, 1], [0.94, 1]);
  const opacity = useEased(progress, [0, 0.5], [0.35, 1]);
  return (
    <motion.div
      style={reduceMotion ? {} : { x, y, rotate, scale, opacity }}
      className="h-44 overflow-hidden rounded-lg border border-border bg-card p-5 shadow-xl"
    >
      <PaperFace {...paper} />
    </motion.div>
  );
}

// Narrow screens: nothing is pinned. Copy reveals as it scrolls into view, and the receipts settle into a 2x2 grid that always fits.
function ProblemStacked() {
  const reduceMotion = useReducedMotion();
  const board = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: board, offset: ["start end", "center center"] });
  const reveal = (order: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, x: -16 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true, amount: 0.6 },
          transition: { duration: 0.7, delay: order * 0.08, ease: EASE },
        };

  return (
    <div className="px-5 py-20 md:px-10 lg:hidden">
      <p className="text-xs font-medium uppercase text-landing-amber">The problem</p>
      <h2 className="mt-6 text-4xl font-semibold leading-[1.02] md:text-6xl">
        Warranties end up everywhere.
      </h2>
      <div className="mt-8 space-y-1 text-2xl font-medium text-muted-foreground md:text-3xl">
        {PROBLEM_COPIES.map((copy, index) => (
          <motion.p key={copy} {...reveal(index)}>
            {copy}
          </motion.p>
        ))}
      </div>
      <motion.p
        {...reveal(PROBLEM_COPIES.length)}
        className="mt-8 max-w-sm text-sm leading-6 text-foreground"
      >
        Warrantify turns the mess into a record you can actually use.
      </motion.p>
      <div ref={board} className="mt-14 grid grid-cols-2 gap-3 md:mx-auto md:max-w-xl md:gap-4">
        {PAPERS.map((paper, index) => (
          <StackedPaper
            key={paper.title}
            paper={paper}
            index={index}
            progress={scrollYProgress}
            reduceMotion={!!reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section id="problem" className="relative border-y border-border">
      <ProblemPinned />
      <ProblemStacked />
    </section>
  );
}

function DeviceScene() {
  return <div className="h-full rounded-lg border border-border bg-background p-5"><p className="text-xs text-muted-foreground">DEVICES / MACBOOK AIR M3</p><div className="mt-6 flex items-start justify-between"><div><h3 className="text-2xl font-semibold">MacBook Air M3</h3><p className="mt-1 text-sm text-muted-foreground">Apple · Personal computer</p></div><span className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-xs text-success">Active</span></div><div className="mt-10"><p className="text-xs font-medium text-muted-foreground">WARRANTY TIMELINE</p><div className="relative mt-8 h-1 rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-success" /><span className="absolute left-0 top-1/2 size-4 -translate-y-1/2 rounded-full border-4 border-background bg-success"/><span className="absolute left-2/3 top-1/2 size-4 -translate-y-1/2 rounded-full border-4 border-background bg-success"/><span className="absolute right-0 top-1/2 size-4 -translate-y-1/2 rounded-full border-4 border-background bg-muted-foreground"/></div><div className="mt-4 flex justify-between text-[10px] text-muted-foreground"><span>Purchased<br/>12 Jun 2025</span><span className="text-success">Today</span><span className="text-right">Coverage ends<br/>12 Jun 2027</span></div></div><div className="mt-10 grid grid-cols-3 gap-3">{["Invoice", "Warranty card", "Service history"].map((item)=><div key={item} className="landing-hover rounded-md border border-border bg-card p-3 text-xs hover:border-primary/40"><FileText className="mb-3 size-4 text-primary"/>{item}</div>)}</div></div>;
}

function InvoiceScene() {
  return <div className="grid h-full place-items-center rounded-lg border border-border bg-background p-5"><div className="w-full max-w-md rounded-lg border border-border bg-card p-6"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">AI INVOICE SCAN</p><h3 className="mt-1 text-xl font-semibold">Review extracted details</h3></div><span className="grid size-11 place-items-center rounded-md bg-primary-soft text-primary"><ScanLine/></span></div><div className="mt-6 space-y-3">{[["Device", "Sony Bravia XR"],["Purchase date", "18 Aug 2026"],["Amount", "₹1,24,990"],["Warranty", "24 months"]].map(([label,value])=><div key={label} className="landing-hover-row flex justify-between border-b border-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>)}</div><div className="mt-5 flex items-center gap-2 text-xs text-success"><Sparkles className="size-4"/>Ready to add in one click</div></div></div>;
}

function ReminderScene() {
  return <div className="flex h-full flex-col justify-center rounded-lg border border-border bg-background p-6"><p className="text-xs text-muted-foreground">UPCOMING EXPIRIES</p>{[["Sony Bravia OLED", "73 days", "text-warning"],["MacBook Air M3", "284 days", "text-success"],["Samsung Refrigerator", "Expired", "text-danger"]].map(([name,time,tone], index)=><div key={name} className="landing-hover mt-4 flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/40"><span className={cn("grid size-10 place-items-center rounded-md bg-muted", tone)}>{index === 0 ? <Tv/> : index === 1 ? <Laptop/> : <Refrigerator/>}</span><div className="min-w-0 flex-1"><p className="font-medium">{name}</p><p className="text-xs text-muted-foreground">Manufacturer warranty</p></div><span className={cn("text-sm font-semibold", tone)}>{time}</span></div>)}</div>;
}

function ClaimsScene() {
  const columns = [["Submitted", "Display flickering"],["Inspection", "Compressor noise"],["Ready", "Battery replacement"]];
  return <div className="h-full rounded-lg border border-border bg-background p-5"><div className="flex justify-between"><div><p className="text-xs text-muted-foreground">CLAIMS</p><h3 className="mt-1 text-xl font-semibold">Repair progress, visible.</h3></div><Wrench className="text-primary"/></div><div className="mt-6 grid gap-3 sm:h-[70%] sm:grid-cols-3">{columns.map(([status,issue], index)=><div key={status} className="rounded-md bg-muted/50 p-2"><div className="flex items-center justify-between text-[10px] font-medium"><span>{status}</span><span className="text-muted-foreground">1</span></div><div className="landing-hover mt-3 rounded-md border border-border bg-card p-3 hover:border-primary/40"><span className={cn("mb-3 block h-1 w-8 rounded-full", index === 2 ? "bg-success" : "bg-primary")}/><p className="text-xs font-medium">{issue}</p><p className="mt-2 text-[9px] text-muted-foreground">Updated today</p></div></div>)}</div></div>;
}

const FEATURES = [
  { kicker: "01 / Overview", title: "See every warranty at a glance.", body: "A live household dashboard surfaces what is safe, what needs attention, and what already expired.", scene: <DashboardScene compact /> },
  { kicker: "02 / Timeline", title: "Coverage, measured in time.", body: "Purchase dates, expiry windows, documents, and service history stay attached to the device.", scene: <DeviceScene /> },
  { kicker: "03 / AI capture", title: "Your invoice does the typing.", body: "Upload a bill. Warrantify reads the product, purchase date, price, and warranty term for you.", scene: <InvoiceScene /> },
  { kicker: "04 / Reminders", title: "Never miss a claim window.", body: "Quiet, timely alerts appear before coverage disappears—not after.", scene: <ReminderScene /> },
  { kicker: "05 / Claims", title: "Know exactly what happens next.", body: "Track repairs from submission through inspection, service, and collection in one visual flow.", scene: <ClaimsScene /> },
];

function FeatureShowcase() {
  const section = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (latest) => setActive(Math.min(FEATURES.length - 1, Math.floor(latest * FEATURES.length))));

  return (
    <section ref={section} className="relative h-auto px-5 md:px-10 lg:h-[500vh] lg:px-16">
      <div className="mx-auto max-w-[1380px] py-24 lg:sticky lg:top-0 lg:grid lg:min-h-screen-dvh lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-20 lg:py-16">
        <div className="hidden lg:block">
          <p className="mb-10 text-xs font-medium uppercase text-landing-amber">Built for the moment you need it</p>
          <div className="relative min-h-64">
            {FEATURES.map((feature, index) => (
              <motion.div key={feature.title} animate={{ opacity: active === index ? 1 : 0, y: active === index ? 0 : active > index ? -28 : 28 }} transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE }} className={cn("absolute inset-0", active !== index && "pointer-events-none")}>
                <p className="text-xs font-medium text-primary">{feature.kicker}</p><h2 className="mt-5 max-w-lg text-5xl font-semibold leading-[1.02]">{feature.title}</h2><p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">{feature.body}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex gap-2">{FEATURES.map((feature,index)=><span key={feature.kicker} className={cn("h-1 rounded-full transition-all duration-500 ease-(--ease-landing) motion-reduce:transition-none", active === index ? "w-12 bg-landing-amber" : "w-5 bg-muted")}/>)}</div>
        </div>
        <div className="hidden h-[min(68vh,640px)] supports-[height:100dvh]:h-[min(68dvh,640px)] lg:block">
          <div className="relative h-full overflow-hidden rounded-lg border border-border bg-card p-3 shadow-2xl">
            {FEATURES.map((feature, index) => {
              const isActive = active === index;
              const side = active > index ? -1 : 1;
              return (
                <motion.div
                  key={feature.title}
                  animate={
                    reduceMotion
                      ? { opacity: isActive ? 1 : 0 }
                      : {
                          opacity: isActive ? 1 : 0,
                          scale: isActive ? 1 : 0.94,
                          x: isActive ? 0 : side * 24,
                          filter: isActive ? "blur(0px)" : "blur(10px)",
                        }
                  }
                  transition={{ duration: reduceMotion ? 0 : 0.7, ease: EASE }}
                  className={cn("absolute inset-3", !isActive && "pointer-events-none")}
                >
                  {feature.scene}
                </motion.div>
              );
            })}
          </div>
        </div>
        <div className="space-y-24 lg:hidden">
          {FEATURES.map((feature,index)=><motion.article key={feature.title} initial={reduceMotion ? false : { opacity: 0, x: index % 2 ? 24 : -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, ease: EASE }}><p className="text-xs font-medium text-primary">{feature.kicker}</p><h2 className="mt-4 text-4xl font-semibold leading-tight">{feature.title}</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">{feature.body}</p><div className="mt-8 min-h-[420px] rounded-lg border border-border bg-card p-2">{feature.scene}</div></motion.article>)}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { number: "01", title: "Add the device", body: "Type the basics, or photograph the invoice. Keep moving while the details are extracted.", className: "lg:col-span-5 lg:mt-24" },
  { number: "02", title: "Let time do the work", body: "Coverage status and reminder windows update automatically, every day.", className: "lg:col-span-3" },
  { number: "03", title: "Open it when it matters", body: "Find the invoice, warranty card, and claim history while you are still on the support call.", className: "lg:col-span-4 lg:mt-40" },
];

function HowItWorks() {
  const reduceMotion = useReducedMotion();
  return <section className="border-y border-border px-5 py-32 md:px-10 lg:px-16"><div className="mx-auto max-w-[1320px]"><div className="max-w-xl"><p className="text-xs font-medium uppercase text-landing-amber">A lighter habit</p><h2 className="mt-5 text-4xl font-semibold md:text-6xl">Three minutes now.<br/>Hours saved later.</h2></div><div className="mt-20 grid gap-14 lg:grid-cols-12">{STEPS.map((step,index)=><motion.article key={step.number} initial={reduceMotion ? false : { opacity: 0, x: index === 1 ? 0 : index === 0 ? -42 : 42 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.85, ease: EASE }} className={cn("border-t border-border pt-5", step.className)}><span className="text-[clamp(5rem,9vw,9rem)] font-bold leading-none tracking-[-0.07em] text-primary-soft">{step.number}</span><h3 className="mt-5 text-xl font-semibold">{step.title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{step.body}</p></motion.article>)}</div></div></section>;
}

function Counter({ to, decimals = 0, prefix = "", suffix = "" }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? to : 0);
  useEffect(() => {
    if (!inView || reduceMotion) { if (reduceMotion) setValue(to); return; }
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - started) / 1500, 1);
      setValue(to * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, to]);
  return <span ref={ref}>{prefix}{value.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</span>;
}

function Stats() {
  return <section className="px-5 py-32 md:px-10 lg:px-16"><div className="mx-auto grid max-w-[1320px] gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3"><div className="bg-background p-8 md:p-10"><p className="text-5xl font-semibold md:text-6xl"><Counter to={10000} suffix="+"/></p><p className="mt-4 text-sm text-muted-foreground">warranties tracked</p></div><div className="bg-background p-8 md:p-10"><p className="text-5xl font-semibold text-landing-amber md:text-6xl"><Counter to={2.4} decimals={1} prefix="₹" suffix="Cr+"/></p><p className="mt-4 text-sm text-muted-foreground">in coverage protected</p></div><div className="bg-background p-8 md:p-10"><p className="text-5xl font-semibold md:text-6xl"><Counter to={3} suffix=" min"/></p><p className="mt-4 text-sm text-muted-foreground">average setup time</p></div></div></section>;
}

const FLOATING = [{ Icon: Smartphone, className: "left-[8%] top-[22%] -rotate-12" }, { Icon: Laptop, className: "right-[10%] top-[18%] rotate-6" }, { Icon: Tv, className: "left-[18%] bottom-[15%] rotate-12" }, { Icon: Refrigerator, className: "right-[17%] bottom-[13%] -rotate-6" }];

function ClosingCta() {
  const reduceMotion = useReducedMotion();
  return <section className="relative isolate overflow-hidden bg-landing-amber px-5 py-36 text-landing-amber-foreground md:px-10 md:py-44">{FLOATING.map(({Icon,className},index)=><motion.div key={index} className={cn("absolute opacity-10",className)} animate={reduceMotion ? {} : { y: [0, index % 2 ? 20 : -18, 0], rotate: [0, index % 2 ? 5 : -5, 0] }} transition={{ duration: 12 + index * 2, repeat: Infinity, ease: "easeInOut" }}><Icon className="size-20 md:size-28" strokeWidth={1}/></motion.div>)}<div className="relative z-10 mx-auto max-w-[1120px]"><p className="text-xs font-semibold uppercase opacity-70">Your future self will thank you</p><h2 className="mt-6 max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[0.9]">The receipt is still here. So is the coverage.</h2><div className="mt-10"><MagneticLink className="bg-background text-foreground hover:bg-background/90">Start tracking free</MagneticLink></div></div></section>;
}

function Footer() {
  return <footer className="px-5 py-10 md:px-10 lg:px-16"><div className="mx-auto flex max-w-[1320px] flex-col gap-7 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"><ShieldCheck className="size-4"/></span>Warrantify</Link><nav className="flex flex-wrap gap-6 text-xs text-muted-foreground"><Link to="/auth" className="hover:text-foreground">Sign in</Link><a href="#problem" className="hover:text-foreground">Why Warrantify</a><span>© 2026 Warrantify</span></nav></div></footer>;
}

export function LandingPage() {
  return <main className="landing-page relative min-h-screen-dvh overflow-clip bg-background text-foreground"><div className="landing-mesh pointer-events-none fixed inset-0" aria-hidden="true"/><Hero/><ProblemSection/><FeatureShowcase/><HowItWorks/><Stats/><ClosingCta/><Footer/></main>;
}