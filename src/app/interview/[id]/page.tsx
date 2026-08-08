"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { QuestionBubble } from "@/components/intervu/QuestionBubble";
import { AnswerBubble } from "@/components/intervu/AnswerBubble";
import { TypingIndicator } from "@/components/intervu/TypingIndicator";
import { apiClient } from "@/lib/api-client";
import { InterviewTurn } from "@/lib/types";
import { Info, MessageSquare, LayoutDashboard, AlertCircle } from "lucide-react";

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

  const contextPanelContent = (
    <Card className="flex-1 border-none lg:border-solid lg:border-[var(--color-border)] shadow-none lg:shadow-sm">
      <CardContent className="pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-4">Session Context</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Candidate</p>
            <p className="font-medium text-sm">Alex Chen</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Focus Area</p>
            <p className="font-medium text-sm">Backend Systems</p>
          </div>
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted-foreground)] mb-2">Curriculum Scope</p>
            <ul className="text-sm space-y-2 text-[var(--color-foreground)]">
              <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[var(--color-primary)]"/> Vector Search</li>
              <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[var(--color-primary)]"/> System Design</li>
              <li className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[var(--color-primary)]"/> RAG Optimization</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const evalPanelContent = (
    <Card className="flex-1 border-none lg:border-solid lg:border-[var(--color-border)] shadow-none lg:shadow-sm">
      <CardContent className="pt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-4">Evaluation Context</h3>
        
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-medium text-[var(--color-foreground)]">Interview Progress</span>
            <span className="font-mono text-[var(--color-muted-foreground)]">{progress} / 8</span>
          </div>
          <Progress value={progress} max={8} />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Current Topic</p>
            <p className="font-medium text-sm text-[var(--color-primary)]">{currentTurn?.topic || "Processing..."}</p>
          </div>
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Active Competency</p>
            <p className="font-medium text-sm">System Design & Tradeoffs</p>
          </div>
          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted-foreground)] mb-1">State</p>
            <p className="font-mono text-xs text-amber-600 bg-amber-50 p-2 rounded">
              {isProcessing ? "Evaluating reasoning..." : "Awaiting response..."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--color-background)]">
      <Navbar />
      
      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
        <button onClick={() => setActiveTab("context")} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === "context" ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"}`}>
          <Info className="w-4 h-4" /> Context
        </button>
        <button onClick={() => setActiveTab("chat")} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === "chat" ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"}`}>
          <MessageSquare className="w-4 h-4" /> Interview
        </button>
        <button onClick={() => setActiveTab("eval")} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === "eval" ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"}`}>
          <LayoutDashboard className="w-4 h-4" /> Status
        </button>
      </div>

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 p-0 lg:p-6 lg:pb-8 max-w-[1920px] mx-auto w-full">
        
        {/* Left Column: Context */}
        <aside className={`${activeTab === "context" ? "flex" : "hidden"} lg:flex lg:col-span-3 flex-col gap-6 overflow-y-auto p-4 lg:p-0`}>
          {contextPanelContent}
        </aside>

        {/* Center Column: Conversation */}
        <section className={`${activeTab === "chat" ? "flex" : "hidden"} lg:flex col-span-1 lg:col-span-6 flex-col bg-[var(--color-surface)] lg:border lg:border-[var(--color-border)] lg:rounded-[24px] lg:shadow-sm overflow-hidden relative h-full max-h-full`}>
          
          <div className="hidden lg:flex px-6 py-4 border-b border-[var(--color-border)] justify-between items-center bg-[var(--color-surface)]/80 backdrop-blur z-10">
             <div className="flex items-center gap-3">
               <div className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
               <span className="font-semibold text-sm">Live Assessment</span>
             </div>
             <span className="font-mono text-xs text-[var(--color-muted-foreground)]">00:14:23</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth bg-[var(--color-surface)]">
            {isInitializing ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-muted-foreground)]">
                <div className="h-4 w-4 rounded-full bg-[var(--color-primary)] animate-ping mb-4" />
                <p className="text-sm font-medium animate-pulse">Connecting to INTERVU engine...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <>
                {chat.map((msg, idx) => (
                  msg.role === "interviewer" ? (
                    <QuestionBubble key={idx} text={msg.text} />
                  ) : (
                    <AnswerBubble key={idx} text={msg.text} />
                  )
                ))}
                {isProcessing && <TypingIndicator text="Evaluating reasoning..." />}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          <div className="p-3 lg:p-4 bg-[var(--color-background)] lg:border-t border-[var(--color-border)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)] lg:shadow-none">
            <div className="relative rounded-[16px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] transition-shadow">
              <textarea
                className="w-full min-h-[120px] lg:min-h-[100px] resize-none p-4 pr-24 bg-transparent outline-none text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]"
                placeholder="Type your response..."
                value={answerInput}
                onChange={e => setAnswerInput(e.target.value)}
                disabled={isInitializing || !!error}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit();
                  }
                }}
              />
              <div className="absolute bottom-3 right-3 flex gap-2 items-center">
                <Button size="sm" onClick={handleSubmit} disabled={isProcessing || !answerInput.trim() || isInitializing || !!error}>
                  Submit
                </Button>
              </div>
            </div>
            <p className="hidden lg:block text-[11px] text-center text-[var(--color-muted-foreground)] mt-3">Press <kbd className="font-mono bg-[#E5E5DF] text-[#1A1C1B] px-1.5 py-0.5 rounded shadow-sm">Cmd + Enter</kbd> to submit</p>
          </div>
        </section>

        {/* Right Column: Intelligence */}
        <aside className={`${activeTab === "eval" ? "flex" : "hidden"} lg:flex lg:col-span-3 flex-col gap-6 overflow-y-auto p-4 lg:p-0`}>
          {evalPanelContent}
        </aside>

      </main>
    </div>
  );
}
