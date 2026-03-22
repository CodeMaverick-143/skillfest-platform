'use client';

import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  ChevronRight, 
  Github, 
  MessageSquare,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/api";

export default function AdminApplicationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/applications'), {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/applications/${id}/status`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      if (response.ok) {
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesTab = activeTab === "All" || app.status === activeTab;
    const matchesSearch = app.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-black text-2xl animate-pulse">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#1a1a1a]">Admin – Fresher Applications</h1>
            <p className="text-[#8b949e] font-medium">Review and manage candidates for the 2026 Mentorship Program.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b949e] group-focus-within:text-[#238636] transition-colors" />
              <input 
                type="text" 
                placeholder="Search candidates..."
                className="pl-12 pr-4 py-3 bg-white border border-[#d0d7de] rounded-xl focus:ring-2 focus:ring-[#238636]/20 focus:border-[#238636] outline-none transition-all font-medium w-full md:w-72"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white border border-[#d0d7de] rounded-xl hover:bg-[#f6f8fa] transition-colors">
              <Filter className="w-5 h-5 text-[#1a1a1a]" />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Apps" value={applications.length} icon={<Users className="w-5 h-5" />} color="gray" />
          <StatCard label="Pending" value={applications.filter(a => a.status === 'Pending').length} icon={<Clock className="w-5 h-5" />} color="blue" />
          <StatCard label="Approved" value={applications.filter(a => a.status === 'Approved' || a.status === 'Accepted').length} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
          <StatCard label="Rejected" value={applications.filter(a => a.status === 'Rejected').length} icon={<XCircle className="w-5 h-5" />} color="red" />
        </div>

        {/* Main Content Card */}
        <div className="bg-white border border-[#d0d7de] rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          {/* Tabs */}
          <div className="px-8 pt-6 border-b border-[#d0d7de] flex items-center gap-8 font-black text-xs uppercase tracking-widest overflow-x-auto no-scrollbar">
            {["All", "Pending", "Approved", "Rejected"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 transition-all relative ${
                  activeTab === tab ? "text-[#238636]" : "text-[#8b949e] hover:text-[#1a1a1a]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#238636] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* List/Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f6f8fa]/50 text-xs font-black text-[#8b949e] uppercase tracking-widest border-b border-[#d0d7de]">
                  <th className="px-8 py-6">Candidate</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Experience</th>
                  <th className="px-8 py-6">Applied</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de]">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="group hover:bg-[#f6f8fa]/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center font-bold text-[#238636]">
                          {app.user?.avatar_url ? <img src={app.user.avatar_url} className="rounded-xl w-full h-full object-cover" /> : app.user?.username?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a1a]">{app.user?.username}</p>
                          <p className="text-xs text-[#8b949e] font-medium">{app.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-[#1a1a1a]">{app.experience_summary}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-[#8b949e]">{new Date(app.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-2.5 rounded-xl border border-[#d0d7de] bg-white hover:border-[#238636] hover:text-[#238636] transition-all shadow-sm active:scale-95"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApps.length === 0 && (
              <div className="py-32 text-center space-y-4">
                <div className="w-16 h-16 bg-[#f6f8fa] rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-[#d0d7de]" />
                </div>
                <p className="font-bold text-[#8b949e]">No applications found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-[#0d1117]/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#238636]" />
              
              <div className="p-10 space-y-10">
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#238636] to-[#A371F7] flex items-center justify-center text-white text-2xl font-black">
                       {selectedApp.user?.avatar_url ? <img src={selectedApp.user.avatar_url} className="rounded-[1.5rem] w-full h-full object-cover" /> : selectedApp.user?.username?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#1a1a1a]">{selectedApp.user?.username}</h2>
                      <div className="flex items-center gap-2 text-[#8b949e] font-medium text-sm">
                        <Github className="w-4 h-4" />
                        <span>@{selectedApp.user?.username}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={selectedApp.status} size="lg" />
                </div>

                <div className="space-y-8">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#f6f8fa] p-4 rounded-2xl border border-[#d0d7de] space-y-1">
                      <p className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">GitHub Profile</p>
                      <a href={`https://github.com/${selectedApp.user?.username}`} className="text-sm font-bold text-[#238636] flex items-center gap-1 hover:underline">
                        Visit Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="bg-[#f6f8fa] p-4 rounded-2xl border border-[#d0d7de] space-y-1">
                      <p className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">Portfolio</p>
                      <a href={selectedApp.portfolio_url} className="text-sm font-bold text-[#238636] flex items-center gap-1 hover:underline">
                        View Portfolio <LinkIcon className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Statement */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-[#1a1a1a] flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-[#8b949e]" />
                       Statement of Interest
                    </h4>
                    <div className="p-6 bg-[#f6f8fa] border border-[#d0d7de] rounded-3xl text-sm leading-relaxed text-[#57606a] font-medium italic">
                      "{selectedApp.statement}"
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')}
                    className="flex-1 py-4 px-6 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Approve
                  </button>
                  <button 
                     onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                    className="flex-1 py-4 px-6 bg-white border border-[#cf222e] text-[#cf222e] hover:bg-[#cf222e]/5 font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    gray: "bg-[#f6f8fa] text-[#1a1a1a] border-[#d0d7de]",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} space-y-2`}>
      <div className="flex items-center justify-between opacity-80">
        <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function StatusBadge({ status, size = "sm" }: { status: string, size?: "sm" | "lg" }) {
  const styles: any = {
    Pending: "bg-blue-100 text-blue-700 border-blue-200",
    Approved: "bg-green-100 text-green-700 border-green-200",
    Accepted: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`${size === 'lg' ? 'px-4 py-1.5 text-xs' : 'px-3 py-1 text-[10px]'} rounded-full font-black tracking-widest uppercase border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

function LinkIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
