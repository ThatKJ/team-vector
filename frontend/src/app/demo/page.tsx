"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, Zap, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

// We'll hardcode 3 specific candidate IDs from the seed data
const SCENARIOS = [
  {
    id: "01",
    title: "Strong Engineer",
    description: "Evaluates a candidate with deep systems knowledge and correct reasoning.",
    candidateId: "33333333-3333-3333-3333-333333333333", // Emily Chen
    icon: Zap,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "02",
    title: "Theory ≠ Practice",
    description: "Evaluates a candidate who knows definitions but struggles to apply them to real problems.",
    candidateId: "a0000000-0000-0000-0000-000000000010", // Gerald Combs
    icon: Brain,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "03",
    title: "Critical Misconception",
    description: "Evaluates a candidate with a fundamental misunderstanding of distributed state.",
    candidateId: "a0000000-0000-0000-0000-000000000017", // Tyler Brooks
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  }
];

export default function DemoLaunchScreen() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-neutral-900 selection:bg-emerald-500/30">
      {/* We use a specialized dark navbar for the demo screen */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-neutral-200">
        <div className="font-heading font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          INTERVU
        </div>
        <div className="text-xs font-mono text-neutral-500 tracking-widest uppercase">
          Hackathon Demo Environment
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl w-full z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl sm:text-7xl font-heading font-medium tracking-tight mb-6 text-neutral-900">
              INTERVU doesn't follow<br/>a question script.
            </h1>
            <p className="text-xl text-neutral-600 font-light max-w-2xl mx-auto">
              Select a scenario to watch the adaptive engine dynamically pivot its strategy based on the candidate's actual capability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCENARIOS.map((scenario, idx) => (
              <Link href={`/demo/${scenario.candidateId}`} key={scenario.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative bg-white border border-neutral-200 shadow-sm rounded-2xl p-8 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer overflow-hidden h-full flex flex-col"
                >
                  <div className={`w-12 h-12 rounded-xl ${scenario.bg} flex items-center justify-center mb-6`}>
                    <scenario.icon className={`w-6 h-6 ${scenario.color}`} />
                  </div>
                  
                  <div className="text-xs font-mono text-neutral-400 mb-3 uppercase tracking-widest">
                    Scenario {scenario.id}
                  </div>
                  
                  <h3 className="text-xl font-medium mb-3 group-hover:text-emerald-600 text-neutral-900 transition-colors">
                    {scenario.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-600 leading-relaxed mb-8 flex-1">
                    {scenario.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-medium text-neutral-500 group-hover:text-emerald-600 transition-colors mt-auto">
                    Launch Demo
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
