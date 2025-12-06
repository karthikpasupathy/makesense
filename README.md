# Makesense - YouTube Video Summarizer

A Chrome extension that summarizes YouTube videos using AI models via OpenRouter. It stores your summary history securely using InstantDB.

## Features

- **Flexible Model Selection**: Use any model from OpenRouter - from free to premium.
- **Smart Summaries**: Adapts summary structure based on video type.
- **Summary History**: Save and view all your summaries in a beautiful interface.
- **Extended Support**: Handles videos up to ~100,000 characters of transcript.
- **Complete Summaries**: Generates up to 4096 tokens to avoid truncation.
- **Privacy Focused**: Your API keys are stored locally.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/makesense.git
cd makesense
```

### 2. API Key Configuration

1. Copy the template file to create your secrets file:
   ```bash
   cp secrets.js.template secrets.js
   ```

2. Open `secrets.js` and configure your keys:

   - **OpenRouter API Key**: Get one from [OpenRouter Keys](https://openrouter.ai/keys).
   - **InstantDB App ID**: (Optional) Get one from [InstantDB](https://instantdb.com) to enable history features.

   ```javascript
   // secrets.js
   const OPENROUTER_API_KEY = 'your-openrouter-api-key-here';
   const OPENROUTER_MODEL = 'anthropic/claude-3.5-haiku';
   const INSTANTDB_APP_ID = 'your-instantdb-app-id-here';
   ```

   **Note:** `secrets.js` is gitignored to protect your API keys. Never commit this file.

### 3. Choose Your Model

You can change the `OPENROUTER_MODEL` in `secrets.js` to any model supported by OpenRouter.

**Recommended Models:**
- `anthropic/claude-3.5-haiku` (Fast, cheap, high quality)
- `google/gemini-2.0-flash-exp:free` (Free)
- `meta-llama/llama-3.1-8b-instruct:free` (Free)
- `openai/gpt-4o-mini` (Very cheap GPT-4 class)

See all available models at [OpenRouter Models](https://openrouter.ai/models).

### 4. Install the Extension

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `makesense` directory.

## Usage

### Summarizing Videos
1. Navigate to any YouTube video.
2. The Makesense widget will appear in the right sidebar.
3. Click **Summarize Video**.
4. The summary will be generated and automatically saved to your history.

### Viewing History
1. Click the Makesense extension icon in your browser toolbar.
2. View all your saved summaries in a grid layout.
3. Click on any summary to view the details or watch the video.

## Development

If you make changes to the code:
1. Go to `chrome://extensions/`.
2. Find **Makesense**.
3. Click the reload icon (circular arrow).
4. Refresh the YouTube page to see your changes.

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for help with common issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
