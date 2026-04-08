'use client';

import { Github, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#EBE6DF] bg-[#FDFBF7] py-16 font-mono">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="font-bold text-sm tracking-widest text-[#8C867E] uppercase">SKILLFEST<span className="text-[#1A1A1A]">.</span></span>
            </Link>
            <p className="text-[#6B6661] text-xs leading-relaxed max-w-xs">
              The open source contribution engine for builders.
            </p>
            <div className="flex gap-4">
              {[{Icon: Github, href: "https://github.com/nst-sdc"}, {Icon: Mail, href: "mailto:support@nstsdc.org"}].map(({Icon, href}, i) => (
                <Link key={i} href={href} target={href.startsWith('http') ? "_blank" : undefined} rel={href.startsWith('http') ? "noopener noreferrer" : undefined} className="flex items-center justify-center text-[#6B6661] hover:text-[#1A1A1A] transition-colors">
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4 text-xs text-[#6B6661]">
              {[["Rules", "/rules"], ["Projects", "/projects"], ["Leaderboard", "/leaderboard"], ["Apply", "/fresher-application"]].map(([n, h]) => (
                <li key={n} className="flex items-center gap-2 group"><span className="text-[#C4BFAF] group-hover:text-[#1A1A1A] transition-colors">&gt;</span><Link href={h} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-[#1A1A1A] transition-colors">{n}</Link></li>
              ))}
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4 text-xs text-[#6B6661]">
              <li className="flex items-center gap-2 group"><span className="text-[#C4BFAF] group-hover:text-[#1A1A1A] transition-colors">&gt;</span><Link href="#" className="hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-2">GitHub Repo <ArrowUpRight className="w-3 h-3 text-[#A39D96]" /></Link></li>
              <li className="flex items-center gap-2 group"><span className="text-[#C4BFAF] group-hover:text-[#1A1A1A] transition-colors">&gt;</span><Link href="#" className="hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-2">Documentation</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#EBE6DF] flex flex-col sm:flex-row justify-center items-center gap-4 text-[10px] font-bold tracking-widest uppercase text-[#8C867E]">
          <p>© {new Date().getFullYear()} SKILLFEST · <span className="text-[#1A1A1A]">nst-sdc</span></p>
        </div>
      </div>
    </footer>
  );
}
