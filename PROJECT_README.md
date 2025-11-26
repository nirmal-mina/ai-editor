# ✨ AI Editor

A professional, AI-assisted text editor built with React, TypeScript, XState, and ProseMirror. Features a beautiful, responsive UI with dark/light theme support and intelligent content generation.

![AI Editor](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![XState](https://img.shields.io/badge/XState-Latest-green)
![ProseMirror](https://img.shields.io/badge/ProseMirror-Latest-orange)

## 🎯 Features

### Core Functionality
- **AI-Powered Writing**: Click "Continue Writing" to let AI intelligently extend your content
- **Rich Text Editing**: Professional editor powered by ProseMirror
- **State Management**: Robust state handling with XState state machines
- **Real-time Statistics**: Track words, characters, sentences, paragraphs, and reading time

### UI/UX Excellence
- **Dark/Light Theme**: Beautiful theme switcher with smooth transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Polished micro-interactions and transitions
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + Enter`: Continue writing with AI
  - `Ctrl/Cmd + Z`: Undo
  - `Ctrl/Cmd + Shift + Z`: Redo

### Advanced Features
- **Export Functionality**: Save your work as a text file
- **Error Handling**: Graceful error notifications with retry capability
- **Loading States**: Visual feedback during AI generation
- **Document Statistics**: Real-time analytics panel
- **Content Validation**: Smart button states based on content

## 🏗️ Architecture

### State Management (XState)
The application uses XState to manage three distinct states:
- **Idle**: Ready for user input
- **Generating**: AI is creating content
- **Error**: Error occurred with recovery options

### Editor (ProseMirror)
- Schema-based document model
- History plugin for undo/redo
- Custom keymap bindings
- Real-time content synchronization

### AI Service
- Contextual content generation
- Topic-aware continuations
- Simulated realistic AI behavior
- Error handling and retry logic

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📁 Project Structure

```
ai-editor/
├── src/
│   ├── components/          # React components
│   │   ├── EditorComponent.tsx    # ProseMirror editor wrapper
│   │   ├── Toolbar.tsx            # Action buttons and controls
│   │   ├── StatsPanel.tsx         # Document statistics
│   │   ├── ThemeToggle.tsx        # Dark/light mode switcher
│   │   └── ErrorNotification.tsx  # Error display
│   ├── machines/            # XState state machines
│   │   └── editorMachine.ts       # Editor state logic
│   ├── services/            # Business logic
│   │   └── aiService.ts           # AI content generation
│   ├── App.tsx              # Main application component
│   ├── App.css              # Global styles and theming
│   ├── index.css            # Base CSS reset
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#6366f1)
- **Accent**: Purple (#8b5cf6)
- **Background**: Adaptive light/dark
- **Text**: High contrast for accessibility

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 700-900 weight
- **Body**: 400-600 weight

### Spacing
- Consistent 4px/8px grid system
- Generous padding for touch targets
- Balanced whitespace

## 🧪 Technical Implementation

### React Best Practices
- Functional components with hooks
- Proper TypeScript typing
- Effect cleanup and dependency arrays
- Memoization where appropriate

### XState Integration
- Type-safe events and context
- Guard conditions for state transitions
- Clear separation of concerns
- Predictable state flow

### ProseMirror Features
- Custom schema configuration
- Plugin system integration
- Transaction-based updates
- Bidirectional data flow

### Performance Optimizations
- Lazy loading where possible
- Debounced statistics calculation
- Efficient re-rendering
- CSS transitions over JavaScript

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Quality
- ESLint configuration for React and TypeScript
- Strict TypeScript mode
- Consistent code formatting
- Component-level CSS organization

## 📝 Usage Examples

### Basic Writing Flow
1. Start typing in the editor
2. Press `Ctrl+Enter` or click "Continue Writing"
3. AI analyzes your content and generates a continuation
4. Review and edit the generated content
5. Export when finished

### Theme Switching
Click the theme toggle in the header to switch between light and dark modes. Preference is saved to localStorage.

### Document Management
- Use the reset button to clear all content (with confirmation)
- Export button saves your work as a `.txt` file
- Real-time statistics update as you type

## 🎓 Learning Points

### React Patterns
- Component composition
- Custom hooks potential
- Context vs props
- State lifting

### XState Concepts
- Finite state machines
- State transitions
- Event handling
- Guard conditions

### ProseMirror Mastery
- Document model
- Transaction system
- Plugin architecture
- View updates

## 🚀 Future Enhancements

Potential features for expansion:
- [ ] Multiple AI models/providers
- [ ] Rich text formatting toolbar
- [ ] Collaborative editing
- [ ] Version history
- [ ] Cloud save/sync
- [ ] Templates library
- [ ] Custom AI prompts
- [ ] Export to multiple formats (PDF, Markdown, HTML)
- [ ] Voice input
- [ ] Grammar checking

## 🤝 Contributing

This is a showcase project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own applications.

## 🙏 Acknowledgments

- Built for Chronicle Frontend Engineer Task
- Powered by React, TypeScript, XState, and ProseMirror
- Inspired by modern text editors and AI writing assistants

---

**Built with ❤️ using AI assistance and deep technical understanding**
