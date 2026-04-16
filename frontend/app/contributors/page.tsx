'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CONTRIBUTORS from './contributors.json';
import ParticleText from '@/components/ParticleText';
import { 
  Github as GithubIcon, 
  ExternalLink as ExternalLinkIcon, 
  X as CloseIcon 
} from 'lucide-react';

interface Contributor {
  id: string;
  name: string;
  projects: string[];
  github: string;
}

const FLOATING_POSITIONS: React.CSSProperties[] = [
  { top: '15%', left: '15%' },
  { bottom: '20%', left: '25%' },
  { top: '25%', right: '15%' },
  { bottom: '25%', right: '25%' },
  { top: '45%', left: '5%' },
  { top: '55%', right: '8%' },
  { bottom: '10%', left: '45%' },
  { top: '10%', right: '40%' },
];


export default function ContributorsPage() {
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <main 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full relative bg-[#fdfbf7] selection:bg-black selection:text-white font-['Space_Grotesk']"
    >
      
      {/* Interactive Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0.02), transparent 40%)`
          }}
        />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-[100vh] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_0,transparent_100%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #000000 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Layer 1: The Particle Text (Interactive Layer) */}
        <div className="absolute inset-0 z-10">
          <ParticleText text="Top Contributors" />
        </div>

        {/* Layer 2: The Subtitle (Non-interactive overlay) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-40 md:mt-48 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-[#1A1A1A] tracking-tighter opacity-80 uppercase italic">
              In Open Source
            </h1>
          </motion.div>
        </div>

        <div className="absolute inset-0 z-30 pointer-events-none">
          {CONTRIBUTORS.map((contributor, index) => {
            const pos = FLOATING_POSITIONS[index % FLOATING_POSITIONS.length];
            const floatDuration = 5 + (index % 4);
            const yOffset = 15 + (index % 3) * 5;

            return (
              <motion.div
                key={contributor.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: [0, -yOffset, 0], x: [0, yOffset / 2, 0] }}
                transition={{
                  opacity: { duration: 1 },
                  scale: { duration: 1, type: 'spring' },
                  y: { duration: floatDuration, repeat: Infinity, ease: 'easeInOut' },
                  x: { duration: floatDuration + 1.5, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={pos}
                className="absolute pointer-events-auto"
              >
                <button
                  onClick={() => setSelectedContributor(contributor)}
                  className="relative group w-20 h-20 md:w-28 md:h-28 focus:outline-none"
                >
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="w-full h-full relative">
                    <img
                      src={`https://github.com/${contributor.github.split('/').pop()}.png`}
                      alt={contributor.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-2xl transition-all duration-300 group-hover:border-[#1A1A1A]"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent rounded-full transition-colors duration-300" />
                  </motion.div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {contributor.name}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* ─── Pop-up Modal ─── */}
      <AnimatePresence>
        {selectedContributor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContributor(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg bg-[#FDFBF7] rounded-[40px] p-10 shadow-2xl"
            >
              <button
                onClick={() => setSelectedContributor(null)}
                className="absolute top-8 right-8 w-12 h-12 bg-[#EBE6DF]/40 hover:bg-[#EBE6DF] rounded-full flex items-center justify-center transition-colors focus:outline-none z-20"
              >
                <CloseIcon className="w-5 h-5 text-[#1A1A1A]" />
              </button>

              <div className="relative z-10">
                <div className="inline-block relative mb-8">
                  <div className="absolute -inset-4 bg-[#F5F2EA] rounded-[32px] scale-100 transition-transform duration-500 ease-out" />
                  <img
                    src={`https://github.com/${selectedContributor.github.split('/').pop()}.png`}
                    alt={selectedContributor.name}
                    className="relative w-32 h-32 rounded-[32px] object-cover border-[8px] border-white shadow-2xl shadow-black/10"
                  />
                </div>

                <h3 className="text-4xl font-black text-[#1A1A1A] mb-3 tracking-tight">
                  {selectedContributor.name}
                </h3>

                <div className="flex flex-wrap gap-2 mb-10 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
                  {selectedContributor.projects.map((project) => (
                    <span
                      key={project}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#F5F2EA] text-[#6B6661] border border-[#EBE6DF]"
                    >
                      {project}
                    </span>
                  ))}
                </div>

                <div className="pt-8 border-t border-[#EBE6DF]">
                  <a
                    href={selectedContributor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#8C867E] hover:text-[#1A1A1A] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F5F2EA] flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-all">
                      <GithubIcon className="w-5 h-5" />
                    </div>
                    Visit GitHub Profile <ExternalLinkIcon className="w-4 h-4 ml-1 opacity-30 group-hover:opacity-100 transition-all" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


    </main>
  );
}
