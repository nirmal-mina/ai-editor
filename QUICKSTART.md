# 🚀 Quick Start Guide - AI Text Editor with Gemini

## ⚡ Get Running in 3 Minutes

### Step 1: Install Dependencies (30 seconds)
```bash
npm install
```

### Step 2: Configure API Key (1 minute)

1. Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create `.env` file in the project root:
   ```bash
   # Copy the example file
   cp .env.example .env
   ```
3. Open `.env` and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

### Step 3: Start the App (10 seconds)
```bash
npm run dev
```

**That's it!** Open http://localhost:5173/ and start writing! 🎉

---

## 🎯 Quick Test

1. Type some text in the editor:
   ```
   Artificial intelligence is transforming how we write.
   ```

2. Press `Ctrl+Enter` (or click "Continue Writing")

3. Watch as Gemini AI generates a natural continuation! ✨

---

## 📋 What You Get

✅ **Google Gemini 1.5 Flash** - Fast, intelligent text generation  
✅ **Premium UI/UX** - Glassmorphism, animations, dual themes  
✅ **ProseMirror Editor** - Professional text editing  
✅ **XState Machine** - Robust state management  
✅ **Real-time Stats** - Word count, reading time, etc.  
✅ **Keyboard Shortcuts** - `Ctrl+Enter`, `Ctrl+Z`, etc.  
✅ **Error Handling** - Retry logic, clear error messages  
✅ **Responsive Design** - Mobile, tablet, desktop  

---

## 🎨 Try These Features

### Theme Switching
Click the sun/moon icon in the top right to toggle between light and dark themes with smooth animations.

### Statistics Panel
Watch the stats panel on the right update in real-time as you type with animated counters.

### Keyboard Shortcuts
- `Ctrl+Enter` / `Cmd+Enter` - Generate AI continuation
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo

### Export Your Work
Click the download icon to save your text as a `.txt` file.

---

## 🔧 Troubleshooting

### "API key not configured"
- Make sure `.env` file exists in the project root
- Check that `VITE_GEMINI_API_KEY` is set with your actual key
- Restart the dev server after creating `.env`

### Port already in use
If port 5173 is taken, Vite will automatically use the next available port (5174, 5175, etc.).

### Build fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Next Steps

- **Read the Full Docs**: Check out `README.md` for architecture details
- **Setup Guide**: See `GEMINI_SETUP.md` for advanced configuration
- **Implementation Summary**: Review `IMPLEMENTATION_SUMMARY.md` for technical details

---

## 💡 Pro Tips

1. **Start with short text** - The AI works best when you give it some context (at least 1-2 sentences)
2. **Use Ctrl+Enter** - It's much faster than clicking the button
3. **Undo is your friend** - Don't like the AI's suggestion? Just press `Ctrl+Z`
4. **Try different topics** - The AI adapts to technical, creative, or general content
5. **Watch the stats** - See your writing progress in real-time

---

## 🆘 Need Help?

- **Console Messages**: Open browser DevTools (F12) to see initialization status
- **Network Tab**: Check if API requests are going through
- **Error Messages**: The app shows clear error messages with specific solutions
- **Documentation**: All features are documented in `README.md`

---

## 🎉 Enjoy Writing!

You now have a production-ready AI text editor powered by Google's latest Gemini model. 

**Happy writing!** ✍️
