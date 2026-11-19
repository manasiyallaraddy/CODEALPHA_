/**
 * LinguaAI – Smart Language Translation Platform
 * CodeAlpha Artificial Intelligence Internship Project
 * 
 * Backend: Node.js & Express.js
 * AI Engine: Google Gemini API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Supported languages catalog
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-US', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', bcp47: 'fr-FR', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', bcp47: 'de-DE', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', bcp47: 'es-ES', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', bcp47: 'ar-SA', dir: 'rtl' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', bcp47: 'zh-CN', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', bcp47: 'ja-JP', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', bcp47: 'ko-KR', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', bcp47: 'pt-BR', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', bcp47: 'ru-RU', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', bcp47: 'it-IT', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', bcp47: 'nl-NL', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', bcp47: 'tr-TR', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', bcp47: 'ur-PK', dir: 'rtl' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', bcp47: 'vi-VN', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', bcp47: 'pl-PL', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN', dir: 'ltr' }
];

const languageCodeMap = new Map(SUPPORTED_LANGUAGES.map(lang => [lang.code, lang]));

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Helper to get language name by code
 */
function getLanguageName(code) {
  if (code === 'auto') return 'Auto Detect';
  const found = languageCodeMap.get(code);
  return found ? found.name : code;
}

/**
 * Translate using Google Gemini AI
 * Tries modern GoogleGenAI SDK with automatic fallback to GoogleGenerativeAI
 */
async function performGeminiTranslation(text, sourceLangCode, targetLangCode) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    const error = new Error('GEMINI_API_KEY is not configured in the backend .env file.');
    error.status = 503;
    error.code = 'API_KEY_MISSING';
    throw error;
  }

  const sourceLangName = sourceLangCode === 'auto' ? 'Auto Detect (Please detect source language)' : getLanguageName(sourceLangCode);
  const targetLangName = getLanguageName(targetLangCode);

  const prompt = `You are a high-precision, context-aware multilingual translation AI.
Translate the following input text accurately into ${targetLangName}.

Source language: ${sourceLangName}
Target language: ${targetLangName}

Strict Translation Rules:
1. Preserve original tone, idioms, nuances, technical terms, and punctuation.
2. Return ONLY a valid JSON object with the following schema:
{
  "translation": "The exact translated text",
  "detectedLanguage": "The full name of the detected source language (e.g. English, French, Hindi)",
  "detectedLanguageCode": "The 2-letter ISO language code if detected, or null"
}
3. Never include conversational text, notes, or markdown outside the JSON.
4. If source language was already provided as "${sourceLangName}", set detectedLanguage to "${sourceLangName}".

Input text to translate:
"""
${text}
"""`;

  // Candidate models in order of current availability and speed
  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash'
  ].filter(Boolean);

  // De-duplicate candidate models
  const modelsToTry = [...new Set(candidateModels)];

  let lastError = null;

  for (const modelName of modelsToTry) {
    // Attempt 1: Using modern @google/genai SDK
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
      });

      const rawOutput = response.text || (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text);
      if (rawOutput) {
        const parsed = parseGeminiResponse(rawOutput, sourceLangCode, targetLangCode);
        return { ...parsed, modelUsed: modelName };
      }
    } catch (err) {
      console.warn(`[SDK @google/genai] Model ${modelName} notice:`, err.message || err);
      lastError = err;
    }

    // Attempt 2: Using direct Google Gemini REST endpoint (ultra-reliable fallback)
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const restResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (restResponse.ok) {
        const restData = await restResponse.json();
        const candidateText = restData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = parseGeminiResponse(candidateText, sourceLangCode, targetLangCode);
          return { ...parsed, modelUsed: modelName };
        }
      } else {
        const errorDetails = await restResponse.json().catch(() => ({}));
        console.warn(`[REST Fallback] Model ${modelName} returned ${restResponse.status}:`, errorDetails.error?.message || restResponse.statusText);
      }
    } catch (err) {
      console.warn(`[REST Fallback] Model ${modelName} fetch error:`, err.message);
      lastError = err;
    }

    // Attempt 3: Using @google/generative-ai SDK
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawOutput = response.text();

      if (rawOutput) {
        const parsed = parseGeminiResponse(rawOutput, sourceLangCode, targetLangCode);
        return { ...parsed, modelUsed: modelName };
      }
    } catch (err) {
      lastError = err;
    }
  }

  // If all models failed
  const error = new Error(lastError ? lastError.message : 'Translation request to Gemini failed.');
  error.status = 502;
  error.originalError = lastError;
  throw error;
}

/**
 * Safely parse JSON from Gemini's response
 */
function parseGeminiResponse(rawText, sourceLangCode, targetLangCode) {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    const parsed = JSON.parse(cleaned);

    if (parsed.translation && typeof parsed.translation === 'string') {
      return {
        translatedText: parsed.translation.trim(),
        detectedSourceLanguage: parsed.detectedLanguage || (sourceLangCode !== 'auto' ? getLanguageName(sourceLangCode) : null),
        detectedLanguageCode: parsed.detectedLanguageCode || (sourceLangCode !== 'auto' ? sourceLangCode : null)
      };
    }
  } catch (e) {
    // Fallback: If not valid JSON, treat the entire cleaned output as the translation
  }

  return {
    translatedText: cleaned,
    detectedSourceLanguage: sourceLangCode !== 'auto' ? getLanguageName(sourceLangCode) : null,
    detectedLanguageCode: sourceLangCode !== 'auto' ? sourceLangCode : null
  };
}

// ==========================================
// API ROUTES
// ==========================================

/**
 * GET /api/health
 * Server health check and configuration status
 */
app.get('/api/health', (req, res) => {
  const apiKeyConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  res.json({
    status: 'ok',
    service: 'LinguaAI Translation Platform',
    version: '1.0.0',
    apiKeyConfigured,
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/languages
 * Retrieve list of all supported languages
 */
app.get('/api/languages', (req, res) => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES
  });
});

/**
 * POST /api/translate
 * Main translation endpoint
 */
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang } = req.body;

    // 1. Validate text presence
    if (text === undefined || text === null || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'The "text" field is required and must be a string.'
      });
    }

    const trimmedText = text.trim();

    // 2. Prevent empty text requests
    if (trimmedText.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Please enter text to translate. Empty input is not permitted.'
      });
    }

    // 3. Length validation (up to 5,000 characters)
    const MAX_CHARS = 5000;
    if (trimmedText.length > MAX_CHARS) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Input exceeds the maximum limit of ${MAX_CHARS.toLocaleString()} characters (provided: ${trimmedText.length.toLocaleString()} characters).`
      });
    }

    // 4. Validate target language
    if (!targetLang || typeof targetLang !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'The "targetLang" field is required.'
      });
    }

    if (targetLang === 'auto') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Target language cannot be "auto". Please select a specific destination language.'
      });
    }

    if (!languageCodeMap.has(targetLang)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Unsupported target language code: "${targetLang}".`
      });
    }

    // 5. Validate source language
    if (sourceLang !== 'auto' && !languageCodeMap.has(sourceLang)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Unsupported source language code: "${sourceLang}".`
      });
    }

    // 6. Identity shortcut: if source and target are the same and not auto
    if (sourceLang === targetLang && sourceLang !== 'auto') {
      return res.json({
        success: true,
        sourceText: trimmedText,
        translatedText: trimmedText,
        sourceLang,
        targetLang,
        detectedSourceLanguage: getLanguageName(sourceLang),
        detectedLanguageCode: sourceLang,
        modelUsed: 'identity-passthrough',
        characterCount: trimmedText.length,
        timestamp: new Date().toISOString()
      });
    }

    // 7. Perform AI translation via Gemini
    const result = await performGeminiTranslation(trimmedText, sourceLang, targetLang);

    return res.json({
      success: true,
      sourceText: trimmedText,
      translatedText: result.translatedText,
      sourceLang,
      targetLang,
      detectedSourceLanguage: result.detectedSourceLanguage,
      detectedLanguageCode: result.detectedLanguageCode,
      modelUsed: result.modelUsed,
      characterCount: trimmedText.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error.message);

    // Missing API key error
    if (error.code === 'API_KEY_MISSING' || error.status === 503) {
      return res.status(503).json({
        success: false,
        error: 'API Configuration Required',
        message: 'Google Gemini API key is missing. Please add your GEMINI_API_KEY to the .env file in the project root and restart the server.',
        configured: false
      });
    }

    // Gemini API error handling
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      error: 'Translation Failed',
      message: error.message || 'An unexpected error occurred while processing translation with Gemini AI.'
    });
  }
});

// Fallback for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.path} does not exist.`
  });
});

// Root route: Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 LinguaAI Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ${path.join(__dirname, 'public')}`);
  console.log(`🔑 Gemini API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No (set GEMINI_API_KEY in .env)'}`);
  console.log('========================================================');
});
