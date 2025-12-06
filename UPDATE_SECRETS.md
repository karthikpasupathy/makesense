# IMPORTANT: Update Your secrets.js File

Since `secrets.js` is gitignored (for security), you need to manually update it.

## Steps:

1. Open `d:\Qoder\makesense\secrets.js` in your editor

2. Replace the entire content with:

```javascript
// secrets.js
// This file contains API keys and should be added to .gitignore

// OpenRouter Configuration
const OPENROUTER_API_KEY = 'sk-or-v1-YOUR-KEY-HERE';

// Model name - you can change this to any model available on OpenRouter
// Examples:
// - 'anthropic/claude-3.5-haiku' (fast and cheap)
// - 'google/gemini-2.0-flash-exp:free' (free)
// - 'openai/gpt-4o-mini' (cheap GPT-4)
// - 'meta-llama/llama-3.1-8b-instruct:free' (free)
// - 'anthropic/claude-3.5-sonnet' (most capable)
const OPENROUTER_MODEL = 'anthropic/claude-3.5-haiku';
```

3. Get your OpenRouter API key from: https://openrouter.ai/keys

4. Replace `'sk-or-v1-YOUR-KEY-HERE'` with your actual OpenRouter API key

5. Choose your preferred model and update `OPENROUTER_MODEL` if needed

6. Save the file

7. Reload the extension in Chrome

That's it! You can now use any model from OpenRouter and switch anytime by just changing the model name in secrets.js.
