'use client';

import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Search, Loader2, Code, Star, ExternalLink, ArrowUpRight, Trophy, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

interface Challenge {
  id: number;
  title: string;
  url: string;
  repo: string;
  difficulty: string;
  points: number;
  labels: string[];
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(getApiUrl("/api/challenges"));
      if (response.ok) {
        const data = await response.json();
        setChallenges(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttempt = async (repoName: string, issueNumber: number) => {
    if (!user) {
      alert("Please sign in to attempt challenges!");
      return;
    }

    try {
      const token = document.cookie.split('skillfest_token=')[1]?.split(';')[0];
      const response = await fetch(getApiUrl("/api/challenges/attempt"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          repo_name: repoName, 
          issue_number: issueNumber 
        }),
      });
      if (response.ok) {
        alert("Challenge synchronized to your neural link (dashboard)!");
      } else {
        alert("Sync error. Attempt already registered?");
      }
    } catch (error) {
      console.error("Failed to attempt challenge:", error);
    }
  };

  const filtered = challenges.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.repo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#041329] bg-tech-network">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00e5ff] mx-auto mb-4" />
          <p className="text-[#bac9cc] font-tech text-lg tracking-widest uppercase animate-pulse">Scanning Multiverse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#041329] bg-tech-network py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full glass border-[#00e5ff]/20 text-[#00e5ff] text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Available Intelligence Nodes
          </div>
          <h1 className="text-5xl font-black text-[#d6e3ff] tracking-tight sm:text-7xl">
            SkillFest <span className="text-gradient">Cortex</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-[#bac9cc] leading-relaxed">
            Interface with high-value open source issues. Extract knowledge, contribute code, and elevate your rank in the global collective.
          </p>
        </motion.div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00e5ff] w-5 h-5" />
            <input
              type="text"
              placeholder="Filter by technology or repository..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-2xl glass border-[#849396]/20 focus:border-[#00e5ff] focus:ring-4 focus:ring-[#00e5ff]/10 outline-none transition-all text-lg text-white font-tech placeholder-[#bac9cc]/30"
            />
          </div>
          <div className="flex gap-6">
             <div className="px-8 py-4 glass rounded-[2rem] border-[#849396]/20 text-center glass-glow">
               <div className="text-[10px] text-[#bac9cc] font-bold uppercase tracking-[0.2em] mb-1">Active Nodes</div>
               <div className="text-3xl font-black text-[#00e5ff]">{challenges.length}</div>
             </div>
             <div className="px-8 py-4 glass rounded-[2rem] border-[#849396]/20 text-center">
               <div className="text-[10px] text-[#bac9cc] font-bold uppercase tracking-[0.2em] mb-1">Total Repos</div>
               <div className="text-3xl font-black text-[#cdbdff]">{new Set(challenges.map(c => c.repo)).size}</div>
             </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((challenge, i) => (
            <motion.div 
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-[2.5rem] border-[#849396]/10 overflow-hidden hover:border-[#00e5ff]/40 transition-all group flex flex-col relative"
            >
              <div className="absolute top-0 right-0 p-8">
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    challenge.difficulty === 'hard' ? 'bg-[#ffb4ab]/10 text-[#ffb4ab]' :
                    challenge.difficulty === 'medium' ? 'bg-[#ffcc00]/10 text-[#ffcc00]' :
                    'bg-[#00e5ff]/10 text-[#00e5ff]'
                  }`}>
                    {challenge.difficulty}
                  </div>
              </div>

              <div className="p-10 flex-1 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#00e5ff]/5 border border-[#00e5ff]/20">
                    <Code className="w-5 h-5 text-[#00e5ff]" />
                  </div>
                  <span className="text-xs font-bold text-[#bac9cc] uppercase tracking-[0.1em]">{challenge.repo}</span>
                </div>

                <h3 className="text-2xl font-bold text-[#d6e3ff] leading-[1.3] group-hover:text-gradient transition-all">
                  {challenge.title}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {challenge.labels.map(label => (
                    <span key={label} className="text-[9px] font-black px-3 py-1.5 rounded-lg bg-[#112036] text-[#bac9cc] border border-[#849396]/10 uppercase tracking-wider">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-10 py-8 bg-[#0d1c32]/50 border-t border-[#849396]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#ffcc00] fill-[#ffcc00]/20" />
                  <span className="text-2xl font-black text-white">{challenge.points} <span className="text-[10px] text-[#bac9cc] uppercase tracking-widest">EXP</span></span>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={challenge.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl glass border-[#849396]/20 hover:bg-[#1c2a41] transition-colors text-[#bac9cc]"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={() => handleAttempt(challenge.repo, challenge.id)}
                    className="flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] text-[#041329] font-black hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-wider"
                  >
                    <Target className="w-5 h-5" />
                    Attempt
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 glass rounded-[3rem] border-2 border-dashed border-[#849396]/20">
            <Search className="w-20 h-20 text-[#849396]/20 mx-auto mb-8" />
            <h3 className="text-3xl font-black text-[#d6e3ff]">No Nodes Found</h3>
            <p className="text-[#bac9cc] mt-3 text-lg">Adjust your neuro-filters and scan again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
