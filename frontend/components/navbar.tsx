'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Github, Code, Database, LogOut, Layers, Menu, X, ChevronRight, BarChart3, Info, Zap } from "lucide-react";
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
    { name: "Docs", href: "/docs", icon: Info },
    { name: "Fresher track", href: "/fresher-application", icon: Zap },
    ...(user?.is_admin ? [{ name: "Admin", href: "/admin/repositories", icon: Database }] : []),
  ];

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono ${scrolled ? "py-2 bg-[#FDFBF7]/90 backdrop-blur-xl border-b border-[#EBE6DF] shadow-sm" : "py-4 bg-transparent"}`}>
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">

            {/* Logo area */}
            <div className="flex items-center justify-start flex-1 min-w-0">
              <Link href="/" className="flex items-center gap-2 shrink-0 group">
                <span className="font-bold text-sm tracking-widest text-[#1A1A1A] uppercase flex items-center gap-2">
                  <img src="/image.png" alt="SkillFest Logo" className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all" />
                  SKILLFEST<span className="text-[#8C867E]">.</span>
                </span>
              </Link>
            </div>

            {/* Centered Links */}
            <div className="hidden md:flex items-center justify-center gap-6">
              {links.map((l) => (
                <Link key={l.name} href={l.href} className="text-[12px] font-bold tracking-widest uppercase text-[#8C867E] hover:text-[#1A1A1A] transition-colors">
                  {l.name}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center justify-end gap-4 flex-1">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden lg:block text-[11px] font-bold tracking-widest text-[#8C867E]">{user.username}</span>
                  <div className="relative group/u">
                    <button className="w-8 h-8 rounded overflow-hidden border border-[#D6D0C4] hover:border-[#1A1A1A] transition-all shadow-sm">
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-40 opacity-0 invisible group-hover/u:opacity-100 group-hover/u:visible transition-all">
                      <div className="bg-[#F5F2EA] border border-[#EBE6DF] p-1 shadow-md">
                        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-[#6B6661] hover:text-[#1A1A1A] hover:bg-[#EBE6DF] text-[11px] font-bold tracking-widest uppercase transition-colors rounded-sm">
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={getApiUrl("/api/auth/github")} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white font-bold text-[11px] tracking-widest uppercase hover:bg-[#333] transition-colors rounded shadow-sm">
                  <Github className="w-3.5 h-3.5" /> Sign In
                </Link>
              )}
              <button onClick={() => setMobileOpen(o => !o)} className="md:hidden w-8 h-8 flex items-center justify-end text-[#8C867E] hover:text-[#1A1A1A] transition-colors">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[#FDFBF7]/80 backdrop-blur-sm md:hidden font-mono" onClick={closeMobile}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} onClick={e => e.stopPropagation()} className="absolute right-0 top-0 bottom-0 w-72 bg-[#F5F2EA] border-l border-[#EBE6DF] p-6 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-12">
                <span className="font-bold text-sm tracking-widest text-[#1A1A1A] uppercase">SKILLFEST<span className="text-[#8C867E]">.</span></span>
                <button onClick={closeMobile} className="text-[#8C867E] hover:text-[#1A1A1A]"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {links.map((l) => (
                  <Link key={l.name} href={l.href} onClick={closeMobile} className="flex items-center justify-between px-4 py-3 text-[12px] font-bold tracking-widest uppercase text-[#8C867E] hover:text-[#1A1A1A] hover:bg-[#EBE6DF] transition-colors rounded">
                    {l.name}
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </Link>
                ))}
              </div>
              {!user && (
                <Link href={getApiUrl("/api/auth/github")} onClick={closeMobile} className="flex items-center justify-center gap-2 px-4 py-4 bg-[#1A1A1A] text-white font-bold text-[11px] tracking-widest uppercase mt-4 rounded shadow-sm">
                  <Github className="w-4 h-4" /> Sign In
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
