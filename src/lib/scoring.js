export function calculateScore(criteria) {
  const values = Object.values(criteria);

  if (values.length === 0) return 0;

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round(total / values.length);
}

export function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs improvement";

  return "Needs significant work";
}

export function getScoreColor(score) {
  if (score >= 80) return "strong";
  if (score >= 60) return "medium";

  return "weak";
}
