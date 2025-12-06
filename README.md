# Makesense - YouTube Video Summarizer

A Chrome extension that summarizes YouTube videos using AI models via OpenRouter.

## Setup

### 1. API Key Configuration

Create a `secrets.js` file in the root directory with your OpenRouter API key and preferred model:

```javascript
// secrets.js
const OPENROUTER_API_KEY = 'your-openrouter-api-key-here';
const OPENROUTER_MODEL = 'anthropic/claude-3.5-haiku';
```

**Get your OpenRouter API key:** [https://openrouter.ai/keys](https://openrouter.ai/keys)

**Note:** The `secrets.js` file is already in `.gitignore` to prevent accidentally committing your API key.

### 2. Choose Your Model

OpenRouter gives you access to many AI models. Edit `OPENROUTER_MODEL` in `secrets.js` to use any model:

**Free Models:**
- `google/gemini-2.0-flash-exp:free` - Google's latest, completely free
- `meta-llama/llama-3.1-8b-instruct:free` - Fast and free

**Cheap Models (recommended):**
- `anthropic/claude-3.5-haiku` - Fast, cheap, excellent quality (~$0.001 per summary)
- `openai/gpt-4o-mini` - Very cheap GPT-4 (~$0.0015 per summary)
- `google/gemini-flash-1.5` - Fast and affordable

**Premium Models:**
- `anthropic/claude-3.5-sonnet` - Most capable Claude model
- `openai/gpt-4o` - Latest GPT-4

See all models at: [https://openrouter.ai/models](https://openrouter.ai/models)

### 3. InstantDB Setup (Optional - for Summary History)

To save and view your summary history:

1. Create a free account at [https://instantdb.com](https://instantdb.com)
2. Create a new app and copy your App ID
3. Add it to `secrets.js`:
```javascript
const INSTANTDB_APP_ID = 'your-app-id-here';
```

See [INSTANTDB_SETUP.md](INSTANTDB_SETUP.md) for detailed instructions.

### 4. Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `makesense` directory

### 5. Usage

**Summarizing Videos:**
1. Navigate to any YouTube video
2. The Makesense widget will appear in the right sidebar
3. Click "Summarize Video" to generate a summary
4. You can copy or regenerate the summary as needed

**Viewing History:**
1. Click the Makesense extension icon in your browser toolbar
2. View all your saved summaries in a beautiful grid layout
3. Click on any summary to watch the video or view the full summary

## Features

- **Flexible Model Selection**: Use any model from OpenRouter - from free to premium
- **Smart Summaries**: Adapts summary structure based on video type
- **Summary History**: Save and view all your summaries in a beautiful interface (with InstantDB)
- **Extended Support**: Handles videos up to ~100,000 characters of transcript
- **Complete Summaries**: Generates up to 4096 tokens to avoid truncation
- **Cost Effective**: Switch between models based on your budget
- **Local Storage**: Optionally save your API key for convenience

## Token Limits

- **Input**: Up to 100,000 characters of transcript (~30-45 minutes of video)
- **Output**: Up to 4096 tokens for complete summaries without truncation

## Privacy

- Your API key is stored locally in your browser
- Summaries are stored in your personal InstantDB instance (optional)
- Requests go directly to OpenRouter (no third-party servers)
- The extension only activates on YouTube video pages
