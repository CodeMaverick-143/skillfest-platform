'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Github, Code, LogOut, Layers, Menu, X, ChevronRight, BarChart3, Info, Zap, Clock, ScrollText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ── Countdown hook (shared from HomeClient) ────────────────
function useCountdown(targetStr: string | null) {
  const calc = () => {
    if (!targetStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const target = new Date(targetStr);
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const s = Math.floor(diff / 1000);
    return {
      days:    Math.floor(s / 86400),
      hours:   Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    if (!targetStr) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetStr]);
  return time;
}

type EventStatus = {
  phase: "coming_soon" | "active" | "ended";
  start_date: string | null;
  end_date: string | null;
  event_title: string;
};

export function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [eventStatus, setEventStatus] = useState<EventStatus | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // Fetch event status for the banner
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/event/status`)
      .then(r => r.json())
      .then(setEventStatus)
      .catch(console.error);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const countdown = useCountdown(eventStatus?.phase === "active" ? eventStatus.end_date : eventStatus?.start_date || null);

  const links = [
    { name: "Rules", href: "/rules", icon: ScrollText },
    { name: "Projects", href: "/projects", icon: Layers },
    { name: "Dashboard", href: "/dashboard", icon: Code },
    { name: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
    { name: "Docs", href: "/docs", icon: Info },
    { name: "Fresher Track", href: "/fresher-application", icon: Zap },
  ];

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
        {/* ─── Announcement Banner ─── */}
        <AnimatePresence>
          {eventStatus && (
            <motion.div 
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-[#1A1A1A] text-white py-1.5 px-6 pointer-events-auto border-b border-white/10"
            >
              <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 font-mono text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${eventStatus.phase === "active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>
                  {eventStatus.phase === "active" 
                    ? `Live: ${eventStatus.event_title} — Ends in ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`
                    : eventStatus.phase === "coming_soon"
                    ? `Launching: ${eventStatus.event_title} — Starts in ${countdown.days}d ${countdown.hours}h`
                    : `${eventStatus.event_title} has concluded`}
                </span>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${eventStatus.phase === "active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Main Navbar ─── */}
        <nav 
          className={`w-full transition-all duration-500 pointer-events-auto
          ${scrolled 
            ? "py-3 bg-[#1A1A1A]/90 backdrop-blur-xl border-b border-white/10 shadow-lg" 
            : "py-5 bg-transparent"}`}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              
              {/* Logo */}
              <div className="flex items-center justify-start flex-1">
                <Link href="/" className={`flex items-center gap-2.5 group shrink-0 transition-opacity duration-300 ${mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={closeMobile}>
                  <img src="/favicon.ico" alt="SkillFest" className="w-5 h-5 object-contain transition-transform group-hover:scale-110" />
                  <motion.span 
                    animate={{ 
                      color: scrolled ? "#FFFFFF" : "#71717a",
                      scale: scrolled ? 0.95 : 1,
                      y: scrolled ? 0 : -1
                    }}
                    whileHover={{ color: scrolled ? "#FFFFFF" : "#1A1A1A", scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="font-display font-black text-sm tracking-tight uppercase leading-none cursor-default"
                  >
                    SKILLFEST<motion.span 
                      animate={{ color: scrolled ? "#34d399" : "#059669" }}
                    >
                      .
                    </motion.span>
                  </motion.span>
                </Link>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center justify-center gap-8">
                {links.map((l) => (
                  <Link 
                    key={l.name} 
                    href={l.href} 
                    className={`text-[11px] font-bold tracking-widest uppercase transition-all transform hover:-translate-y-0.5 ${
                      scrolled 
                        ? 'text-white/70 hover:text-white' 
                        : 'text-[#8C867E] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {l.name}
                  </Link>
                ))}
              </div>

              {/* Right Actions */}
              <div className="flex items-center justify-end gap-5 flex-1">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden lg:block text-[10px] font-bold tracking-widest text-[#8C867E] uppercase">{user.username}</span>
                    <div className="relative group/u">
                      <button className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all shadow-sm">
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      </button>
                      <div className="absolute right-0 top-full pt-3 opacity-0 invisible group-hover/u:opacity-100 group-hover/u:visible transition-all duration-200">
                        <div className="w-44 bg-white dark:bg-[#222] border border-[#EBE6DF] dark:border-white/10 p-1 shadow-xl rounded-xl">
                          <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all">
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={getApiUrl("/api/auth/github")} 
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-bold text-[10px] tracking-widest uppercase hover:opacity-90 transition-all rounded-full shadow-lg shadow-black/5"
                  >
                    <Github className="w-3.5 h-3.5" /> Sign In
                  </Link>
                )}
                <button onClick={() => setMobileOpen(o => !o)} className={`md:hidden w-8 h-8 flex items-center justify-center transition-colors ${mobileOpen ? 'text-[#1A1A1A] dark:text-white' : (scrolled ? 'text-white' : 'text-[#1A1A1A]')}`}>
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ─── Mobile Overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 z-[45] bg-[#FDFBF7]/80 dark:bg-black/80 backdrop-blur-md md:hidden" 
              onClick={closeMobile}
            />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[320px] z-[46] bg-white dark:bg-[#111] border-l border-[#EBE6DF] dark:border-white/5 p-8 pt-24 flex flex-col md:hidden"
            >
              <div className="flex flex-col gap-1 flex-1">
                {links.map((l) => (
                  <Link key={l.name} href={l.href} onClick={closeMobile} className="flex items-center justify-between px-5 py-4 text-[11px] font-bold tracking-widest uppercase text-[#8C867E] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all rounded-xl">
                    {l.name}
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </Link>
                ))}
              </div>

              {!user && (
                <Link 
                  href={getApiUrl("/api/auth/github")} 
                  onClick={closeMobile} 
                  className="flex items-center justify-center gap-2.5 px-6 py-5 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] font-bold text-[11px] tracking-widest uppercase mt-8 rounded-2xl shadow-xl shadow-black/10"
                >
                  <Github className="w-5 h-5" /> Sign In via GitHub
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
