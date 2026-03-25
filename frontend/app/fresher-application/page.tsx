'use client';

import { Github, Send, Info, CheckCircle2, User, Mail, Link as LinkIcon, Briefcase, Zap, ArrowRight, Loader } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/api";

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
      const response = await fetch(getApiUrl('/api/fresher/apply'), {
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
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7] px-4 font-mono">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-12 bg-white border border-[#EBE6DF] p-12 shadow-xl shadow-black/5"
        >
          <div className="w-20 h-20 bg-[#F5F2EA] border border-[#EBE6DF] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-[#1A1A1A]" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] font-sans">Application Sent!</h1>
            <p className="text-[#8C867E] text-[13px] leading-relaxed">
              Thank you for applying to the SkillFest 2026 Fresher Track. Our team will review your profile and get back to you via email within 5-7 business days.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-[#1A1A1A] text-white font-bold text-[11px] tracking-widest uppercase hover:bg-[#333] transition-all flex items-center justify-center gap-2"
          >
            Return to Home <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-32 px-6 font-mono text-[#1A1A1A] selection:bg-[#1A1A1A]/10 selection:text-black">
      <main className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-2xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#F5F2EA] border border-[#EBE6DF] text-[#6B6661] text-[10px] font-bold tracking-widest uppercase shadow-sm mx-auto">
            <span className="text-[#1A1A1A]">&gt;_</span> Recruitment
          </div>
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight text-[#1A1A1A] font-sans">
            <span className="text-[#8C867E] font-normal">&gt;</span>Fresher Track<span className="animate-pulse font-normal">_</span>
          </h1>
          <p className="text-[#6B6661] font-sans text-base leading-[1.7] font-medium mx-auto">
            Kickstart your career within the SkillFest ecosystem. Fill out the application below to join our mentorship program.
          </p>
        </motion.div>

        {/* Application Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl bg-white border border-[#EBE6DF] p-8 md:p-12 shadow-sm hover:border-[#D6D0C4] transition-colors"
        >
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Form Fields Section 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup 
                label="GitHub Profile URL" 
                icon={<Github className="w-3.5 h-3.5" />} 
                placeholder="https://github.com/username"
                name="github_url"
                required
                defaultValue={user ? `https://github.com/${user.username}` : ""}
              />
              <InputGroup 
                label="Experience Level" 
                icon={<Briefcase className="w-3.5 h-3.5" />} 
                placeholder="e.g., Student, 0-1 years"
                name="experience_summary"
                required
              />
            </div>

            {/* Form Fields Section 2 */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-[#1A1A1A] tracking-widest uppercase flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" />
                Portfolio Link(s)
              </label>
              <textarea 
                name="portfolio_url"
                className="w-full px-6 py-4 bg-[#F5F2EA]/30 border border-[#EBE6DF] focus:border-[#1A1A1A] outline-none transition-all text-[13px] leading-relaxed min-h-[120px]"
                placeholder="Personal website, projects, Behance, etc."
                required
              />
            </div>

            {/* Form Fields Section 3 */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-[#1A1A1A] tracking-widest uppercase flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Why SkillFest?
              </label>
              <textarea 
                name="statement"
                className="w-full px-6 py-4 bg-[#F5F2EA]/30 border border-[#EBE6DF] focus:border-[#1A1A1A] outline-none transition-all text-[13px] leading-relaxed min-h-[160px]"
                placeholder="Tell us about your passion for open source and what you hope to achieve..."
                required
              />
            </div>

            {/* Rules Check */}
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="rules" 
                className="mt-1 w-4 h-4 rounded-none border-[#EBE6DF] text-[#1A1A1A] focus:ring-[#1A1A1A]" 
                required
              />
              <label htmlFor="rules" className="text-[11px] font-medium text-[#8C867E] leading-relaxed uppercase tracking-wider">
                I agree to the <Link href="/rules" className="text-[#1A1A1A] underline font-bold">event rules and terms</Link> and confirm all info is accurate.
              </label>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase tracking-widest"
                >
                  &gt; ERROR: {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

function InputGroup({ label, icon, placeholder, name, required = false, defaultValue = "" }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[11px] font-bold text-[#1A1A1A] tracking-widest uppercase flex items-center gap-2">
        <span className="text-[#1A1A1A]">{icon}</span>
        {label}
      </label>
      <input 
        type="text" 
        name={name}
        defaultValue={defaultValue}
        className="w-full px-6 py-4 bg-[#F5F2EA]/30 border border-[#EBE6DF] focus:border-[#1A1A1A] outline-none transition-all text-[13px]"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
