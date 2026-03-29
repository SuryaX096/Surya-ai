/**
 * Dashboard Page
 * Overview with stats, quick actions, daily motivator, and recent activity
 */
import { useState, useEffect } from 'react'

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Consistency is the key to mastery. Show up every day.", author: "SuryaAI" },
  { text: "The best time to start was yesterday. The next best time is now.", author: "Unknown" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Every expert was once a beginner. Keep grinding, bhai! 💪", author: "SuryaAI" },
  { text: "Your placement is going to be legendary if you stay consistent.", author: "SuryaAI" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
]

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    tasks: 0, completed: 0, notes: 0, goals: 0,
    focusSessions: 0, focusMinutes: 0,
    habits: 0, dsaProblems: 0, kanbanCards: 0,
    snippets: 0, bookmarks: 0, trades: 0,
  })

  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('surya-ai-tasks') || '[]')
    const notes = JSON.parse(localStorage.getItem('surya-ai-notes') || '[]')
    const goals = JSON.parse(localStorage.getItem('surya-ai-goals') || '[]')
    const focusSessions = parseInt(localStorage.getItem('surya-ai-focus-count') || '0')
    const focusMinutes = parseInt(localStorage.getItem('surya-ai-focus-minutes') || '0')
    const habits = JSON.parse(localStorage.getItem('surya-ai-habits') || '[]')
    const dsaProblems = JSON.parse(localStorage.getItem('surya-ai-dsa-problems') || '[]')
    const kanbanCards = JSON.parse(localStorage.getItem('surya-ai-kanban') || '[]')
    const snippets = JSON.parse(localStorage.getItem('surya-ai-snippets') || '[]')
    const bookmarks = JSON.parse(localStorage.getItem('surya-ai-bookmarks') || '[]')
    const trades = JSON.parse(localStorage.getItem('surya-ai-trades') || '[]')

    setStats({
      tasks: tasks.length,
      completed: tasks.filter(t => t.done).length,
      notes: notes.length,
      goals: goals.length,
      focusSessions,
      focusMinutes,
      habits: habits.length,
      dsaProblems: dsaProblems.length,
      kanbanCards: kanbanCards.length,
      snippets: snippets.length,
      bookmarks: bookmarks.length,
      trades: trades.length,
    })
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const formatFocus = (mins) => {
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const quickActions = [
    { icon: '🤖', label: 'Ask AI', desc: 'Chat with Gemini', page: 'chat' },
    { icon: '✅', label: 'Add Task', desc: 'Create a new task', page: 'tasks' },
    { icon: '💻', label: 'Log DSA', desc: 'Track a problem', page: 'dsa' },
    { icon: '⏱️', label: 'Start Focus', desc: 'Pomodoro session', page: 'focus' },
    { icon: '🧪', label: 'Take Quiz', desc: 'AI-powered quiz', page: 'quiz' },
    { icon: '📄', label: 'Study Notes', desc: 'AI note generator', page: 'studynotes' },
  ]

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          fontWeight: 800, 
          marginBottom: '4px',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {greeting()}, Surya 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Here's your productivity at a glance. Let's crush it today!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="card stat-card purple">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.tasks}</div>
          <div className="stat-label">Tasks ({stats.completed} done)</div>
        </div>
        <div className="card stat-card green">
          <div className="stat-icon">💻</div>
          <div className="stat-value">{stats.dsaProblems}</div>
          <div className="stat-label">DSA Problems</div>
        </div>
        <div className="card stat-card blue">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.notes}</div>
          <div className="stat-label">Notes</div>
        </div>
        <div className="card stat-card warm">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{stats.focusSessions}</div>
          <div className="stat-label">Focus ({formatFocus(stats.focusMinutes)})</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', 
          marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          ⚡ Quick Actions
        </h3>
        <div className="dashboard-grid">
          {quickActions.map(action => (
            <div
              key={action.page}
              className="card"
              id={`quick-${action.page}`}
              style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
              onClick={() => onNavigate(action.page)}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', flexShrink: 0,
              }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {action.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {action.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          📦 Your Workspace
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          {[
            { label: 'Goals', value: stats.goals, icon: '🎯', page: 'goals' },
            { label: 'Habits', value: stats.habits, icon: '🔥', page: 'habits' },
            { label: 'Kanban Cards', value: stats.kanbanCards, icon: '📋', page: 'kanban' },
            { label: 'Snippets', value: stats.snippets, icon: '💡', page: 'snippets' },
            { label: 'Bookmarks', value: stats.bookmarks, icon: '🔗', page: 'bookmarks' },
            { label: 'Trades', value: stats.trades, icon: '📉', page: 'trading' },
          ].map(item => (
            <div key={item.page} className="card" style={{
              padding: '14px 16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
            }} onClick={() => onNavigate(item.page)}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{item.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="card" style={{ 
        padding: '24px', 
        background: 'rgba(139, 92, 246, 0.05)',
        borderColor: 'rgba(139, 92, 246, 0.15)',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
          💡 DAILY MOTIVATION
        </div>
        <p style={{ 
          fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)',
          fontStyle: 'italic', lineHeight: 1.6,
        }}>
          "{quote.text}"
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          — {quote.author}
        </p>
      </div>
    </div>
  )
}

export default Dashboard
