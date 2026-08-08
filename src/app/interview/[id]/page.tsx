"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { InterviewTurn } from "@/lib/types";
import { AlertCircle } from "lucide-react";

interface ChatMessage {
  role: "interviewer" | "candidate";
  text: string;
}

export default function InterviewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [currentTurn, setCurrentTurn] = useState<InterviewTurn | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); 
  const [activeTab, setActiveTab] = useState<"chat" | "context" | "eval">("chat");
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    let mounted = true;
    const init = async () => {
      try {
        const res = await apiClient.startInterview(id);
        if (mounted) {
          setCurrentTurn(res.first_turn);
          setChat([{ role: "interviewer", text: res.first_turn.question }]);
          setProgress(1);
        }
      } catch (err: any) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Unable to continue the interview. Please retry.");
        }
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (activeTab === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, isProcessing, activeTab]);

  const handleSubmit = async () => {
    if (!answerInput.trim() || !currentTurn || isProcessing) return;

    const userText = answerInput;
    setAnswerInput("");
    setChat(prev => [...prev, { role: "candidate", text: userText }]);
    setIsProcessing(true);

    try {
      const res = await apiClient.submitAnswer(id, {
        turn_id: currentTurn.turn_id,
        answer: userText
      });

      if (res.is_complete) {
        router.push(`/report/${id}`);
      } else if (res.next_turn) {
        setCurrentTurn(res.next_turn);
        setProgress(prev => Math.min(prev + 1, 8));
        setChat(prev => [...prev, { role: "interviewer", text: res.next_turn!.question }]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to continue the interview. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Removed unused panel content for cleaner viewport

  return (
    <div className="flex flex-col h-[100dvh] min-h-[100dvh] bg-[var(--color-background)] font-sans overflow-hidden">
      
      {/* Centered Assessment Viewport */}
      <main className="flex-1 flex flex-col mx-auto w-full max-w-3xl bg-[var(--color-surface)] shadow-2xl relative overflow-hidden border-x border-[var(--color-border)]">
        
        {/* Sticky Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${isInitializing || !!error ? 'bg-[var(--color-muted-foreground)]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
            <span className="font-semibold text-[13px] tracking-widest uppercase text-[var(--color-foreground)]">Live Assessment</span>
          </div>
          <div className="font-mono text-[13px] text-[var(--color-muted-foreground)] tabular-nums uppercase tracking-widest">
            {isInitializing ? 'Initializing' : error ? 'System Error' : `Turn ${progress}/8`}
          </div>
        </header>

        {isInitializing ? (
          /* TRUE FULL-SCREEN INITIALIZATION STATE */
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FDFDFD] dark:bg-[#121212] fade-in">
            <div className="flex flex-col items-center justify-center max-w-md text-center space-y-6">
              <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-[var(--color-border)] opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--color-foreground)]">Connecting to Intervu</h2>
                <p className="text-sm text-[var(--color-muted-foreground)] opacity-90">Preparing your technical assessment. This should only take a moment.</p>
              </div>
            </div>
          </div>
        ) : error ? (
          /* TRUE FULL-SCREEN ERROR STATE */
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FDFDFD] dark:bg-[#121212] fade-in">
            <div className="flex flex-col items-center justify-center max-w-md text-center space-y-6">
              <div className="flex items-center justify-center w-16 h-16 mb-4 bg-red-500/10 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-500 opacity-90" />
              </div>
              <div className="space-y-2">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--color-foreground)]">Unable to Start Assessment</h2>
                <p className="text-sm text-[var(--color-muted-foreground)] opacity-90">{error}</p>
              </div>
              <Button variant="secondary" size="sm" className="mt-8 uppercase tracking-widest text-[11px] font-bold px-8 h-10" onClick={() => window.location.reload()}>Retry Connection</Button>
            </div>
          </div>
        ) : (
          /* READY / SUBMITTING CONVERSATION STATE */
          <>
            {/* Scrollable Conversation Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 scroll-smooth flex flex-col gap-8 bg-[#FDFDFD] dark:bg-[#121212]">
              
              {/* Assessment Context Header */}
              {currentTurn && (
                <div className="flex flex-col items-center justify-center my-6 space-y-2 opacity-80 fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Assessment Area</span>
                  <span className="text-sm font-medium text-[var(--color-foreground)] px-4 py-1.5 bg-[var(--color-muted)] rounded-full border border-[var(--color-border)]">
                    {currentTurn.topic === "Introduction" ? "Technical Screening" : "Adaptive Follow-up"}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-6 w-full">
                {chat.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'interviewer' ? 'items-start' : 'items-end'} fade-in-up w-full`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-2 px-1">
                      {msg.role === 'interviewer' ? 'INTERVU' : 'Candidate'}
                    </span>
                    {msg.role === 'interviewer' ? (
                      <div className="bg-white dark:bg-[#1E1E1E] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm max-w-[90%] text-[15px] leading-relaxed text-[var(--color-foreground)]">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="bg-[var(--color-primary)] text-white rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm max-w-[90%] text-[15px] leading-relaxed">
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex flex-col items-start fade-in-up w-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-2 px-1">
                      INTERVU
                    </span>
                    <div className="bg-white dark:bg-[#1E1E1E] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs font-medium text-[var(--color-muted-foreground)] ml-2">Evaluating response...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} className="h-4" />
              </div>
            </div>

            {/* Sticky Input Footer */}
            <div className="p-4 lg:p-6 bg-[var(--color-surface)] border-t border-[var(--color-border)] z-20">
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] bg-white dark:bg-[#1A1C1B] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent transition-all shadow-sm">
                <textarea
                  className="w-full min-h-[100px] max-h-[250px] resize-y p-5 pr-24 bg-transparent outline-none text-[15px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] disabled:opacity-50"
                  placeholder={isProcessing ? "Evaluating response..." : "Type your technical response..."}
                  value={answerInput}
                  onChange={e => setAnswerInput(e.target.value)}
                  disabled={isProcessing}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleSubmit();
                    }
                  }}
                />
                <div className="absolute bottom-4 right-4 flex items-center">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isProcessing || !answerInput.trim()}
                    className="rounded-xl px-6 h-10 shadow-sm"
                  >
                    Send <span className="ml-2">↑</span>
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 px-1">
                 <p className="text-[11px] text-[var(--color-muted-foreground)]">Your answers are evaluated based on technical depth and clarity.</p>
                 <p className="hidden sm:block text-[11px] text-[var(--color-muted-foreground)]">Press <kbd className="font-mono bg-[var(--color-muted)] border border-[var(--color-border)] px-1.5 py-0.5 rounded ml-1">Cmd + Enter</kbd></p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
