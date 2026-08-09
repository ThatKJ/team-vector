import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Intervu AI — An interview that thinks",
  description:
    "Adaptive technical interviews that understand your answers, challenge your reasoning, and continuously adjust to your level.",
};

export default function Home() {
  return <LandingPage />;
}
