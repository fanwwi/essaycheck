export function countWords(text) {
  const trimmed = text.trim();

  if (!trimmed) return 0;

  return trimmed.split(/\s+/).length;
}

export function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

export function countSentences(text) {
  if (!text.trim()) return 0;

  return splitSentences(text).length;
}

export function countParagraphs(text) {
  if (!text.trim()) return 0;

  return text
    .trim()
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim().length > 0).length;
}

export function getAverageWordLength(text) {
  const words = text.match(/\b[\w'-]+\b/g) || [];

  if (words.length === 0) return 0;

  const totalLength = words.reduce((sum, word) => sum + word.length, 0);

  return Number((totalLength / words.length).toFixed(1));
}

export function getAverageSentenceLength(text) {
  const sentences = splitSentences(text);
  const words = countWords(text);

  if (sentences.length === 0) return 0;

  return Number((words / sentences.length).toFixed(1));
}

export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
