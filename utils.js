// utils.js

/**
 * Fetches the transcript for the current video using the Innertube API logic
 * (similar to youtube-transcript-plus).
 * @param {string} videoId
 * @returns {Promise<string>} The transcript text.
 */
async function getTranscript(videoId) {
    try {
        // 1. Fetch the video page to get the API Key
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const html = await response.text();

        // 2. Extract Innertube API Key
        const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) ||
            html.match(/INNERTUBE_API_KEY\\":\\"([^\\"]+)\\"/);

        if (!apiKeyMatch) {
            throw new Error('Could not find Innertube API Key');
        }
        const apiKey = apiKeyMatch[1];

        // 3. Call Innertube player API to get caption tracks
        const playerResponse = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                context: {
                    client: {
                        clientName: 'ANDROID',
                        clientVersion: '19.09.37'
                    }
                },
                videoId: videoId
            })
        });

        if (!playerResponse.ok) {
            throw new Error('Failed to fetch player data');
        }

        const playerJson = await playerResponse.json();

        const tracklist = playerJson.captions?.playerCaptionsTracklistRenderer ||
            playerJson.playerCaptionsTracklistRenderer;

        const tracks = tracklist?.captionTracks;

        if (!tracks || tracks.length === 0) {
            throw new Error('No captions found for this video');
        }

        // Prefer English
        const track = tracks.find(t => t.languageCode === 'en') || tracks[0];

        // 4. Fetch the transcript XML
        const transcriptUrl = track.baseUrl;
        const transcriptResponse = await fetch(transcriptUrl);
        const transcriptText = await transcriptResponse.text();

        // 5. Parse XML to text
        const cleanText = transcriptText
            .replace(/<text.+?>/g, ' ')
            .replace(/<\/text>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

        return cleanText;

    } catch (error) {
        console.error('Error fetching transcript:', error);
        throw error;
    }
}

/**
 * Summarizes the text using Anthropic API.
 * @param {string} text
 * @param {string} apiKey
 * @returns {Promise<string>} The summary.
 */
async function summarizeText(text, apiKey) {
    const prompt = `You are world class at insightfully summarising youtube videos. These summaries should provide a clear and engaging insights in the video. It should be clear. 
Keep maximum token length. Avoid being abstract. Be precise. 
*Don't say speaker, this video discusses and all. Tell the name. Make it humane for readers*
This is how I want the response to be: 
* Emphasize key points with emojis and bold text to add visual interest and clearly distinguish different sections of the summary.
* Organize content in a way that makes the summary easy to digest, using bullet points or brief paragraphs under flexible headings tailored to the video's content.
* The headings has to start with emoji 
The below headings are optional and these are just examples. Be flexible. To give you examples on categories of video for structuring the summary, So treat them as examples and come up with your own thing
Product Reviews
* Optional Headings: 📦 Features, 👍 Pros, 👎 Cons, 🔍 Comparison, 💰 Price, 🙋‍♂️ Personal Experience, 🎯 Recommendation.
Cooking Videos
* Optional Headings: 🥘 Ingredients, 📝 How to Cook, 🍽 Final Presentation.
Vlogs
* Optional Headings: 🌟 Place, Main Events, 💭 Personal Insights, 🚀 Unique Experiences, 💌 Key Messages.
Educational Videos
* Optional Headings: 📚 Main Topic, 📊 Important Facts, 🧠 Concept Explanations, 🖼 Visual Aids, 📝 Summary.
Tutorials
* Optional Headings: 🎯 Objective, 🛠 Step-by-Step Instructions, 📋 Materials, ✅ Tips for Success, ⚠️ Common Mistakes.
Gaming Videos
* Optional Headings: 🎮 Game Played, 🕹 Strategy, 🌟 Highlights, 💬 Commentary, 🎉 Experience.
Tech Reviews
* Optional Headings: 💻 Technical Specifications, 🎨 Design and Usability, ⚡ Performance, 💸 Price Comparison, 🏆 Verdict.
Documentary/Investigative
* Optional Headings: 🎥 Main Topic, 🧐 Background, 🔍 Key Findings, 🗣 Interviews, 📌 Conclusion.
Fitness and Health
* Optional Headings: 💪 Exercise Routines, 🌟 Benefits, 📊 Difficulty Level, 🎯 Target Audience, 🛡 Safety.
Travel Videos
* Optional Headings: ✈️ Destinations, 🏞 Attractions, 🍜 Cultures and Cuisines, 🧳 Travel Tips, ❤️ Personal Experiences.
Productivity
* Optional Headings: 🚀 Techniques, 📈 Efficiency Tools, ⏱ Time Management, 🎯 Goal Setting.
Entrepreneurship Teaching
* Optional Headings: 💼 Business Strategies, 🌱 Growth Tactics, 💡 Startup Insights, 🤝 Networking.
Insightful Advice
* Optional Headings: 💭 Life Lessons, 🌟 Personal Growth, 🔑 Key Principles, 🛣 Path to Success.


Flexible Summary Structure:

For videos that do not fit into conventional categories (Product Reviews, Cooking Videos, etc.), adopt a versatile approach that best captures the video's essence

Adaptive Content Strategy:

* Use flexible headings that best match the video’s content, avoiding limitations imposed by fixed categories.
* Ensure each section adds value to the summary, offering clear, informative insights into the video’s content and significance.
* Highlight engaging elements to draw in the reader, such as surprising facts, emotional moments, or key discoveries.
Summary Tips:
* Exclude non-essential sections, such as purely musical interludes without significant action or content.
* Base summaries on the video transcript and content without incorporating external information, ensuring accuracy and relevance.
* Prioritize clarity and engagement, using structured formatting to make the summary accessible and appealing to a broad audience.

Transcript:
${text.substring(0, 30000)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to summarize');
    }

    const data = await response.json();
    return data.content[0].text;
}

/**
 * Helper to get video ID from URL
 */
function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}
