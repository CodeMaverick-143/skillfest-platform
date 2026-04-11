'use client';

import { ScrollText, AlertTriangle, CheckCircle, XCircle, GitPullRequest, Award, Info } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function RulesPage() {
  const sections = [
    { id: "eligibility", label: "01", title: "Eligibility" },
    { id: "participation", label: "02", title: "Participation" },
    { id: "scoring", label: "03", title: "Scoring" },
    { id: "conduct", label: "04", title: "Conduct" },
    { id: "disqualification", label: "05", title: "Disqualification" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-mono selection:bg-[#1A1A1A]/10 selection:text-black scroll-smooth">
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-32 w-full">
        <div className="flex flex-col xl:flex-row gap-16 items-start relative">

          {/* Sticky Sidebar Navigation (xl and up) */}
          <aside className="hidden xl:block w-64 sticky top-32 h-fit space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black tracking-[0.2em] text-[#8C867E] uppercase px-4">Navigation</p>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-[#F5F2EA] active:scale-[0.98]"
                  >
                    <span className="text-[10px] font-black text-[#8C867E] group-hover:text-[#1A1A1A] transition-colors tracking-widest">{section.label}</span>
                    <span className="text-sm font-bold text-[#6B6661] group-hover:text-[#1A1A1A] transition-colors">{section.title}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Support Box */}
            <div className="p-6 rounded-2xl bg-[#F5F2EA] border border-[#EBE6DF] border-dashed space-y-3">
              <p className="text-[10px] font-black tracking-widest text-[#8C867E] uppercase">Need Help?</p>
              <p className="text-[11px] text-[#6B6661] leading-relaxed">Questions about the rules? Chat with our team in Discord or email us.</p>
              <a href="mailto:support@nstsdc.org" className="block text-xs font-black text-[#1A1A1A] hover:underline underline-offset-4">support@nstsdc.org</a>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 max-w-4xl space-y-16">
            {/* Header */}
            <div className="text-left xl:text-center space-y-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex p-4 rounded-2xl bg-[#F5F2EA] text-[#1A1A1A] mb-4 border border-[#EBE6DF] shadow-sm"
              >
                <ScrollText className="w-10 h-10 text-[#8C867E]" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black font-sans tracking-tight text-[#1A1A1A]">
                Rules & Guidelines
              </h1>
              <p className="text-[#6B6661] font-medium max-w-2xl mx-auto">
                Everything you need to know before you start contributing to SkillFest.
              </p>
            </div>

            {/* Section 01 — Eligibility */}
            <motion.div
              id="eligibility"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-6 scroll-mt-32"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#F5F2EA] border border-[#EBE6DF] flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[#8C867E]" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E] mb-1">Section 01</span>
                  <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight text-[#1A1A1A]">Eligibility</h2>
                </div>
              </div>
              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#EBE6DF]">
                  {[
                    { id: "1.1", text: "SkillFest 2026 is open to everyone. Anyone can participate, regardless of age, background, or experience level." },
                    { id: "1.2", text: "Participants must have a valid GitHub account to take part in the Developer Challenge track. The Fresher Track requires a separate application form." },
                    { id: "1.3", text: "There is no minimum experience requirement. Issues are tagged by difficulty to accommodate all skill levels from Newcomer to Expert." },
                    { id: "1.4", text: "Fresher Track and Developer Challenge are independent paths. Applying to the Fresher Track does not restrict you from also participating in the leaderboard challenge. However, selection criteria for each track are evaluated separately." },
                  ].map((rule) => (
                    <li key={rule.id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#F5F2EA] transition-colors">
                      <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">{rule.id}</span>
                      <p className="text-sm text-[#6B6661] leading-relaxed">{rule.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Info Callout */}
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#F5F2EA] border border-[#EBE6DF] shadow-sm">
                <div className="p-2 rounded-xl bg-[#FDFBF7] border border-[#EBE6DF] flex-shrink-0">
                  <Info className="w-4 h-4 text-[#8C867E]" />
                </div>
                <p className="text-xs text-[#6B6661] leading-relaxed">
                  Want to join the NST-SDC Developer Club? Apply through the Fresher Track. The Developer Challenge leaderboard is for recognizing contributors — club membership applications are only accepted via the Fresher Track form.{' '}
                  <Link href="/fresher-application" className="font-bold text-[#1A1A1A] hover:text-[#6B6661] transition-colors">Apply Now</Link>.
                </p>
              </div>

              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#EBE6DF]">
                  {[
                    { id: "1.5", text: "Participants may not use multiple GitHub accounts to earn points. Duplicate accounts will result in immediate disqualification of all associated entries." },
                    { id: "1.6", text: "Members of the NST-SDC core organizing committee are not eligible for leaderboard rankings or selection." },
                  ].map((rule) => (
                    <li key={rule.id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#F5F2EA] transition-colors">
                      <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">{rule.id}</span>
                      <p className="text-sm text-[#6B6661] leading-relaxed">{rule.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Section 02 — Participation Rules */}
            <motion.div
              id="participation"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-6 scroll-mt-32"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#F5F2EA] border border-[#EBE6DF] flex-shrink-0">
                  <GitPullRequest className="w-5 h-5 text-[#8C867E]" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E] mb-1">Section 02</span>
                  <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight text-[#1A1A1A]">Participation Rules</h2>
                </div>
              </div>
              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#EBE6DF]">
                  {[
                    { id: "2.1", text: "All contributions must be made to the repositories listed by NST-SDC for this event. Points are only awarded for activity that occurs within each repository's specific Start and End dates." },
                    { id: "2.2", text: "Before working on an issue, comment on it to claim it. This prevents duplicate effort. If an issue already has someone assigned or an open PR under review, do not open a competing PR for the same one. If no assignment is visible, the issue is fair game." },
                    { id: "2.3", text: "Fork the repository, make your changes on a separate branch, and submit a Pull Request referencing the issue number (e.g. Closes #42)." },
                    { id: "2.4", text: "Points are only awarded after a PR is reviewed and approved by an NST-SDC maintainer. Merged but unreviewed PRs do not count." },
                    { id: "2.5", text: "You may work on multiple issues simultaneously, but maintain quality. Low-effort PRs submitted in bulk may be penalized at maintainer discretion." },
                    { id: "2.6", text: "All PRs must be submitted before the event closes. Late submissions will not be evaluated." },
                  ].map((rule) => (
                    <li key={rule.id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#F5F2EA] transition-colors">
                      <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">{rule.id}</span>
                      <p className="text-sm text-[#6B6661] leading-relaxed">{rule.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Section 03 — Scoring System */}
            <motion.div
              id="scoring"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-6 scroll-mt-32"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#F5F2EA] border border-[#EBE6DF] flex-shrink-0">
                  <Award className="w-5 h-5 text-[#8C867E]" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E] mb-1">Section 03</span>
                  <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight text-[#1A1A1A]">Scoring System</h2>
                </div>
              </div>

              {/* Rule 3.1 — Points Table */}
              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <div className="flex items-start gap-4 px-6 py-5 border-b border-[#EBE6DF]">
                  <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">3.1</span>
                  <p className="text-sm text-[#6B6661] leading-relaxed">Points are calculated automatically from GitHub activity based on issue labels and direct contributions:</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F5F2EA] border-b border-[#EBE6DF]">
                        <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest">Type / Difficulty</th>
                        <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest">Points</th>
                        <th className="px-8 py-5 text-xs font-black text-[#8C867E] uppercase tracking-widest">Requirement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE6DF]">
                      <tr className="hover:bg-[#F5F2EA] transition-colors">
                        <td className="px-8 py-5">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E]">Hard PR</span>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-[#1A1A1A]">50 Pts</td>
                        <td className="px-8 py-5 text-sm text-[#6B6661]">Merged PR for issues tagged with &quot;hard&quot; label</td>
                      </tr>
                      <tr className="hover:bg-[#F5F2EA] transition-colors">
                        <td className="px-8 py-5">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E]">Medium PR</span>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-[#1A1A1A]">25 Pts</td>
                        <td className="px-8 py-5 text-sm text-[#6B6661]">Merged PR for issues tagged with &quot;medium&quot; label</td>
                      </tr>
                      <tr className="hover:bg-[#F5F2EA] transition-colors">
                        <td className="px-8 py-5">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E]">Standard PR</span>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-[#1A1A1A]">10 Pts</td>
                        <td className="px-8 py-5 text-sm text-[#6B6661]">Merged PR for base issues or untagged contributions</td>
                      </tr>
                      <tr className="hover:bg-[#F5F2EA] transition-colors">
                        <td className="px-8 py-5">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E]">Direct Commit</span>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-[#1A1A1A]">5 Pts</td>
                        <td className="px-8 py-5 text-sm text-[#6B6661]">Direct commits made to registered project repositories</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rule 3.2 — Levels */}
              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <div className="flex items-start gap-4 px-6 py-5 border-b border-[#EBE6DF]">
                  <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">3.2</span>
                  <p className="text-sm text-[#6B6661] leading-relaxed">Your total points determine your contributor level:</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#EBE6DF]">
                  {[
                    { level: "Expert", points: "500+" },
                    { level: "Advanced", points: "300+" },
                    { level: "Intermediate", points: "150+" },
                    { level: "Beginner", points: "50+" },
                    { level: "Newcomer", points: "0+" },
                  ].map((l) => (
                    <div key={l.level} className="p-6 text-center hover:bg-[#F5F2EA] transition-colors">
                      <p className="text-[10px] font-black text-[#8C867E] uppercase tracking-widest mb-1">{l.level}</p>
                      <p className="text-lg font-black text-[#1A1A1A]">{l.points}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules 3.3–3.4 */}
              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#EBE6DF]">
                  {[
                    { id: "3.3", text: "Maintainers may award manual bonus points for exceptional PR quality — clean code, thorough testing, or clear documentation. These adjustments are reflected in your profile instantly after evaluation." },
                    { id: "3.4", text: "In the event of a tie (equal points), the ranking is determined chronologically. The participant who reached the score earliest (first to contribute) will hold the higher rank." },
                  ].map((rule) => (
                    <li key={rule.id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#F5F2EA] transition-colors">
                      <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">{rule.id}</span>
                      <p className="text-sm text-[#6B6661] leading-relaxed">{rule.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Info Callout */}
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#F5F2EA] border border-[#EBE6DF] shadow-sm">
                <div className="p-2 rounded-xl bg-[#FDFBF7] border border-[#EBE6DF] flex-shrink-0">
                  <Info className="w-4 h-4 text-[#8C867E]" />
                </div>
                <p className="text-xs text-[#6B6661] leading-relaxed">
                  Points are updated on the leaderboard after each PR is merged. There may be a short delay between merge and score update. If your score hasn&apos;t updated within 24 hours, contact{' '}
                  <a href="mailto:support@nstsdc.org" className="font-bold text-[#1A1A1A] hover:text-[#6B6661] transition-colors">support@nstsdc.org</a>.
                </p>
              </div>
            </motion.div>

            {/* Section 04 — Code of Conduct */}
            <motion.div
              id="conduct"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-6 scroll-mt-32"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#F5F2EA] border border-[#EBE6DF] flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#8C867E]" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E] mb-1">Section 04</span>
                  <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight text-[#1A1A1A]">Code of Conduct</h2>
                </div>
              </div>
              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#EBE6DF]">
                  {[
                    { id: "4.1", text: "Be respectful to maintainers, reviewers, and fellow contributors. Harassment, hate speech, or hostile communication in any form — on GitHub or otherwise — will result in immediate disqualification." },
                    { id: "4.2", text: "Do not plagiarize. All submitted code must be your own. Copying solutions from other participants, Stack Overflow verbatim, or AI-generated code without understanding is prohibited." },
                    { id: "4.3", text: "Do not repeatedly ping maintainers on open PRs. Maintainers review submissions across multiple repositories — avoid tagging or messaging them multiple times for the same PR." },
                    { id: "4.4", text: "NST-SDC maintainer evaluations and organizer decisions are final after internal review." },
                  ].map((rule) => (
                    <li key={rule.id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#F5F2EA] transition-colors">
                      <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">{rule.id}</span>
                      <p className="text-sm text-[#6B6661] leading-relaxed">{rule.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Section 05 — Disqualification */}
            <motion.div
              id="disqualification"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="space-y-6 scroll-mt-32"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#F5F2EA] border border-[#EBE6DF] flex-shrink-0">
                  <XCircle className="w-5 h-5 text-[#8C867E]" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#EBE6DF] text-[#8C867E] mb-1">Section 05</span>
                  <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight text-[#1A1A1A]">Disqualification</h2>
                </div>
              </div>
              <div className="rounded-2xl border border-[#EBE6DF] bg-[#FDFBF7] shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#EBE6DF]">
                  {[
                    { id: "5.1", text: "First offense — submitting a spam, empty, or clearly invalid PR (whitespace-only changes, trivial edits with no value, or PRs unrelated to any issue) results in a formal warning. The PR will be closed without points." },
                    { id: "5.2", text: "Second offense — a second invalid or spam PR results in a temporary points freeze. No new points will be awarded until the contributor acknowledges the warning and the organizers lift the freeze." },
                    { id: "5.3", text: "Third offense or repeated abuse — a third violation results in permanent disqualification from SkillFest 2026. All previously earned points will be voided and the contributor will be removed from the leaderboard." },
                    { id: "5.4", text: "The following actions result in immediate disqualification without warning, skipping the escalation above: use of multiple GitHub accounts, plagiarism, artificially inflating scores, coordinating with others to game the leaderboard, or any form of deceptive contribution. The contributor will be permanently removed from the leaderboard." },
                    { id: "5.5", text: "Disqualified contributors will be notified via GitHub. Organizer decisions are final after internal review." },
                  ].map((rule) => (
                    <li key={rule.id} className="flex items-start gap-4 px-6 py-5 hover:bg-[#F5F2EA] transition-colors">
                      <span className="text-xs font-black text-[#8C867E] tracking-widest mt-0.5 flex-shrink-0">{rule.id}</span>
                      <p className="text-sm text-[#6B6661] leading-relaxed">{rule.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning Callout */}
              <div className="flex items-start gap-4 p-6 rounded-2xl bg-[#F5F2EA] border border-[#EBE6DF] shadow-sm">
                <div className="p-2 rounded-xl bg-[#FDFBF7] border border-[#EBE6DF] flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-[#8C867E]" />
                </div>
                <p className="text-xs text-[#6B6661] leading-relaxed">
                  NST-SDC reserves the right to modify, suspend, or terminate the event at any time. Any updates to these rules will be communicated via the official event page and{' '}
                  <a href="mailto:support@nstsdc.org" className="block mt-1 font-black text-[#1A1A1A] hover:text-[#6B6661] transition-colors">support@nstsdc.org</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
