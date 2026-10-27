"use client";

import { essayTypes } from "@/data/essayTypes";
import { countWords, countSentences, countParagraphs } from "@/lib/textUtils";
import { FileText, RotateCcw, Sparkles, MessageSquareText } from "lucide-react";

const sampleQuestion =
  "Describe a challenge you have overcome and explain how it changed you.";

const sampleEssay = `When I started teaching programming to teenagers in my community, I expected the hardest part to be explaining code. Instead, I discovered that the biggest challenge was helping students believe they could build something meaningful.

One student joined our first session convinced that technology was only for people with expensive computers and years of experience. We began with a simple website, building it one small component at a time. By the end of the course, that student had created a project of their own and was helping other beginners solve problems.

The experience changed how I understood leadership. I had thought that leading meant knowing the answers, but I learned that it often means creating an environment where other people can discover their own abilities. Since then, I have focused on making technology education more accessible and giving students opportunities to turn their ideas into real projects.`;

export default function EssayEditor({
  essay,
  setEssay,
  essayType,
  setEssayType,
  onAnalyze,
  onReset,
  isAnalyzed,
  essayQuestion,
  setEssayQuestion,
}) {
  const words = countWords(essay);
  const sentences = countSentences(essay);
  const paragraphs = countParagraphs(essay);

  function handleTrySample() {
    setEssayQuestion(sampleQuestion);
    setEssay(sampleEssay);
  }

  function handleClear() {
    onReset();
    setEssayQuestion("");
  }

  return (
    <section className="editor-card">
      <div className="section-heading">
        <div>
          <div className="eyebrow">YOUR WORKSPACE</div>
          <h2>Analyze your essay</h2>
          <p>
            Get feedback on your writing and how well it answers the prompt.
          </p>
        </div>

        <span className="editor-icon">
          <FileText size={21} />
        </span>
      </div>

      <div className="editor-controls">
        <label htmlFor="essay-type">Essay type</label>

        <select
          id="essay-type"
          value={essayType}
          onChange={(event) => setEssayType(event.target.value)}
        >
          {essayTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="prompt-field">
        <label htmlFor="essay-question">
          <MessageSquareText size={16} />
          Essay question or prompt
          <span className="optional-label">Optional</span>
        </label>

        <textarea
          id="essay-question"
          className="prompt-textarea"
          value={essayQuestion}
          onChange={(event) => setEssayQuestion(event.target.value)}
          placeholder="Paste the exact question you were asked...

For example: Describe a challenge you have overcome and explain how it changed you."
          rows={3}
        />

        <p className="field-hint">
          Add the original assignment so we can check how closely your essay
          addresses it.
        </p>
      </div>

      <div className="textarea-wrapper">
        <textarea
          value={essay}
          onChange={(event) => setEssay(event.target.value)}
          placeholder="Paste your essay here...

Start with your introduction, develop your ideas, and finish with a conclusion."
          spellCheck
          aria-label="Essay text"
        />

        {!essay && (
          <div className="textarea-placeholder-icon">
            <FileText size={30} strokeWidth={1.3} />
          </div>
        )}
      </div>

      <div className="editor-stats">
        <span>{words} words</span>
        <span>{sentences} sentences</span>
        <span>{paragraphs} paragraphs</span>
      </div>

      <div className="editor-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={handleTrySample}
        >
          <Sparkles size={16} />
          Try sample
        </button>

        <div className="editor-actions-right">
          {(essay || essayQuestion) && (
            <button
              type="button"
              className="button button-ghost"
              onClick={handleClear}
            >
              <RotateCcw size={15} />
              Clear
            </button>
          )}

          <button
            type="button"
            className="button button-primary"
            onClick={onAnalyze}
            disabled={!essay.trim()}
          >
            <Sparkles size={16} />
            {isAnalyzed ? "Analyze again" : "Analyze essay"}
          </button>
        </div>
      </div>

      <p className="privacy-note">
        Your essay is analyzed in your browser and is not sent to a server by
        this application.
      </p>
    </section>
  );
}
