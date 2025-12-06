// content.js

let currentVideoId = null;

function createWidget() {
    const container = document.createElement('div');
    container.id = 'yt-summary-widget';
    container.innerHTML = `
    <div class="yts-header">
      <div class="yts-brand">
        <img src="${chrome.runtime.getURL('icon.png')}" alt="Makesense Logo" class="yts-logo">
        <span class="yts-brand-name">Makesense</span>
      </div>
      <div style="flex-grow: 1;"></div>
      <button id="yts-history-btn" class="yts-icon-btn" title="View History">
        <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
      </button>
      <button id="yts-regenerate-btn" class="yts-icon-btn" title="Regenerate Summary" style="display: none;">
        <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
      </button>
      <button id="yts-copy-btn" class="yts-icon-btn" title="Copy Summary" style="display: none;">
        <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
      </button>
    </div>
    
    <div id="yts-content-area">
      <div id="yts-summary-text" class="yts-content" style="display: none;"></div>
      
      <div id="yts-controls">
        <button id="yts-summarize-btn" class="yts-btn">
          <span>Summarize Video</span>
          <svg height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        </button>
      </div>

      <div id="yts-api-input-container" style="display: none; margin-top: 10px;">
        <input type="password" id="yts-api-key" class="yts-input" placeholder="Enter OpenRouter API Key">
        <button id="yts-save-key-btn" class="yts-btn" style="background-color: #065fd4;">Save Key</button>
        <p class="yts-error" id="yts-key-error" style="display: none;"></p>
      </div>

      <div id="yts-loading" style="display: none;">
        <div class="yts-spinner"></div>
        <span>Fetching transcript & summarizing...</span>
      </div>
      
      <div id="yts-error-msg" class="yts-error" style="display: none;"></div>
    </div>
  `;
    return container;
}

let isInjecting = false;

async function injectWidget() {
    const videoId = getVideoId();
    if (!videoId || videoId === currentVideoId || isInjecting) return;

    isInjecting = true;

    // Remove ALL existing widgets (in case of duplicates)
    const existingWidgets = document.querySelectorAll('#yt-summary-widget');
    existingWidgets.forEach(widget => widget.remove());

    currentVideoId = videoId;

    // Wait for the secondary column to appear
    const secondaryColumn = await waitForElement('#secondary');
    if (!secondaryColumn) {
        isInjecting = false;
        return;
    }

    const widget = createWidget();
    secondaryColumn.insertBefore(widget, secondaryColumn.firstChild);

    setupEventListeners();
    isInjecting = false;
}

function setupEventListeners() {
    const summarizeBtn = document.getElementById('yts-summarize-btn');
    const saveKeyBtn = document.getElementById('yts-save-key-btn');
    const copyBtn = document.getElementById('yts-copy-btn');
    const regenerateBtn = document.getElementById('yts-regenerate-btn');
    const historyBtn = document.getElementById('yts-history-btn');

    summarizeBtn.addEventListener('click', handleSummarize);
    saveKeyBtn.addEventListener('click', handleSaveKey);
    copyBtn.addEventListener('click', handleCopy);
    regenerateBtn.addEventListener('click', handleSummarize); // Regenerate just calls summarize again
    historyBtn.addEventListener('click', handleHistory);
}

async function handleSummarize() {
    const apiKey = await getApiKey();
    if (!apiKey) {
        document.getElementById('yts-summarize-btn').style.display = 'none';
        document.getElementById('yts-api-input-container').style.display = 'block';
        return;
    }

    startLoading();

    try {
        const videoId = getVideoId();
        const transcript = await getTranscript(videoId);
        const summary = await summarizeText(transcript, apiKey);
        showSummary(summary);
    } catch (error) {
        showError(error.message);
    } finally {
        stopLoading();
    }
}

async function handleSaveKey() {
    const keyInput = document.getElementById('yts-api-key');
    const key = keyInput.value.trim();

    if (!key) {
        showKeyError('Please enter a valid API key');
        return;
    }

    await chrome.storage.local.set({ 'openrouter_api_key': key });

    document.getElementById('yts-api-input-container').style.display = 'none';
    handleSummarize(); // Retry summarization
}

function handleCopy() {
    const summaryText = document.getElementById('yts-summary-text').innerText;
    navigator.clipboard.writeText(summaryText).then(() => {
        // Optional: Show a "Copied!" tooltip
        const btn = document.getElementById('yts-copy-btn');
        const originalColor = btn.style.color;
        btn.style.color = '#4caf50'; // Green
        setTimeout(() => btn.style.color = originalColor, 2000);
    });
}

function handleHistory() {
    // Open history page in new tab
    chrome.runtime.sendMessage({ action: 'openHistory' });
}

// Helpers
function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function getApiKey() {
    return new Promise(resolve => {
        chrome.storage.local.get(['openrouter_api_key'], result => {
            // Return stored key or the one from secrets.js
            resolve(result.openrouter_api_key || OPENROUTER_API_KEY);
        });
    });
}

function startLoading() {
    document.getElementById('yts-summarize-btn').style.display = 'none';
    document.getElementById('yts-loading').style.display = 'block';
    document.getElementById('yts-error-msg').style.display = 'none';
}

function stopLoading() {
    document.getElementById('yts-loading').style.display = 'none';
}

function showSummary(text) {
    const summaryDiv = document.getElementById('yts-summary-text');

    // Better Markdown parsing
    const formattedText = parseMarkdown(text);

    summaryDiv.innerHTML = formattedText;
    summaryDiv.style.display = 'block';
    document.getElementById('yts-copy-btn').style.display = 'block';
    document.getElementById('yts-regenerate-btn').style.display = 'block';
    document.getElementById('yts-summarize-btn').style.display = 'none'; // Hide button after summary

    // Save to InstantDB
    saveSummaryToInstantDB(text);
}

// Save summary to InstantDB via background script (to avoid CORS issues)
async function saveSummaryToInstantDB(summary) {
    try {
        console.log('Attempting to save summary to InstantDB...');

        if (typeof INSTANTDB_APP_ID === 'undefined' || !INSTANTDB_APP_ID || INSTANTDB_APP_ID === 'your-instantdb-app-id-here') {
            console.warn('InstantDB App ID not configured. Skipping save.');
            return;
        }

        // Get video metadata
        const videoId = getVideoId();
        const videoTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 'Unknown Title';
        const videoUrl = window.location.href;
        const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

        const summaryData = {
            videoId,
            videoTitle,
            videoUrl,
            thumbnailUrl,
            summary,
            createdAt: Date.now(),
            model: OPENROUTER_MODEL || 'unknown'
        };

        console.log('Saving summary via background script...');
        console.log('Summary data:', summaryData);

        // Send to background script to avoid CORS issues
        const response = await chrome.runtime.sendMessage({
            action: 'saveSummary',
            data: summaryData
        });

        if (response.success) {
            console.log('✅ Summary saved to InstantDB successfully!');
            console.log('Result:', response.result);
        } else {
            throw new Error(response.error);
        }
    } catch (error) {
        console.error('❌ Error saving to InstantDB:', error);
        console.error('Error details:', error.message, error.stack);
    }
}

// Load InstantDB SDK is no longer needed - we use dynamic import

function parseMarkdown(text) {
    let html = text;

    // Headers (e.g., ### Header) -> Increase sizes: ### -> h3, ## -> h3, # -> h2
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');

    // Bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic (*text*)
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Unordered Lists (* item or - item)
    // 1. Wrap list items in <li>
    html = html.replace(/^\s*[\-\*] (.*$)/gim, '<li>$1</li>');

    // 2. Wrap groups of <li> in <ul>
    const lines = html.split('\n');
    let inList = false;
    let newLines = [];

    for (let line of lines) {
        if (line.match(/^\s*<li>/)) {
            if (!inList) {
                newLines.push('<ul>');
                inList = true;
            }
            newLines.push(line);
        } else {
            if (inList) {
                newLines.push('</ul>');
                inList = false;
            }
            newLines.push(line);
        }
    }
    if (inList) newLines.push('</ul>');

    html = newLines.join('\n');

    // Convert double newlines to paragraph breaks, single newlines to <br>
    html = html.replace(/\n\n+/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraph tags
    html = '<p>' + html + '</p>';

    // Cleanup: Remove <p> tags around block elements
    html = html.replace(/<p>(<h[23]>)/g, '$1');
    html = html.replace(/(<\/h[23]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');

    // Remove empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');

    // Cleanup <br> before and after block elements
    html = html.replace(/<br>\s*(<h[23]>)/g, '$1');
    html = html.replace(/(<\/h[23]>)\s*<br>/g, '$1');
    html = html.replace(/<br>\s*(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)\s*<br>/g, '$1');
    html = html.replace(/<br>\s*(<\/p>)/g, '$1');
    html = html.replace(/(<p>)\s*<br>/g, '$1');

    return html;
}

function showError(msg) {
    const errorDiv = document.getElementById('yts-error-msg');
    errorDiv.innerText = msg;
    errorDiv.style.display = 'block';
    document.getElementById('yts-summarize-btn').style.display = 'block';
}

function showKeyError(msg) {
    const errorDiv = document.getElementById('yts-key-error');
    errorDiv.innerText = msg;
    errorDiv.style.display = 'block';
}

// Initialize
// Handle SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        if (url.includes('/watch')) {
            currentVideoId = null; // Force re-injection
            injectWidget();
        }
    }
}).observe(document, { subtree: true, childList: true });

// Initial check
if (location.href.includes('/watch')) {
    injectWidget();
}
