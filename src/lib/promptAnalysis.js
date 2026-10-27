const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "from",
  "with",
  "by",
  "about",
  "into",
  "through",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "you",
  "your",
  "i",
  "me",
  "my",
  "we",
  "our",
  "they",
  "their",
  "he",
  "she",
  "his",
  "her",
  "what",
  "which",
  "who",
  "when",
  "where",
  "why",
  "how",
  "can",
  "could",
  "would",
  "should",
  "will",
  "describe",
  "explain",
  "discuss",
  "tell",
  "share",
  "reflect",
  "write",
  "essay",
  "experience",
]);

function getKeywords(text) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9'\s-]/g, " ")
        .split(/\s+/)
        .map((word) => word.replace(/^[-']+|[-']+$/g, ""))
        .filter((word) => word.length >= 3 && !STOP_WORDS.has(word)),
    ),
  ];
}

export function analyzePrompt(question, essay) {
  if (!question?.trim()) {
    return null;
  }

  const keywords = getKeywords(question);
  const essayWords = new Set(getKeywords(essay));

  const matchedKeywords = keywords.filter((word) => essayWords.has(word));
  const missingKeywords = keywords.filter((word) => !essayWords.has(word));

  const coverage = keywords.length
    ? Math.round((matchedKeywords.length / keywords.length) * 100)
    : 0;

  const questionLower = question.toLowerCase();
  const essayLower = essay.toLowerCase();

  const taskChecks = [
    {
      label: "Personal experience",
      patterns: [
        /\b(i|my|me|we|our)\b/i,
        /\b(when i|i learned|i experienced|i remember)\b/i,
      ],
      relevant:
        /\b(describe|share|tell|experience|personal|challenge|story)\b/i.test(
          questionLower,
        ),
    },
    {
      label: "Reflection or learning",
      patterns: [
        /\b(i learned|i realized|i discovered|it taught me|i understood)\b/i,
        /\b(changed my|shaped my|made me|since then|as a result)\b/i,
      ],
      relevant:
        /\b(reflect|learn|change|growth|impact|lesson|overcome|develop)\b/i.test(
          questionLower,
        ),
    },
    {
      label: "Examples or actions",
      patterns: [
        /\b(for example|for instance|such as|i built|i created|i started|i helped)\b/i,
      ],
      relevant:
        /\b(example|describe|explain|challenge|action|contribute|solve|achieve)\b/i.test(
          questionLower,
        ),
    },
  ];

  const checks = taskChecks
    .filter((check) => check.relevant)
    .map((check) => ({
      label: check.label,
      addressed: check.patterns.some((pattern) => pattern.test(essayLower)),
    }));

  const addressedCount = checks.filter((check) => check.addressed).length;
  const checksScore = checks.length
    ? Math.round((addressedCount / checks.length) * 100)
    : null;

  const score =
    checksScore === null
      ? coverage
      : Math.round(coverage * 0.6 + checksScore * 0.4);

  let label;
  let description;

  if (score >= 75) {
    label = "Promising alignment";
    description =
      "Your essay shares several signals with the prompt. Review the missing points and make sure you answer every part directly.";
  } else if (score >= 45) {
    label = "Partial alignment";
    description =
      "Some prompt-related terms or task elements appear in your essay. Check whether your main example directly answers the question.";
  } else {
    label = "Alignment needs review";
    description =
      "Few prompt-related signals were detected. You may need to address the question more directly or use more specific examples.";
  }

  const suggestions = [];

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Consider whether these prompt terms need a clearer response: ${missingKeywords.slice(0, 6).join(", ")}.`,
    );
  }

  for (const check of checks) {
    if (!check.addressed) {
      suggestions.push(
        `Make sure your essay addresses: ${check.label.toLowerCase()}.`,
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Review each part of the prompt and make sure your examples and conclusion answer it directly.",
    );
  }

  return {
    score,
    label,
    description,
    matchedKeywords,
    missingKeywords,
    checks,
    suggestions,
  };
}
