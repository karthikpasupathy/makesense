// background.js

// Import the InstantDB UMD bundle
importScripts('instantdb.umd.js');

// Import secrets
importScripts('secrets.js');

// Get the InstantDB functions from the global instant object
const { init, id } = self.instant;

let db = null;

// Initialize the database
function initializeDB() {
    if (db) return db;

    if (!INSTANTDB_APP_ID || INSTANTDB_APP_ID === 'your-instantdb-app-id-here') {
        console.error('InstantDB App ID not configured');
        return null;
    }

    try {
        db = init({ appId: INSTANTDB_APP_ID });
        console.log('InstantDB initialized successfully with App ID:', INSTANTDB_APP_ID);
        return db;
    } catch (error) {
        console.error('Failed to initialize InstantDB:', error);
        return null;
    }
}

// Initialize on startup
initializeDB();

chrome.runtime.onInstalled.addListener(() => {
    console.log('Makesense extension installed.');
    initializeDB();
});

// Open history page when extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('history.html')
    });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request.action);

    if (request.action === 'openHistory') {
        chrome.tabs.create({
            url: chrome.runtime.getURL('history.html')
        });
        return false;
    }

    // Handle InstantDB save request
    if (request.action === 'saveSummary') {
        handleSaveSummary(request.data)
            .then(result => {
                console.log('Save successful:', result);
                sendResponse({ success: true, result });
            })
            .catch(error => {
                console.error('Save failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Required for async sendResponse
    }

    // Handle InstantDB query request
    if (request.action === 'querySummaries') {
        handleQuerySummaries()
            .then(summaries => {
                console.log('Query successful, found:', summaries.length);
                sendResponse({ success: true, summaries });
            })
            .catch(error => {
                console.error('Query failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Required for async sendResponse
    }

    // Handle InstantDB delete request
    if (request.action === 'deleteSummary') {
        handleDeleteSummary(request.id)
            .then(result => {
                console.log('Delete successful:', result);
                sendResponse({ success: true, result });
            })
            .catch(error => {
                console.error('Delete failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Required for async sendResponse
    }

    return false;
});

// Save summary to InstantDB using SDK
async function handleSaveSummary(summaryData) {
    const database = initializeDB();
    if (!database) {
        throw new Error('Database not initialized');
    }

    const result = await database.transact(
        database.tx.summaries[id()].update(summaryData)
    );

    return result;
}

// Query summaries from InstantDB
async function handleQuerySummaries() {
    const database = initializeDB();
    if (!database) {
        throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
        let resolved = false;

        // Use subscribeQuery to get data once
        const unsubscribe = database.subscribeQuery({ summaries: {} }, (resp) => {
            if (resolved) return;

            if (resp.error) {
                resolved = true;
                unsubscribe();
                reject(resp.error);
                return;
            }

            resolved = true;
            unsubscribe();
            resolve(resp.data.summaries || []);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                unsubscribe();
                reject(new Error('Query timed out'));
            }
        }, 10000);
    });
}

// Delete summary from InstantDB
async function handleDeleteSummary(summaryId) {
    const database = initializeDB();
    if (!database) {
        throw new Error('Database not initialized');
    }

    const result = await database.transact(
        database.tx.summaries[summaryId].delete()
    );

    return result;
}
