'use client';

import { Github, Zap, Shield, GitPullRequest, Calendar, Clock, Trophy, Star, Users, Code2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

type EventStatus = {
  phase: "coming_soon" | "active" | "ended";
  start_date: string | null;
  end_date: string | null;
  event_title: string;
  event_description: string;
  stats: {
    total_users: number;
    total_prs: number;
    merged_prs: number;
    active_repos: number;
  };
};

// ── Countdown hook ─────────────────────────────
function useCountdown(targetStr: string | null) {
  const calc = () => {
    if (!targetStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const target = new Date(targetStr);
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
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

// ── Shared features grid ───────────────────────
const features = [
  { icon: Zap, title: "Skill Validation", desc: "When you submit a PR, SkillFest analyzes your code quality and surfaces your real capabilities securely." },
  { icon: Shield, title: "Real-world Projects", desc: "Drop into open-source projects without breaking your flow. Detect your experience level and grow fast." },
  { icon: GitPullRequest, title: "Global Leaderboard", desc: "Designed to handle thousands of developers and rank contributions fairly across all roles." },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });
}

// ─────────────────────────────────────────────────────────────
// 1. COMING SOON
// ─────────────────────────────────────────────────────────────
function ComingSoonView({ config }: { config: EventStatus }) {
  const countdown = useCountdown(config.start_date);
  const sectorRef = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const ctx = gsap.context(() => {
      gsap.from(".reveal-item", {
        y: 30, opacity: 0, duration: 0.7,
        stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: sectorRef.current, start: "top 80%" },
      });
    }, sectorRef);
    return () => ctx.revert();
  }, []);

  const units = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
    { label: "Seconds", value: countdown.seconds },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] pb-24">
      <section className="pt-32 md:pt-48 pb-20 flex flex-col items-center text-center px-6 relative w-full">
        <motion.div initial="hidden" animate="show" variants={stagger} className="w-full max-w-4xl mx-auto flex flex-col items-center">

          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 mb-8 font-mono text-[11px] font-bold tracking-widest text-[#6B6661] uppercase">
            <Clock className="w-3 h-3" />
            Launching {formatDate(config.start_date)}
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[40px] md:text-[68px] lg:text-[84px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-6">
            <span className="text-[#8C867E] font-normal">&gt;</span> Get ready for<br />
            <span className="font-mono font-medium text-[34px] md:text-[48px] lg:text-[60px]">{config.event_title}</span>
            <span className="animate-pulse font-normal">|</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[#6B6661] text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-14 font-medium">
            {config.event_description || `${config.event_title} is nearly here — a premier open-source contribution challenge. Mark your calendar.`}
          </motion.p>

          <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4 md:gap-8 mb-14 w-full max-w-xl">
            {units.map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-full aspect-square md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-[#1A1A1A] text-white flex items-center justify-center text-[28px] md:text-[42px] font-bold font-mono shadow-lg shadow-black/10 tabular-nums">
                  {hasMounted ? String(value).padStart(2, "0") : "00"}
                </div>
                <span className="mt-2 text-[10px] md:text-xs font-bold tracking-widest text-[#8C867E] uppercase font-mono">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-14">
            {[
              { icon: Calendar, text: config.start_date ? `${formatDate(config.start_date)} – ${formatDate(config.end_date)}` : "Coming Soon" },
              { icon: Users, text: "Open to all contributors" },
              { icon: Star, text: "Points · Rankings · Recognition" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#EBE6DF] bg-white text-[#6B6661] text-[13px] font-semibold shadow-sm">
                <Icon className="w-4 h-4 text-[#8C867E]" />
                {text}
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href={getApiUrl("/api/auth/github")} className="px-8 py-3.5 bg-[#1A1A1A] text-white font-bold text-[13px] rounded hover:bg-[#333] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10 font-mono">
              <span className="opacity-50">&gt;_</span> Register Early
            </Link>
            <Link href="/docs" className="px-8 py-3.5 bg-transparent border border-[#D6D0C4] text-[#1A1A1A] font-bold text-[13px] rounded hover:bg-[#F5F2EA] transition-colors flex items-center justify-center gap-2 font-mono">
              &lt;&gt; Learn More
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#EBE6DF] to-transparent my-10 max-w-6xl mx-auto" />

      <section className="px-6 py-12 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-14">What to expect</h2>
        <div ref={sectorRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="reveal-item p-8 bg-white border border-[#EBE6DF] rounded-3xl shadow-sm">
              <Icon className="w-6 h-6 mb-6 text-[#8C867E]" />
              <h3 className="font-bold text-lg mb-4">{title}</h3>
              <p className="text-[#6B6661] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. ACTIVE EVENT
// ─────────────────────────────────────────────────────────────
function ActiveEventView({ config }: { config: EventStatus }) {
  const { user } = useAuth();
  const sectorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const countdown = useCountdown(config.end_date);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-item", {
        y: 30, opacity: 0, duration: 0.7,
        stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectorRef.current, start: "top 80%" },
      });
    }, sectorRef);
    return () => ctx.revert();
  }, []);

  const flowSteps = [
    { label: "< > FORK", id: 0 },
    { label: "{} COMMIT", id: 1 },
    { label: "∿ PR", id: 2 },
    { label: "✔ MERGE", id: 3 },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] selection:bg-[#1A1A1A]/10 selection:text-[#1A1A1A] pb-24 font-sans">

      <section className="pt-28 md:pt-40 pb-16 flex flex-col items-center justify-center text-center px-6 relative w-full">
        <motion.div initial="hidden" animate="show" variants={stagger} className="w-full max-w-5xl mx-auto flex flex-col items-center">

          <motion.h1 variants={fadeUp} className="text-[40px] md:text-[64px] lg:text-[80px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-8 mx-auto">
            <span className="text-[#8C867E] font-normal">&gt;</span>Contribute to<br />
            <span className="text-[#1A1A1A] font-mono font-medium tracking-normal text-[36px] md:text-[60px] lg:text-[72px]">{`{${(config?.event_title ?? "SkillFest").toLowerCase().replace(/ /g, '_')}}`}</span>
            <span className="animate-pulse font-normal text-[#1A1A1A]">_</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[#6B6661] text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            SkillFest captures your PRs, evaluates code quality, and tracks your real-world behavior — so you can grow and get hired.
          </motion.p>

          <motion.div variants={fadeUp} className="flex justify-center mb-12 w-full">
            <div className="inline-flex items-center p-1 rounded-full bg-[#F5F2EA] border border-[#EBE6DF] overflow-x-auto whitespace-nowrap max-w-full font-mono shadow-sm">
              {flowSteps.map((step, idx) => (
                <div key={step.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => setActiveTab(step.id)}
                    className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[11px] md:text-[13px] font-bold tracking-widest transition-colors ${activeTab === step.id ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#8C867E] hover:text-[#1A1A1A]"}`}
                  >
                    {step.label}
                  </button>
                  {idx < flowSteps.length - 1 && <span className="text-[#C4BFAF] px-1 md:px-3 text-[10px]">&rarr;</span>}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 font-mono w-full">
            {user ? (
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] text-white font-bold text-[13px] rounded hover:bg-[#333] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                <span className="opacity-50">&gt;_</span> Go to Dashboard
              </Link>
            ) : (
              <Link href={getApiUrl("/api/auth/github")} className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1A1A] text-white font-bold text-[13px] rounded hover:bg-[#333] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                <span className="opacity-50">&gt;_</span> Get Started
              </Link>
            )}
            <Link href="/leaderboard" className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-[#D6D0C4] text-[#1A1A1A] font-bold text-[13px] rounded hover:bg-[#F5F2EA] transition-colors flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" /> View Leaderboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#EBE6DF] to-transparent my-10 max-w-6xl mx-auto" />

      <section ref={sectorRef} className="py-12 px-6 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="reveal-item flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-[#1A1A1A] font-bold text-[15px] font-mono">
                <Icon className="w-4 h-4 text-[#8C867E]" />
                {title}
              </div>
              <p className="text-[#6B6661] font-sans text-sm md:text-[15px] leading-[1.8] font-medium">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. EVENT ENDED
// ─────────────────────────────────────────────────────────────
function EventEndedView({ config }: { config: EventStatus }) {
  const sectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-item", {
        y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: sectorRef.current, start: "top 80%" },
      });
    }, sectorRef);
    return () => ctx.revert();
  }, []);

  const highlights = [
    { icon: Users, label: "Contributors", value: config.stats.total_users },
    { icon: Code2, label: "Total Submissions", value: config.stats.total_prs },
    { icon: Trophy, label: "Merged PRs", value: config.stats.merged_prs },
    { icon: Star, label: "Active Repos", value: config.stats.active_repos },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] pb-24">

      <section className="pt-28 md:pt-44 pb-20 flex flex-col items-center text-center px-6 relative w-full">
        <motion.div initial="hidden" animate="show" variants={stagger} className="w-full max-w-4xl mx-auto flex flex-col items-center">

          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 mb-8 font-mono text-[11px] font-bold tracking-widest text-[#6B6661] uppercase">
            <Calendar className="w-3 h-3" />
            Closed on {formatDate(config.end_date)}
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[40px] md:text-[68px] lg:text-[80px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-6">
            <span className="text-[#8C867E] font-normal">&gt;</span> {config.event_title}<br />
            <span className="font-mono font-medium tracking-normal text-[34px] md:text-[48px] lg:text-[60px]">{"has_concluded;"}</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[#6B6661] text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            The session has concluded. Thank you to everyone who contributed and pushed the open-source community forward.
          </motion.p>

          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 w-full max-w-3xl">
            {highlights.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center p-6 rounded-3xl border border-[#EBE6DF] bg-white shadow-sm">
                <Icon className="w-5 h-5 text-[#8C867E] mb-3" />
                <span className="text-[28px] md:text-[32px] font-bold font-mono tabular-nums text-[#1A1A1A]">{value}</span>
                <span className="text-[10px] font-bold tracking-widest text-[#8C867E] uppercase mt-1">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/leaderboard" className="px-8 py-3.5 bg-[#1A1A1A] text-white font-bold text-[13px] rounded hover:bg-[#333] transition-colors flex items-center justify-center gap-2 font-mono shadow-lg shadow-black/10">
              <Trophy className="w-4 h-4" /> View Rankings
            </Link>
            <a href="https://github.com/nst-sdc" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-transparent border border-[#D6D0C4] text-[#1A1A1A] font-bold text-[13px] rounded hover:bg-[#F5F2EA] transition-colors flex items-center justify-center gap-2 font-mono">
              <Github className="w-4 h-4" /> NST-SDC
            </a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root export — picks phase automatically
// ─────────────────────────────────────────────────────────────
export default function HomeClient() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<EventStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/event/status`);
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error("Failed to fetch event status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 60_000);
    return () => clearInterval(id);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="font-mono text-sm animate-pulse text-[#8C867E]">INITIALIZING_SKILLFEST_STATE...</div>
    </div>
  );

  if (!config) return null;

  if (config.phase === "coming_soon") return <ComingSoonView config={config} />;
  if (config.phase === "ended") return <EventEndedView config={config} />;
  return <ActiveEventView config={config} />;
}
