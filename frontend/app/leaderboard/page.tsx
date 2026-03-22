'use client';

import { Trophy, Search, Filter, ArrowUpRight, Star, Award, Medal } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const [filter, setFilter] = useState("All Levels");
  const [search, setSearch] = useState("");
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          // Map backend User model to frontend contributor format
          const mapped = data.map((u: any, i: number) => ({
            rank: i + 1,
            username: u.username,
            points: u.points,
            prs: 0, // Backend needs to provide PR count if possible, or we fetch separately
            level: u.level,
            avatar: u.username.substring(0, 2).toUpperCase()
          }));
          setContributors(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const levels = ["All Levels", "Expert", "Advanced", "Intermediate", "Beginner", "Newcomer"];

  const filteredContributors = contributors.filter(c => 
    (filter === "All Levels" || c.level === filter) &&
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex p-3 rounded-2xl bg-[#238636]/10 text-[#238636] mb-4"
            >
              <Trophy className="w-10 h-10" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a]">Global Leaderboard</h1>
            <p className="text-[#8b949e] font-medium max-w-2xl mx-auto">
              Celebrating the amazing developers contributing to SkillFest 2026. Top 15 performers earn exclusive physical schwag!
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white border border-[#d0d7de] p-6 rounded-[2rem] shadow-sm">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b949e] group-focus-within:text-[#238636] transition-colors" />
              <input 
                type="text" 
                placeholder="Search contributors..."
                className="w-full pl-12 pr-4 py-3 bg-[#f6f8fa] border border-[#d0d7de] rounded-xl focus:ring-2 focus:ring-[#238636]/20 focus:border-[#238636] outline-none transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 font-bold no-scrollbar">
              <Filter className="w-5 h-5 text-[#8b949e] mr-2 flex-shrink-0" />
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setFilter(l)}
                  className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all border ${
                    filter === l 
                      ? "bg-[#238636] text-white border-[#238636] shadow-md" 
                      : "bg-white text-[#8b949e] border-[#d0d7de] hover:border-[#238636] hover:text-[#238636]"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-[#d0d7de] rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f6f8fa] border-b border-[#d0d7de]">
                    <th className="px-8 py-6 text-xs font-black text-[#8b949e] uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-6 text-xs font-black text-[#8b949e] uppercase tracking-widest">Contributor</th>
                    <th className="px-8 py-6 text-xs font-black text-[#8b949e] uppercase tracking-widest">Points</th>
                    <th className="px-8 py-6 text-xs font-black text-[#8b949e] uppercase tracking-widest text-center">PRs</th>
                    <th className="px-8 py-6 text-xs font-black text-[#8b949e] uppercase tracking-widest">Level</th>
                    <th className="px-8 py-6 text-xs font-black text-[#8b949e] uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d0d7de]">
                  {filteredContributors.map((c) => (
                    <motion.tr 
                      key={c.username}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group hover:bg-[#f6f8fa]/50 transition-colors ${c.rank <= 15 ? 'bg-[#238636]/[0.02]' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {c.rank === 1 && <Medal className="w-6 h-6 text-yellow-500" />}
                          {c.rank === 2 && <Medal className="w-6 h-6 text-slate-400" />}
                          {c.rank === 3 && <Medal className="w-6 h-6 text-amber-600" />}
                          <span className={`text-lg font-black ${c.rank <= 3 ? 'text-[#1a1a1a]' : 'text-[#8b949e]'}`}>
                            #{c.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm transform group-hover:scale-110 transition-transform ${
                            c.rank === 1 ? 'bg-yellow-500' : 
                            c.rank === 2 ? 'bg-slate-400' : 
                            c.rank === 3 ? 'bg-amber-600' : 'bg-gradient-to-br from-[#238636] to-[#A371F7]'
                          }`}>
                            {c.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-[#1a1a1a] group-hover:text-[#238636] transition-colors">@{c.username}</p>
                            {c.rank <= 3 && <p className="text-[10px] font-black text-[#8b949e] uppercase tracking-tighter">🏆 Top Contributor</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xl font-black text-[#1a1a1a]">{c.points.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="px-3 py-1 rounded-lg bg-[#f6f8fa] border border-[#d0d7de] font-bold text-[#1a1a1a]">
                          {c.prs}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                          c.level === 'Expert' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          c.level === 'Advanced' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {c.level}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <button className="p-2 rounded-full hover:bg-white border border-transparent hover:border-[#d0d7de] shadow-none hover:shadow-sm transition-all text-[#8b949e] hover:text-[#238636]">
                          <ArrowUpRight className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
