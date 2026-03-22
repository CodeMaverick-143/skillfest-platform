import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#f6f8fa] border-t border-[#d0d7de] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#238636] to-[#A371F7] flex items-center justify-center">
                <span className="text-white text-xs font-bold italic">SF</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-[#1a1a1a]">SkillFest 2026</span>
            </Link>
            <p className="text-[#8b949e] max-w-sm">
              Empowering the next generation of developers through open source contributions and mentorship.
            </p>
            <div className="flex gap-4">
              <button className="p-2 rounded-lg bg-white border border-[#d0d7de] hover:border-[#238636] transition-colors">
                <Github className="w-5 h-5 text-[#1a1a1a]" />
              </button>
              <button className="p-2 rounded-lg bg-white border border-[#d0d7de] hover:border-[#238636] transition-colors">
                <Twitter className="w-5 h-5 text-[#1a1a1a]" />
              </button>
              <button className="p-2 rounded-lg bg-white border border-[#d0d7de] hover:border-[#238636] transition-colors">
                <Mail className="w-5 h-5 text-[#1a1a1a]" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#1a1a1a] mb-6">Program</h3>
            <ul className="space-y-4 text-[#8b949e] text-sm font-medium">
              <li><Link href="/rules" className="hover:text-[#238636] transition-colors">Event Rules</Link></li>
              <li><Link href="/leaderboard" className="hover:text-[#238636] transition-colors">Global Leaderboard</Link></li>
              <li><Link href="/fresher-application" className="hover:text-[#238636] transition-colors">Fresher Track</Link></li>
              <li><Link href="/prizes" className="hover:text-[#238636] transition-colors">Rewards & Prizes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#1a1a1a] mb-6">Support</h3>
            <ul className="space-y-4 text-[#8b949e] text-sm font-medium">
              <li><Link href="/about" className="hover:text-[#238636] transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-[#238636] transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-[#238636] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[#238636] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#d0d7de] text-center">
          <p className="text-xs text-[#8b949e] font-medium">
            © 2026 SkillFest. Powered by <span className="text-[#238636]">nst-sdc</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
