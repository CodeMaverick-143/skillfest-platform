'use client';

import { Users, FileText, Database, Settings, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const cards = [
    {
      title: "Applications",
      desc: "Review Fresher Developer Program applications.",
      icon: <FileText className="w-8 h-8 text-[#238636]" />,
      path: "/admin/applications",
      color: "border-[#238636]/20 bg-[#238636]/5 hover:border-[#238636]", 
      text: "text-[#238636]"
    },
    {
      title: "User Management",
      desc: "Manage participants, assign manual points or hide users.",
      icon: <Users className="w-8 h-8 text-[#0969da]" />,
      path: "/admin/users",
      color: "border-[#0969da]/20 bg-[#0969da]/5 hover:border-[#0969da]",
      text: "text-[#0969da]"
    },
    {
      title: "Repositories",
      desc: "Manage tracked organizations and remote repositories.",
      icon: <Database className="w-8 h-8 text-[#8250df]" />,
      path: "/admin/repositories",
      color: "border-[#8250df]/20 bg-[#8250df]/5 hover:border-[#8250df]",
      text: "text-[#8250df]"
    },
    {
      title: "System & Sync",
      desc: "Trigger manual data synchronization and adjust global rules.",
      icon: <Settings className="w-8 h-8 text-[#cf222e]" />,
      path: "/admin/leaderboard",
      color: "border-[#cf222e]/20 bg-[#cf222e]/5 hover:border-[#cf222e]",
      text: "text-[#cf222e]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fa] p-8 lg:p-12 font-sans selection:bg-[#238636]/20 selection:text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4 pt-10">
          <div className="inline-flex p-3 rounded-2xl bg-[#238636]/10 text-[#238636] mb-2 border border-[#238636]/20 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1a1a1a] tracking-tight">Admin Console</h1>
          <p className="text-[#57606a] text-lg font-medium max-w-2xl">
            Welcome to the command center. Control telemetry, rank adjustments, repositories, and applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((c, i) => (
            <Link href={c.path} key={i}>
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`p-8 rounded-[2rem] border-2 bg-white transition-all shadow-sm cursor-pointer h-full flex flex-col group ${c.color}`}
              >
                <div className={`p-4 rounded-2xl w-fit mb-6 bg-white shadow-sm border ${c.color.split(' ')[0]}`}>
                  {c.icon}
                </div>
                <h2 className="text-2xl font-black text-[#1a1a1a] mb-2">{c.title}</h2>
                <p className="text-[#57606a] font-medium leading-relaxed mb-8 flex-1">{c.desc}</p>
                <div className={`mt-auto font-bold uppercase tracking-widest text-xs flex items-center gap-2 ${c.text}`}>
                  Access Module <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
