import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../store/AppContext.tsx";
import { DemoBadge } from "./ui.tsx";

/* -------------------------------- Logo ------------------------------- */

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Applywise home">
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#ff6a2b" />
        <path
          d="M9 22V10l14 12V10"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-display text-[22px] font-semibold tracking-tight ${dark ? "text-cream" : "text-ink"}`}>
        Applywise
      </span>
    </Link>
  );
}

/* ------------------------------- Navbar ------------------------------ */

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream/85 shadow-[0_8px_30px_-18px_rgb(28_23_18/0.35)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-inksoft transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/app"
            className="rounded-full border-2 border-ink/12 px-5 py-2.5 text-[15px] font-semibold transition-all hover:border-ink/30"
          >
            Open demo
          </Link>
          <Link
            to="/app/new"
            className="rounded-full bg-accent px-5 py-2.5 text-[15px] font-semibold text-white shadow-[0_10px_25px_-8px_rgb(255_106_43/0.7)] transition-all hover:-translate-y-0.5 hover:bg-accentdeep"
          >
            Try it free
          </Link>
        </div>
        <button
          className="rounded-xl p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-ink/8 bg-cream/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 font-medium text-ink hover:bg-ink/5"
                >
                  {l.label}
                </a>
              ))}
              <Link
                to="/app/new"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-accent px-5 py-3 text-center font-semibold text-white"
              >
                Try it free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------- Footer ------------------------------ */

export function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "/#how-it-works" },
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Live demo", href: "/app" },
      ],
    },
    {
      title: "Demo app",
      links: [
        { label: "New application", href: "/app/new" },
        { label: "Applications", href: "/app/applications" },
        { label: "Portfolio", href: "/app/portfolio" },
        { label: "Settings", href: "/app/settings" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "FAQ", href: "/#faq" },
        { label: "Trust & privacy", href: "/#faq" },
        { label: "Changelog", href: "/app" },
      ],
    },
  ];
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-cream/60">
              Turn any job description into a tailored, proofread cover letter — grounded in your real experience, never
              invented.
            </p>
            <div className="mt-5">
              <DemoBadge />
            </div>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="text-sm font-semibold tracking-wider text-cream/40 uppercase">{c.title}</h3>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-[15px] text-cream/70 transition-colors hover:text-cream">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream/10 pt-8 text-sm text-cream/45 sm:flex-row sm:items-center">
          <p>© 2026 Applywise. Demo build — all names, companies and metrics are fictional.</p>
          <p>Built with React · Tailwind · Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------ App shell ---------------------------- */

const shellNav = [
  { to: "/app", label: "Overview", icon: "◧" },
  { to: "/app/new", label: "New application", icon: "＋" },
  { to: "/app/applications", label: "Applications", icon: "▤" },
  { to: "/app/portfolio", label: "Portfolio", icon: "☰" },
  { to: "/app/settings", label: "Settings", icon: "⚙" },
];

export function AppShell() {
  const location = useLocation();
  const { profile } = useApp();
  const initials = profile.personal_info.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="hidden border-r border-ink/8 bg-white/60 lg:flex lg:flex-col" aria-label="App navigation">
        <div className="px-6 pt-7 pb-6">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {shellNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-all ${
                  isActive ? "bg-ink text-cream shadow-card" : "text-inksoft hover:bg-ink/5 hover:text-ink"
                }`
              }
            >
              <span aria-hidden className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <div className="rounded-2xl bg-peach p-4">
            <p className="text-sm font-semibold">Demo mode</p>
            <p className="mt-1 text-[13px] leading-snug text-inksoft">
              Pipeline runs are simulated with sample data.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b border-ink/8 bg-cream/85 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
            <div className="lg:hidden">
              <Logo />
            </div>
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Breadcrumb">
              <span className="text-sm text-inksoft">Applywise demo</span>
            </nav>
            {/* Mobile nav */}
            <nav className="flex items-center gap-1 overflow-x-auto lg:hidden" aria-label="App">
              {shellNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/app"}
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap ${
                      isActive ? "bg-ink text-cream" : "text-inksoft hover:bg-ink/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="hidden items-center gap-3 sm:flex">
              <DemoBadge />
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-cream"
                title={profile.personal_info.name}
              >
                {initials}
              </div>
            </div>
          </div>
        </div>

        {/* Page content with transition */}
        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
