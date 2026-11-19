const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "am", "was", "were", "be", "been", "being",
  "i", "we", "you", "he", "she", "they", "it", "this", "that", "these", "those",
  "what", "when", "where", "who", "why", "how", "can", "could", "would", "should",
  "do", "does", "did", "please", "tell", "me", "my", "our", "your", "about",
  "to", "of", "for", "in", "on", "at", "and", "or", "but", "with", "from",
  "have", "has", "had", "there", "any"
]);

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function preprocess(text) {
  return tokenize(text)
    .filter(token => !STOP_WORDS.has(token))
    .map(token => {
      // Small, transparent suffix normalization for common English word forms.
      if (token.length > 5 && token.endsWith("ies")) return token.slice(0, -3) + "y";
      if (token.length > 5 && token.endsWith("ing")) return token.slice(0, -3);
      if (token.length > 4 && token.endsWith("ed")) return token.slice(0, -2);
      if (token.length > 4 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
      return token;
    });
}

module.exports = { tokenize, preprocess };