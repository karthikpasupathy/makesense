# Setting Up InstantDB for Makesense

## Step 1: Create an InstantDB Account

1. Go to [https://instantdb.com](https://instantdb.com)
2. Sign up for a free account
3. Create a new app

## Step 2: Get Your App ID

1. Go to your [InstantDB Dashboard](https://instantdb.com/dash)
2. Click on your app
3. Copy the **App ID** (it looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## Step 3: Update Your secrets.js

Open `secrets.js` in the project root and add your InstantDB App ID:

```javascript
// InstantDB Configuration
const INSTANTDB_APP_ID = 'your-app-id-here'; // Paste your App ID here
```

## Step 4: Reload the Extension

1. Go to `chrome://extensions/`
2. Find **Makesense**
3. Click the reload button (🔄)

## Step 5: Test It Out!

1. Go to any YouTube video
2. Click "Summarize Video"
3. After the summary is generated, it will automatically be saved to InstantDB
4. Click the Makesense extension icon to view your summary history!

## Features

- **Automatic Saving**: Every summary is automatically saved with:
  - Video title
  - Thumbnail
  - Video URL
  - Summary text
  - Model used
  - Timestamp

- **Beautiful History Page**: View all your summaries in a neat grid layout
- **Quick Actions**: Watch video, view full summary, or delete
- **Persistent Storage**: All summaries are stored in InstantDB cloud

## Troubleshooting

If summaries aren't saving:
1. Check that `INSTANTDB_APP_ID` is correctly set in `secrets.js`
2. Open browser console (F12) and check for errors
3. Make sure you're connected to the internet
4. Verify your InstantDB app is active in the dashboard

Enjoy your summary history! 🎉
