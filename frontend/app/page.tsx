'use client';

import { ArrowRight, Github, Zap, ChevronRight, Cpu, Globe, Rocket, Users, GitBranch } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ease = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ease as any } },
};

/* ═══════════════════════════════════════════════════════ */
export default function Home() {
  const { user } = useAuth();
  const sectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((el, i) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.6,
          delay: i * 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
    }, sectorRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] bg-dots">

      {/* ═══════ HERO ═══════ */}
      <section style={{ paddingTop: 'clamp(140px, 18vw, 260px)' }} className="pb-20 md:pb-28 lg:pb-36">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col items-center">

            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--accent)] text-[10px] font-semibold tracking-widest uppercase mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Open for Contributions
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white font-display mb-6">
              Open Source{" "}
              <span className="text-gradient">Contribution</span>
              <br />Engine for Builders
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={fadeUp} className="text-sm md:text-base text-slate-400 max-w-md leading-relaxed mb-10">
              Ship code to real projects, earn points on the leaderboard, and grow your skills with the SkillFest community.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3">
              {user ? (
                <Link href="/dashboard" className="px-7 py-3 bg-[var(--accent)] text-[#06080f] font-bold rounded-lg text-sm hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2 group">
                  Go to Dashboard
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : (
                <Link href={getApiUrl("/api/auth/github")} className="px-7 py-3 bg-[var(--accent)] text-[#06080f] font-bold rounded-lg text-sm hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2 group">
                  <Github className="w-4 h-4" />
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
              <Link href="/rules" className="px-7 py-3 rounded-lg border border-[var(--border)] text-slate-300 hover:bg-[var(--surface-2)] hover:text-white text-sm font-semibold transition-all">
                View Rules
              </Link>
            </motion.div>

            {/* ── Terminal ── */}
            <motion.div variants={fadeUp} className="w-full max-w-2xl mt-16 md:mt-24">
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">terminal</span>
                </div>
                <div className="p-6 font-mono text-[13px] space-y-2.5 text-slate-400">
                  <p><span className="text-[var(--accent)]">$</span> skillfest connect --node &quot;main&quot;</p>
                  <p className="text-slate-500 italic">Authenticating via GitHub...</p>
                  <p><span className="text-[var(--accent)]">$</span> skillfest sync --repos all</p>
                  <p className="text-emerald-400/70">[OK] Synced 14 repositories — 2,847 contributions tracked</p>
                  <p><span className="text-[var(--accent)]">$</span> skillfest rank</p>
                  <p className="text-[var(--accent-2)]">[INFO] Rank: #42 of 12,400 contributors</p>
                  <p className="text-white"><span className="text-[var(--accent)]">$</span> <span className="animate-pulse">_</span></p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ TRACKS ═══════ */}
      <section ref={sectorRef} className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-14 md:mb-20">
            <p className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-[0.15em] mb-3">Tracks</p>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight mb-4">
              How it <span className="text-gradient">works</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
              Pick a participation track and start making an impact.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {/* Main card */}
            <div className="reveal-card md:col-span-7">
              <div className="card p-7 md:p-9 h-full flex flex-col min-h-[280px]">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Contribute to Projects</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                  Pick a project from the directory, submit pull requests, and earn contribution points that count towards your rank.
                </p>
                <div className="mt-auto">
                  <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[var(--accent)] text-xs font-semibold hover:text-white transition-colors group">
                    Start Contributing <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Onboarding card */}
            <div className="reveal-card md:col-span-5">
              <div className="card p-7 md:p-9 h-full flex flex-col min-h-[280px]">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-2)]/10 text-[var(--accent-2)] flex items-center justify-center mb-6">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">Fresher? Apply Here</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  New to open source? Apply to our onboarding track for mentorship and guided contributions.
                </p>
                <div className="mt-auto">
                  <Link href="/fresher-application" className="inline-flex items-center gap-1.5 text-[var(--accent-2)] text-xs font-semibold hover:text-white transition-colors group">
                    Apply Now <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats row */}
            {[
              { icon: Globe, value: "12.4K", label: "Contributors" },
              { icon: GitBranch, value: "847", label: "Repositories" },
              { icon: Users, value: "96%", label: "Retention" },
            ].map((stat) => (
              <div key={stat.label} className="reveal-card md:col-span-4">
                <div className="card p-7 flex flex-col justify-between h-full min-h-[160px] border-t-2 border-t-[var(--accent)]/20">
                  <stat.icon className="w-4 h-4 text-slate-500 mb-6" />
                  <div>
                    <p className="text-3xl md:text-4xl font-black text-white font-display tracking-tight">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold mt-1">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-24 md:py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: ease as any }}
          className="max-w-3xl mx-auto card p-10 md:p-16 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight mb-4">
            Ready to <span className="text-gradient">start?</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-sm mx-auto leading-relaxed mb-8">
            Sign in with GitHub and start contributing to open source projects today.
          </p>
          <Link
            href={getApiUrl("/api/auth/github")}
            className="inline-flex items-center gap-2 px-7 py-3 bg-[var(--accent)] text-[#06080f] font-bold rounded-lg text-sm hover:brightness-110 active:scale-[0.97] transition-all"
          >
            Get Started
            <Zap className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
