const { preprocess } = require("./preprocess");

function buildVocabulary(documents) {
  return [...new Set(documents.flatMap(doc => preprocess(doc)))].sort();
}

function termFrequency(tokens) {
  const counts = new Map();
  for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1);
  const total = tokens.length || 1;
  for (const [token, count] of counts) counts.set(token, count / total);
  return counts;
}

function buildIdf(documents, vocabulary) {
  const idf = new Map();
  for (const term of vocabulary) {
    const documentCount = documents.reduce((count, doc) =>
      count + (preprocess(doc).includes(term) ? 1 : 0), 0);
    idf.set(term, Math.log((documents.length + 1) / (documentCount + 1)) + 1);
  }
  return idf;
}

function vectorize(text, vocabulary, idf) {
  const tf = termFrequency(preprocess(text));
  return vocabulary.map(term => (tf.get(term) || 0) * (idf.get(term) || 0));
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function rankDocuments(question, documents) {
  const vocabulary = buildVocabulary(documents);
  const idf = buildIdf(documents, vocabulary);
  const questionVector = vectorize(question, vocabulary, idf);
  return documents.map((document, index) => ({
    index,
    score: cosineSimilarity(questionVector, vectorize(document, vocabulary, idf))
  })).sort((a, b) => b.score - a.score);
}

module.exports = { rankDocuments, cosineSimilarity };