import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-heading text-5xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-7xl">
                Know how someone engineers.
              </h1>
              <p className="mt-8 text-lg leading-8 text-[var(--color-muted-foreground)]">
                Your cohort built the knowledge. <strong>INTERVU</strong> tests whether you can explain it.
                Adaptive technical interviews based on a candidate&apos;s actual 31-day AI Cohort learning journey.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/candidates">
                  <Button size="lg">Start assessment &rarr;</Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="ghost" size="lg">See how it works</Button>
                </Link>
              </div>
            </div>
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                 <div className="rounded-lg shadow-2xl ring-1 ring-gray-900/10 overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
                   <Image 
                     src="/images/intervu_home/screen.png" 
                     alt="Intervu Product Preview"
                     fill
                     className="object-cover object-top"
                     priority
                   />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-[var(--color-primary)] font-mono uppercase tracking-widest">Build the interviewer</h2>
              <p className="mt-2 font-heading text-3xl font-bold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
                The interview adapts to the candidate.
              </p>
              <p className="mt-6 text-lg leading-8 text-[var(--color-muted-foreground)]">
                Intervu evaluates candidates based on their learning journey, completed curriculum, previous responses, technical depth, and engineering reasoning. No scripted questions.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
