import {
  countWords,
  countSentences,
  countParagraphs,
  getAverageSentenceLength,
} from "./textUtils";

import { weakPhrases } from "./weakPhrases";
import { findRepeatedWords } from "./repetition";
import { calculateScore } from "./scoring";
import { analyzePrompt } from "./promptAnalysis";

export function analyzeEssay(text, essayType = "general", essayQuestion = "") {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  const words = countWords(trimmed);
  const sentences = countSentences(trimmed);
  const paragraphs = countParagraphs(trimmed);
  const averageSentenceLength = getAverageSentenceLength(trimmed);

  const lowerText = trimmed.toLowerCase();

  const foundPhrases = weakPhrases
    .filter(({ phrase }) => lowerText.includes(phrase.toLowerCase()))
    .map((item) => ({
      ...item,
      foundText: item.phrase,
    }));

  const repeatedWords = findRepeatedWords(trimmed);

  const criteria = {
    structure: getStructureScore(paragraphs, words),
    clarity: getClarityScore(averageSentenceLength, sentences),
    style: getStyleScore(foundPhrases.length, repeatedWords.length),
    development: getDevelopmentScore(trimmed, words, paragraphs),
    mechanics: getMechanicsScore(trimmed),
  };

  const score = calculateScore(criteria);

  const feedback = generateFeedback({
    words,
    paragraphs,
    averageSentenceLength,
    foundPhrases,
    repeatedWords,
    criteria,
    essayType,
  });

  // Анализ соответствия эссе вопросу, если вопрос указан.
  const promptAnalysis = essayQuestion.trim()
    ? analyzePrompt(essayQuestion.trim(), trimmed)
    : null;

  return {
    score,
    criteria,
    words,
    sentences,
    paragraphs,
    averageSentenceLength,
    foundPhrases,
    repeatedWords,
    feedback,
    essayType,
    essayQuestion: essayQuestion.trim(),
    promptAnalysis,
  };
}

function getStructureScore(paragraphs, words) {
  let score = 60;

  if (paragraphs >= 3) score += 20;
  else if (paragraphs === 2) score += 10;
  else score -= 15;

  if (words >= 150) score += 10;
  if (words >= 300) score += 10;
  if (words < 50) score -= 20;

  return clamp(score);
}

function getClarityScore(averageSentenceLength, sentences) {
  let score = 80;

  if (averageSentenceLength > 30) score -= 20;
  else if (averageSentenceLength > 24) score -= 10;

  if (averageSentenceLength > 0 && averageSentenceLength < 8) {
    score -= 10;
  }

  if (sentences < 3) score -= 20;

  return clamp(score);
}

function getStyleScore(phraseCount, repeatedCount) {
  let score = 90;

  score -= phraseCount * 7;
  score -= repeatedCount * 4;

  return clamp(score);
}

function getDevelopmentScore(text, words, paragraphs) {
  let score = 55;

  if (words >= 100) score += 10;
  if (words >= 250) score += 10;
  if (paragraphs >= 3) score += 10;

  const examples = /\b(for example|for instance|such as|one example|when I)\b/i;

  if (examples.test(text)) score += 10;
  if (words < 50) score -= 20;

  return clamp(score);
}

function getMechanicsScore(text) {
  let score = 85;

  if (/[a-z][.!?]\s+[a-z]/.test(text)) {
    score -= 10;
  }

  if (/\s{2,}/.test(text)) {
    score -= 5;
  }

  if (/[!?]{3,}/.test(text)) {
    score -= 10;
  }

  const opening = text.trim()[0];

  if (opening && opening === opening.toLowerCase() && /[a-z]/i.test(opening)) {
    score -= 10;
  }

  return clamp(score);
}

function generateFeedback({
  words,
  paragraphs,
  averageSentenceLength,
  foundPhrases,
  repeatedWords,
  criteria,
  essayType,
}) {
  const feedback = [];

  if (words < 100) {
    feedback.push({
      type: "warning",
      title: "Essay may be too short",
      description:
        "Your essay is relatively short. Develop your ideas with specific details and examples.",
    });
  }

  if (paragraphs < 3) {
    feedback.push({
      type: "warning",
      title: "Improve paragraph structure",
      description:
        "Consider separating your introduction, main ideas, and conclusion into clear paragraphs.",
    });
  }

  if (averageSentenceLength > 25) {
    feedback.push({
      type: "warning",
      title: "Some sentences may be too long",
      description:
        "Review long sentences and split them where it improves readability.",
    });
  }

  if (foundPhrases.length > 0) {
    feedback.push({
      type: "warning",
      title: "Potentially generic phrases",
      description: `We found ${foundPhrases.length} phrase(s) that may sound generic. Review them in the Weak Spots section.`,
    });
  }

  if (repeatedWords.length > 0) {
    feedback.push({
      type: "info",
      title: "Repeated vocabulary",
      description:
        "Some content words appear several times. Check whether the repetition is necessary.",
    });
  }

  const lowestCriterion = Object.entries(criteria).sort(
    (a, b) => a[1] - b[1],
  )[0];

  const criterionNames = {
    structure: "Structure",
    clarity: "Clarity",
    style: "Style and variety",
    development: "Idea development",
    mechanics: "Writing mechanics",
  };

  if (lowestCriterion) {
    feedback.push({
      type: "info",
      title: `Focus on ${criterionNames[lowestCriterion[0]]}`,
      description:
        "Start by improving the lowest-scoring criterion, then analyze the essay again.",
    });
  }

  if (essayType === "college") {
    feedback.push({
      type: "info",
      title: "Admissions essay reminder",
      description:
        "Specific personal experiences and genuine reflection are more useful than broad claims about your qualities.",
    });
  }

  if (feedback.length === 0) {
    feedback.push({
      type: "success",
      title: "No obvious structural issues found",
      description:
        "Review the essay manually as well. This automated check cannot judge every nuance of your argument.",
    });
  }

  return feedback;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
