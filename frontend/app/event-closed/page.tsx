"use client";

import { Github, Trophy, Calendar, Users, Code2, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });
}

export default function EventClosedPage() {
  const sectorRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}/api/event/status`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !data) return;
    const ctx = gsap.context(() => {
      gsap.from(".reveal-item", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectorRef.current, start: "top 80%" },
      });
    }, sectorRef);
    return () => ctx.revert();
  }, [loading, data]);

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-mono text-sm text-[#8C867E]">
      VERIFYING_EVENT_LIFECYCLE...
    </div>
  );

  const stats = [
    { icon: Users,  label: "Participants",      value: data?.stats?.total_users ?? 0 },
    { icon: Code2,  label: "Submissions",       value: data?.stats?.total_prs ?? 0 },
    { icon: Trophy, label: "Validated PRs",    value: data?.stats?.merged_prs ?? 0 },
    { icon: Star,   label: "Active Repos",      value: data?.stats?.active_repos ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] pb-24 selection:bg-[#1A1A1A]/10">

      <div className="bg-[#1A1A1A] text-white py-2.5 px-6 text-center font-mono text-[11px] font-bold tracking-widest uppercase">
        {data.event_title} is currently paused or closed — check back soon.
      </div>

      <section className="pt-28 md:pt-44 pb-20 flex flex-col items-center text-center px-6 w-full">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="w-full max-w-4xl mx-auto flex flex-col items-center"
        >

          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 mb-8 font-mono text-[11px] font-bold tracking-widest text-[#6B6661] uppercase"
          >
            <Calendar className="w-3 h-3" />
            {formatDate(data.start_date)} – {formatDate(data.end_date)}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-[40px] md:text-[68px] lg:text-[80px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-6"
          >
            <span className="text-[#8C867E] font-normal">&gt;</span> {data.event_title}<br />
            <span className="font-mono font-medium tracking-normal text-[34px] md:text-[56px] lg:text-[68px]">
              {"is_closed;"}
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-[#6B6661] text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium"
          >
            {data.event_description || `The organizers have temporarily restricted access to ${data.event_title}. Thank you for your contributions — they are safely stored in our systems.`}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 w-full max-w-3xl"
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center p-6 rounded-3xl border border-[#EBE6DF] bg-white shadow-sm"
              >
                <Icon className="w-5 h-5 text-[#8C867E] mb-3" />
                <span className="text-[28px] md:text-[32px] font-bold font-mono tabular-nums text-[#1A1A1A]">
                  {value}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#8C867E] uppercase mt-1">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center font-mono"
          >
            <Link
              href="/leaderboard"
              className="px-8 py-3.5 bg-[#1A1A1A] text-white font-bold text-[13px] rounded hover:bg-[#333] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10"
            >
              <Trophy className="w-4 h-4" /> View Leaderboard
            </Link>
            <a
              href="https://github.com/nst-sdc"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-transparent border border-[#D6D0C4] text-[#1A1A1A] font-bold text-[13px] rounded hover:bg-[#F5F2EA] transition-colors flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" /> NST-SDC on GitHub
            </a>
          </motion.div>
        </motion.div>
      </section>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#EBE6DF] to-transparent my-10 max-w-6xl mx-auto" />

      <section ref={sectorRef} className="py-12 px-6 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {[
            {
              title: "Skill Validation",
              desc:  "PRs were analyzed for code quality to surface real capabilities — not just commit counts.",
            },
            {
              title: "Real-world Projects",
              desc:  "Participants contributed to actual NST-SDC repositories solving real engineering problems.",
            },
            {
              title: "Global Leaderboard",
              desc:  "Contributions were ranked fairly across all roles — frontend, backend, and full-stack.",
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="reveal-item flex flex-col p-8 bg-white border border-[#EBE6DF] rounded-3xl"
            >
              <div className="flex items-center gap-2 mb-6 text-[#1A1A1A] font-bold text-[15px] font-mono">
                <span className="text-[#8C867E]">∿</span>
                {title}
              </div>
              <p className="text-[#6B6661] text-sm md:text-[15px] leading-[1.8] font-medium">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
