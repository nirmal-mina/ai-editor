# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173`

---

## 📖 User Guide

### Writing with AI

1. **Start Writing**: Click in the editor and begin typing
2. **Continue with AI**: Press `Ctrl+Enter` or click the "Continue Writing" button
3. **Wait for Generation**: The AI will analyze your text and generate a continuation
4. **Edit as Needed**: The generated content is fully editable

### Features Overview

#### Editor
- Type naturally - the editor feels like any modern text editor
- Use `Ctrl+Z` to undo and `Ctrl+Shift+Z` to redo
- The editor autofocuses when you click anywhere in the box

#### Statistics Panel
- **Words**: Total word count
- **Characters**: Total character count (including spaces)
- **Sentences**: Number of complete sentences
- **Paragraphs**: Number of paragraphs
- **Reading Time**: Estimated time to read (based on 200 words/minute)

#### Toolbar Actions
- **Continue Writing** (⚡): Generate AI continuation of your text
  - Keyboard shortcut: `Ctrl+Enter` (or `Cmd+Enter` on Mac)
  - Only enabled when you have content
- **Export** (⬇️): Download your content as a text file
- **Reset** (🔄): Clear all content (with confirmation)

#### Theme Toggle
- Click the sun/moon button in the header to switch themes
- Your preference is saved automatically
- Supports system theme detection

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Continue writing with AI |
| `Ctrl+Z` | Undo last change |
| `Ctrl+Shift+Z` | Redo last undone change |
| `Ctrl+Y` | Redo (alternative) |

---

## 🎨 Customization

### Changing AI Behavior

Edit `src/services/aiService.ts` to:
- Add new topic templates
- Adjust continuation styles
- Modify generation delay
- Change error probability

### Styling

Edit `src/App.css` to customize:
- Color scheme (light/dark themes)
- Typography
- Spacing
- Animations

### Adding Features

The modular architecture makes it easy to add:
- New toolbar buttons
- Additional statistics
- Custom keyboard shortcuts
- Export formats

---

## 🐛 Troubleshooting

### Development Server Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build Errors
```bash
# Check TypeScript errors
npm run build
```

### Port Already in Use
```bash
# Use a different port
npm run dev -- --port 3000
```

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear browser cache and reload

---

## 📦 Production Build

### Build for Production
```bash
npm run build
```
Output will be in `dist/` directory

### Preview Production Build
```bash
npm run preview
```

### Deploy
The `dist/` folder can be deployed to:
- Vercel (recommended)
- Netlify
- GitHub Pages
- Any static hosting service

---

## 🔧 Configuration

### TypeScript
- Config: `tsconfig.json`
- Strict mode enabled
- Path aliases configured

### Vite
- Config: `vite.config.ts`
- Fast refresh enabled
- Optimized build settings

### ESLint
- Config: `eslint.config.js`
- React hooks rules
- TypeScript rules

---

## 📚 Learning Resources

### Technologies Used
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [XState Documentation](https://xstate.js.org/docs/)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)

### Code Examples
- Check `src/components/` for React patterns
- Check `src/machines/` for XState patterns
- Check `src/services/` for business logic

---

## 🤝 Support

### Getting Help
1. Check this guide
2. Read the Implementation Guide
3. Review the code comments
4. Check the README

### Reporting Issues
When reporting issues, include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Console errors (if any)

---

## ✨ Tips & Tricks

### For Best Results
- Write at least a sentence before using AI generation
- The AI works better with context
- Try different writing styles and topics
- Use the statistics to track your progress

### Performance Tips
- Close other browser tabs for best performance
- Use latest browser version
- Clear browser cache if sluggish
- Check browser console for errors

### Development Tips
- Use React DevTools for debugging
- Install XState DevTools for state visualization
- Use browser's responsive mode for mobile testing
- Enable source maps for debugging

---

**Enjoy writing with AI! 🚀**
