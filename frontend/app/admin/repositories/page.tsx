'use client';

import { useState, useEffect } from "react";
import { Plus, Trash2, Github, Loader2, CheckCircle2, Shield, Activity, Globe, Database } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Repository {
  id: string;
  owner: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminRepositoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRepo, setNewRepo] = useState({ owner: "", name: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push("/dashboard");
      return;
    }
    fetchRepos();
  }, [user, authLoading, router]);

  const fetchRepos = async () => {
    try {
      const token = document.cookie.split('skillfest_token=')[1]?.split(';')[0];
      const response = await fetch(getApiUrl("/api/admin/repositories"), {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRepos(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = document.cookie.split('skillfest_token=')[1]?.split(';')[0];
      const response = await fetch(getApiUrl("/api/admin/repositories"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newRepo),
      });
      if (response.ok) {
        setNewRepo({ owner: "", name: "" });
        fetchRepos();
      }
    } catch (error) {
      console.error("Failed to add repo:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRepo = async (id: string) => {
    if (!confirm("Are you sure you want to remove this node repository?")) return;
    try {
      const token = document.cookie.split('skillfest_token=')[1]?.split(';')[0];
      const response = await fetch(getApiUrl(`/api/admin/repositories/${id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchRepos();
      }
    } catch (error) {
      console.error("Failed to delete repo:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#041329] bg-tech-network">
        <Loader2 className="w-12 h-12 animate-spin text-[#00e5ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#041329] bg-tech-network py-20 px-4 sm:px-6 lg:px-8 text-[#d6e3ff]">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/20">
               <Shield className="w-5 h-5 text-[#00e5ff]" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00e5ff]">Admin Override</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight">Curation <span className="text-gradient">Nexus</span></h1>
          <p className="mt-3 text-[#bac9cc] text-lg font-light">Add or remove intelligence repositories from the platform collective.</p>
        </motion.div>

        {/* Add Repo Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[2rem] border-[#00e5ff]/10 p-8 shadow-[0_0_40px_rgba(0,229,255,0.05)]"
        >
          <h2 className="text-xl font-black mb-8 flex items-center gap-3">
             <div className="p-2 rounded-lg bg-[#00e5ff]/5">
               <Plus className="w-5 h-5 text-[#00e5ff]" />
             </div>
             Initialize New Node
          </h2>
          <form onSubmit={handleAddRepo} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[#bac9cc] uppercase tracking-widest mb-2 ml-1">Repository Owner</label>
              <input
                type="text"
                placeholder="e.g. facebook"
                required
                value={newRepo.owner}
                onChange={(e) => setNewRepo({ ...newRepo, owner: e.target.value })}
                className="w-full px-5 py-4 rounded-xl glass border-[#849396]/20 focus:border-[#00e5ff] focus:ring-4 focus:ring-[#00e5ff]/10 outline-none transition-all text-white font-tech"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[#bac9cc] uppercase tracking-widest mb-2 ml-1">Repository Name</label>
              <input
                type="text"
                placeholder="e.g. react"
                required
                value={newRepo.name}
                onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                className="w-full px-5 py-4 rounded-xl glass border-[#849396]/20 focus:border-[#00e5ff] focus:ring-4 focus:ring-[#00e5ff]/10 outline-none transition-all text-white font-tech"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#7c4dff] text-[#041329] font-black hover:opacity-90 transition-all shadow-[0_0_30px_rgba(0,229,255,0.2)] disabled:opacity-50 uppercase tracking-[0.2em]"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                Integrate Repository
              </button>
            </div>
          </form>
        </motion.div>

        {/* Repos List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-lg font-black flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#cdbdff]" />
                Active Intelligence Hubs
             </h3>
             <span className="text-[10px] font-black text-[#bac9cc] uppercase tracking-widest">{repos.length} NODES ONLINE</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {repos.length === 0 ? (
              <div className="p-20 glass rounded-[2.5rem] border-dashed border-[#849396]/20 text-center">
                <Github className="w-16 h-16 mx-auto mb-6 opacity-20 text-[#bac9cc]" />
                <p className="text-[#bac9cc] font-tech tracking-widest uppercase text-sm">Waiting for node integration...</p>
              </div>
            ) : (
              repos.map((repo, i) => (
                <motion.div 
                  key={repo.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-3xl p-6 flex items-center justify-between group border-[#849396]/10 hover:border-[#00e5ff]/30 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d1c32] to-[#1c2a41] flex items-center justify-center border border-[#849396]/20 group-hover:border-[#00e5ff]/40 transition-all">
                      <Github className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {repo.owner} / <span className="text-[#00e5ff]">{repo.name}</span>
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00e5ff]/5 text-[9px] font-black text-[#00e5ff] uppercase tracking-widest border border-[#00e5ff]/10">
                          <CheckCircle2 className="w-3 h-3" />
                          Authorized
                        </div>
                        <span className="text-[9px] text-[#bac9cc] font-mono opacity-50 uppercase">Linked: {new Date(repo.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRepo(repo.id)}
                    className="p-4 rounded-2xl text-[#ffb4ab]/60 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-all"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
