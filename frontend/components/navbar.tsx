'use client';

import Link from "next/link";
import { Github, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Fresher Program", href: "/fresher-application" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#d0d7de]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#238636] to-[#A371F7] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
                <span className="text-white font-bold text-lg italic">SF</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">SkillFest <span className="text-[#238636]">2026</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#238636] ${
                    isActive(link.href) ? "text-[#238636] underline underline-offset-8 decoration-2" : "text-[#8b949e]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="h-6 w-px bg-[#d0d7de]" />
            
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-semibold hover:bg-[#2ea043] transition-all shadow-sm">
              <Github className="w-4 h-4" />
              Sign in
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#1a1a1a]">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-[#d0d7de] animate-in slide-in-from-top duration-200">
          <div className="px-4 pt-2 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-lg font-medium text-[#1a1a1a] hover:text-[#238636]"
              >
                {link.name}
              </Link>
            ))}
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#238636] text-white font-bold">
              <Github className="w-5 h-5" />
              Sign in with GitHub
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
