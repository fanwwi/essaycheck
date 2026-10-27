import { weakPhrases } from "./weakPhrases";

const replacements = [
  [/\bin order to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bat this point in time\b/gi, "now"],
  [/\ba large number of\b/gi, "many"],
  [/\butilize\b/gi, "use"],
  [/\bdemonstrate\b/gi, "show"],
  [/\bhas the ability to\b/gi, "can"],
  [/\bin the event that\b/gi, "if"],
  [/\bfor the purpose of\b/gi, "for"],
  [/\bI believe that\b/gi, "I think"],
];

function simplifySentence(sentence) {
  let result = sentence;

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

export function analyzeSentences(text) {
  const sentences =
    text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

  return sentences
    .map((rawSentence, index) => {
      const sentence = rawSentence.trim();
      const words = sentence.match(/\b[\w'-]+\b/g) || [];
      const issues = [];

      const lowerSentence = sentence.toLowerCase();

      const foundPhrase = weakPhrases.find(({ phrase }) =>
        lowerSentence.includes(phrase.toLowerCase()),
      );

      if (foundPhrase) {
        issues.push({
          type: "generic",
          label: "Generic phrase",
          explanation: foundPhrase.reason,
          suggestion:
            "Replace the broad statement with a specific experience, detail, or example.",
        });
      }

      if (words.length > 30) {
        issues.push({
          type: "long",
          label: "Long sentence",
          explanation: `This sentence contains ${words.length} words. Its main idea may be difficult to follow.`,
          suggestion:
            "Consider splitting the sentence into two shorter sentences, keeping one main idea in each.",
        });
      }

      if (/\b(\w+)\s+\1\b/i.test(sentence)) {
        issues.push({
          type: "grammar",
          label: "Possible repeated word",
          explanation:
            "The same word appears twice in a row. Check whether this is intentional.",
          suggestion: "Remove the accidental duplicate word.",
        });
      }

      if (/\b(in conclusion|to sum up|all in all)\b/i.test(sentence)) {
        issues.push({
          type: "style",
          label: "Formulaic transition",
          explanation:
            "This transition may make the conclusion sound predictable.",
          suggestion:
            "Try opening with the actual insight or implication instead of announcing the conclusion.",
        });
      }

      const simplified = simplifySentence(sentence);

      if (
        simplified !== sentence &&
        !issues.some((issue) => issue.type === "wordy")
      ) {
        issues.push({
          type: "wordy",
          label: "Wordy expression",
          explanation:
            "This sentence contains wording that can potentially be made more concise.",
          suggestion: "Try the simplified version shown below.",
        });
      }

      return {
        id: index,
        text: sentence,
        issues,
        suggestion: simplified !== sentence ? simplified : "",
      };
    })
    .filter((sentence) => sentence.issues.length > 0);
}

export function getSentenceIssueCounts(issues) {
  return issues.reduce((counts, sentence) => {
    for (const issue of sentence.issues) {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
    }

    return counts;
  }, {});
}
