'use client';

import { Settings, Eye, EyeOff, RefreshCcw, Save, ShieldAlert, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";

export default function AdminLeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    visible: true,
    lastUpdated: ""
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch(getApiUrl("/api/admin/leaderboard-settings"), {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          visible: data.visible,
          lastUpdated: data.lastUpdated || "Never"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/leaderboard-settings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible: settings.visible })
      });
      if (res.ok) {
        alert("Settings configured successfully.");
        fetchSettings();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(getApiUrl("/api/sync"), {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        alert("Telemetry sync process has been initiated successfully in the background.");
      } else {
        alert("Failed to initiate sync.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] p-8 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#1a1a1a]">System & Sync</h1>
          <p className="text-[#8b949e] font-medium">Control leaderboard visibility globally and trigger manual telemetric syncs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Synchronizer Card */}
          <div className="bg-white border border-[#d0d7de] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#238636]/5 rounded-bl-[100px] pointer-events-none" />
            <div className="w-12 h-12 bg-[#238636]/10 text-[#238636] flex items-center justify-center rounded-2xl mb-6 border border-[#238636]/20">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-[#1a1a1a] mb-2">Manual Telemetry Sync</h2>
            <p className="text-[#57606a] font-medium leading-relaxed mb-8 flex-1">
              Trigger the backend engine to fetch all pull requests for enrolled users and recalculate points instantly without waiting for the automated 30-minute chron job.
            </p>
            <button 
              onClick={handleManualSync} disabled={syncing}
              className="w-full py-4 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5" />
                  Trigger Sync Workflow
                </>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-[#8b949e] mt-4 uppercase tracking-widest flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Can take up to 60s
            </p>
          </div>

          {/* Visibility Controls */}
          <div className="bg-white border border-[#d0d7de] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8250df]/5 rounded-bl-[100px] pointer-events-none" />
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl mb-6 border ${settings.visible ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/20' : 'bg-[#cf222e]/10 text-[#cf222e] border-[#cf222e]/20'}`}>
              {settings.visible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-black text-[#1a1a1a] mb-2">Leaderboard Controls</h2>
            <p className="text-[#57606a] font-medium leading-relaxed mb-6">
              Globally freeze or unfreeze the public leaderboard UI. Often used before result announcements or to preserve ranking states during audit phases.
            </p>
            
            <div className="p-5 bg-[#f6f8fa] border border-[#d0d7de] rounded-2xl mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-[#1a1a1a] uppercase tracking-widest">Visibility</p>
                <p className="text-xs font-medium text-[#8b949e] mt-1">{settings.visible ? 'Public mode engaged' : 'Private mode engaged'}</p>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, visible: !settings.visible })}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${settings.visible ? 'bg-[#238636]' : 'bg-[#d0d7de]'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${settings.visible ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <button 
              onClick={handleSaveSettings} disabled={saving || loading}
              className="w-full mt-auto py-4 bg-[#1a1a1a] text-white hover:bg-[#333] font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? "Saving Configuration..." : (
                <>
                  <Save className="w-5 h-5" />
                  Save Configuration
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
