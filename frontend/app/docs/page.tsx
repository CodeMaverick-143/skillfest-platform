'use client';

import { motion } from "framer-motion";
import { Info, ChevronRight, Book, ArrowRight, Layers, Target, Users } from "lucide-react";
import Link from "next/link";

const DOCS = [
  {
    id: "overview",
    title: "Event Overview",
    description: "Learn about SkillFest 2026, the tracks, and our mission.",
    icon: Target,
    content: (
      <div className="space-y-6">
        <p className="text-[#6B6661] font-sans leading-relaxed">
          Welcome to <span className="text-[#1A1A1A] font-bold">SkillFest 2026</span>, a week-long open source contribution program designed to showcase development skills and identify top talent for our team.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F5F2EA] border border-[#EBE6DF]">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A] mb-2">Developer Challenge</h4>
            <p className="text-[13px] text-[#8C867E]">For experienced developers. Solve real-world issues in nst-sdc repositories.</p>
          </div>
          <div className="p-4 bg-[#F5F2EA] border border-[#EBE6DF]">
            <h4 className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A] mb-2">Fresher Track</h4>
            <p className="text-[13px] text-[#8C867E]">Application-based track for those starting their career with mentorship.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "developer-challenge",
    title: "Developer Challenge",
    description: "Detailed guide on how to contribute and earn points.",
    icon: Layers,
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wider">How to Participate</h4>
          <ul className="space-y-3">
            {[
              "Sign in with your GitHub account.",
              "Browse active issues in the Projects section.",
              "Fork the repo, solve the issue, and submit a PR.",
              "Wait for evaluation to earn points and climb the leaderboard."
            ].map((step, i) => (
              <li key={i} className="flex gap-4 text-[13px] text-[#6B6661]">
                <span className="text-[#1A1A1A] font-bold">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-l-2 border-[#1A1A1A] bg-[#F5F2EA]">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Scoring</p>
          <p className="text-[13px] text-[#6B6661]">Points are awarded based on issue difficulty and PR quality. Top 15 performers are selected for potential positions.</p>
        </div>
      </div>
    )
  },
  {
    id: "fresher-program",
    title: "Fresher Program",
    description: "Information about the application and selection process.",
    icon: Users,
    content: (
      <div className="space-y-6">
        <p className="text-[#6B6661] font-sans text-sm leading-relaxed">
          The Fresher Developer Program is designed for early-career developers. We focus on potential, passion, and basic technical understanding.
        </p>
        <div className="space-y-4">
          <h4 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-wider">Selection Criteria</h4>
          <div className="space-y-3">
            {[
              { label: "Portfolio", desc: "Showcase your personal projects and learning journey." },
              { label: "Statement", desc: "Tell us why you want to join and what you aim to achieve." },
              { label: "GitHub Profile", desc: "Active participation and clean coding habits." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-[#1A1A1A] uppercase tracking-wide">{item.label}</span>
                <span className="text-[13px] text-[#8C867E]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/fresher-application" className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-[11px] font-bold tracking-widest uppercase hover:bg-[#333] transition-colors">
          Apply Now <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    )
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-32 px-6 font-mono text-[#1A1A1A]">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left space-y-6 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#F5F2EA] border border-[#EBE6DF] text-[#6B6661] text-[10px] font-bold tracking-widest uppercase shadow-sm">
            <span className="text-[#1A1A1A]">&gt;_</span> Documentation
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-8 font-sans">
            <span className="text-[#8C867E] font-normal">&gt;</span>Event Guide<span className="animate-pulse font-normal">_</span>
          </h1>
          <p className="text-[#6B6661] font-sans text-base leading-[1.7] font-medium">
            Everything you need to know about SkillFest 2026, contribution rules, and the selection process.
          </p>
        </motion.div>

        {/* Docs Grid */}
        <div className="grid grid-cols-1 gap-12">
          {DOCS.map((doc, i) => (
            <motion.section
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#F5F2EA] border border-[#EBE6DF] text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-300">
                    <doc.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold font-sans">{doc.title}</h2>
                  <p className="text-[#8C867E] text-[13px] leading-relaxed">{doc.description}</p>
                </div>
                <div className="flex-1 p-8 bg-white border border-[#EBE6DF] group-hover:border-[#1A1A1A] transition-colors shadow-sm">
                  {doc.content}
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        {/* Help Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-16 border-t border-[#EBE6DF] text-center"
        >
          <p className="text-[#8C867E] text-xs uppercase tracking-widest font-bold mb-4">Need more help?</p>
          <a href="mailto:[support@nstsdc.org]" className="text-[#1A1A1A] hover:text-[#8C867E] text-sm font-bold underline transition-colors">
            Contact the organizers
          </a>
        </motion.div>
      </div>
    </div>
  );
}
