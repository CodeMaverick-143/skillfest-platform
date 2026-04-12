'use client';

import { useState, useEffect } from "react";
import { GitPullRequest, Code, Trophy, Star, Activity, Shield, Clock, ExternalLink, ChevronRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";

export default function DashboardClient() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [stats, setStats] = useState({
    points: 0,
    level: "Newcomer",
    streak: 0,
    completedChallenges: 0,
    pullRequests: [] as any[]
  });

  useEffect(() => {
    if (user?.username) {
      fetch(getApiUrl(`/api/profile/${user.username}`), { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data && data.user) {
            const prList = data.prs || data.pull_requests || [];
            setStats({
              points: data.user.points || 0,
              level: data.user.level || "Newcomer",
              streak: data.streak || 0,
              completedChallenges: data.tasks_completed || 0,
              pullRequests: prList
            });
          }
        })
        .catch(err => console.error("Failed to fetch profile", err))
        .finally(() => setLoading(false));
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center font-sans tracking-tight">
        <Activity className="w-12 h-12 text-[#EBE6DF] mb-6 animate-pulse" />
        <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-4 font-mono tracking-widest uppercase">Access Denied</h2>
        <p className="text-[#6B6661] text-sm mb-8 font-medium max-w-sm">Connect your GitHub to sync your open-source telemetrics.</p>
        <Link 
          href={getApiUrl("/api/auth/github/login")}
          className="px-8 py-3 bg-[#1A1A1A] text-white font-bold rounded text-[13px] tracking-widest uppercase font-mono hover:bg-[#333] transition-all shadow-md"
        >
          Authenticate
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center font-mono">
        <Activity className="w-10 h-10 text-[#1A1A1A] animate-pulse mb-4" />
        <p className="text-[#8C867E] text-[11px] font-bold uppercase tracking-widest">Loading runtime...</p>
      </div>
    );
  }

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch(getApiUrl("/api/users/enroll"), {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnrolling(false);
    }
  };

  if (user && !user.is_enrolled) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center font-sans tracking-tight">
        <Shield className="w-12 h-12 text-[#EBE6DF] mb-6" />
        <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-4 font-mono tracking-widest uppercase">Action Required</h2>
        <p className="text-[#6B6661] text-sm mb-8 font-medium max-w-sm">You need to enroll in SkillFest to start tracking your open source contributions and points.</p>
        <button 
          onClick={handleEnroll}
          disabled={enrolling}
          className="px-8 py-3 bg-[#1A1A1A] text-white font-bold rounded text-[13px] tracking-widest uppercase font-mono hover:bg-[#333] transition-all shadow-md disabled:opacity-50"
        >
          {enrolling ? "Enrolling..." : "Enroll Now"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] overflow-hidden font-mono selection:bg-[#1A1A1A]/10 selection:text-black pt-24 pb-24 px-6 md:px-10">
      <main className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#EBE6DF]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#F5F2EA] border border-[#EBE6DF] text-[#8C867E] text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm">
              <Shield className="w-3.5 h-3.5" /> <span className="text-[#1A1A1A]">&gt;_</span> Verified Operative
            </div>
            <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight leading-none text-[#1A1A1A] font-sans">
              <span className="text-[#8C867E] font-normal">&gt;</span>{user?.username || "Guest_User"} <span className="animate-pulse font-normal">_</span>
            </h1>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-[#F5F2EA] border border-[#EBE6DF] p-6 md:p-8 hover:border-[#D6D0C4] transition-colors shadow-sm rounded-lg">
              <Star className="w-5 h-5 text-[#8C867E] mb-6" />
              <p className="text-[9px] uppercase font-bold text-[#6B6661] tracking-widest mb-2">Total Points</p>
              <h2 className="text-3xl md:text-4xl font-bold font-sans">{stats.points}</h2>
            </div>
            <div className="bg-[#F5F2EA] border border-[#EBE6DF] p-6 md:p-8 hover:border-[#D6D0C4] transition-colors shadow-sm rounded-lg">
              <Trophy className="w-5 h-5 text-[#8C867E] mb-6" />
              <p className="text-[9px] uppercase font-bold text-[#6B6661] tracking-widest mb-2">Rank Level</p>
              <h2 className="text-xl md:text-2xl font-bold font-sans mt-2 uppercase">{stats.level}</h2>
            </div>
            <div className="bg-[#F5F2EA] border border-[#EBE6DF] p-6 md:p-8 hover:border-[#D6D0C4] transition-colors shadow-sm rounded-lg">
              <Activity className="w-5 h-5 text-[#8C867E] mb-6" />
              <p className="text-[9px] uppercase font-bold text-[#6B6661] tracking-widest mb-2">Current Streak</p>
              <h2 className="text-3xl md:text-4xl font-bold font-sans">{stats.streak} d</h2>
            </div>
            <div className={`border p-6 md:p-8 transition-colors shadow-sm rounded-lg ${stats.completedChallenges >= 3 ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-[#F5F2EA] border-[#EBE6DF] hover:border-[#D6D0C4]'}`}>
              <CheckCircle className={`w-5 h-5 mb-6 ${stats.completedChallenges >= 3 ? 'text-[#27c93f]' : 'text-[#8C867E]'}`} />
              <p className={`text-[9px] uppercase font-bold tracking-widest mb-2 ${stats.completedChallenges >= 3 ? 'text-[#D6D0C4]' : 'text-[#6B6661]'}`}>Tasks Completed</p>
              <h2 className="text-3xl md:text-4xl font-bold font-sans">{stats.completedChallenges}</h2>
              {stats.completedChallenges >= 3 && (
                <div className="mt-4 pt-4 border-t border-[#333]">
                  <p className="text-[10px] font-bold text-[#27c93f] uppercase tracking-widest animate-pulse">🎉 Swag Kit Unlocked!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PR Analytics */}
        <div>
          <h3 className="text-sm font-bold flex items-center gap-3 text-[#1A1A1A] uppercase tracking-widest mb-6 pb-4 border-b border-[#EBE6DF]">
            <GitPullRequest className="w-4 h-4 text-[#8C867E]" /> Contribution Log
          </h3>
          <div className="bg-[#FDFBF7] border border-[#EBE6DF] border-b-0 divide-y divide-[#EBE6DF] shadow-sm rounded-t-lg">
            {stats.pullRequests.map((pr: any, i: number) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-[#F5F2EA] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full ${pr.state === 'Merged' || pr.state === 'merged' ? 'bg-[#27c93f]' : pr.state === 'Closed' || pr.state === 'closed' ? 'bg-[#ff5f56]' : 'bg-[#eab308]'}`} />
                  <div>
                    <p className="font-bold text-[13px] font-sans text-[#1A1A1A]">{pr.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[10px] font-bold text-[#8C867E] uppercase tracking-widest">{pr.repo_name}</p>
                      <div className="w-1 h-1 rounded-full bg-[#EBE6DF]" />
                      <span className={`text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded border ${
                        pr.review_status === 'approved' ? 'bg-[#27c93f]/10 text-[#27c93f] border-[#27c93f]/20' : 
                        pr.review_status === 'rejected' ? 'bg-[#ff5f56]/10 text-[#ff5f56] border-[#ff5f56]/20' : 
                        'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20'
                      }`}>
                        {pr.review_status === 'approved' ? 'Accepted' : pr.review_status === 'rejected' ? 'Rejected' : 'Review Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                <a href={pr.url} target="_blank" className="p-2 text-[#A39D96] group-hover:text-[#1A1A1A] transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
            {stats.pullRequests.length === 0 && (
              <div className="p-8 text-center text-[#8C867E] text-[11px] font-bold uppercase tracking-widest">
                No contributions yet.
              </div>
            )}
          </div>
          <div className="h-[1px] bg-[#EBE6DF] w-full" />
        </div>

      </main>
    </div>
  );
}
