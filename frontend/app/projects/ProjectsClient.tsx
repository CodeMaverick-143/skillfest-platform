'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Search, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";

export default function ProjectsClient() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(getApiUrl("/api/challenges"))
      .then(res => res.json())
      .then(data => {
        setChallenges(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error fetching challenges:", err);
      })
      .finally(() => setLoading(false));
  }, []);
  
  const filtered = challenges.filter((c: any) => {
    const titleMatch = c.title?.toLowerCase().includes(search.toLowerCase());
    const repoMatch = c.repo?.toLowerCase().includes(search.toLowerCase());
    const labelMatch = c.labels?.some((l: string) => l.toLowerCase().includes(search.toLowerCase()));
    const textMatch = titleMatch || repoMatch || labelMatch;
    
    let diffMatch = true;
    if (filterDifficulty !== "All") {
      diffMatch = c.difficulty?.toLowerCase() === filterDifficulty.toLowerCase();
    }
    return textMatch && diffMatch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDifficulty]);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedChallenges = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-32 px-6 font-mono text-[#1A1A1A] selection:bg-[#1A1A1A]/10 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left space-y-6 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#F5F2EA] border border-[#EBE6DF] text-[#6B6661] text-[10px] font-bold tracking-widest uppercase shadow-sm">
            <span className="text-[#1A1A1A]">&gt;_</span> Challenges
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-8 font-sans">
            <span className="text-[#8C867E] font-normal">&gt;</span>Open Source Tasks <span className="animate-pulse font-normal">_</span>
          </h1>
          <p className="text-[#6B6661] font-sans text-base leading-[1.7] font-medium">
            Find an issue, submit a pull request, and earn your place on the leaderboard.
          </p>
        </motion.div>

        {/* Participation Rules */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 border-l border-[#1A1A1A] bg-[#F5F2EA] shadow-sm"
        >
          <h3 className="text-[#1A1A1A] font-bold mb-4 text-sm tracking-widest uppercase">Participation Rules</h3>
          <ul className="space-y-3 text-[13px] text-[#6B6661] font-sans">
            <li className="flex gap-3 leading-relaxed">
              <span className="text-[#1A1A1A] font-black mt-0.5">&gt;</span> 
              <span>Participants sign in using their GitHub account.</span>
            </li>
            <li className="flex gap-3 leading-relaxed">
              <span className="text-[#1A1A1A] font-black mt-0.5">&gt;</span> 
              <span>Find an issue across various repositories in the nst-sdc organization.</span>
            </li>
            <li className="flex gap-3 leading-relaxed">
              <span className="text-[#1A1A1A] font-black mt-0.5">&gt;</span> 
              <span>Submit PRs and wait for evaluation to earn points.</span>
            </li>
            <li className="flex gap-3 leading-relaxed">
              <span className="text-[#1A1A1A] font-black mt-0.5">&gt;</span> 
              <span>Top 15 performers on the leaderboard are selected for potential positions.</span>
            </li>
          </ul>
        </motion.div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C867E] w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-none bg-[#F5F2EA] border border-[#EBE6DF] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] outline-none transition-all text-sm text-[#1A1A1A] placeholder-[#8C867E] font-sans shadow-sm"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-4 py-2 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-colors border shadow-sm ${
                  filterDifficulty === diff 
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                    : 'bg-transparent text-[#6B6661] border-[#EBE6DF] hover:text-[#1A1A1A] hover:border-[#D6D0C4] hover:bg-[#F5F2EA]'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center place-content-center">
            <Loader className="w-8 h-8 text-[#1A1A1A] animate-spin mb-4" />
            <p className="text-[#8C867E] text-xs uppercase tracking-widest font-bold">Syncing active issues...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedChallenges.map((challenge: any, i: number) => (
              <motion.div 
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#FDFBF7] border border-[#EBE6DF] p-6 flex flex-col group relative hover:border-[#1A1A1A] hover:shadow-xl hover:shadow-black/5 transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="px-2.5 py-1 bg-[#F5F2EA] border border-[#EBE6DF] text-[9px] font-bold uppercase tracking-widest text-[#8C867E]">
                    {challenge.repo || "core"}
                  </div>
                  <div className="text-[10px] font-bold text-[#6B6661] uppercase tracking-widest flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-[#27c93f]`} />
                    OPEN
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#1A1A1A] leading-tight mb-4 font-sans line-clamp-3">
                  {challenge.title}
                </h3>

                <div className="mt-auto flex items-center justify-between pt-6 mt-6 border-t border-[#EBE6DF]">
                  <div className="text-[11px] uppercase tracking-widest font-bold text-[#8C867E] flex items-center gap-2">
                    <span>Level:</span> <span className="text-[#1A1A1A]">{challenge.difficulty} ({challenge.points} PTS)</span>
                  </div>
                  <a href={challenge.url} target="_blank" className="text-[#8C867E] group-hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-[#EBE6DF]/50">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 border border-[#EBE6DF] bg-transparent text-[#1A1A1A] font-bold text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-[#FDFBF7] transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#1A1A1A] disabled:cursor-not-allowed cursor-pointer"
            >
              Prev
            </button>
            <span className="text-[#8C867E] text-[10px] font-bold uppercase tracking-widest px-4">
              Page {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 border border-[#EBE6DF] bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-[#F5F2EA] border border-dashed border-[#D6D0C4]">
            <Search className="w-8 h-8 text-[#A39D96] mx-auto mb-4" />
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-2 uppercase tracking-widest">No tasks found</h3>
            <p className="text-[#8C867E] text-xs uppercase tracking-widest">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
