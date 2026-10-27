"use client";

import { useMemo, useState } from "react";
import { Copy, FileText, Sparkles, ScanText, ShieldAlert } from "lucide-react";

import { analyzeSentences } from "@/lib/sentenceAnalysis";
import { detectAIStyle } from "@/lib/aiDetector";
import { buildFeedbackPrompt } from "@/lib/feedbackPrompt";
import { humanizeText } from "@/lib/humanizer";

const issueColors = {
  generic: "issue-generic",
  long: "issue-long",
  grammar: "issue-grammar",
  style: "issue-style",
  wordy: "issue-wordy",
};

const tabs = [
  { id: "feedback", label: "Written feedback" },
  { id: "sentences", label: "Sentence review" },
  { id: "prompt", label: "Prompt" },
  { id: "humanizer", label: "Humanizer" },
  { id: "detector", label: "AI detector" },
];

export default function AdvancedAnalysis({ essay, essayType }) {
  const [activeTab, setActiveTab] = useState("feedback");
  const [humanizedText, setHumanizedText] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const sentenceIssues = useMemo(() => analyzeSentences(essay), [essay]);

  const detector = useMemo(() => detectAIStyle(essay), [essay]);

  const prompt = useMemo(
    () => buildFeedbackPrompt(essay, essayType),
    [essay, essayType],
  );

  const writtenFeedback = useMemo(
    () => createWrittenFeedback(essay, sentenceIssues),
    [essay, sentenceIssues],
  );

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied to clipboard");
    } catch {
      setCopyMessage(
        "Clipboard unavailable. Select and copy the text manually.",
      );
    }

    window.setTimeout(() => setCopyMessage(""), 2500);
  }

  function runHumanizer() {
    setHumanizedText(humanizeText(essay));
  }

  const highlightedSentences = useMemo(() => {
    const flagged = new Map(sentenceIssues.map((item) => [item.text, item]));

    const parts = essay.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    return parts.map((text, index) => ({
      id: index,
      text,
      issue: flagged.get(text.trim()) || null,
    }));
  }, [essay, sentenceIssues]);

  if (!essay.trim()) {
    return (
      <section className="advanced-card">
        <div className="advanced-empty">
          <ScanText size={25} />
          <h2>Deep essay review</h2>
          <p>
            Add an essay above to review individual sentences, read written
            feedback, inspect the prompt, and use the style tools.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="advanced-card">
      <div className="advanced-heading">
        <div>
          <div className="eyebrow">DEEP REVIEW</div>
          <h2>Improve your essay</h2>
          <p>
            Detailed feedback, sentence-level suggestions, and writing tools.
          </p>
        </div>
        <span className="editor-icon">
          <Sparkles size={21} />
        </span>
      </div>

      <div className="advanced-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={
              activeTab === tab.id ? "advanced-tab active" : "advanced-tab"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="advanced-content">
        {activeTab === "feedback" && (
          <div>
            <h3>Written feedback</h3>
            <p className="advanced-intro">
              A rule-based review of the text, not a generative AI critique.
            </p>

            <div className="written-feedback">
              <article>
                <h4>Overview</h4>
                <p>{writtenFeedback.overview}</p>
              </article>

              <article>
                <h4>What to improve</h4>
                {writtenFeedback.problems.length ? (
                  <ul>
                    {writtenFeedback.problems.map((problem) => (
                      <li key={problem}>{problem}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No major issues were detected by these basic checks. This
                    does not guarantee that the essay is error-free.
                  </p>
                )}
              </article>

              <article>
                <h4>Recommended next steps</h4>
                <ol>
                  {writtenFeedback.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ol>
              </article>
            </div>
          </div>
        )}

        {activeTab === "sentences" && (
          <div>
            <h3>Sentence-level review</h3>
            <p className="advanced-intro">
              Select a highlighted sentence below to review its issue and
              suggested improvement.
            </p>

            <div className="issue-legend">
              <span>
                <i className="issue-dot generic" /> Generic phrase
              </span>
              <span>
                <i className="issue-dot long" /> Long sentence
              </span>
              <span>
                <i className="issue-dot grammar" /> Possible typo
              </span>
              <span>
                <i className="issue-dot style" /> Formulaic transition
              </span>
              <span>
                <i className="issue-dot wordy" /> Wordy wording
              </span>
            </div>

            <div className="highlighted-essay">
              {highlightedSentences.map((part) => (
                <span
                  key={part.id}
                  className={
                    part.issue
                      ? `highlighted-sentence ${issueColors[part.issue.issues[0].type]}`
                      : "highlighted-sentence"
                  }
                  title={
                    part.issue
                      ? part.issue.issues.map((issue) => issue.label).join(", ")
                      : "No issue detected by current checks"
                  }
                >
                  {part.text}{" "}
                </span>
              ))}
            </div>

            <div className="sentence-issues">
              {sentenceIssues.length === 0 ? (
                <p className="advanced-empty-message">
                  No issues from the current rule set were detected.
                </p>
              ) : (
                sentenceIssues.map((item) => (
                  <article className="sentence-issue-card" key={item.id}>
                    <div className="sentence-original">
                      <span className="mini-label">ORIGINAL SENTENCE</span>
                      <p>{item.text}</p>
                    </div>

                    {item.issues.map((issue, index) => (
                      <div
                        className="sentence-explanation"
                        key={`${issue.type}-${index}`}
                      >
                        <span
                          className={`issue-pill ${issueColors[issue.type]}`}
                        >
                          {issue.label}
                        </span>
                        <p>{issue.explanation}</p>
                        <p className="suggestion-text">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </p>
                      </div>
                    ))}

                    {item.suggestion && (
                      <div className="suggested-version">
                        <span className="mini-label">SIMPLIFIED VERSION</span>
                        <p>{item.suggestion}</p>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => copyText(item.suggestion)}
                        >
                          <Copy size={14} /> Copy suggestion
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "prompt" && (
          <div>
            <h3>Analysis prompt</h3>
            <p className="advanced-intro">
              Copy this instruction if you want to run a deeper review with an
              external language model. This website does not send it anywhere.
            </p>

            <div className="prompt-toolbar">
              <span>
                <FileText size={15} /> {essayType} essay prompt
              </span>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={() => copyText(prompt)}
              >
                <Copy size={14} /> Copy prompt
              </button>
            </div>

            <pre className="prompt-text">{prompt}</pre>
          </div>
        )}

        {activeTab === "humanizer" && (
          <div>
            <h3>Humanizer</h3>
            <p className="advanced-intro">
              Simplifies a limited set of wordy expressions. It does not
              generate new ideas or guarantee that writing sounds human.
            </p>

            <button
              type="button"
              className="button button-primary"
              onClick={runHumanizer}
            >
              <Sparkles size={15} /> Simplify wording
            </button>

            {humanizedText && (
              <div className="humanizer-result">
                <textarea
                  value={humanizedText}
                  onChange={(event) => setHumanizedText(event.target.value)}
                  aria-label="Humanized essay"
                />
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => copyText(humanizedText)}
                >
                  <Copy size={15} /> Copy result
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "detector" && (
          <div>
            <h3>AI-style indicator</h3>
            <p className="advanced-intro">
              This tool checks a few surface-level writing patterns. It cannot
              reliably tell who wrote the essay.
            </p>

            <div className="detector-panel">
              <div className="detector-score">
                <ShieldAlert size={23} />
                <div>
                  <strong>
                    {detector.score === null ? "—" : `${detector.score}/100`}
                  </strong>
                  <span>{detector.label}</span>
                </div>
              </div>

              <p className="detector-disclaimer">{detector.disclaimer}</p>

              {detector.signals.length > 0 ? (
                <div className="detector-signals">
                  {detector.signals.map((signal) => (
                    <article key={signal.title}>
                      <h4>{signal.title}</h4>
                      <p>{signal.detail}</p>
                    </article>
                  ))}
                </div>
              ) : detector.score !== null ? (
                <p className="advanced-empty-message">
                  No signals from this small rule set were detected. This is not
                  proof that the text was written by a human.
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {copyMessage && (
        <p className="copy-status" role="status">
          {copyMessage}
        </p>
      )}
    </section>
  );
}

function createWrittenFeedback(essay, sentenceIssues) {
  const words = essay.trim().split(/\s+/).filter(Boolean).length;
  const paragraphs = essay.trim()
    ? essay
        .trim()
        .split(/\n\s*\n/)
        .filter(Boolean).length
    : 0;

  const problems = [];

  if (words < 100) {
    problems.push(
      "The essay is relatively short. Check whether your main claims have enough explanation and evidence.",
    );
  }

  if (paragraphs < 3) {
    problems.push(
      "The text has fewer than three paragraphs. Consider separating the introduction, main ideas, and conclusion where appropriate.",
    );
  }

  const genericCount = sentenceIssues.filter((item) =>
    item.issues.some((issue) => issue.type === "generic"),
  ).length;

  if (genericCount > 0) {
    problems.push(
      `${genericCount} sentence(s) contain a phrase from the generic-language list. Add specific details instead of relying on broad claims.`,
    );
  }

  const longCount = sentenceIssues.filter((item) =>
    item.issues.some((issue) => issue.type === "long"),
  ).length;

  if (longCount > 0) {
    problems.push(
      `${longCount} sentence(s) are longer than 30 words. Review whether each one can be divided without losing meaning.`,
    );
  }

  const wordyCount = sentenceIssues.filter((item) =>
    item.issues.some((issue) => issue.type === "wordy"),
  ).length;

  if (wordyCount > 0) {
    problems.push(
      `${wordyCount} sentence(s) contain expressions that may be shortened. Review the suggested alternatives before applying them.`,
    );
  }

  if (problems.length === 0) {
    problems.push(
      "The current checks found few obvious surface-level issues. Review the strength of your examples, the logic of your argument, and whether the conclusion adds insight.",
    );
  }

  const actions = [
    "Make broad claims more concrete with a specific example or detail.",
    "Check that every paragraph contributes to the essay's central purpose.",
    "Read the essay aloud and revise wording that feels unclear or unnecessarily complicated.",
  ];

  return {
    overview: `Your essay contains ${words} words across ${paragraphs} paragraph(s). The automated review identified ${sentenceIssues.length} sentence(s) with at least one pattern worth checking. These are suggestions, not definitive errors.`,
    problems,
    actions,
  };
}
