import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* ------------------------------- Button ------------------------------ */

type ButtonVariant = "primary" | "dark" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-[0_10px_25px_-8px_rgb(255_106_43/0.7)] hover:bg-accentdeep hover:-translate-y-0.5",
  dark: "bg-ink text-cream hover:bg-stone-800 hover:-translate-y-0.5",
  outline: "border-2 border-ink/15 bg-white/60 text-ink hover:border-ink/40 hover:-translate-y-0.5",
  ghost: "text-ink hover:bg-ink/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[15px]",
  lg: "px-8 py-4 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* -------------------------------- Card ------------------------------- */

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-3xl border border-ink/8 bg-white shadow-card ${className}`}>{children}</div>
  );
}

/* -------------------------------- Chip ------------------------------- */

export function Chip({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-peach px-3 py-1 text-[13px] font-medium text-ink ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------------------------- Section heading ------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <Reveal className={`max-w-2xl ${alignCls}`}>
      <span className="inline-block rounded-full bg-ink px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-cream uppercase">
        {eyebrow}
      </span>
      <h2 className="font-display mt-5 text-4xl font-semibold text-balance sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-lg leading-relaxed text-inksoft">{sub}</p>}
    </Reveal>
  );
}

/* ------------------------------- Reveal ------------------------------ */

type RevealFrom = "bottom" | "left" | "right";

type AnimTarget = { opacity: number; y?: number; x?: number; filter: string };

const revealInitial: Record<RevealFrom, AnimTarget> = {
  bottom: { opacity: 0, y: 36, filter: "blur(4px)" },
  left:   { opacity: 0, x: -56, filter: "blur(4px)" },
  right:  { opacity: 0, x:  56, filter: "blur(4px)" },
};
const revealAnimate: AnimTarget = { opacity: 1, y: 0, x: 0, filter: "blur(0px)" };

export function Reveal({
  children,
  delay = 0,
  className = "",
  from = "bottom",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: RevealFrom;
}) {
  return (
    <motion.div
      className={className}
      initial={revealInitial[from]}
      whileInView={revealAnimate}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------- Page header --------------------------- */

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 max-w-xl text-inksoft">{sub}</p>}
      </motion.div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/* ----------------------------- Sample badge --------------------------- */

export function SampleBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-accent/60 bg-peach/60 px-3 py-1 text-xs font-semibold tracking-wide text-accentdeep uppercase"
      title="Sample content used to illustrate the interface. The workspace itself runs on your profile."
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      Sample content
    </span>
  );
}

/* ----------------------------- Empty state --------------------------- */

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-peach text-2xl">
        <span aria-hidden>🗂️</span>
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-inksoft">{copy}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
