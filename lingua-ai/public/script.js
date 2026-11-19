/**
 * LinguaAI – Smart Language Translation Platform
 * Frontend Controller & UI Engine
 * CodeAlpha Artificial Intelligence Internship Project
 */

(function () {
  'use strict';

  // ==========================================
  // CONFIGURATION & STATE
  // ==========================================
  const STORAGE_KEY_HISTORY = 'lingua_ai_history_v1';
  const STORAGE_KEY_THEME = 'lingua_ai_theme';
  const MAX_HISTORY_ITEMS = 50;

  let supportedLanguages = [];
  let languageMap = new Map();
  let isTranslating = false;
  let currentlySpeakingUtterance = null;

  // DOM Elements
  const elements = {
    // Header & Status
    apiStatusPill: document.getElementById('apiStatusPill'),
    apiStatusLabel: document.getElementById('apiStatusLabel'),
    apiKeyBanner: document.getElementById('apiKeyBanner'),
    openSetupGuideBtn: document.getElementById('openSetupGuideBtn'),
    historyToggleBtn: document.getElementById('historyToggleBtn'),
    historyCountBadge: document.getElementById('historyCountBadge'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),

    // Source Panel
    sourceLangSelect: document.getElementById('sourceLangSelect'),
    sourcePills: document.getElementById('sourcePills'),
    sourceText: document.getElementById('sourceText'),
    sourceCharCount: document.getElementById('sourceCharCount'),
    detectedBadge: document.getElementById('detectedBadge'),
    detectedText: document.getElementById('detectedText'),
    sourceTtsBtn: document.getElementById('sourceTtsBtn'),
    copySourceBtn: document.getElementById('copySourceBtn'),
    clearSourceBtn: document.getElementById('clearSourceBtn'),

    // Swap
    swapLangBtn: document.getElementById('swapLangBtn'),

    // Target Panel
    targetLangSelect: document.getElementById('targetLangSelect'),
    targetPills: document.getElementById('targetPills'),
    targetText: document.getElementById('targetText'),
    targetCharCount: document.getElementById('targetCharCount'),
    latencyPill: document.getElementById('latencyPill'),
    modelBadge: document.getElementById('modelBadge'),
    modelName: document.getElementById('modelName'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    targetTtsBtn: document.getElementById('targetTtsBtn'),
    copyTargetBtn: document.getElementById('copyTargetBtn'),
    clearTargetBtn: document.getElementById('clearTargetBtn'),

    // Action Bar
    translateBtn: document.getElementById('translateBtn'),
    translateBtnLabel: document.getElementById('translateBtnLabel'),
    btnSpinner: document.getElementById('btnSpinner'),
    clearAllBtn: document.getElementById('clearAllBtn'),

    // History Drawer
    historyDrawer: document.getElementById('historyDrawer'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    historyList: document.getElementById('historyList'),

    // Setup Modal
    setupModal: document.getElementById('setupModal'),
    setupModalOverlay: document.getElementById('setupModalOverlay'),
    closeSetupModalBtn: document.getElementById('closeSetupModalBtn'),
    dismissSetupModalBtn: document.getElementById('dismissSetupModalBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
    updateHistoryBadge();
    await fetchLanguages();
    await checkApiHealth();
  });

  // ==========================================
  // THEME MANAGEMENT (LIGHT / DARK)
  // ==========================================
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    showToast(`Switched to ${newTheme} theme`, 'info');
  }

  // ==========================================
  // API HEALTH & LANGUAGES FETCH
  // ==========================================
  async function checkApiHealth() {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Health check failed');
      const data = await response.json();

      const dot = elements.apiStatusPill.querySelector('.status-dot');
      dot.className = 'status-dot';

      if (data.apiKeyConfigured) {
        dot.classList.add('status-online');
        elements.apiStatusLabel.textContent = `${data.model || 'Gemini AI'} Online`;
        elements.apiKeyBanner.style.display = 'none';
        if (elements.modelName) {
          elements.modelName.textContent = data.model || 'Gemini 2.5 Flash';
        }
      } else {
        dot.classList.add('status-warning');
        elements.apiStatusLabel.textContent = 'API Key Required';
        elements.apiKeyBanner.style.display = 'block';
      }
    } catch (err) {
      const dot = elements.apiStatusPill.querySelector('.status-dot');
      dot.className = 'status-dot status-error';
      elements.apiStatusLabel.textContent = 'Backend Offline';
    }
  }

  async function fetchLanguages() {
    try {
      const response = await fetch('/api/languages');
      if (!response.ok) throw new Error('Failed to load supported languages');
      const data = await response.json();
      supportedLanguages = data.languages || [];

      languageMap.clear();
      supportedLanguages.forEach(lang => languageMap.set(lang.code, lang));

      populateLanguageDropdowns();
    } catch (err) {
      console.error('Could not fetch language list from server:', err);
      showToast('Using local language catalog fallback', 'warning');
      useFallbackLanguages();
    }
  }

  function useFallbackLanguages() {
    supportedLanguages = [
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
      { code: 'ru', name: 'Russian', nativeName: 'Русский', bcp47: 'ru-RU', dir: 'ltr' }
    ];
    supportedLanguages.forEach(lang => languageMap.set(lang.code, lang));
    populateLanguageDropdowns();
  }

  function populateLanguageDropdowns() {
    // Populate Source Select
    elements.sourceLangSelect.innerHTML = '<option value="auto" selected>✨ Auto Detect</option>';
    supportedLanguages.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = `${lang.name} (${lang.nativeName})`;
      elements.sourceLangSelect.appendChild(opt);
    });

    // Populate Target Select
    elements.targetLangSelect.innerHTML = '';
    supportedLanguages.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = `${lang.name} (${lang.nativeName})`;
      // Default target: Hindi (hi)
      if (lang.code === 'hi') {
        opt.selected = true;
      }
      elements.targetLangSelect.appendChild(opt);
    });

    syncPillsWithSelect('source');
    syncPillsWithSelect('target');
  }

  // ==========================================
  // SYNC DROPDOWNS & QUICK PILLS
  // ==========================================
  function syncPillsWithSelect(type) {
    const isSource = type === 'source';
    const select = isSource ? elements.sourceLangSelect : elements.targetLangSelect;
    const pillsContainer = isSource ? elements.sourcePills : elements.targetPills;
    const selectedVal = select.value;

    const pills = pillsContainer.querySelectorAll('.lang-pill');
    let pillFound = false;

    pills.forEach(pill => {
      if (pill.getAttribute('data-lang') === selectedVal) {
        pill.classList.add('active');
        pillFound = true;
      } else {
        pill.classList.remove('active');
      }
    });

    // Update Swap Button availability
    if (elements.sourceLangSelect.value === 'auto') {
      elements.swapLangBtn.setAttribute('disabled', 'true');
      elements.swapLangBtn.title = 'Cannot swap when "Auto Detect" is selected';
    } else {
      elements.swapLangBtn.removeAttribute('disabled');
      elements.swapLangBtn.title = 'Swap source and target languages';
    }

    // Update Text Direction (LTR / RTL)
    updateTextDirection();
  }

  function updateTextDirection() {
    const targetLang = languageMap.get(elements.targetLangSelect.value);
    if (targetLang && targetLang.dir === 'rtl') {
      elements.targetText.setAttribute('dir', 'rtl');
    } else {
      elements.targetText.setAttribute('dir', 'ltr');
    }

    const sourceLang = languageMap.get(elements.sourceLangSelect.value);
    if (sourceLang && sourceLang.dir === 'rtl') {
      elements.sourceText.setAttribute('dir', 'rtl');
    } else {
      elements.sourceText.setAttribute('dir', 'ltr');
    }
  }

  // ==========================================
  // EVENT LISTENERS SETUP
  // ==========================================
  function setupEventListeners() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Source language change
    elements.sourceLangSelect.addEventListener('change', () => {
      syncPillsWithSelect('source');
      elements.detectedBadge.style.display = 'none';
    });

    // Target language change
    elements.targetLangSelect.addEventListener('change', () => {
      syncPillsWithSelect('target');
    });

    // Source pills click
    elements.sourcePills.addEventListener('click', (e) => {
      const pill = e.target.closest('.lang-pill');
      if (!pill) return;
      const langCode = pill.getAttribute('data-lang');
      elements.sourceLangSelect.value = langCode;
      syncPillsWithSelect('source');
      elements.detectedBadge.style.display = 'none';
    });

    // Target pills click
    elements.targetPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.lang-pill');
      if (!pill) return;
      const langCode = pill.getAttribute('data-lang');
      elements.targetLangSelect.value = langCode;
      syncPillsWithSelect('target');
    });

    // Swap Languages Button
    elements.swapLangBtn.addEventListener('click', handleSwapLanguages);

    // Source Textarea input counter
    elements.sourceText.addEventListener('input', () => {
      const count = elements.sourceText.value.length;
      elements.sourceCharCount.textContent = `${count.toLocaleString()} / 5,000`;
      if (count > 5000) {
        elements.sourceCharCount.style.color = 'var(--danger)';
      } else {
        elements.sourceCharCount.style.color = 'var(--text-muted)';
      }
    });

    // Translate Button
    elements.translateBtn.addEventListener('click', handleTranslate);

    // Keyboard Shortcut (Ctrl+Enter / Cmd+Enter)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleTranslate();
      }
      if (e.key === 'Escape') {
        closeHistoryDrawer();
        closeSetupModal();
      }
    });

    // Copy Buttons
    elements.copySourceBtn.addEventListener('click', () => {
      copyToClipboard(elements.sourceText.value, 'Source text copied to clipboard!');
    });

    elements.copyTargetBtn.addEventListener('click', () => {
      copyToClipboard(elements.targetText.textContent, 'Translated text copied to clipboard!');
    });

    // Clear Buttons
    elements.clearSourceBtn.addEventListener('click', () => {
      elements.sourceText.value = '';
      elements.sourceCharCount.textContent = '0 / 5,000';
      elements.detectedBadge.style.display = 'none';
      elements.sourceText.focus();
    });

    elements.clearTargetBtn.addEventListener('click', clearOutputPanel);

    elements.clearAllBtn.addEventListener('click', () => {
      elements.sourceText.value = '';
      elements.sourceCharCount.textContent = '0 / 5,000';
      elements.detectedBadge.style.display = 'none';
      clearOutputPanel();
      showToast('Cleared all panels', 'info');
      elements.sourceText.focus();
    });

    // TTS Buttons
    elements.sourceTtsBtn.addEventListener('click', () => {
      const text = elements.sourceText.value.trim();
      const langCode = elements.sourceLangSelect.value === 'auto' ? 'en' : elements.sourceLangSelect.value;
      speakText(text, langCode, elements.sourceTtsBtn);
    });

    elements.targetTtsBtn.addEventListener('click', () => {
      const text = elements.targetText.textContent.trim();
      const langCode = elements.targetLangSelect.value;
      speakText(text, langCode, elements.targetTtsBtn);
    });

    // Sample Chips
    document.querySelectorAll('.sample-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        elements.sourceText.value = chip.getAttribute('data-sample');
        elements.sourceText.dispatchEvent(new Event('input'));
        elements.sourceText.focus();
      });
    });

    // History Drawer Events
    elements.historyToggleBtn.addEventListener('click', openHistoryDrawer);
    elements.closeDrawerBtn.addEventListener('click', closeHistoryDrawer);
    elements.drawerOverlay.addEventListener('click', closeHistoryDrawer);
    elements.clearHistoryBtn.addEventListener('click', handleClearHistory);

    // Setup Guide Modal
    elements.openSetupGuideBtn.addEventListener('click', openSetupModal);
    elements.closeSetupModalBtn.addEventListener('click', closeSetupModal);
    elements.dismissSetupModalBtn.addEventListener('click', closeSetupModal);
    elements.setupModalOverlay.addEventListener('click', closeSetupModal);
  }

  // ==========================================
  // TRANSLATION DISPATCH & HANDLER
  // ==========================================
  async function handleTranslate() {
    if (isTranslating) return;

    const text = elements.sourceText.value.trim();
    if (!text) {
      showToast('Please enter text to translate', 'warning');
      elements.sourceText.focus();
      return;
    }

    if (text.length > 5000) {
      showToast('Text exceeds the 5,000 character limit', 'error');
      return;
    }

    const sourceLang = elements.sourceLangSelect.value;
    const targetLang = elements.targetLangSelect.value;

    setLoadingState(true);
    const startTime = performance.now();

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang, targetLang })
      });

      const data = await response.json();
      const endTime = performance.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

      if (!response.ok || !data.success) {
        if (response.status === 503 || data.configured === false) {
          openSetupModal();
          throw new Error(data.message || 'Gemini API key is required');
        }
        throw new Error(data.message || 'Translation failed');
      }

      // Display translation
      displayTranslationResult(data, durationSeconds);

      // Save to local history
      saveToHistory({
        sourceText: text,
        translatedText: data.translatedText,
        sourceLang: data.sourceLang,
        targetLang: data.targetLang,
        detectedSourceLanguage: data.detectedSourceLanguage,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('Translation error:', err);
      showToast(err.message, 'error');
      resetOutputToEmpty();
    } finally {
      setLoadingState(false);
    }
  }

  function displayTranslationResult(data, durationSeconds) {
    elements.emptyState.style.display = 'none';
    elements.loadingState.style.display = 'none';
    elements.targetText.style.display = 'block';

    elements.targetText.textContent = data.translatedText;
    elements.targetCharCount.textContent = `${data.translatedText.length.toLocaleString()} characters`;

    if (durationSeconds) {
      elements.latencyPill.textContent = `${durationSeconds}s`;
      elements.latencyPill.style.display = 'inline-block';
    }

    if (data.modelUsed) {
      elements.modelName.textContent = data.modelUsed;
    }

    // Detected language display
    if (data.sourceLang === 'auto' && data.detectedSourceLanguage) {
      elements.detectedText.textContent = `Detected: ${data.detectedSourceLanguage}`;
      elements.detectedBadge.style.display = 'inline-flex';
    } else {
      elements.detectedBadge.style.display = 'none';
    }

    // Enable toolbar buttons
    elements.copyTargetBtn.removeAttribute('disabled');
    elements.clearTargetBtn.removeAttribute('disabled');
    elements.targetTtsBtn.removeAttribute('disabled');

    updateTextDirection();
  }

  function setLoadingState(loading) {
    isTranslating = loading;
    if (loading) {
      elements.translateBtn.setAttribute('disabled', 'true');
      elements.btnSpinner.style.display = 'inline-block';
      elements.translateBtnLabel.textContent = 'Translating...';

      elements.emptyState.style.display = 'none';
      elements.targetText.style.display = 'none';
      elements.loadingState.style.display = 'flex';
      elements.latencyPill.style.display = 'none';
    } else {
      elements.translateBtn.removeAttribute('disabled');
      elements.btnSpinner.style.display = 'none';
      elements.translateBtnLabel.textContent = 'Translate Now';
      elements.loadingState.style.display = 'none';
    }
  }

  function resetOutputToEmpty() {
    elements.targetText.textContent = '';
    elements.targetText.style.display = 'none';
    elements.loadingState.style.display = 'none';
    elements.emptyState.style.display = 'flex';
    elements.targetCharCount.textContent = '0 characters';
    elements.latencyPill.style.display = 'none';
    elements.copyTargetBtn.setAttribute('disabled', 'true');
    elements.clearTargetBtn.setAttribute('disabled', 'true');
    elements.targetTtsBtn.setAttribute('disabled', 'true');
  }

  function clearOutputPanel() {
    resetOutputToEmpty();
    showToast('Output cleared', 'info');
  }

  // ==========================================
  // SWAP LANGUAGES
  // ==========================================
  function handleSwapLanguages() {
    const currentSource = elements.sourceLangSelect.value;
    const currentTarget = elements.targetLangSelect.value;

    if (currentSource === 'auto') {
      showToast('Cannot swap when source is set to "Auto Detect"', 'warning');
      return;
    }

    // Swap dropdowns
    elements.sourceLangSelect.value = currentTarget;
    elements.targetLangSelect.value = currentSource;

    syncPillsWithSelect('source');
    syncPillsWithSelect('target');

    // If target has text, swap text too
    const currentTargetText = elements.targetText.textContent.trim();
    const currentSourceText = elements.sourceText.value.trim();

    if (currentTargetText) {
      elements.sourceText.value = currentTargetText;
      elements.sourceText.dispatchEvent(new Event('input'));
      elements.targetText.textContent = currentSourceText;
      elements.targetCharCount.textContent = `${currentSourceText.length} characters`;
      if (!currentSourceText) {
        resetOutputToEmpty();
      }
    }

    elements.detectedBadge.style.display = 'none';
    showToast('Languages swapped', 'info');
  }

  // ==========================================
  // TEXT-TO-SPEECH (TTS)
  // ==========================================
  function speakText(text, langCode, buttonElement) {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported in this browser.', 'warning');
      return;
    }

    // If currently speaking, stop and reset
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      resetTtsButtons();
      return;
    }

    if (!text) {
      showToast('Nothing to read aloud.', 'warning');
      return;
    }

    const langInfo = languageMap.get(langCode);
    const bcp47 = langInfo ? langInfo.bcp47 : 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v => v.lang === bcp47 || v.lang.startsWith(langCode));
      if (match) {
        utterance.voice = match;
      }
    }

    // Visual wave feedback
    buttonElement.classList.add('speaking');
    const wave = buttonElement.querySelector('.audio-wave');
    const idleIcon = buttonElement.querySelector('.tts-idle-icon') || buttonElement.querySelector('svg');
    if (wave) wave.style.display = 'inline-flex';
    if (idleIcon && wave) idleIcon.style.display = 'none';

    utterance.onend = () => {
      resetTtsButtons();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      resetTtsButtons();
    };

    currentlySpeakingUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function resetTtsButtons() {
    [elements.sourceTtsBtn, elements.targetTtsBtn].forEach(btn => {
      btn.classList.remove('speaking');
      const wave = btn.querySelector('.audio-wave');
      const icon = btn.querySelector('.tts-idle-icon') || btn.querySelector('svg');
      if (wave) wave.style.display = 'none';
      if (icon) icon.style.display = 'inline-block';
    });
    currentlySpeakingUtterance = null;
  }

  // Pre-load voices for browsers that fetch async
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // ==========================================
  // CLIPBOARD COPY
  // ==========================================
  async function copyToClipboard(text, successMessage) {
    if (!text || text.trim() === '') {
      showToast('No text available to copy', 'warning');
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(successMessage, 'success');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showToast('Failed to copy text', 'error');
    }
  }

  // ==========================================
  // TRANSLATION HISTORY
  // ==========================================
  function getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(item) {
    const list = getHistory();
    // Unique ID
    item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    // Add to beginning
    list.unshift(item);
    // Cap at max items
    if (list.length > MAX_HISTORY_ITEMS) {
      list.length = MAX_HISTORY_ITEMS;
    }
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
    updateHistoryBadge();
  }

  function updateHistoryBadge() {
    const list = getHistory();
    elements.historyCountBadge.textContent = list.length;
  }

  function openHistoryDrawer() {
    renderHistoryItems();
    elements.historyDrawer.classList.add('open');
    elements.historyDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeHistoryDrawer() {
    elements.historyDrawer.classList.remove('open');
    elements.historyDrawer.setAttribute('aria-hidden', 'true');
  }

  function renderHistoryItems() {
    const list = getHistory();
    elements.historyList.innerHTML = '';

    if (list.length === 0) {
      elements.historyList.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <p><strong>No history yet</strong></p>
          <p style="font-size: 0.82rem; margin-top: 0.35rem;">Your completed translations will be saved here automatically.</p>
        </div>
      `;
      return;
    }

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-item-card';

      const sourceName = item.detectedSourceLanguage || getLangName(item.sourceLang);
      const targetName = getLangName(item.targetLang);
      const timeStr = formatRelativeTime(item.timestamp);

      card.innerHTML = `
        <div class="history-item-meta">
          <span class="history-lang-pair">${escapeHtml(sourceName)} &rarr; ${escapeHtml(targetName)}</span>
          <span class="history-timestamp">${escapeHtml(timeStr)}</span>
        </div>
        <p class="history-source-snippet" title="${escapeHtml(item.sourceText)}">${escapeHtml(item.sourceText)}</p>
        <p class="history-target-snippet" title="${escapeHtml(item.translatedText)}">${escapeHtml(item.translatedText)}</p>
        <div class="history-item-footer">
          <button type="button" class="history-action-btn reuse-btn" data-id="${item.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 2v6h6"></path>
              <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
              <path d="M21 22v-6h-6"></path>
              <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
            </svg>
            Reuse
          </button>
          <button type="button" class="history-action-btn copy-btn" data-id="${item.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
          <button type="button" class="history-action-btn delete-btn" data-id="${item.id}" title="Delete item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            </svg>
          </button>
        </div>
      `;

      // Event listeners for card buttons
      card.querySelector('.reuse-btn').addEventListener('click', () => {
        elements.sourceText.value = item.sourceText;
        elements.sourceLangSelect.value = item.sourceLang || 'auto';
        elements.targetLangSelect.value = item.targetLang;
        syncPillsWithSelect('source');
        syncPillsWithSelect('target');
        elements.sourceText.dispatchEvent(new Event('input'));

        displayTranslationResult({
          translatedText: item.translatedText,
          sourceLang: item.sourceLang,
          targetLang: item.targetLang,
          detectedSourceLanguage: item.detectedSourceLanguage
        }, null);

        closeHistoryDrawer();
        showToast('Translation restored from history', 'info');
      });

      card.querySelector('.copy-btn').addEventListener('click', () => {
        copyToClipboard(item.translatedText, 'Copied translation to clipboard!');
      });

      card.querySelector('.delete-btn').addEventListener('click', () => {
        deleteHistoryItem(item.id);
      });

      elements.historyList.appendChild(card);
    });
  }

  function deleteHistoryItem(id) {
    let list = getHistory();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
    updateHistoryBadge();
    renderHistoryItems();
    showToast('Item deleted from history', 'info');
  }

  function handleClearHistory() {
    const list = getHistory();
    if (list.length === 0) return;
    if (confirm('Are you sure you want to clear your entire translation history?')) {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      updateHistoryBadge();
      renderHistoryItems();
      showToast('All translation history cleared', 'info');
    }
  }

  // ==========================================
  // SETUP MODAL
  // ==========================================
  function openSetupModal() {
    elements.setupModal.style.display = 'flex';
    elements.setupModal.setAttribute('aria-hidden', 'false');
  }

  function closeSetupModal() {
    elements.setupModal.style.display = 'none';
    elements.setupModal.setAttribute('aria-hidden', 'true');
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 3200);
  }

  // ==========================================
  // UTILITY HELPERS
  // ==========================================
  function getLangName(code) {
    if (code === 'auto') return 'Auto Detect';
    const found = languageMap.get(code);
    return found ? found.name : code;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatRelativeTime(dateString) {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  }

})();
