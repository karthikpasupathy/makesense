// db-helper.js
// Helper functions for saving summaries to InstantDB

// Save summary to InstantDB
async function saveSummaryToDB(videoData) {
    try {
        // Import InstantDB (loaded via CDN in content script)
        if (typeof init === 'undefined') {
            console.error('InstantDB not loaded');
            return false;
        }

        const db = init({ appId: INSTANTDB_APP_ID });

        const summaryData = {
            videoId: videoData.videoId,
            videoTitle: videoData.videoTitle,
            videoUrl: videoData.videoUrl,
            thumbnailUrl: videoData.thumbnailUrl,
            summary: videoData.summary,
            createdAt: Date.now(),
            model: OPENROUTER_MODEL
        };

        await db.transact([
            db.tx.summaries[db.id()].update(summaryData)
        ]);

        console.log('Summary saved to InstantDB');
        return true;
    } catch (error) {
        console.error('Error saving to InstantDB:', error);
        return false;
    }
}

// Get video metadata from YouTube page
function getVideoMetadata() {
    const videoId = getVideoId();
    const videoTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 'Unknown Title';
    const videoUrl = window.location.href;
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

    return {
        videoId,
        videoTitle,
        videoUrl,
        thumbnailUrl
    };
}
