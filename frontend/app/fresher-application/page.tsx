'use client';

import { Github, Send, Info, CheckCircle2, User, Mail, Link as LinkIcon, Briefcase, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function FresherApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in with GitHub before applying.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      portfolio_url: formData.get("portfolio_url"),
      experience_summary: formData.get("experience_summary"),
      statement: formData.get("statement"),
    };

    try {
      const response = await fetch('http://localhost:8080/api/fresher/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit application");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 bg-[#f6f8fa] border border-[#d0d7de] p-12 rounded-[3rem] shadow-xl"
        >
          <div className="w-24 h-24 bg-[#238636] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#238636]/20">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-[#1a1a1a]">Application Sent!</h1>
            <p className="text-[#8b949e] font-medium leading-relaxed">
              Thank you for applying to the SkillFest 2026 Fresher Developer Program. Our team will review your profile and get back to you via email within 5-7 business days.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-[#1a1a1a] text-white font-bold rounded-2xl hover:bg-[#238636] transition-all shadow-md active:scale-95"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-[#A371F7]/10 text-[#A371F7] mb-4">
              <Zap className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a]">Apply for Fresher Track</h1>
            <p className="text-[#8b949e] font-medium text-lg max-w-2xl mx-auto">
              Kickstart your career within the SkillFest ecosystem. Fill out the application below to join our mentorship program.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border border-[#d0d7de] p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#A371F7]" />
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup 
                  label="GitHub Profile URL" 
                  icon={<Github className="w-5 h-5" />} 
                  placeholder="https://github.com/username"
                  name="github_url"
                  required
                  defaultValue={user ? `https://github.com/${user.username}` : ""}
                />
                <InputGroup 
                  label="Experience Level" 
                  icon={<Briefcase className="w-5 h-5" />} 
                  placeholder="e.g., 0-1 years, Student"
                  name="experience_summary"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-[#1a1a1a] flex items-center gap-2 px-1">
                  <LinkIcon className="w-4 h-4 text-[#A371F7]" />
                  Portfolio Link(s)
                </label>
                <textarea 
                  name="portfolio_url"
                  className="w-full px-6 py-4 bg-[#f6f8fa] border border-[#d0d7de] rounded-2xl focus:ring-2 focus:ring-[#A371F7]/20 focus:border-[#A371F7] outline-none transition-all font-medium min-h-[120px]"
                  placeholder="Personal website, projects, Behance, etc."
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-[#1a1a1a] flex items-center gap-2 px-1">
                  <Info className="w-4 h-4 text-[#A371F7]" />
                  Why do you want to join SkillFest?
                </label>
                <textarea 
                  name="statement"
                  className="w-full px-6 py-4 bg-[#f6f8fa] border border-[#d0d7de] rounded-2xl focus:ring-2 focus:ring-[#A371F7]/20 focus:border-[#A371F7] outline-none transition-all font-medium min-h-[160px]"
                  placeholder="Tell us about your passion for open source and what you hope to achieve..."
                  required
                />
              </div>

              <div className="flex items-start gap-3 px-2">
                <input 
                  type="checkbox" 
                  id="rules" 
                  className="mt-1 w-5 h-5 rounded border-[#d0d7de] text-[#A371F7] focus:ring-[#A371F7]" 
                  required
                />
                <label htmlFor="rules" className="text-sm font-medium text-[#8b949e]">
                  I agree to the <Link href="/rules" className="text-[#A371F7] underline">event rules and terms</Link>. I confirm that the information provided is accurate and all profile links belong to me.
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-[#A371F7] hover:bg-[#8b5cf6] text-white font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 text-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Application"}
                <Send className="w-5 h-5 text-current" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function InputGroup({ label, icon, placeholder, name, required = false, defaultValue = "" }: any) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-[#1a1a1a] flex items-center gap-2 px-1">
        <span className="text-[#A371F7]">{icon}</span>
        {label}
      </label>
      <input 
        type="text" 
        name={name}
        defaultValue={defaultValue}
        className="w-full px-6 py-4 bg-[#f6f8fa] border border-[#d0d7de] rounded-2xl focus:ring-2 focus:ring-[#A371F7]/20 focus:border-[#A371F7] outline-none transition-all font-medium"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
