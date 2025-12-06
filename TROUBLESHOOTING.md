# Troubleshooting InstantDB Integration

## Check if summaries are being saved:

1. **Open YouTube** and go to any video
2. **Open Browser Console** (F12 → Console tab)
3. **Click "Summarize Video"**
4. **Watch for these console messages:**
   - ✅ "Attempting to save summary to InstantDB..."
   - ✅ "InstantDB initialized"
   - ✅ "Saving summary data: {...}"
   - ✅ "✅ Summary saved to InstantDB successfully!"

## Common Issues:

### Issue 1: "InstantDB App ID not configured"
**Solution:** Add your App ID to `secrets.js`:
```javascript
const INSTANTDB_APP_ID = 'your-actual-app-id-here';
```

### Issue 2: No console messages at all
**Solution:** 
- Make sure you've reloaded the extension
- Hard refresh the YouTube page (Ctrl + Shift + R)

### Issue 3: History page shows "No Summaries Yet"
**Checklist:**
1. ✅ INSTANTDB_APP_ID is set in secrets.js
2. ✅ You've summarized at least one video
3. ✅ Console shows "✅ Summary saved successfully"
4. ✅ You've refreshed the history page

### Issue 4: Error messages in console
**Check:**
- Is your InstantDB App ID correct?
- Is your InstantDB app active in the dashboard?
- Are you connected to the internet?

## Testing Steps:

1. **Set up InstantDB:**
   - Go to https://instantdb.com/dash
   - Create a new app
   - Copy the App ID
   - Add to `secrets.js`

2. **Reload extension:**
   - Go to chrome://extensions/
   - Click reload on Makesense

3. **Test saving:**
   - Go to any YouTube video
   - Open console (F12)
   - Click "Summarize Video"
   - Watch console for success messages

4. **View history:**
   - Click extension icon OR history button in widget
   - Should see your summary!

## Still not working?

Check the browser console for detailed error messages and verify:
- InstantDB SDK is loading (check Network tab)
- No CORS errors
- App ID is valid (check InstantDB dashboard)
