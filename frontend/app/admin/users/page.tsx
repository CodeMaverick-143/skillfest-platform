'use client';

import { Users, Search, Edit2, ShieldCheck, Star, EyeOff, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Edit State
  const [editPoints, setEditPoints] = useState(0);
  const [editRank, setEditRank] = useState(0);
  const [editHidden, setEditHidden] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(getApiUrl("/api/leaderboard"));
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/update-user-rank"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: selectedUser.username,
          points: Number(editPoints),
          rank: Number(editRank),
          hidden: editHidden
        })
      });
      if (res.ok) {
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert("Failed to update user.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u: any) => 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f8fa] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#1a1a1a]">User Management</h1>
            <p className="text-[#8b949e] font-medium">Manage participants, update points, or toggle hidden status.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b949e]" />
            <input 
              type="text" 
              placeholder="Search username..."
              className="pl-12 pr-4 py-3 bg-white border border-[#d0d7de] rounded-xl focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da] outline-none transition-all font-medium w-full md:w-72 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white border border-[#d0d7de] rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f6f8fa]/50 text-xs font-black text-[#8b949e] uppercase tracking-widest border-b border-[#d0d7de]">
                  <th className="px-8 py-6">Contributor</th>
                  <th className="px-8 py-6">Points</th>
                  <th className="px-8 py-6">Level / Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de]">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center font-bold text-[#8b949e] animate-pulse">Loading users...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center font-bold text-[#8b949e]">No users matched your search.</td></tr>
                ) : filtered.map((u: any, i: number) => (
                  <tr key={i} className="group hover:bg-[#0969da]/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0969da] border border-[#d0d7de] flex items-center justify-center font-bold text-white overflow-hidden shadow-sm">
                          {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover"/> : u.username?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a1a] flex items-center gap-2">
                            {u.username}
                            {u.is_admin && <ShieldCheck className="w-4 h-4 text-[#0969da]" />}
                          </p>
                          <p className="text-xs text-[#8b949e] font-medium font-mono border bg-[#f6f8fa] px-1.5 py-0.5 rounded inline-block mt-1">ID: {u.id?.substring(0, 8) || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-black text-[#1a1a1a] text-lg">
                        <Star className="w-4 h-4 text-[#d2a8ff]" fill="currentColor" />
                        {u.points}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#ddf4ff] text-[#0969da] border border-[#54aeff]/40 rounded-full font-black text-[10px] tracking-widest uppercase">
                          {u.level}
                        </span>
                        {u.is_hidden && (
                          <span className="px-3 py-1 bg-[#ffebe9] text-[#cf222e] border border-[#ff8182]/40 rounded-full font-black text-[10px] tracking-widest uppercase flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => {
                          setSelectedUser(u);
                          setEditPoints(u.points);
                          setEditRank(u.rank || 0); // Note: Admin can manually set a rank override here if supported
                          setEditHidden(u.is_hidden || false);
                        }}
                        className="p-2.5 rounded-xl border border-[#d0d7de] bg-white hover:border-[#0969da] hover:text-[#0969da] transition-all shadow-sm active:scale-95"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-[#d0d7de]"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#0969da]" />
              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-[#1a1a1a]">Modify User</h2>
                  <p className="text-[#57606a] text-sm font-medium mt-1">Editing <span className="font-bold text-[#0969da]">@{selectedUser.username}</span></p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#1a1a1a]">Manual Points Override</label>
                    <input 
                      type="number"
                      value={editPoints}
                      onChange={(e) => setEditPoints(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-[#f6f8fa] border border-[#d0d7de] rounded-xl focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da] outline-none transition-all font-medium font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-black text-[#1a1a1a]">Manual Rank (0 = Auto)</label>
                    <input 
                      type="number"
                      value={editRank}
                      onChange={(e) => setEditRank(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-[#f6f8fa] border border-[#d0d7de] rounded-xl focus:ring-2 focus:ring-[#0969da]/20 focus:border-[#0969da] outline-none transition-all font-medium font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-[#fff8c5]/50 border border-[#d4a72c]/40 rounded-xl">
                    <input 
                      type="checkbox"
                      id="hiddenToggle"
                      checked={editHidden}
                      onChange={(e) => setEditHidden(e.target.checked)}
                      className="w-5 h-5 rounded border-[#d0d7de] text-[#cf222e] focus:ring-[#cf222e]"
                    />
                    <label htmlFor="hiddenToggle" className="text-sm font-bold text-[#9a6700] cursor-pointer">
                      Hide from global leaderboard
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    type="button" onClick={() => setSelectedUser(null)}
                    className="flex-1 py-3 px-4 bg-white border border-[#d0d7de] text-[#1a1a1a] font-bold rounded-xl hover:bg-[#f6f8fa] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={saving}
                    className="flex-1 py-3 px-4 bg-[#0969da] text-white font-bold rounded-xl hover:bg-[#0349b4] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
