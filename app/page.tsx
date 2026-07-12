"use client";

import React from "react";
import { Nav } from "../components/landing/Nav";
import { Hero } from "../components/landing/Hero";
import { PerformanceStats } from "../components/landing/PerformanceStats";
import { Pipeline } from "../components/landing/Pipeline";
import { ResearchCapabilities } from "../components/landing/ResearchCapabilities";
import { Technology } from "../components/landing/Technology";
import { ReportPreview } from "../components/landing/ReportPreview";
import { ResearchSuite } from "../components/landing/ResearchSuite";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-base text-zinc-100 font-sans selection:bg-accent-violet/30">
      <Nav />
      <Hero />
      <PerformanceStats />
      <Pipeline />
      <ResearchCapabilities />
      <Technology />
      <ReportPreview />
      <ResearchSuite />
      <Footer />
    </main>
  );
}
