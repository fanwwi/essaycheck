"use client";

import { useState } from "react";
import { Sparkles, ShieldCheck, Zap, LockKeyhole } from "lucide-react";

import Header from "@/components/layout/Header";
import EssayEditor from "@/editor/EssayEditor";
import AnalysisResults from "@/analysis/AnalysisResults";
import AdvancedAnalysis from "@/analysis/AdvancedAnalysis";

import { analyzeEssay } from "@/lib/analyzer";

export default function Home() {
  const [essay, setEssay] = useState("");
  const [essayQuestion, setEssayQuestion] = useState("");
  const [essayType, setEssayType] = useState("college");
  const [result, setResult] = useState(null);

  function handleAnalyze() {
    if (!essay.trim()) return;

    setResult(analyzeEssay(essay, essayType, essayQuestion));
  }

  function handleReset() {
    setEssay("");
    setEssayQuestion("");
    setResult(null);
  }

  return (
    <main className="app-shell">
      <Header />

      <section className="hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          SMART ESSAY FEEDBACK
        </div>

        <h1>
          Your ideas deserve
          <br />
          <span>better writing.</span>
        </h1>

        <p className="hero-description">
          Analyze your essay, identify weak spots, and make every word count.
          Simple feedback, right in your browser.
        </p>

        <div className="hero-benefits">
          <span>
            <ShieldCheck size={16} />
            Private by design
          </span>

          <span>
            <Zap size={16} />
            Instant results
          </span>

          <span>
            <LockKeyhole size={16} />
            No account required
          </span>
        </div>
      </section>

      <section className="workspace">
        <EssayEditor
          essay={essay}
          setEssay={setEssay}
          essayQuestion={essayQuestion}
          setEssayQuestion={setEssayQuestion}
          essayType={essayType}
          setEssayType={setEssayType}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
          isAnalyzed={Boolean(result)}
        />

        <AnalysisResults result={result} essay={essay} />
      </section>

      <AdvancedAnalysis essay={essay} essayType={essayType} />

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="footer-brand-icon">
            <ShieldCheck size={17} />
          </span>

          <strong>
            essay<span>check</span>
          </strong>
        </div>

        <p>Built for better writing. Your essay stays in your browser.</p>

        <span className="footer-version">BETA · 2026</span>
      </footer>
    </main>
  );
}
