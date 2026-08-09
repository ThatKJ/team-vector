"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { InterviewTurn } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function DemoInterviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const candidateId = searchParams.get("candidateId");
  const router = useRouter();

  const [currentTurn, setCurrentTurn] = useState<InterviewTurn | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [initStatus, setInitStatus] = useState<"idle" | "initializing" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  // Intelligence state tracking
  const [prevStrategy, setPrevStrategy] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [flashDetails, setFlashDetails] = useState({ 
    from: "", 
    to: "",
    target: "",
    dimension: "",
    uncertaintyDrop: "",
    evidence: [] as string[]
  });

  const initCalledRef = useRef(false);

  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;
    
    let cancelled = false;
    const init = async () => {
      setInitStatus("initializing");
      try {
        const res = await apiClient.startInterview(id, candidateId);
        if (cancelled) return;
        setCurrentTurn(res.first_turn);
        setInitStatus("ready");
      } catch (err: any) {
        if (cancelled) return;
        if (err.message && err.message.includes('rate limited') || err.code === 'LLM_RATE_LIMITED') {
          setError("RATE_LIMITED");
        } else {
          setError(err.message || "Unable to connect to the interview engine.");
        }
        setInitStatus("error");
      }
    };
    init();
    return () => { cancelled = true; };
  }, [id, candidateId]);

  // Flash money shot trigger
  useEffect(() => {
    const telemetry = currentTurn?.telemetry as any;
    const newStrategy = telemetry?.decision?.strategy;
    
    if (newStrategy && prevStrategy && newStrategy !== prevStrategy) {
      const uBefore = telemetry?.decision?.uncertaintyBefore || 1;
      const uAfter = telemetry?.decision?.uncertaintyAfter || 1;

      setFlashDetails({ 
        from: prevStrategy, 
        to: newStrategy,
        target: telemetry?.decision?.targetCompetency || "",
        dimension: telemetry?.decision?.targetDimension || "",
        uncertaintyDrop: `${(uBefore).toFixed(2)} → ${(uAfter).toFixed(2)}`,
        evidence: telemetry?.decision?.expectedEvidence || []
      });
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 2500); // Give it a bit more time to read
      setPrevStrategy(newStrategy);
      return () => clearTimeout(timer);
    } else if (newStrategy && !prevStrategy) {
      setPrevStrategy(newStrategy);
    }
  }, [currentTurn, prevStrategy]);

  const handleSubmit = async () => {
    if (!answerInput.trim() || !currentTurn || isProcessing) return;

    const userText = answerInput;
    setAnswerInput("");
    setIsProcessing(true);

    try {
      const res = await apiClient.submitAnswer(id, {
        turn_id: currentTurn.turn_id,
        answer: userText,
      });

      if (res.is_complete) {
        setIsComplete(true);
        setIsFinalizing(true);
        try {
          await apiClient.finalizeInterview(id);
          router.push(`/report/${id}`);
        } catch (finalizeErr: any) {
          if (finalizeErr.message && finalizeErr.message.includes('rate limited') || finalizeErr.code === 'LLM_RATE_LIMITED') {
             setError("RATE_LIMITED");
          } else {
             setError("Failed to finalize assessment.");
          }
          setIsFinalizing(false);
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

  if (isComplete) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 text-neutral-900 animate-spin mb-6" />
        <div className="text-xl font-medium tracking-widest text-neutral-900 uppercase mb-4">
          FINALIZING ASSESSMENT
        </div>
        <div className="text-xs text-neutral-400 mt-2">
          Generating deterministic report artifact...
        </div>
      </div>
    );
  }

  if (initStatus === "initializing" || initStatus === "idle") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAFAFA]">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 animate-pulse">
          Connecting to INTERVU
        </div>
      </div>
    );
  }

  if (error === "RATE_LIMITED") {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#FAFAFA]">
        <div className="text-xl font-medium tracking-widest text-neutral-900 uppercase mb-4">
          ENGINE RATE LIMITED
        </div>
        <div className="text-sm text-neutral-500 mb-8 max-w-md text-center leading-relaxed">
          The reasoning provider is temporarily throttled.
        </div>
        <button
          onClick={() => {
            setError(null);
            if (initStatus === "error") {
              initCalledRef.current = false;
              setInitStatus("idle");
            }
          }}
          className="px-6 py-3 border border-neutral-200 text-neutral-900 hover:bg-neutral-100 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#FAFAFA]">
        <div className="text-sm text-red-500 max-w-md text-center mb-6">
          {error}
        </div>
        <button
          onClick={() => {
            setError(null);
            if (initStatus === "error") {
              initCalledRef.current = false;
              setInitStatus("idle");
            }
          }}
          className="px-6 py-3 border border-neutral-200 text-neutral-900 hover:bg-neutral-100 text-[10px] font-bold tracking-[0.15em] uppercase transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Safe extract telemetry
  const telemetry = currentTurn?.telemetry;
  const decision = telemetry?.decision;
  const knowledgeState = telemetry?.knowledgeState;
  
  const targetComp = decision?.targetCompetency || "General Assessment";
  const compState = knowledgeState?.competencies?.[targetComp] || {};
  
  const scoreCorrectness = compState.correctness ?? 0;
  const scoreDepth = compState.depth ?? 0;
  const scoreApplication = compState.application ?? 0;
  const scoreUncertainty = knowledgeState?.uncertainty ?? 1;

  const renderBar = (label: string, val: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round(val * totalBlocks);
    const filledStr = "█".repeat(filledBlocks);
    const emptyStr = "░".repeat(Math.max(0, totalBlocks - filledBlocks));
    
    return (
      <div className="flex items-center justify-between font-mono text-[11px] mb-2">
        <span className="uppercase tracking-widest text-neutral-500 w-32">{label}</span>
        <div className="flex items-center gap-4 text-neutral-900">
          <span>{filledStr}{emptyStr}</span>
          <span className="w-8 text-right font-bold text-neutral-900">{val.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-[100dvh] bg-white font-sans text-neutral-900 overflow-hidden selection:bg-neutral-200">
      
      {/* LEFT PANEL: Live Interview (Candidate Mirror) */}
      <div className="w-1/2 h-full flex flex-col border-r border-neutral-200 bg-[#FAFAFA] relative">
        <header className="w-full px-8 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-bold text-xs tracking-[0.2em] uppercase text-neutral-900">
              INTERVU
            </span>
            <span className="text-neutral-400">|</span>
            <span className="text-xs tracking-[0.1em] uppercase text-neutral-500">
              Technical Assessment
            </span>
          </div>
          <hr className="border-neutral-200 mt-6" />
        </header>

        <main className="flex-1 w-full px-8 pb-12 flex flex-col overflow-y-auto">
          <div className="mb-10 animate-in fade-in duration-700">
            <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-6">
              Question {(currentTurn?.turn_number || 1).toString().padStart(2, '0')}
            </div>
            <h1 className="text-[22px] leading-relaxed font-medium text-neutral-900">
              {currentTurn?.question}
            </h1>
          </div>

          <hr className="border-neutral-200 mb-10" />

          <div className="flex-1 flex flex-col relative">
            <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-6">
              Your Response
            </div>
            
            <div className="relative flex-1 min-h-[250px]">
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAFAFA]/70 backdrop-blur-sm z-10 animate-in fade-in duration-300">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mb-4" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 animate-pulse">
                    INTERVU is evaluating your response...
                  </span>
                </div>
              ) : null}
              
              <textarea
                className="w-full h-full min-h-[250px] resize-none bg-transparent border-0 p-0 text-neutral-800 text-base leading-relaxed focus:ring-0 placeholder:text-neutral-300 disabled:opacity-50 outline-none"
                placeholder="Type your answer here..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !answerInput.trim()}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold tracking-[0.15em] uppercase transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Submit Response
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* RIGHT PANEL: Assessment Intelligence */}
      <div className="w-1/2 h-full bg-white flex flex-col overflow-y-auto relative">
        {showFlash && (
          <div className="absolute inset-0 z-50 bg-neutral-900 flex flex-col items-center justify-center text-white animate-flash-overlay pointer-events-none p-12 text-center">
            <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-emerald-400 mb-8 animate-pulse border border-emerald-900/50 bg-emerald-900/20 px-4 py-2">
              ADAPTATION DETECTED
            </div>
            <div className="flex items-center gap-6 text-2xl font-mono mb-12">
              <span className="opacity-50">{flashDetails.from}</span>
              <span className="text-emerald-500">→</span>
              <span className="font-bold">{flashDetails.to}</span>
            </div>
            
            <div className="w-full max-w-md bg-neutral-800/50 border border-neutral-700/50 p-6 text-left">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-neutral-500 mb-1">TARGET</div>
                  <div className="text-sm font-mono text-emerald-100">{flashDetails.target}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-neutral-500 mb-1">DIMENSION</div>
                  <div className="text-sm font-mono text-emerald-100">{flashDetails.dimension}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold tracking-widest uppercase text-neutral-500 mb-1">UNCERTAINTY</div>
                  <div className="text-sm font-mono text-emerald-100">{flashDetails.uncertaintyDrop}</div>
                </div>
              </div>
              
              <div>
                <div className="text-[9px] font-bold tracking-widest uppercase text-neutral-500 mb-2">EXPECTED EVIDENCE</div>
                <ul className="space-y-1">
                  {flashDetails.evidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-mono text-neutral-300">
                      <span className="text-emerald-500 mt-[2px]">•</span> {ev}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="p-12 max-w-2xl w-full mx-auto">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-12">
            Assessment Intelligence
          </div>

          {/* SECTION 1: Target */}
          <div className="mb-12">
            <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-3">
              CURRENT TARGET
            </div>
            <hr className="border-neutral-200 mb-4" />
            <div className="font-mono text-sm text-neutral-900">
              {targetComp}
            </div>
          </div>

          {/* SECTION 2: Decision */}
          <div className="mb-12">
            <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-3">
              ADAPTIVE DECISION
            </div>
            <hr className="border-neutral-200 mb-4" />
            <div className="inline-block bg-neutral-100 px-3 py-1.5 mb-6">
              <span className="font-mono text-xs font-bold text-neutral-900">
                {decision?.strategy || "INITIALIZING"}
              </span>
            </div>
            
            <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2">
              Why now?
            </div>
            <div className="text-[13px] text-neutral-700 leading-relaxed font-sans max-w-md">
              {decision?.rationale || "Establishing baseline capabilities."}
            </div>
          </div>

          {/* SECTION 3: Expected Evidence */}
          <div className="mb-12">
            <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-3">
              EXPECTED EVIDENCE
            </div>
            <hr className="border-neutral-200 mb-4" />
            <ul className="space-y-2">
              {(decision?.expectedEvidence || []).map((ev, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-emerald-500 text-xs">✓</span>
                  <span className="font-mono text-[11px] text-neutral-700 pt-[1px]">{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 4: Knowledge State */}
          <div className="mb-16">
            <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-3">
              KNOWLEDGE STATE
            </div>
            <hr className="border-neutral-200 mb-4" />
            <div className="p-6 bg-[#FAFAFA] border border-neutral-200">
              {renderBar("CORRECTNESS", scoreCorrectness)}
              {renderBar("DEPTH", scoreDepth)}
              {renderBar("APPLICATION", scoreApplication)}
              <div className="h-4" />
              {renderBar("UNCERTAINTY", scoreUncertainty)}
            </div>
          </div>

          {/* SECTION 5: Timeline */}
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 mb-3">
              ADAPTATION TIMELINE
            </div>
            <hr className="border-neutral-200 mb-4" />
            <div className="flex flex-col gap-3 font-mono text-[11px]">
              {(knowledgeState?.trajectory || []).map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-neutral-400 w-4">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <span className={step.turnId === currentTurn?.turn_id ? "font-bold text-neutral-900" : "text-neutral-500"}>
                    {step.strategy}
                  </span>
                  {step.turnId === currentTurn?.turn_id && (
                    <span className="text-emerald-500 font-bold uppercase text-[9px] tracking-widest">
                      ← CURRENT
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
