'use client';

import { Github, Zap, Shield, GitPullRequest } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function HomeClient() {
  const { user } = useAuth();
  const sectorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);

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
    { label: "✔ MERGE", id: 3 }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] selection:bg-[#1A1A1A]/10 selection:text-[#1A1A1A] pb-24 font-sans">
      <section className="pt-32 md:pt-48 pb-16 flex flex-col items-center justify-center text-center px-6 relative w-full">
        <motion.div initial="hidden" animate="show" variants={stagger} className="w-full max-w-5xl mx-auto flex flex-col items-center">

          <motion.h1 
            variants={fadeUp} 
            className="text-[40px] md:text-[64px] lg:text-[80px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-8 mx-auto"
          >
            <span className="text-[#8C867E] font-normal">&gt;</span>Showcase your skills by<br/>contributing to <br/>
            <span className="text-[#1A1A1A] font-mono font-medium tracking-normal text-[36px] md:text-[60px] lg:text-[72px]">{"{open_source}"}</span> <span className="animate-pulse font-normal text-[#1A1A1A]">_</span>
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
                    className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[11px] md:text-[13px] font-bold tracking-widest transition-colors ${
                      activeTab === step.id ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#8C867E] hover:text-[#1A1A1A]"
                    }`}
                  >
                    {step.label}
                  </button>
                  {idx < flowSteps.length - 1 && (
                    <span className="text-[#C4BFAF] px-1 md:px-3 text-[10px]">&rarr;</span>
                  )}
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
                <span className="opacity-50">&gt;_</span> Get Started (2 min setup)
              </Link>
            )}
            <Link href="/docs/event" className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-[#D6D0C4] text-[#1A1A1A] font-bold text-[13px] rounded hover:bg-[#F5F2EA] transition-colors flex items-center justify-center gap-2">
              &lt;&gt; Documentation
            </Link>
          </motion.div>

        </motion.div>
      </section>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#EBE6DF] to-transparent my-10 max-w-6xl mx-auto" />
      <section ref={sectorRef} className="py-12 px-6 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-y-0 text-left">
          
          <div className="reveal-item md:pr-10 md:border-r border-[#EBE6DF] flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-[#1A1A1A] font-bold text-[15px] font-mono">
              <Zap className="w-4 h-4 text-[#8C867E]" />
              Skill Validation
            </div>
            <p className="text-[#6B6661] font-sans text-sm md:text-[15px] leading-[1.8] font-medium">
              When you submit a PR, you need reviews that understand your intent. SkillFest analyzes your code quality to surface your real capabilities securely.
            </p>
          </div>

          <div className="reveal-item md:px-10 md:border-r border-[#EBE6DF] flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-[#1A1A1A] font-bold text-[15px] font-mono">
              <Shield className="w-4 h-4 text-[#8C867E]" />
              Real-world Projects
            </div>
            <p className="text-[#6B6661] font-sans text-sm md:text-[15px] leading-[1.8] font-medium">
              Drop into an open-source project without breaking your flow. It detects your experience level in real time and helps you grow fast.
            </p>
          </div>

          <div className="reveal-item md:pl-10 flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-[#1A1A1A] font-bold text-[15px] font-mono">
              <GitPullRequest className="w-4 h-4 text-[#8C867E]" />
              Global Leaderboard
            </div>
            <p className="text-[#6B6661] font-sans text-sm md:text-[15px] leading-[1.8] font-medium">
              Works seamlessly across all roles — frontend, backend, or fullstack. Designed to handle thousands of developers and rank contributions fairly.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
