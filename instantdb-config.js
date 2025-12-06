// instantdb-config.js
// InstantDB Configuration

// This file is loaded after the InstantDB SDK
// The 'init' function comes from the SDK loaded via CDN

// Get InstantDB instance
function getDB() {
    if (typeof init === 'undefined') {
        console.error('InstantDB SDK not loaded');
        return null;
    }
    return init({ appId: INSTANTDB_APP_ID });
}
