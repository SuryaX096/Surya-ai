import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import VoiceAssistant from './components/VoiceAssistant'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Goals from './pages/Goals'
import Focus from './pages/Focus'
import Habits from './pages/Habits'
import Analytics from './pages/Analytics'
import DSATracker from './pages/DSATracker'
import Kanban from './pages/Kanban'
import Snippets from './pages/Snippets'
import Bookmarks from './pages/Bookmarks'
import Quiz from './pages/Quiz'
import StudyNotes from './pages/StudyNotes'
import Trading from './pages/Trading'
import Settings from './pages/Settings'

// Page config with icons and labels
const PAGES = {
  dashboard: { label: 'Dashboard', icon: '📊', badge: 'Overview' },
  chat: { label: 'AI Chat', icon: '🤖', badge: 'Gemini' },
  tasks: { label: 'Tasks', icon: '✅', badge: 'Productivity' },
  notes: { label: 'Notes', icon: '📝', badge: 'Quick Notes' },
  goals: { label: 'Goals', icon: '🎯', badge: 'Tracker' },
  focus: { label: 'Focus Timer', icon: '⏱️', badge: 'Pomodoro' },
  habits: { label: 'Habits', icon: '🔥', badge: 'Streaks' },
  analytics: { label: 'Analytics', icon: '📈', badge: 'Insights' },
  dsa: { label: 'DSA Tracker', icon: '💻', badge: 'Problems' },
  kanban: { label: 'Kanban Board', icon: '📋', badge: 'Projects' },
  snippets: { label: 'Snippets', icon: '💡', badge: 'Code' },
  bookmarks: { label: 'Bookmarks', icon: '🔗', badge: 'Resources' },
  quiz: { label: 'AI Quiz', icon: '🧪', badge: 'Test' },
  studynotes: { label: 'Study Notes', icon: '📄', badge: 'AI Notes' },
  trading: { label: 'Trading', icon: '📉', badge: 'Journal' },
  settings: { label: 'Settings', icon: '⚙️', badge: 'Config' },
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('surya-ai-key') || '')
  
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('surya-ai-key', apiKey)
    } else {
      localStorage.removeItem('surya-ai-key')
    }
  }, [apiKey])

  const pageConfig = PAGES[activePage]

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />
      case 'chat': return <Chat apiKey={apiKey} onGoToSettings={() => setActivePage('settings')} />
      case 'tasks': return <Tasks />
      case 'notes': return <Notes />
      case 'goals': return <Goals />
      case 'focus': return <Focus />
      case 'habits': return <Habits />
      case 'analytics': return <Analytics />
      case 'dsa': return <DSATracker />
      case 'kanban': return <Kanban />
      case 'snippets': return <Snippets />
      case 'bookmarks': return <Bookmarks />
      case 'quiz': return <Quiz apiKey={apiKey} />
      case 'studynotes': return <StudyNotes apiKey={apiKey} />
      case 'trading': return <Trading />
      case 'settings': return <Settings apiKey={apiKey} setApiKey={setApiKey} />
      default: return <Dashboard onNavigate={setActivePage} />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        pages={PAGES} 
      />
      <div className="main-content">
        <Header 
          title={pageConfig.label} 
          badge={pageConfig.badge}
        />
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
      <VoiceAssistant 
        onNavigate={setActivePage}
        activePage={activePage}
        apiKey={apiKey}
      />
    </div>
  )
}

export default App
