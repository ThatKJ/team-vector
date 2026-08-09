"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { InterviewTurn } from "@/lib/types";
import { Loader2, Zap, Brain, Target, ShieldAlert, AlertCircle } from "lucide-react";

export default function DemoSplitScreen() {
  const params = useParams();
  const candidateId = params.id as string;
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string>("");
  const [currentTurn, setCurrentTurn] = useState<InterviewTurn | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [initStatus, setInitStatus] = useState<"idle" | "initializing" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  // For telemetry animation
  const [flashKey, setFlashKey] = useState(0);
  const [prevStrategy, setPrevStrategy] = useState<string | null>(null);

  const initCalledRef = useRef(false);

  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;
    
    const init = async () => {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      setInitStatus("initializing");
      try {
        const res = await apiClient.startInterview(newSessionId, candidateId);
        setCurrentTurn(res.first_turn);
        setInitStatus("ready");
      } catch (err: any) {
        if (err.message && err.message.includes('rate limited') || err.code === 'LLM_RATE_LIMITED') {
          setError("RATE_LIMITED");
        } else {
          setError(err.message || "Unable to connect to the interview engine.");
        }
        setInitStatus("error");
      }
    };
    
    init();
  }, [candidateId]);

  // Flash effect on strategy change
  useEffect(() => {
    if (currentTurn?.telemetry?.decision?.strategy) {
      if (prevStrategy && prevStrategy !== currentTurn.telemetry.decision.strategy) {
        setFlashKey(prev => prev + 1);
      }
      setPrevStrategy(currentTurn.telemetry.decision.strategy);
    }
  }, [currentTurn]);

  const handleSubmit = async () => {
    if (!answerInput.trim() || !currentTurn || isProcessing) return;

    const userText = answerInput;
    setAnswerInput("");
    setIsProcessing(true);

    try {
      const res = await apiClient.submitAnswer(sessionId, {
        turn_id: currentTurn.turn_id,
        answer: userText,
      });

      if (res.is_complete) {
        setIsComplete(true);
        try {
          await apiClient.finalizeInterview(sessionId);
          router.push(`/report/${sessionId}`);
        } catch (finalizeErr: any) {
          setError("Failed to finalize assessment.");
          setIsComplete(false); // allow retry
        }
      } else if (res.next_turn) {
        setCurrentTurn(res.next_turn);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('rate limited') || err.code === 'LLM_RATE_LIMITED') {
        setError("RATE_LIMITED");
      } else {
        setError(err.message || "Unable to continue the interview.");
      }
    } finally {
      if (!isComplete) {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (initStatus === "initializing" || initStatus === "idle" || isComplete) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500 animate-pulse">
            {isComplete ? "FINALIZING INTELLIGENCE DOSSIER..." : "INITIALIZING SCENARIO..."}
          </div>
        </div>
      </div>
    );
  }

  const tel = currentTurn?.telemetry;

  return (
    <div className="flex h-screen w-full bg-[#FDFBF7] text-neutral-900 overflow-hidden">
      {/* LEFT: CANDIDATE VIEW */}
      <div className="w-1/2 flex flex-col bg-white text-neutral-900 border-r border-neutral-200 shadow-2xl z-10 relative">
        <header className="px-8 py-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="font-bold text-xs tracking-[0.2em] uppercase text-neutral-900">INTERVU</div>
          <div className="text-xs tracking-[0.1em] uppercase text-neutral-400">Candidate Experience</div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 flex flex-col relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
              <div className="text-xs font-bold tracking-widest text-emerald-600 uppercase animate-pulse">
                Evaluating Response & Adapting...
              </div>
            </div>
          )}

          <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-6">
            Question {(currentTurn?.turn_number || 1).toString().padStart(2, '0')}
          </div>
          <h1 className="text-2xl font-medium leading-[1.5] text-neutral-900 mb-12">
            {currentTurn?.question || "Loading..."}
          </h1>

          <div className="flex-1 flex flex-col">
             <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">Your Response</div>
             <textarea
                className="w-full flex-1 resize-none bg-neutral-50/50 border border-neutral-200 rounded-xl p-6 text-neutral-800 text-lg leading-relaxed focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-300"
                placeholder="Type your answer here..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                autoFocus
             />
             <div className="mt-6 flex justify-between items-center">
               <div className="text-xs text-neutral-400 font-mono">Press ⌘+Enter to submit</div>
               <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !answerInput.trim()}
                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold tracking-[0.1em] uppercase transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
               >
                  Submit
               </button>
             </div>
          </div>
        </main>
      </div>

      {/* RIGHT: INTELLIGENCE VIEW */}
      <div className="w-1/2 flex flex-col relative overflow-hidden bg-[#F5F2EB]">
        {/* Flash Overlay on Strategy Change */}
        <div key={flashKey} className="absolute inset-0 bg-emerald-500/10 z-0 animate-flash-overlay pointer-events-none opacity-0 mix-blend-multiply" />

        <header className="px-8 py-6 border-b border-neutral-200 flex items-center justify-between z-10 bg-[#F5F2EB]/80 backdrop-blur-md">
          <div className="font-bold text-xs tracking-[0.2em] uppercase text-emerald-600 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Intelligence Engine
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            LIVE TELEMETRY
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 z-10">
          <AnimatePresence mode="wait">
            {tel ? (
              <motion.div 
                key={currentTurn?.turn_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Decision Block */}
                <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-emerald-600" />
                      <h2 className="text-sm font-semibold tracking-widest uppercase text-neutral-900">Engine Decision</h2>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-mono rounded-full border border-emerald-200">
                      {tel.decision.strategy}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] tracking-widest uppercase text-neutral-500 mb-1">Target Competency</div>
                      <div className="text-sm font-medium text-neutral-900">{tel.decision.targetCompetency}</div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest uppercase text-neutral-500 mb-1">Rationale</div>
                      <div className="text-sm text-neutral-700 leading-relaxed italic border-l-2 border-emerald-500/50 pl-3">
                        "{tel.decision.rationale}"
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] tracking-widest uppercase text-neutral-500 mb-1">Why Now?</div>
                      <div className="text-sm text-neutral-700">{tel.decision.whyNow}</div>
                    </div>
                  </div>
                </section>

                {/* Expected Evidence */}
                <section>
                   <div className="flex items-center gap-2 mb-4">
                      <Target className="w-4 h-4 text-blue-500" />
                      <h2 className="text-[10px] font-semibold tracking-widest uppercase text-neutral-500">Expected Evidence</h2>
                   </div>
                   <div className="space-y-2">
                     {tel.decision.expectedEvidence?.map((ev, i) => (
                       <div key={i} className="bg-white border border-neutral-200 rounded-lg p-3 flex items-start gap-3 shadow-sm">
                         <div className="w-4 h-4 rounded-full border border-neutral-300 mt-0.5 flex-shrink-0" />
                         <span className="text-sm text-neutral-800 leading-snug">{ev}</span>
                       </div>
                     ))}
                   </div>
                </section>

                {/* Current Knowledge State Bars */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <h2 className="text-[10px] font-semibold tracking-widest uppercase text-neutral-500">Knowledge Graph State</h2>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(tel.knowledgeState.competencies || {}).map(([topic, state]: [string, any]) => (
                      <div key={topic} className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                           <span className="text-xs font-bold text-neutral-900">{topic}</span>
                           <span className="text-[10px] font-mono text-neutral-500">Conf: {Math.round(state.confidence * 100)}%</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500 w-16">Concept</span>
                            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${state.conceptualUnderstanding * 100}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500 w-16">Depth</span>
                            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${state.reasoningAbility * 100}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-wider text-neutral-500 w-16">Apply</span>
                            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${state.applicationAbility * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                 <AlertCircle className="w-8 h-8 mb-4 opacity-50 text-neutral-300" />
                 <p className="text-xs uppercase tracking-widest text-neutral-500">Waiting for telemetry...</p>
               </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
