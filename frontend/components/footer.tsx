'use client';

import { Github, Twitter, Mail, Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-1)] py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-10">
          <div className="col-span-2 md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[var(--accent)] text-[#06080f] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-black text-sm tracking-tight text-white font-display">SKILL<span className="text-[var(--accent)]">FEST</span></span>
            </Link>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              The open source contribution engine for builders.
            </p>
            <div className="flex gap-2">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <Link key={i} href="#" className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-slate-500 hover:text-white hover:bg-[var(--surface-3)] transition-all">
                  <Icon className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-[10px] font-semibold text-white uppercase tracking-[0.12em] mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              {[["Rules", "/rules"], ["Projects", "/projects"], ["Leaderboard", "/leaderboard"], ["Apply", "/fresher-application"]].map(([n, h]) => (
                <li key={n}><Link href={h} className="hover:text-white transition-colors">{n}</Link></li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-semibold text-white uppercase tracking-[0.12em] mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">GitHub Repo <ArrowUpRight className="w-3 h-3 opacity-40" /></Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} SkillFest · <span className="text-[var(--accent)]">nst-sdc</span></p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
