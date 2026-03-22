'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Github, Code, Database, LogOut, Layers, Zap, Menu, X, ChevronRight, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const links = [
    { name: "Projects", href: "/projects", icon: Layers },
    { name: "Dashboard", href: "/dashboard", icon: Code },
    { name: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
    ...(user?.is_admin ? [{ name: "Admin", href: "/admin/repositories", icon: Database }] : []),
  ];

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className={`rounded-2xl px-4 sm:px-5 py-2.5 flex items-center justify-between transition-all duration-300 ${scrolled ? "bg-[var(--surface-1)]/90 backdrop-blur-xl border border-[var(--border)] shadow-lg shadow-black/30" : "bg-transparent"}`}>

            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-md bg-[var(--accent)] text-[#06080f] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-black text-sm tracking-tight text-white font-display">SKILL<span className="text-[var(--accent)]">FEST</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {links.map((l) => (
                <Link key={l.name} href={l.href} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-[var(--surface-3)] transition-all">
                  {l.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="hidden lg:block text-[11px] font-semibold text-slate-400">{user.username}</span>
                  <div className="relative group/u">
                    <button className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all">
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 opacity-0 invisible group-hover/u:opacity-100 group-hover/u:visible transition-all">
                      <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1 shadow-xl">
                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-[11px] font-semibold transition-colors">
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={getApiUrl("/api/auth/github")} className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-[#06080f] font-bold text-[11px] hover:brightness-110 transition-all">
                  <Github className="w-3.5 h-3.5" /> Sign In
                </Link>
              )}
              <button onClick={() => setMobileOpen(o => !o)} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[var(--surface-3)] transition-all">
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={closeMobile}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} onClick={e => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-64 bg-[var(--surface-1)] border-l border-[var(--border)] p-5 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="font-black text-sm text-white font-display">SKILL<span className="text-[var(--accent)]">FEST</span></span>
                <button onClick={closeMobile} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                {links.map((l) => (
                  <Link key={l.name} href={l.href} onClick={closeMobile} className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-[var(--surface-3)] transition-all">
                    <span className="flex items-center gap-2.5"><l.icon className="w-4 h-4 opacity-40" />{l.name}</span>
                    <ChevronRight className="w-3 h-3 opacity-20" />
                  </Link>
                ))}
              </div>
              {!user && (
                <Link href={getApiUrl("/api/auth/github")} onClick={closeMobile} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent)] text-[#06080f] font-bold text-sm mt-4">
                  <Github className="w-4 h-4" /> Sign in with GitHub
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
