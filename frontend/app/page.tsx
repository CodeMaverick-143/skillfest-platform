'use client';

import { ArrowRight, Code, Github, Sparkles, Trophy, Zap, CheckCircle2, Terminal, LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, login, logout } = useAuth();
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.span variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f6f8fa] border border-[#d0d7de] text-sm font-medium text-[#238636]">
              <Trophy className="w-4 h-4" />
              SkillFest 2026 Registration is Live
            </motion.span>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black tracking-tight text-[#1a1a1a]">
              SkillFest – <span className="gradient-text italic">Build.</span> <span className="gradient-text italic">Contribute.</span> <span className="gradient-text italic">Grow.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
              Empowering developers through open source. Join the movement, contribute to top repositories, and level up your skills.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 active:scale-95">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button onClick={logout} className="w-full sm:w-auto px-8 py-4 bg-[#f6f8fa] border border-[#d0d7de] text-[#1a1a1a] font-bold rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 active:scale-95">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button 
                  onClick={login}
                  className="group w-full sm:w-auto px-8 py-4 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 active:scale-95"
                >
                  <Github className="w-6 h-6" />
                  Sign in with GitHub
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <Link href="/rules" className="w-full sm:w-auto px-8 py-4 bg-[#f6f8fa] border border-[#d0d7de] text-[#1a1a1a] font-bold rounded-2xl hover:bg-white transition-all text-center active:scale-95">
                Read the rules
              </Link>
            </motion.div>

            {/* Git Animation Component */}
            <motion.div variants={itemVariants} className="max-w-3xl mx-auto mt-16 p-px rounded-3xl bg-gradient-to-r from-[#d0d7de] via-[#238636] to-[#A371F7] opacity-80 shadow-2xl overflow-hidden">
              <div className="bg-[#0d1117] rounded-[23px] p-6 text-left font-mono text-sm relative">
                <div className="flex gap-1.5 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="space-y-1.5 min-h-[100px]">
                  <p className="text-white"><span className="text-[#238636]">$</span> git clone https://github.com/skillfest/2026</p>
                  <p className="text-[#8b949e]">Cloning into 'skillfest-2026'...</p>
                  <p className="text-white"><span className="text-[#238636]">$</span> npm install && git checkout -b feature/level-up</p>
                  <p className="text-purple-400"># Setting up your contribution workspace...</p>
                  <p className="text-white animate-pulse"><span className="text-[#238636]">$</span> _</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-24 bg-[#f6f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-[#1a1a1a]">Participation Tracks</h2>
            <p className="text-[#8b949e] font-medium">Choose your path and start contributing to the ecosystem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TrackCard 
              title="Developer Challenge"
              description="Make 3+ PRs to nst-sdc repos to earn exclusive rewards, including digital badges, physical swags, and limited edition stickers."
              icon={<Code className="w-8 h-8 text-[#238636]" />}
              color="emerald"
              btnText="Learn more"
              href="/dashboard"
            />
            <TrackCard 
              title="Fresher Developer Program"
              description="Kickstart your career. Apply with your profile/portfolio and get mentored by industry experts from top tech companies."
              icon={<Zap className="w-8 h-8 text-[#A371F7]" />}
              color="purple"
              btnText="Apply now"
              href="/fresher-application"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#161b22] to-[#0d1117] rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#238636] via-[#A371F7] to-[#f778ba]" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Ready to start your journey?</h2>
            <p className="text-[#8b949e] text-lg max-w-xl mx-auto">
              Join thousands of developers in the SkillFest 2026 challenge. Build your portfolio while giving back to open source.
            </p>
            <button className="px-10 py-5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 mx-auto active:scale-95 text-lg">
              Level Up Now!
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrackCard({ title, description, icon, color, btnText, href }: { title: string; description: string; icon: any; color: string, btnText: string, href: string }) {
  return (
    <div className={`group p-10 rounded-[2.5rem] border border-[#d0d7de] bg-white card-hover relative overflow-hidden`}>
      <div className={`w-16 h-16 rounded-2xl bg-${color}-500/10 flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-[#1a1a1a] mb-6">{title}</h3>
      <p className="text-[#8b949e] leading-relaxed mb-10 min-h-[80px]">
        {description}
      </p>
      <Link 
        href={href}
        className={`inline-flex items-center gap-2 font-bold transition-all text-[#1a1a1a] hover:translate-x-1`}
      >
        {btnText} 
        <ArrowRight className="w-5 h-5 text-[#238636]" />
      </Link>
    </div>
  );
}
