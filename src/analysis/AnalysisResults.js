"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileText,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Type,
  Target,
  AlertCircle,
} from "lucide-react";

import { getScoreLabel } from "@/lib/scoring";
import { humanizeText } from "@/lib/humanizer";
import { getAverageWordLength } from "@/lib/textUtils";

const criteriaLabels = {
  structure: "Structure",
  clarity: "Clarity",
  style: "Style & variety",
  development: "Idea development",
  mechanics: "Writing mechanics",
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "weak", label: "Weak spots" },
  { id: "style", label: "Style" },
  { id: "rewrite", label: "Quick rewrite" },
];

export default function AnalysisResults({ result, essay }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [rewrittenText, setRewrittenText] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    setRewrittenText("");
    setCopyStatus("");
    setActiveTab("overview");
  }, [essay, result]);

  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied to clipboard");
    } catch {
      setCopyStatus(
        "Could not copy automatically. Please select and copy the text.",
      );
    }
  }

  function handleRewrite() {
    if (!essay?.trim()) return;

    setRewrittenText(humanizeText(essay));
    setActiveTab("rewrite");
    setCopyStatus("");
  }

  if (!result) {
    return (
      <section className="results-card results-empty">
        <div className="empty-icon">
          <Sparkles size={24} />
        </div>

        <h2>Your results will appear here</h2>

        <p>Paste an essay and click Analyze essay to receive your feedback.</p>

        <div className="empty-features">
          <span>
            <CheckCircle2 size={15} />
            Writing feedback
          </span>

          <span>
            <CheckCircle2 size={15} />
            Weak phrase detection
          </span>

          <span>
            <CheckCircle2 size={15} />
            Prompt alignment analysis
          </span>
        </div>
      </section>
    );
  }

  const promptAnalysis = result.promptAnalysis;
  const criteria = result.criteria || {};
  const feedback = result.feedback || [];
  const foundPhrases = result.foundPhrases || [];
  const repeatedWords = result.repeatedWords || [];

  return (
    <section className="results-card">
      <div className="section-heading results-heading">
        <div>
          <div className="eyebrow">YOUR REPORT</div>
          <h2>Essay analysis</h2>
          <p>Review your results and decide what to improve.</p>
        </div>

        <span className="editor-icon">
          <FileText size={21} />
        </span>
      </div>

      <div className="score-overview">
        <div
          className="score-circle"
          style={{ "--score": `${result.score ?? 0}%` }}
        >
          <div className="score-circle-inner">
            <strong>{result.score ?? 0}</strong>
            <span>out of 100</span>
          </div>
        </div>

        <div className="score-description">
          <span className="score-label">
            {getScoreLabel(result.score ?? 0)}
          </span>

          <h3>Your writing snapshot</h3>

          <p>
            This score is based on structural and text-pattern checks, not an
            expert or AI judgment.
          </p>
        </div>
      </div>

      <div className="quick-stats">
        <div>
          <span>Words</span>
          <strong>{result.words ?? 0}</strong>
        </div>

        <div>
          <span>Sentences</span>
          <strong>{result.sentences ?? 0}</strong>
        </div>

        <div>
          <span>Paragraphs</span>
          <strong>{result.paragraphs ?? 0}</strong>
        </div>

        <div>
          <span>Avg. sentence</span>
          <strong>{result.averageSentenceLength ?? 0}</strong>
        </div>
      </div>

      {promptAnalysis && (
        <section className="prompt-analysis">
          <div className="prompt-analysis-heading">
            <span className="prompt-analysis-icon">
              <Target size={19} />
            </span>

            <div>
              <h3>Prompt alignment</h3>
              <p>How closely your essay matches the question</p>
            </div>

            <strong className="prompt-analysis-score">
              {promptAnalysis.score ?? 0}%
            </strong>
          </div>

          <div
            className="prompt-analysis-track"
            role="progressbar"
            aria-label="Prompt alignment score"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={promptAnalysis.score ?? 0}
          >
            <div
              className="prompt-analysis-fill"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, promptAnalysis.score ?? 0),
                )}%`,
              }}
            />
          </div>

          <h4>{promptAnalysis.label || "Prompt review"}</h4>

          <p className="prompt-analysis-description">
            {promptAnalysis.description ||
              "Review whether your essay addresses each part of the question."}
          </p>

          {promptAnalysis.checks?.length > 0 && (
            <div className="prompt-checks">
              {promptAnalysis.checks.map((check) => (
                <div className="prompt-check" key={check.label}>
                  {check.addressed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}

                  <span>{check.label}</span>

                  <span>{check.addressed ? "Detected" : "Review"}</span>
                </div>
              ))}
            </div>
          )}

          {promptAnalysis.matchedKeywords?.length > 0 && (
            <div className="prompt-keywords">
              <strong>Matched terms</strong>

              <div className="prompt-keyword-list">
                {promptAnalysis.matchedKeywords.map((word) => (
                  <span key={word} className="prompt-keyword matched">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {promptAnalysis.missingKeywords?.length > 0 && (
            <div className="prompt-keywords">
              <strong>Terms to review</strong>

              <div className="prompt-keyword-list">
                {promptAnalysis.missingKeywords.map((word) => (
                  <span key={word} className="prompt-keyword">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {promptAnalysis.suggestions?.length > 0 && (
            <div className="prompt-suggestions">
              <strong>Suggestions</strong>

              <ul>
                {promptAnalysis.suggestions.map((suggestion, index) => (
                  <li key={`${index}-${suggestion}`}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="muted-note">
            This score is based on keywords and simple writing patterns. It
            cannot reliably determine whether the essay fully answers the
            question.
          </p>
        </section>
      )}

      <div className="results-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={
              activeTab === tab.id ? "results-tab active" : "results-tab"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="results-content">
        {activeTab === "overview" && (
          <div className="tab-panel">
            <h3 className="panel-title">Writing criteria</h3>

            <div className="criteria-list">
              {Object.entries(criteria).map(([key, score]) => (
                <div className="criterion" key={key}>
                  <div className="criterion-heading">
                    <span>{criteriaLabels[key] || key}</span>
                    <strong>{score}/100</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.max(0, Math.min(100, score ?? 0))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <h3 className="panel-title feedback-title">
              <Lightbulb size={18} />
              Recommendations
            </h3>

            <div className="feedback-list">
              {feedback.length > 0 ? (
                feedback.map((item, index) => (
                  <article
                    className="feedback-item"
                    key={`${item.title}-${index}`}
                  >
                    <span className={`feedback-icon ${item.type}`}>
                      {item.type === "success" ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <AlertTriangle size={17} />
                      )}
                    </span>

                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="empty-message">
                  No recommendations are available for this analysis.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "weak" && (
          <div className="tab-panel">
            <h3 className="panel-title">Potentially generic phrases</h3>

            {foundPhrases.length === 0 ? (
              <p className="empty-message">
                No phrases from our current list were detected. This does not
                guarantee that the essay is free of clichés.
              </p>
            ) : (
              <div className="weak-phrase-list">
                {foundPhrases.map((item) => (
                  <article className="weak-phrase" key={item.phrase}>
                    <span className="phrase-highlight">{item.foundText}</span>
                    <p>{item.reason}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "style" && (
          <div className="tab-panel">
            <h3 className="panel-title">Style & repetition</h3>

            <div className="style-stat">
              <Type size={18} />

              <div>
                <span>Average word length</span>
                <strong>{getAverageWordLength(essay || "")} characters</strong>
              </div>
            </div>

            <h4 className="subheading">Repeated content words</h4>

            {repeatedWords.length === 0 ? (
              <p className="empty-message">
                No frequent content-word repetitions were detected.
              </p>
            ) : (
              <div className="repeated-word-list">
                {repeatedWords.map(({ word, count }) => (
                  <span className="word-chip" key={word}>
                    {word} <strong>×{count}</strong>
                  </span>
                ))}
              </div>
            )}

            <p className="muted-note">
              Repetition can be intentional. Review the context before changing
              your wording.
            </p>
          </div>
        )}

        {activeTab === "rewrite" && (
          <div className="tab-panel">
            <div className="rewrite-heading">
              <div>
                <h3 className="panel-title">Quick rewrite</h3>

                <p className="muted-note">
                  Simplifies selected phrases. It does not generate new ideas or
                  guarantee a more natural essay.
                </p>
              </div>

              <button
                type="button"
                className="button button-secondary button-small"
                onClick={handleRewrite}
                disabled={!essay?.trim()}
              >
                <RefreshCw size={14} />
                Simplify
              </button>
            </div>

            {!rewrittenText ? (
              <div className="rewrite-empty">
                <Sparkles size={23} />
                <p>Click Simplify to replace a few common wordy expressions.</p>
              </div>
            ) : (
              <>
                <textarea
                  className="rewrite-textarea"
                  value={rewrittenText}
                  onChange={(event) => {
                    setRewrittenText(event.target.value);
                    setCopyStatus("");
                  }}
                  aria-label="Simplified essay"
                />

                <button
                  type="button"
                  className="button button-primary copy-button"
                  onClick={() => handleCopy(rewrittenText)}
                >
                  <Copy size={15} />
                  Copy text
                </button>

                {copyStatus && (
                  <p className="muted-note" role="status">
                    {copyStatus}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
