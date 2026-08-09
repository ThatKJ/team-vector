"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { InterviewTurn } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function InterviewPage() {
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
          ASSESSMENT COMPLETE
        </div>
        <div className="text-xs text-neutral-400 mt-2">
          Compiling your assessment...
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
          ASSESSMENT ENGINE BUSY
        </div>
        <div className="text-sm text-neutral-500 mb-8 max-w-md text-center leading-relaxed">
          INTERVU is temporarily waiting for its reasoning provider.
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-neutral-900 selection:bg-neutral-200">
      <header className="w-full max-w-4xl mx-auto px-8 pt-16 pb-8">
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

      <main className="flex-1 w-full max-w-4xl mx-auto px-8 pb-24 flex flex-col">
        <div className="mb-12 animate-in fade-in duration-700">
          <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-6">
            Question {(currentTurn?.turn_number || 1).toString().padStart(2, '0')}
          </div>
          <h1 className="text-2xl md:text-[32px] font-medium leading-[1.4] text-neutral-900">
            {currentTurn?.question}
          </h1>
        </div>

        <hr className="border-neutral-200 mb-12" />

        <div className="flex-1 flex flex-col relative">
          <div className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-6">
            Your Response
          </div>
          
          <div className="relative flex-1 min-h-[300px]">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAFAFA]/70 backdrop-blur-sm z-10 animate-in fade-in duration-300">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-4" />
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-600 animate-pulse">
                  INTERVU is evaluating your response...
                </span>
              </div>
            ) : null}
            
            <textarea
              className="w-full h-full min-h-[300px] resize-none bg-transparent border-0 p-0 text-neutral-800 text-lg leading-relaxed focus:ring-0 placeholder:text-neutral-300 disabled:opacity-50 outline-none"
              placeholder="Type your answer here..."
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              autoFocus
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !answerInput.trim()}
              className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold tracking-[0.15em] uppercase transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Submit Response
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
