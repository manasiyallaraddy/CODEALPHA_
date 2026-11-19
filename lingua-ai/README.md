# LinguaAI – Smart Language Translation Platform

[![CodeAlpha AI Internship](https://img.shields.io/badge/CodeAlpha-AI%20Internship%20Project-4F46E5.svg)](https://www.codealpha.tech/)
[![Google Gemini API](https://img.shields.io/badge/AI%20Engine-Google%20Gemini-06B6D4.svg)](https://aistudio.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A modern, responsive, full-stack AI translation platform powered by Google Gemini API, Node.js, Express, and HTML5/CSS3/Vanilla JavaScript. Built for the **CodeAlpha Artificial Intelligence Internship**.

---

## 📖 Project Overview

**LinguaAI** is an intelligent language translation web application designed to break down language barriers with human-like contextual precision. Unlike traditional dictionary-based translators, LinguaAI leverages Google's state-of-the-art **Gemini Large Language Model** to comprehend cultural nuances, idiomatic phrasing, domain-specific terminology, and natural grammatical flow.

The project strictly follows professional full-stack security and architectural best practices: API keys are strictly confined to the backend environment and never leaked to the client browser, requests are thoroughly validated, text-to-speech audio synthesis is built into both source and target panels, and translation history is stored locally for offline privacy and rapid recall.

---

## ✨ Key Features

- **🧠 Google Gemini Generative AI Engine**: Powered by Google's latest multimodal LLMs (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-2.0-flash`) for nuanced, accurate translations.
- **✨ Intelligent Auto-Detection**: Automatically detects the source language in real-time and displays a detected language badge.
- **🌐 25+ Comprehensive Languages**: Complete support for major Indian regional languages (Hindi, Kannada, Telugu, Tamil, Malayalam, Marathi, Bengali, Gujarati, Punjabi) and international languages (Spanish, French, German, Arabic, Chinese, Japanese, Korean, Russian, Portuguese, Italian, Dutch, Turkish, Vietnamese, Polish, Urdu).
- **🔁 Dynamic Language Swap**: One-click language swapping with rotating button animation that swaps both selected languages and text.
- **🔊 Browser Speech Synthesis (TTS)**: Native Web Speech API integration that speaks translated text aloud in regional accents with live audio wave animation.
- **📜 Local Translation History**: Browser-stored (`localStorage`) history drawer with instant "Reuse / Load", "Copy", and "Delete" capabilities.
- **📋 One-Click Clipboard Copy**: Fast copy-to-clipboard for both source and translated text with floating toast confirmation.
- **⚡ Low-Latency Performance & Live Metrics**: Real-time request latency counter, live character counter (up to 5,000 characters), and model status badge.
- **🌗 Theme Modes**: High-contrast Light Mode with soft ambient gradients and Dark Mode toggle with persistent preference.
- **🛡️ Enterprise Security**: API keys are isolated on the Express backend; zero exposure in frontend client scripts; robust input sanitation and error handling.
- **📱 Fully Responsive**: Fluid desktop, tablet, and mobile interface with responsive grid restructuring and touch-friendly controls.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Semantic markup, CSS Custom Properties, flexbox/grid, responsive layouts |
| **Styling** | Custom CSS3 & Glassmorphism | Soft gradients, subtle transitions, dark/light themes, no bulky frameworks |
| **Audio** | Web Speech API | Client-side speech synthesis with multi-language voice detection |
| **Backend** | Node.js & Express.js | RESTful API server, input validation, static asset delivery, error middleware |
| **AI Integration**| Google Gemini API (`@google/genai`) | Official Google GenAI SDK with fallback to `@google/generative-ai` |
| **Configuration** | `dotenv` | Secure environment variable management |
| **Network** | Fetch API | Asynchronous client-server communication with JSON payloads |

---

## 📂 Project Structure

```
CodeAlpha_LanguageTranslationTool/
├── public/
│   ├── index.html         # Modern, semantic single-page UI
│   ├── style.css          # Glassmorphism, animations, light/dark themes
│   └── script.js          # Client controller, TTS, History, Fetch calls
├── server.js              # Express REST API, Gemini SDK, input validation
├── package.json           # Dependencies and startup scripts
├── .env.example           # Environment template for API keys
├── .env                   # Local environment file (ignored by Git)
├── .gitignore             # Git exclusions (node_modules, .env, logs)
└── README.md              # Project documentation and submission details
```

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up and run LinguaAI locally on your system.

### Prerequisites

- **Node.js**: Version 18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: Version 8.0.0 or higher (comes bundled with Node.js)
- A **Google Gemini API Key** (Free from Google AI Studio)

---

### Step 1: Clone or Download the Repository

```bash
git clone https://github.com/YourUsername/CodeAlpha_LanguageTranslationTool.git
cd CodeAlpha_LanguageTranslationTool
```

---

### Step 2: Install Dependencies

Install the required npm packages:

```bash
npm install
```

---

### Step 3: Obtain and Configure Your Google Gemini API Key

1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click the **"Create API Key"** button (or **"Get API key"**).
4. Copy your newly generated API key.
5. In the project root directory, create a `.env` file (you can copy `.env.example`):

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS / Bash:
cp .env.example .env
```

6. Open `.env` in any text editor and paste your API key:

```env
PORT=3000
GEMINI_API_KEY=AIzaSyYourActualGoogleGeminiApiKeyHere
GEMINI_MODEL=gemini-2.5-flash
```

> ⚠️ **Security Notice:** The `.env` file is excluded from Git tracking via `.gitignore`. Never commit your real API key to a public GitHub repository.

---

### Step 4: Run the Application

Start the Express backend server:

```bash
npm start
```

Or run in development auto-reload mode:

```bash
npm run dev
```

You will see the console confirmation:

```
========================================================
🚀 LinguaAI Server running at http://localhost:3000
📁 Serving frontend from: .../public
🔑 Gemini API Key configured: Yes
========================================================
```

---

### Step 5: Open in Your Browser

Open your web browser and navigate to:

```
http://localhost:3000
```

---

## 📡 API Endpoint Documentation

The Express backend exposes clean, structured REST endpoints:

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Returns server status, configuration state, and model details.
- **Response**:
```json
{
  "status": "ok",
  "service": "LinguaAI Translation Platform",
  "version": "1.0.0",
  "apiKeyConfigured": true,
  "model": "gemini-2.5-flash",
  "supportedLanguagesCount": 25,
  "timestamp": "2026-11-18T11:08:51.812Z"
}
```

### 2. Supported Languages Catalog
- **Endpoint**: `GET /api/languages`
- **Description**: Returns all supported languages with codes, native scripts, and BCP 47 TTS tags.
- **Response**:
```json
{
  "success": true,
  "languages": [
    { "code": "en", "name": "English", "nativeName": "English", "bcp47": "en-US", "dir": "ltr" },
    { "code": "hi", "name": "Hindi", "nativeName": "हिन्दी", "bcp47": "hi-IN", "dir": "ltr" },
    { "code": "kn", "name": "Kannada", "nativeName": "ಕನ್ನಡ", "bcp47": "kn-IN", "dir": "ltr" },
    { "code": "es", "name": "Spanish", "nativeName": "Español", "bcp47": "es-ES", "dir": "ltr" },
    { "code": "ar", "name": "Arabic", "nativeName": "العربية", "bcp47": "ar-SA", "dir": "rtl" }
  ]
}
```

### 3. Translate Text
- **Endpoint**: `POST /api/translate`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "text": "Hello, how are you today?",
  "sourceLang": "auto",
  "targetLang": "hi"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "sourceText": "Hello, how are you today?",
  "translatedText": "नमस्ते, आप आज कैसे हैं?",
  "sourceLang": "auto",
  "targetLang": "hi",
  "detectedSourceLanguage": "English",
  "detectedLanguageCode": "en",
  "modelUsed": "gemini-2.5-flash",
  "characterCount": 25,
  "timestamp": "2026-11-18T11:15:30.000Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Empty input, text > 5000 chars, invalid target language.
  - `503 Service Unavailable`: `GEMINI_API_KEY` missing from `.env`.
  - `502 Bad Gateway`: Upstream Gemini API network or quota error.

---

## 📸 Screenshots & Demonstration

Add your screenshots to a `screenshots/` directory before final repository submission:

| Feature | Description |
| :--- | :--- |
| **Main Translation View** | Dual-card layout with auto-detect, quick chips, and live character counts. |
| **Dark Theme** | Deep obsidian palette designed for low-light developer workflows. |
| **History Drawer** | Slide-out panel displaying saved translations with one-click restore. |
| **Speech Synthesis** | Interactive audio wave visualizer during active TTS playback. |

*To add screenshots to your GitHub repo:*
1. Take screenshots of your running app at `http://localhost:3000`.
2. Create a folder named `screenshots/` in the project root.
3. Save images as `screenshots/desktop-preview.png`, `screenshots/dark-mode.png`, etc.
4. Link them in this README using `![Desktop Preview](screenshots/desktop-preview.png)`.

---

## 🛡️ Validation & Error Handling

- **Client-Side Validation**:
  - Empty text prevention with visual toast notifications.
  - Maximum length cap enforced at 5,000 characters.
  - Disables swap button automatically when source is "Auto Detect".
  - Audio playback auto-cancels if user clicks speech button again.
- **Server-Side Validation**:
  - String type check and trimming.
  - Rejection of empty or oversized payloads.
  - Validation of language codes against verified ISO list.
  - Graceful JSON extraction with markdown code-fence sanitization.
  - Identity passthrough shortcut: if `sourceLang === targetLang`, returns immediately without consuming Gemini API tokens.

---

## 📜 Submission Details

- **Internship Organization**: CodeAlpha
- **Track**: Artificial Intelligence Internship
- **Project**: AI-Powered Language Translation Tool
- **Repository Name**: `CodeAlpha_LanguageTranslationTool`
- **Developer**: CodeAlpha AI Intern

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
