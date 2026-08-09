"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { InterviewTurn } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const init = async () => {
      setInitStatus("initializing");
      try {
        const res = await apiClient.startInterview(id, candidateId);
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
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[var(--color-background)]">
        <Loader2 className="w-8 h-8 text-[var(--color-foreground)] animate-spin mb-6" />
        <div className="text-xl font-bold font-heading tracking-widest text-[var(--color-foreground)] uppercase mb-4">
          ASSESSMENT COMPLETE
        </div>
        <div className="text-sm text-[var(--color-muted-foreground)] mt-2">
          Compiling your assessment report...
        </div>
      </div>
    );
  }

  if (initStatus === "initializing" || initStatus === "idle") {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[var(--color-background)]">
        <div className="text-sm uppercase tracking-[0.2em] font-bold text-[var(--color-muted-foreground)] animate-pulse">
          Initializing Engine
        </div>
      </div>
    );
  }

  if (error === "RATE_LIMITED") {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[var(--color-background)]">
        <div className="text-xl font-bold font-heading tracking-widest text-[var(--color-foreground)] uppercase mb-4">
          ENGINE BUSY
        </div>
        <div className="text-sm text-[var(--color-muted-foreground)] mb-8 max-w-md text-center leading-relaxed">
          The assessment engine is temporarily waiting for its reasoning provider. Please wait a few seconds and try again.
        </div>
        <button
          onClick={() => {
            setError(null);
            if (initStatus === "error") {
              initCalledRef.current = false;
              setInitStatus("idle");
            }
          }}
          className="px-8 py-3 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 rounded-xl text-xs font-bold tracking-[0.15em] uppercase transition-all shadow-xl shadow-black/10"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[var(--color-background)]">
        <div className="text-sm font-semibold text-red-500/80 max-w-md text-center mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
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
          className="px-8 py-3 bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 rounded-xl text-xs font-bold tracking-[0.15em] uppercase transition-all shadow-xl shadow-black/10"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col font-sans text-[var(--color-foreground)] selection:bg-[var(--color-muted)]">
      <header className="w-full max-w-4xl mx-auto px-6 pt-12 pb-6 flex items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <span className="font-black text-sm tracking-[0.2em] uppercase text-[var(--color-foreground)] font-heading">
            INTERVU
          </span>
          <span className="text-[var(--color-border)]">|</span>
          <span className="text-xs tracking-[0.1em] uppercase text-[var(--color-muted-foreground)] font-semibold">
            Technical Assessment
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted-foreground)]">Engine Connected</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTurn?.turn_id || 'init'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-6">
               <div className="bg-[var(--color-foreground)] text-[var(--color-background)] text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest uppercase">
                 Q {(currentTurn?.turn_number || 1).toString().padStart(2, '0')}
               </div>
               <div className="h-[1px] flex-1 bg-[var(--color-border)]"></div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold leading-snug text-[var(--color-foreground)]">
              {currentTurn?.question}
            </h1>
          </motion.div>
        </AnimatePresence>

        <div className="flex-1 flex flex-col relative mt-8 bg-white/40 backdrop-blur-3xl rounded-3xl border border-[var(--color-border)] p-6 shadow-sm overflow-hidden group focus-within:border-gray-300 focus-within:shadow-md transition-all duration-300">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--color-muted-foreground)] mb-4">
            Your Response
          </div>
          
          <div className="relative flex-1 min-h-[250px]">
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-20 rounded-2xl"
                >
                  <div className="h-16 w-16 relative flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-[var(--color-border)] rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[var(--color-foreground)] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <span className="mt-6 text-xs font-black tracking-[0.2em] uppercase text-[var(--color-foreground)] animate-pulse">
                    Evaluating & Adapting
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <textarea
              className="w-full h-full min-h-[250px] resize-none bg-transparent border-0 p-2 text-[var(--color-foreground)] text-lg leading-relaxed focus:ring-0 placeholder:text-gray-300 disabled:opacity-40 outline-none font-sans"
              placeholder="Type your detailed answer here... (Cmd+Enter to submit)"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              autoFocus
            />
          </div>

          <div className="mt-6 flex justify-between items-center border-t border-[var(--color-border)] pt-4">
            <span className="text-xs text-[var(--color-muted-foreground)] hidden sm:block">
              Markdown is supported. Be concise but thorough.
            </span>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !answerInput.trim()}
              className="px-8 py-3.5 bg-[var(--color-foreground)] hover:bg-black text-[var(--color-background)] rounded-xl text-xs font-bold tracking-[0.15em] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-black/10 active:scale-[0.98]"
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
