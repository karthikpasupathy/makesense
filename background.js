// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log('YouTube Summarizer (Local) installed.');
});

// We can add more logic here if we need to handle specific browser events
// or message passing between content scripts and other parts of the extension.
