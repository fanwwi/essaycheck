import { weakPhrases } from "./weakPhrases";
import { splitSentences } from "./textUtils";

const formulaicTransitions = [
  "furthermore",
  "moreover",
  "in conclusion",
  "in today's world",
  "it is important to note",
  "plays a crucial role",
  "in addition",
];

export function detectAIStyle(text) {
  const sentences = splitSentences(text);
  const words = text.match(/\b[\w'-]+\b/g) || [];
  const lower = text.toLowerCase();

  if (words.length < 80 || sentences.length < 4) {
    return {
      score: null,
      label: "Not enough text",
      signals: [],
      disclaimer:
        "Use at least 80 words and 4 sentences for this limited style check. Even longer texts cannot be reliably classified by these heuristics.",
    };
  }

  const signals = [];

  const phraseMatches = weakPhrases.filter(({ phrase }) =>
    lower.includes(phrase.toLowerCase()),
  );

  if (phraseMatches.length >= 2) {
    signals.push({
      title: "Common generic phrases",
      detail: `${phraseMatches.length} phrases from a predefined list were found.`,
    });
  }

  const transitionCount = formulaicTransitions.filter((phrase) =>
    lower.includes(phrase),
  ).length;

  if (transitionCount >= 2) {
    signals.push({
      title: "Formulaic transitions",
      detail: "Several common formal transitions appear in the text.",
    });
  }

  const lengths = sentences.map(
    (sentence) => (sentence.match(/\b[\w'-]+\b/g) || []).length,
  );

  const average =
    lengths.reduce((sum, length) => sum + length, 0) / lengths.length;

  const variance =
    lengths.reduce((sum, length) => sum + (length - average) ** 2, 0) /
    lengths.length;

  const standardDeviation = Math.sqrt(variance);

  if (standardDeviation < 4 && average > 8) {
    signals.push({
      title: "Similar sentence lengths",
      detail:
        "Sentence lengths are unusually similar, which can also occur in carefully edited human writing.",
    });
  }

  const firstPersonCount = (lower.match(/\b(i|my|me|we|our|us)\b/g) || [])
    .length;

  if (firstPersonCount === 0 && words.length > 150) {
    signals.push({
      title: "Limited first-person language",
      detail:
        "The text contains little first-person language. This may be appropriate for academic writing.",
    });
  }

  const score = Math.min(signals.length * 25, 100);

  return {
    score,
    label:
      score >= 50
        ? "Several style signals"
        : score >= 25
          ? "Some style signals"
          : "Few style signals",
    signals,
    disclaimer:
      "This is not the probability that AI wrote the essay. These patterns also occur in human writing, and this check cannot reliably determine authorship.",
  };
}
