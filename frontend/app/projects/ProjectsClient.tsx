'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Search, Loader, GitBranch, Binary, Star } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";

type RepositoryStats = {
  id: string;
  owner: string;
  name: string;
  url: string;
  org_name: string;
  description: string;
  stars_count: number;
  contribution_count: number;
  total_points: number;
};

export default function ProjectsClient() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [repositories, setRepositories] = useState<RepositoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(getApiUrl("/api/participating-repositories"))
      .then(res => res.json())
      .then(data => {
        setRepositories(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error fetching repositories:", err);
      })
      .finally(() => setLoading(false));
  }, []);
  
  const filtered = repositories.filter((repo) => {
    const nameMatch = repo.name?.toLowerCase().includes(search.toLowerCase());
    const orgMatch = repo.org_name?.toLowerCase().includes(search.toLowerCase());
    const descMatch = repo.description?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || orgMatch || descMatch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRepos = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
            <span className="text-[#1A1A1A]">&gt;_</span> Ecosystem
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] mb-8 font-sans">
            <span className="text-[#8C867E] font-normal">&gt;</span>Participating Repositories <span className="animate-pulse font-normal">_</span>
          </h1>
          <p className="text-[#6B6661] font-sans text-base leading-[1.7] font-medium">
            Explore active open-source projects where your contributions drive real impact.
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
              <span>Contributions across these featured repositories earn points for the leaderboard.</span>
            </li>
            <li className="flex gap-3 leading-relaxed">
              <span className="text-[#1A1A1A] font-black mt-0.5">&gt;</span> 
              <span>Valid contributions include merged Pull Requests and verified Commits during the event.</span>
            </li>
            <li className="flex gap-3 leading-relaxed">
              <span className="text-[#1A1A1A] font-black mt-0.5">&gt;</span> 
              <span>Top performers are evaluated for exclusive positions and rewards.</span>
            </li>
          </ul>
        </motion.div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C867E] w-4 h-4" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-none bg-[#F5F2EA] border border-[#EBE6DF] focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] outline-none transition-all text-sm text-[#1A1A1A] placeholder-[#8C867E] font-sans shadow-sm"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center place-content-center">
            <Loader className="w-8 h-8 text-[#1A1A1A] animate-spin mb-4" />
            <p className="text-[#8C867E] text-xs uppercase tracking-widest font-bold">Syncing participating projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRepos.map((repo, i: number) => (
              <motion.div 
                key={repo.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#FDFBF7] border border-[#EBE6DF] p-8 flex flex-col group relative hover:border-[#1A1A1A] hover:shadow-2xl hover:shadow-black/5 transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#8C867E] uppercase tracking-widest">{repo.org_name || repo.owner}</span>
                    <h3 className="text-xl font-bold text-[#1A1A1A] leading-tight font-sans group-hover:text-[#333]">
                      {repo.name}
                    </h3>
                  </div>
                  <div className="text-[10px] font-bold text-[#6B6661] uppercase tracking-widest flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5)]`} />
                    ACTIVE
                  </div>
                </div>

                <p className="text-[#6B6661] text-sm leading-relaxed mb-10 line-clamp-4 font-sans font-medium">
                  {repo.description || "No description available for this participating repository."}
                </p>

                <div className="mt-auto pt-6 border-t border-[#EBE6DF] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#1A1A1A]">
                    <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="text-sm font-bold font-mono">{repo.stars_count || 0}</span>
                    <span className="text-[10px] text-[#8C867E] uppercase tracking-widest font-bold ml-1">Stars</span>
                  </div>
                  
                  <a 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#333] transition-all shadow-lg shadow-black/5"
                  >
                    Repo Link
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
          <div className="text-center py-24 bg-[#F5F2EA] border border-dashed border-[#D6D0C4] rounded-2xl">
            <Search className="w-10 h-10 text-[#A39D96] mx-auto mb-6 opacity-50" />
            <h3 className="text-base font-bold text-[#1A1A1A] mb-2 uppercase tracking-widest">No repositories found</h3>
            <p className="text-[#8C867E] text-xs uppercase tracking-widest">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
