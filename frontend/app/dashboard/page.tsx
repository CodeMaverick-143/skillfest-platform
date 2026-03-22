'use client';

import { useState, useEffect } from "react";
import { 
  GitPullRequest, 
  Code, 
  Trophy, 
  Zap, 
  ArrowUpRight, 
  Search, 
  Settings,
  Star,
  Activity,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      const fetchData = async () => {
        try {
          const [dashboardRes, attemptsRes] = await Promise.all([
            fetch(getApiUrl(`/api/users/${user.id}/dashboard`), { credentials: 'include' }),
            fetch(getApiUrl("/api/challenges/user-attempts"), {
              headers: { Authorization: `Bearer ${document.cookie.split('skillfest_token=')[1]?.split(';')[0]}` }
            })
          ]);

          if (dashboardRes.ok) setDashboardData(await dashboardRes.json());
          if (attemptsRes.ok) setAttempts(await attemptsRes.json());
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#041329] flex items-center justify-center bg-tech-network">
        <div className="flex flex-col items-center gap-4">
           <Zap className="w-12 h-12 text-[#00e5ff] animate-pulse" />
           <p className="text-[#00e5ff] font-tech text-xs tracking-[0.4em] uppercase">Syncing Neural Link...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || { points: 0, level: 'Newcomer', rank: '-' };
  const pullRequests = dashboardData?.pull_requests || [];

  return (
    <div className="min-h-screen bg-[#041329] text-[#d6e3ff] relative overflow-hidden bg-tech-network">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00e5ff]/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#7c4dff]/5 blur-[150px] rounded-full" />

      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="space-y-12">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20">
                  <Shield className="w-5 h-5 text-[#00e5ff]" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-[#00e5ff]">Verified Operative</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                Welcome, <span className="text-gradient">{user?.username}</span>
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-1.5 glass rounded-2xl border-[#849396]/10"
            >
              <div className="px-6 py-3 rounded-xl bg-[#0d1c32] border border-[#849396]/10">
                <p className="text-[10px] text-[#bac9cc] font-bold uppercase tracking-widest mb-1">Cortex Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
                  <span className="text-lg font-black text-[#00e5ff]">ONLINE</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="glass rounded-[2.5rem] p-8 border-[#00e5ff]/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star className="w-20 h-20 text-[#00e5ff]" />
              </div>
              <p className="text-[10px] font-black tracking-[0.3em] text-[#00e5ff] uppercase mb-4">Cumulative EXP</p>
              <h2 className="text-5xl font-black text-white">{stats.points}</h2>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-[#112036] rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: "40%" }} className="h-full bg-gradient-to-r from-[#00e5ff] to-[#7c4dff]" />
                </div>
                <span className="text-[10px] font-bold text-[#bac9cc]">NEXT LVL: 2000</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass rounded-[2.5rem] p-8 border-[#cdbdff]/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-20 h-20 text-[#cdbdff]" />
              </div>
              <p className="text-[10px] font-black tracking-[0.3em] text-[#cdbdff] uppercase mb-4">Current Level</p>
              <h2 className="text-5xl font-black text-white uppercase">{stats.level}</h2>
              <p className="mt-4 text-xs font-medium text-[#bac9cc] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#cdbdff]" />
                Top 15% of all hackers
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass rounded-[2.5rem] p-8 border-[#00e5ff]/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Code className="w-20 h-20 text-[#00e5ff]" />
              </div>
              <p className="text-[10px] font-black tracking-[0.3em] text-[#00e5ff] uppercase mb-4">Ongoing Tasks</p>
              <h2 className="text-5xl font-black text-white">{attempts.length}</h2>
              <Link href="/projects" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-[#00e5ff] hover:underline uppercase tracking-widest">
                Scan for more nodes <ArrowUpRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </div>

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
            {/* Ongoing Challenges */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Activity className="w-6 h-6 text-[#00e5ff]" />
                  Internal Tasks
                </h3>
              </div>
              
              <div className="space-y-4">
                {attempts.length === 0 ? (
                  <div className="glass rounded-3xl p-12 text-center border-dashed border-[#849396]/10">
                    <p className="text-[#bac9cc] font-tech text-sm tracking-widest">No active tasks detected.</p>
                  </div>
                ) : (
                  attempts.map((attempt, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass rounded-3xl p-6 flex items-center justify-between group border-[#849396]/10 hover:border-[#00e5ff]/30 transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#00e5ff]/5 border border-[#00e5ff]/10 flex items-center justify-center group-hover:bg-[#00e5ff]/10 transition-colors">
                          <Code className="w-6 h-6 text-[#00e5ff]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">Issue #{attempt.issue_number}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
                             <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-[0.2em]">Executing...</span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        href="/projects" 
                        className="p-3 rounded-xl glass border-[#849396]/10 text-[#bac9cc] hover:text-[#00e5ff] hover:border-[#00e5ff]/30 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* PR Analytics */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <GitPullRequest className="w-6 h-6 text-[#cdbdff]" />
                  Extraction Logs
                </h3>
              </div>

              <div className="glass rounded-[3rem] p-8 border-[#849396]/10 h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-tech-network opacity-5" />
                <div className="relative z-10 space-y-6">
                  {pullRequests.length === 0 ? (
                    <div className="p-12 text-center">
                      <Clock className="w-12 h-12 text-[#bac9cc]/20 mx-auto mb-4" />
                      <p className="text-[#bac9cc] text-sm tracking-widest font-tech">Awaiting signal...</p>
                    </div>
                  ) : (
                    pullRequests.map((pr: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${pr.status === 'Merged' ? 'bg-[#238636]' : 'bg-[#7c4dff]'}`} />
                          <div>
                            <p className="font-bold text-sm text-white group-hover:text-[#00e5ff] transition-colors line-clamp-1">{pr.title}</p>
                            <p className="text-[10px] text-[#bac9cc] uppercase tracking-widest mt-1">{pr.repository}</p>
                          </div>
                        </div>
                        <a href={pr.url} target="_blank" className="p-2 text-[#bac9cc] hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
