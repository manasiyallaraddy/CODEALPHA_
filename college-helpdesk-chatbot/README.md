# College Helpdesk – AI FAQ Chatbot

A full-stack FAQ chatbot for a college helpdesk. It preprocesses user questions and ranks stored FAQs using TF-IDF and cosine similarity.

## Features

- Responsive chat interface with suggested and related questions
- 40 sample FAQs across admissions, courses, fees, examinations, attendance, library, hostel, placements and campus facilities
- Text normalization, tokenization, stop-word removal and light suffix normalization
- TF-IDF vectorization and cosine similarity ranking
- Confidence score and fallback response for questions without a close match
- Express REST API and JSON FAQ knowledge base
- No API key or paid AI service required

## Technology

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js and Express
- NLP/matching: custom JavaScript preprocessing, TF-IDF and cosine similarity
- Data: JSON

## Requirements

- Node.js 18 or later
- npm

## Installation and running

1. Download or clone this project.
2. Open a terminal in the `college-helpdesk-chatbot` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open **http://localhost:3000** in your browser.

For development with automatic server restart (Node.js 18.11+):

```bash
npm run dev
```

## API endpoints

### `GET /api/health`
Returns the server health status.

### `GET /api/faqs`
Returns the FAQ count and FAQ records.

### `POST /api/chat`
Request:

```json
{
  "question": "How do I pay my fees?"
}
```

Example response:

```json
{
  "answer": "Use only the payment methods and official payment links communicated by the college accounts section. Keep the transaction receipt or acknowledgement for your records.",
  "matched": true,
  "confidence": 0.42,
  "category": "Fees",
  "matchedQuestion": "How can I pay my college fees?",
  "suggestions": []
}
```

The exact confidence score and suggestions depend on the FAQ data and input question.

## How the matching works

1. The input and FAQ text are converted to lowercase, punctuation is removed and text is split into tokens.
2. Common stop words are removed and simple suffix normalization is applied.
3. A vocabulary is built from the FAQ corpus.
4. Term frequency (TF) measures how often a term appears in a document. Inverse document frequency (IDF) gives more weight to terms that are less common across FAQs.
5. Each question is represented as a TF-IDF vector.
6. Cosine similarity measures the angle-based similarity between the user's vector and each FAQ vector.
7. The highest-scoring FAQ is returned when its score meets the configured threshold; otherwise a fallback answer is shown.

The matching code is intentionally implemented in plain JavaScript so the algorithm is easy to inspect and explain during a project demonstration. It is a lightweight FAQ retrieval chatbot, not a generative AI model.

## Customizing the FAQ data

Edit `data/faqs.json`. Each FAQ has:
- `id`
- `category`
- `question`
- `answer`
- `keywords`

Add real, verified institutional information before using this as an official college support channel. Current fees, attendance rules, dates, contact details and facilities are deliberately not invented in this demo.

## Testing checklist

Try questions such as:
- `How do I apply for admission?`
- `tell me about applying to join`
- `What is the attendance percentage?`
- `My fee payment failed, what should I do?`
- `How can I prepare for campus interviews?`
- `What is the weather today?` (should normally trigger the fallback)

Also test an empty message, a long question, and a server restart.

## GitHub

```bash
git init
git add .
git commit -m "Build College Helpdesk FAQ chatbot"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/college-helpdesk-chatbot.git
git push -u origin main
```

Do not commit `node_modules` or `.env` files.
