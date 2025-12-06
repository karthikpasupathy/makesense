// history.js
// History page functionality

let summaries = [];

// Load summaries from InstantDB via background script
async function loadSummaries() {
    try {
        console.log('Loading summaries via background script...');

        const response = await chrome.runtime.sendMessage({
            action: 'querySummaries'
        });

        if (!response || !response.success) {
            throw new Error(response?.error || 'Failed to load summaries');
        }

        summaries = response.summaries || [];
        summaries.sort((a, b) => b.createdAt - a.createdAt);
        console.log('Loaded summaries:', summaries.length);
        renderSummaries();

        // Poll for updates every 30 seconds
        setInterval(async () => {
            try {
                const refreshResponse = await chrome.runtime.sendMessage({
                    action: 'querySummaries'
                });
                if (refreshResponse && refreshResponse.success) {
                    summaries = refreshResponse.summaries || [];
                    summaries.sort((a, b) => b.createdAt - a.createdAt);
                    renderSummaries();
                }
            } catch (error) {
                console.error('Error refreshing summaries:', error);
            }
        }, 30000);
    } catch (error) {
        console.error('Error loading summaries:', error);
        showEmptyState();
    }
}

// Render summaries
function renderSummaries() {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    const list = document.getElementById('summaries-list');

    loading.style.display = 'none';

    if (summaries.length === 0) {
        emptyState.style.display = 'flex';
        list.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    list.style.display = 'flex';
    list.innerHTML = '';

    summaries.forEach(summary => {
        const item = createSummaryItem(summary);
        list.appendChild(item);
    });
}

// Create summary item
function createSummaryItem(summary) {
    const item = document.createElement('div');
    item.className = 'summary-item';

    const date = new Date(summary.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Get plain text preview (strip markdown/HTML)
    const plainText = summary.summary
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/[-*]\s/g, '') // Remove list markers
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();

    const summaryPreview = plainText.length > 150
        ? plainText.substring(0, 150) + '...'
        : plainText;

    item.innerHTML = `
        <div class="summary-thumbnail">
            <img src="${summary.thumbnailUrl}" alt="${escapeHtml(summary.videoTitle)}" onerror="this.style.display='none'">
        </div>
        <div class="summary-content">
            <h3 class="summary-title">${escapeHtml(summary.videoTitle)}</h3>
            <div class="summary-meta">
                <span>${formattedDate}</span>
                ${summary.model ? `<span class="dot"></span><span>${escapeHtml(summary.model)}</span>` : ''}
            </div>
            <p class="summary-preview">${escapeHtml(summaryPreview)}</p>
        </div>
        <div class="summary-actions">
            <button class="action-btn play-btn" title="Watch Video" data-url="${escapeHtml(summary.videoUrl)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </button>
            <button class="action-btn delete-btn" title="Delete" data-id="${summary.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    // Click on item to view summary
    item.addEventListener('click', (e) => {
        if (!e.target.closest('.action-btn')) {
            viewSummary(summary.id);
        }
    });

    // Play button click
    const playBtn = item.querySelector('.play-btn');
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = playBtn.dataset.url;
        window.open(url, '_blank');
    });

    // Delete button click
    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = deleteBtn.dataset.id;
        deleteSummary(id);
    });

    return item;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Parse markdown to HTML
function parseMarkdown(text) {
    if (!text) return '';

    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Unordered Lists
    html = html.replace(/^\s*[-*] (.*$)/gim, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
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

    // Paragraphs
    html = html.replace(/\n\n+/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = '<p>' + html + '</p>';

    // Cleanup
    html = html.replace(/<p>(<h[23]>)/g, '$1');
    html = html.replace(/(<\/h[23]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<br>\s*(<h[23]>)/g, '$1');
    html = html.replace(/(<\/h[23]>)\s*<br>/g, '$1');
    html = html.replace(/<br>\s*(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)\s*<br>/g, '$1');
    html = html.replace(/<br>\s*(<\/p>)/g, '$1');
    html = html.replace(/(<p>)\s*<br>/g, '$1');

    return html;
}

// View full summary in modal
function viewSummary(id) {
    const summary = summaries.find(s => s.id === id);
    if (!summary) {
        console.error('Summary not found:', id);
        return;
    }

    const container = document.getElementById('modal-container');

    const date = new Date(summary.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Parse markdown to HTML
    const formattedSummary = parseMarkdown(summary.summary);

    container.innerHTML = `
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2>${escapeHtml(summary.videoTitle)}</h2>
                    <button class="modal-close" id="modal-close-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="modal-meta">
                    <span>${formattedDate}</span>
                    ${summary.model ? `<span>•</span><span>${escapeHtml(summary.model)}</span>` : ''}
                    <span>•</span>
                    <a href="${escapeHtml(summary.videoUrl)}" target="_blank" id="modal-video-link">Watch Video ↗</a>
                </div>
                <div class="modal-body">
                    ${formattedSummary}
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    const overlay = container.querySelector('.modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');
    const modal = container.querySelector('.modal');

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    // Close on button click
    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    // Prevent modal clicks from closing
    modal.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close on Escape key
    document.addEventListener('keydown', handleEscapeKey);
}

// Close modal
function closeModal() {
    const container = document.getElementById('modal-container');
    container.innerHTML = '';
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handle Escape key
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
}

// Delete summary via background script
async function deleteSummary(id) {
    if (!confirm('Delete this summary?')) return;

    try {
        console.log('Deleting summary:', id);

        const response = await chrome.runtime.sendMessage({
            action: 'deleteSummary',
            id: id
        });

        console.log('Delete response:', response);

        if (!response || !response.success) {
            throw new Error(response?.error || 'Failed to delete summary');
        }

        // Remove from local array and re-render
        summaries = summaries.filter(s => s.id !== id);
        renderSummaries();

        console.log('Summary deleted successfully');
    } catch (error) {
        console.error('Error deleting summary:', error);
        alert('Failed to delete summary: ' + error.message);
    }
}

// Clear all summaries
async function clearAll() {
    if (!confirm('Delete all summaries? This cannot be undone.')) return;

    try {
        // Delete all summaries one by one
        for (const s of summaries) {
            await chrome.runtime.sendMessage({
                action: 'deleteSummary',
                id: s.id
            });
        }
        summaries = [];
        renderSummaries();
    } catch (error) {
        console.error('Error clearing summaries:', error);
        alert('Failed to clear summaries');
    }
}

// Show empty state
function showEmptyState() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('empty-state').style.display = 'flex';
    document.getElementById('summaries-list').style.display = 'none';
}

// Event listeners
document.getElementById('refresh-btn').addEventListener('click', () => {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('summaries-list').style.display = 'none';
    loadSummaries();
});

document.getElementById('clear-all-btn').addEventListener('click', clearAll);

// Initialize
loadSummaries();
