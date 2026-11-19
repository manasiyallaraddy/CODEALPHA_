const express = require("express");
const path = require("path");
const { answerQuestion, getFaqs } = require("./server/chatbot");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "College Helpdesk chatbot is running." });
});

app.get("/api/faqs", (_req, res) => {
  res.json({ count: getFaqs().length, faqs: getFaqs() });
});

app.post("/api/chat", (req, res) => {
  const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
  if (!question) {
    return res.status(400).json({ error: "Please enter a question." });
  }
  if (question.length > 500) {
    return res.status(400).json({ error: "Please keep your question under 500 characters." });
  }
  try {
    res.json(answerQuestion(question));
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`College Helpdesk is running at http://localhost:${PORT}`);
});