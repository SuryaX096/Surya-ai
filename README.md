# 🚀 SuryaAI — Personal AI Productivity Dashboard

A comprehensive, all-in-one productivity command center built with **React + Vite**, powered by **Google Gemini AI**. Designed for students, developers, and hustlers who want to master DSA, manage projects, track habits, and crush their goals.

![SuryaAI Dashboard](https://img.shields.io/badge/Built%20With-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

### 🤖 AI-Powered
- **AI Chat** — Chat with Gemini AI for coding help, project planning, career advice
- **AI Quiz** — Auto-generated MCQ quizzes on CS topics (Sorting, OOP, OS, DBMS, etc.)
- **AI Study Notes** — Generate structured study notes on any technical topic

### 📊 Productivity Suite
- **Dashboard** — Central overview with live stats, quick actions, workspace summary
- **Task Manager** — Full CRUD with priority filtering (High/Medium/Low)
- **Focus Timer** — Pomodoro-style timer with session logging & audio alerts
- **Habit Tracker** — Daily logging with streak counters & 30-day heatmap
- **Goal Tracker** — Set and track progress on your goals
- **Analytics** — Visual charts for tasks, habits, focus time, and DSA stats

### 📚 Learning & Development
- **DSA Tracker** — Log coding problems with Topic/Difficulty/Platform/Link/Notes
- **Code Snippets** — Save reusable code blocks with language tagging & copy
- **Bookmarks** — Categorized learning resources with favicon support

### 🏗️ Projects & Finance
- **Kanban Board** — Drag-and-drop project management with labels
- **Trading Journal** — P&L tracking, win/loss stats, trade logging

### ⚙️ System
- **Settings** — API key management, JSON data import/export, storage reset
- **🎙️ Voice Commands** — Control the entire app with voice (Ctrl+Shift+V)

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| **React 18** | UI Components |
| **Vite** | Build tool & dev server |
| **Gemini 2.0 Flash** | AI chat, quiz, notes generation |
| **localStorage** | Zero-backend data persistence |
| **Web Speech API** | Voice commands & text-to-speech |
| **CSS Variables** | Dark-mode design system |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Gemini API Key (free at [Google AI Studio](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/surya-ai.git
cd surya-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Setup AI Features
1. Go to **Settings** page
2. Enter your **Gemini API Key**
3. Start chatting, taking quizzes, and generating notes!

---

## 📱 Screenshots

### Dashboard
- Real-time stats (Tasks, DSA Problems, Notes, Focus Hours)
- Quick action cards for instant navigation
- Daily motivational quotes

### AI Chat
- Context-aware assistant tuned for CS students
- Suggestion chips for common queries
- Full conversation history

### Kanban Board
- Drag-and-drop cards between columns
- Labels (frontend, backend, bug, feature, design, urgent)
- Full CRUD with modal editor

---

## 🎙️ Voice Commands

Press the **purple mic button** or `Ctrl+Shift+V`:

| Command | What it does |
|---------|-------------|
| "Open tasks" | Navigate to Tasks page |
| "Ask AI about binary trees" | AI answers via voice |
| "Add task submit assignment" | Creates a new task |
| "What's my progress" | Reads your stats aloud |
| "Start focus timer" | Opens Pomodoro timer |
| "Take quiz" | Opens AI Quiz page |

---

## 🔒 Privacy

- **100% client-side** — No backend server, no database
- **All data in localStorage** — Stays on your device
- **API key stored locally** — Never shared with third parties
- **No tracking, no analytics** — Your data is yours

---

## 📦 Data Management

- **Export**: Settings → Export creates a JSON backup of all your data
- **Import**: Settings → Import restores from a backup file
- **Reset**: Settings → Danger Zone → Reset clears all data

---

## 🗂️ Project Structure

```
surya-ai/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   ├── index.css             # Design system (2600+ lines)
│   ├── components/
│   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   ├── Header.jsx        # Page header
│   │   └── VoiceAssistant.jsx # Voice command system
│   └── pages/
│       ├── Dashboard.jsx     # Central overview
│       ├── Chat.jsx          # AI Chat (Gemini)
│       ├── Tasks.jsx         # Task manager
│       ├── Notes.jsx         # Quick notes
│       ├── Goals.jsx         # Goal tracker
│       ├── Focus.jsx         # Pomodoro timer
│       ├── Habits.jsx        # Habit tracker + heatmap
│       ├── Analytics.jsx     # Visual analytics
│       ├── DSATracker.jsx    # DSA problem logger
│       ├── Kanban.jsx        # Project board
│       ├── Snippets.jsx      # Code snippets
│       ├── Bookmarks.jsx     # Learning resources
│       ├── Quiz.jsx          # AI Quiz generator
│       ├── StudyNotes.jsx    # AI Study Notes
│       ├── Trading.jsx       # Trading journal
│       └── Settings.jsx      # App settings
```

---

## 🚧 Roadmap

- [ ] Deploy to Vercel/Netlify
- [ ] Add React Router for URL-based navigation
- [ ] Cloud sync with Firebase/Supabase
- [ ] Mobile PWA support
- [ ] AI code review feature
- [ ] Spaced repetition for DSA problems

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use, modify, and share.

---

## 👨‍💻 Author

**Surya** — 2nd Year CSE BTech Student  
Building products, mastering DSA, crushing placements. 💪

---

*Built with ❤️ and ☕ using React + Gemini AI*
