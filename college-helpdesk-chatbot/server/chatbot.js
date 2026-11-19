const faqs = require("../data/faqs.json");
const { rankDocuments } = require("./similarity");

const FALLBACK = "I'm sorry, I couldn't find a close match in my college FAQ database. Please try asking about admissions, fees, attendance, exams, library, hostel, or placements, or contact the college helpdesk for confirmation.";

function getFaqs() {
  return faqs;
}

function answerQuestion(question) {
  const searchableQuestions = faqs.map(faq => `${faq.question} ${faq.keywords.join(" ")}`);
  const ranked = rankDocuments(question, searchableQuestions);
  const best = ranked[0];
  const threshold = 0.12;

  if (!best || best.score < threshold) {
    return {
      answer: FALLBACK,
      matched: false,
      confidence: best ? Number(best.score.toFixed(3)) : 0,
      suggestions: faqs.slice(0, 3).map(faq => faq.question)
    };
  }

  const matchedFaq = faqs[best.index];
  return {
    answer: matchedFaq.answer,
    matched: true,
    confidence: Number(best.score.toFixed(3)),
    category: matchedFaq.category,
    matchedQuestion: matchedFaq.question,
    suggestions: faqs
      .filter(faq => faq.category === matchedFaq.category && faq.id !== matchedFaq.id)
      .slice(0, 3)
      .map(faq => faq.question)
  };
}

module.exports = { answerQuestion, getFaqs };