"use client";

import { LandingNavbar } from "./navbar";
import { Hero } from "./hero";
import { ScriptedSection } from "./scripted";
import { EngineSection } from "./engine";
import { IntelligenceSection } from "./intelligence";
import { ExperienceSection } from "./experience";
import { DifficultySection } from "./difficulty";
import { ReportSection } from "./report";
import { AudiencesSection } from "./audiences";
import { TrustSection } from "./trust";
import { DemoSection } from "./demo";
import { FinalCta } from "./final-cta";
import { LandingFooter } from "./footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-carbon text-pearl">
      <LandingNavbar />
      <main>
        <Hero />
        <ScriptedSection />
        <EngineSection />
        <IntelligenceSection />
        <ExperienceSection />
        <DifficultySection />
        <ReportSection />
        <AudiencesSection />
        <TrustSection />
        <DemoSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
