'use client';

import { Trophy, Search, Filter, ArrowUpRight, Star, Medal } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { getApiUrl } from "@/lib/api";

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("All Levels");
  const [search, setSearch] = useState("");
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  const calculateLevel = (points: number) => {
    if (points >= 100000) return "Elite";
    if (points >= 50000) return "Lead";
    if (points >= 25000) return "Core";
    if (points >= 10000) return "Maintainer";
    if (points >= 2500) return "Builder";
    if (points >= 1000) return "Contributor";
    return "Explorer";
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const settingsRes = await fetch(getApiUrl("/api/admin/leaderboard-settings"));
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.visible === false) {
            setVisible(false);
            setLoading(false);
            return;
          }
        }

        const res = await fetch(getApiUrl("/api/leaderboard"));
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        
        const mapped = Array.isArray(data) ? data.map((u: any, i: number) => ({
          rank: i + 1,
          username: u.username,
          points: u.points,
          prs: u.prs || 0,
          level: calculateLevel(u.points),
          avatar_url: u.avatar_url,
          avatar: u.username.substring(0, 2).toUpperCase()
        })) : [];
        
        setContributors(mapped);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const levels = ["All Levels", "Elite", "Lead", "Core", "Maintainer", "Builder", "Contributor", "Explorer"];

  const filteredContributors = contributors.filter(c =>
    (filter === "All Levels" || c.level === filter) &&
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!visible) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-mono">
        <Trophy className="w-12 h-12 text-[#8C867E] mb-6 opacity-50" />
        <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-4 tracking-widest uppercase">Leaderboard Hidden</h2>
        <p className="text-[#6B6661] text-sm text-center max-w-sm">The public leaderboard is currently frozen by administration. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-mono selection:bg-[#1A1A1A]/10 selection:text-black">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-32 w-full">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex p-4 rounded-2xl bg-[#F5F2EA] text-[#1A1A1A] mb-4 border border-[#EBE6DF] shadow-sm"
            >
              <Trophy className="w-10 h-10 text-[#8C867E]" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black font-sans tracking-tight text-[#1A1A1A]">Global Ranking</h1>
            <p className="text-[#6B6661] font-medium max-w-2xl mx-auto">
              Celebrating the amazing developers contributing to SkillFest.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-4 md:p-6 rounded-3xl bg-[#F5F2EA] border border-[#EBE6DF] shadow-sm">
            <div className="relative w-full lg:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867E] group-focus-within:text-[#1A1A1A] transition-colors" />
              <input 
                type="text" 
                placeholder="Search ranks..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#EBE6DF] rounded-2xl focus:ring-1 focus:ring-[#1A1A1A] focus:border-[#1A1A1A] outline-none transition-all font-medium text-sm text-[#1A1A1A] placeholder-[#8C867E] font-sans"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto font-bold hide-scrollbar pb-1 lg:pb-0">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setFilter(l)}
                  className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider whitespace-nowrap transition-all border ${
                    filter === l 
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md shadow-black/10" 
                      : "bg-[#FDFBF7] text-[#6B6661] border-[#EBE6DF] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-[2rem] overflow-hidden border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-[#8C867E]">Loading ranks...</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F2EA] border-b border-[#EBE6DF]">
                      <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest">Rank</th>
                      <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest">Contributor</th>
                      <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest">Points</th>
                      <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest text-center">PRs</th>
                      <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest">Level</th>
                      <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE6DF]">
                    {filteredContributors.map((c) => (
                      <motion.tr
                        key={c.username}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group hover:bg-[#F5F2EA] transition-colors`}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            {c.rank === 1 && <Medal className="w-5 h-5 text-[#eab308]" />}
                            {c.rank === 2 && <Medal className="w-5 h-5 text-[#A39D96]" />}
                            {c.rank === 3 && <Medal className="w-5 h-5 text-[#D6D0C4]" />}
                            <span className={`text-lg font-black ${c.rank <= 3 ? 'text-[#1A1A1A]' : 'text-[#8C867E]'}`}>
                              #{c.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-[#1A1A1A] overflow-hidden`}>
                              {c.avatar_url ? <img src={c.avatar_url} alt={c.username} className="w-full h-full object-cover" /> : c.avatar}
                            </div>
                            <div>
                              <p className="font-bold text-[#1A1A1A] group-hover:text-[#6B6661] transition-colors">@{c.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-[#8C867E]" />
                            <span className="text-xl font-black text-[#1A1A1A]">{c.points.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="px-3 py-1 rounded-lg bg-[#FDFBF7] border border-[#EBE6DF] font-bold text-[#1A1A1A]">
                            {c.prs}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E]`}>
                            {c.level}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <button className="p-2 rounded-full hover:bg-[#FDFBF7] border border-transparent hover:border-[#EBE6DF] transition-all text-[#8C867E] hover:text-[#1A1A1A]">
                            <ArrowUpRight className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredContributors.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-10 text-center text-[#8C867E]">
                          No contributors found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
