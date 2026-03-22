'use client';

import { CheckCircle2, GitPullRequest, LayoutDashboard, Trophy, Users, Star, ArrowUpRight, Search, Bell, Settings, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const fetchDashboard = async () => {
        try {
          const response = await fetch(getApiUrl(`/api/users/${user.id}/dashboard`), {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setDashboardData(data);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboard();
    }
  }, [user, authLoading, router]);

  if (authLoading || (user && loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-black text-2xl animate-pulse">
        Loading SkillFest Dashboard...
      </div>
    );
  }

  const prs = dashboardData?.prs || [];
  const stats = {
    points: user?.points || 0,
    level: user?.level || "Newcomer",
    prCount: prs.length,
    rank: user?.rank || "Pending"
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#d0d7de] hidden lg:flex flex-col bg-[#f6f8fa] py-8">
        <div className="px-6 space-y-8">
          <div className="space-y-1">
            <SidebarLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
            <SidebarLink href="/projects" icon={<Code className="w-5 h-5" />} label="Projects" />
            <SidebarLink href="/leaderboard" icon={<Trophy className="w-5 h-5" />} label="Leaderboard" />
          </div>

          <div className="pt-8 border-t border-[#d0d7de]">
            <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-4 px-3">Account</h4>
            <SidebarLink href="/profile" icon={<Users className="w-5 h-5" />} label="My Profile" />
            <SidebarLink href="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-[#d0d7de] flex items-center justify-between px-8 bg-white sticky top-16 z-10 transition-all">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <Search className="w-5 h-5 text-[#8b949e]" />
            <input 
              type="search" 
              placeholder="Search repositories, PRs..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-[#8b949e] hover:text-[#1a1a1a] transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#f778ba] rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#238636] to-[#A371F7] p-0.5">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#238636]">JD</div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-10">
          {/* Welcome & Banner */}
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-black text-[#1a1a1a]">Welcome back, {user?.username || 'Hunter'}! 👋</h1>
                <p className="text-[#8b949e] font-medium mt-1">You're making great progress towards your 2026 goal.</p>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-[#1a1a1a] to-[#0d1117] rounded-3xl p-8 relative overflow-hidden group shadow-xl"
            >
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#238636]/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-[#238636]/20 text-[#2ea043] rounded-full text-xs font-bold border border-[#238636]/30 uppercase tracking-widest">
                    Challenge Unlocked
                  </span>
                  <h2 className="text-2xl font-black text-white">Challenge Complete! 🏆</h2>
                  <p className="text-[#8b949e] max-w-md">Congrats! You've submitted 3 qualifying PRs. Claim your limited edition physical swag kit now.</p>
                  <button className="px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2">
                    Claim Swag Kit <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#238636] to-[#A371F7] p-1.5 animate-spin-slow">
                    <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-[#f778ba] animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#f6f8fa] border border-[#d0d7de] p-8 rounded-[2rem] space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[#8b949e] font-bold text-sm uppercase tracking-wider">Event Progress</p>
                <GitPullRequest className="w-6 h-6 text-[#238636]" />
              </div>
              <p className="text-4xl font-black text-[#1a1a1a]">{stats.prCount} of 3 <span className="text-lg text-[#8b949e]">PRs</span></p>
              <div className="h-3 w-full bg-[#d0d7de] rounded-full overflow-hidden flex gap-1 bg-transparent border-none">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-full w-1/3 rounded-full ${stats.prCount >= i ? "bg-[#238636]" : "bg-[#d0d7de]"}`} />
                ))}
              </div>
              <p className={`text-xs font-bold ${stats.prCount >= 3 ? "text-[#238636]" : "text-[#8b949e]"}`}>
                {stats.prCount >= 3 ? "100% COMPLETED" : `${Math.round((stats.prCount / 3) * 100)}% PROGRESS`}
              </p>
            </div>

            <div className="bg-[#f6f8fa] border border-[#d0d7de] p-8 rounded-[2rem] space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[#8b949e] font-bold text-sm uppercase tracking-wider">Current Level</p>
                <Star className="w-6 h-6 text-[#A371F7]" />
              </div>
              <p className="text-4xl font-black text-[#1a1a1a]">{stats.level}</p>
              <span className="inline-block px-4 py-1.5 bg-[#A371F7]/10 text-[#A371F7] border border-[#A371F7]/20 rounded-full text-xs font-black tracking-widest uppercase">
                {stats.level}
              </span>
              <p className="text-xs font-bold text-[#8b949e]">{stats.points} POINTS EARNED</p>
            </div>

            <div className="bg-[#f6f8fa] border border-[#d0d7de] p-8 rounded-[2rem] space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[#8b949e] font-bold text-sm uppercase tracking-wider">Global Rank</p>
                <Users className="w-6 h-6 text-[#1a1a1a]" />
              </div>
              <p className="text-4xl font-black text-[#1a1a1a]">#{stats.rank}</p>
              <p className="text-[#8b949e] font-medium">Keep contributing to climb higher!</p>
              <Link href="/leaderboard" className="text-xs font-bold text-[#238636] hover:underline flex items-center gap-1">
                VIEW LEADERBOARD <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* PR List */}
          <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-[#1a1a1a]">Your Pull Requests</h2>
              <button className="text-sm font-bold text-[#238636] hover:underline">View History</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {prs.length > 0 ? prs.map((pr: any, i: number) => (
                <PRCard 
                  key={i} 
                  id={`#${pr.pr_number}`}
                  title={pr.title}
                  repo={pr.repo_name}
                  status={pr.state.toUpperCase()}
                  difficulty={pr.difficulty?.toUpperCase() || "MEDIUM"}
                  date={new Date(pr.created_at).toLocaleDateString()}
                />
              )) : (
                <div className="bg-[#f6f8fa] border border-[#d0d7de] border-dashed p-12 rounded-3xl text-center">
                  <p className="text-[#8b949e] font-bold">No pull requests found. Start contributing to see your progress!</p>
                  <Link href="/projects" className="text-[#238636] hover:underline mt-2 inline-block font-black">Find Projects →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label, active = false }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
        active 
          ? "bg-white text-[#238636] shadow-sm border border-[#d0d7de]" 
          : "text-[#8b949e] hover:text-[#1a1a1a] hover:bg-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function PRCard({ id, title, repo, status, difficulty, date }: any) {
  const statusColors: any = {
    MERGED: "bg-purple-100 text-purple-700 border-purple-200",
    OPEN: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const diffColors: any = {
    EASY: "text-green-600 bg-green-50",
    MEDIUM: "text-blue-600 bg-blue-50",
    HARD: "text-red-600 bg-red-50",
  };

  return (
    <div className="bg-white border border-[#d0d7de] p-6 rounded-3xl flex items-center justify-between hover:border-[#238636] transition-all hover:shadow-md group">
      <div className="flex items-center gap-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          status === "MERGED" ? "bg-purple-50 group-hover:bg-purple-100" : "bg-[#f6f8fa]"
        }`}>
          <GitPullRequest className={`w-6 h-6 ${status === "MERGED" ? "text-purple-600" : "text-[#8b949e]"}`} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-black text-[#1a1a1a] group-hover:text-[#238636] transition-colors">{title}</h4>
            <span className="text-[#8b949e] font-mono text-xs">{id}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-[#8b949e]">{repo}</span>
            <span className="text-[#d0d7de]">•</span>
            <span className="text-[#8b949e] uppercase">{date}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase ${statusColors[status]}`}>
          {status}
        </span>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${diffColors[difficulty]}`}>
          {difficulty}
        </span>
        <button className="p-3 rounded-full hover:bg-[#f6f8fa] transition-colors">
          <ArrowUpRight className="w-5 h-5 text-[#8b949e]" />
        </button>
      </div>
    </div>
  );
}

function Code(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
