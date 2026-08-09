"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DemoLauncherPage() {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState("");

  const launchDemo = async (scenarioName: string, role: string) => {
    setIsLaunching(true);
    setLoadingScenario(scenarioName);
    try {
      // In demo mode, we just need a valid canonical candidate ID to anchor the session.
      // We will use one of the canonical candidate UUIDs depending on the demo,
      // but any canonical candidate works because the assessment engine adapts to the live answers.
      const candidateId = scenarioName.includes('WEAK') || scenarioName.includes('JUNIOR') ? 'a0000000-0000-0000-0000-000000000017' : '88888888-8888-8888-8888-888888888888';
      const sessionId = crypto.randomUUID();
      
      router.push(`/demo/${sessionId}?candidateId=${candidateId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to launch demo. Is the backend running?");
      setIsLaunching(false);
    }
  };

  const scenarios = [
    {
      id: "01",
      title: "STRONG ENGINEER",
      role: "Senior Systems Engineer",
      demonstrates: [
        "increasing depth",
        "application testing"
      ],
    },
    {
      id: "02",
      title: "MISCONCEPTION",
      role: "Mid-Level Developer",
      demonstrates: [
        "misconception detection",
        "remediation"
      ],
    },
    {
      id: "03",
      title: "THEORY ≠ PRACTICE",
      role: "Junior Developer",
      demonstrates: [
        "conceptual strength",
        "application weakness"
      ],
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-5xl w-full">
        
        <header className="mb-24 flex items-center gap-4">
          <span className="font-bold text-xs tracking-[0.2em] uppercase text-neutral-900">
            INTERVU
          </span>
          <span className="text-neutral-400">|</span>
          <span className="text-xs tracking-[0.1em] uppercase text-neutral-500">
            Control Room
          </span>
        </header>

        <div className="mb-20">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 mb-6 leading-tight">
            ADAPTIVE ASSESSMENT ENGINE
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl leading-relaxed">
            INTERVU doesn't follow a question script.<br/>
            It decides what to test next from the evidence in your answers.
          </p>
        </div>

        <div className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-8 border-b border-neutral-200 pb-4">
          Select Test Scenario
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => launchDemo(s.title, s.role)}
              disabled={isLaunching}
              className="group flex flex-col text-left bg-white border border-neutral-200 p-8 hover:border-neutral-900 transition-colors duration-300 disabled:opacity-50"
            >
              <div className="flex items-start justify-between w-full mb-12">
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-900">
                  {s.id}
                </div>
                {isLaunching && loadingScenario === s.title ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                ) : (
                  <span className="text-neutral-300 group-hover:text-neutral-900 transition-colors transform group-hover:translate-x-1 duration-300">
                    →
                  </span>
                )}
              </div>

              <div className="mb-10">
                <h2 className="text-[13px] font-bold tracking-widest uppercase text-neutral-900 mb-2">
                  {s.title}
                </h2>
                <div className="text-xs text-neutral-500 uppercase tracking-widest">
                  {s.role}
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-neutral-100">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">
                  Demonstrate
                </div>
                <ul className="space-y-3">
                  {s.demonstrates.map((point, i) => (
                    <li key={i} className="text-xs text-neutral-600 flex items-start gap-3 uppercase tracking-wider">
                      <span className="text-emerald-500 mt-[-1px]">→</span> {point}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
