/**
 * Habits Page
 * Daily habit tracker with streaks, heatmap calendar, and progress tracking
 */
import { useState, useEffect } from 'react'

const DEFAULT_HABITS = [
  { id: 1, name: 'DSA Practice', icon: '💻', color: '#8b5cf6' },
  { id: 2, name: 'Workout', icon: '🏋️', color: '#10b981' },
  { id: 3, name: 'Reading', icon: '📚', color: '#3b82f6' },
  { id: 4, name: 'No Junk Food', icon: '🥗', color: '#f59e0b' },
]

function Habits() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('surya-ai-habits')
    return saved ? JSON.parse(saved) : DEFAULT_HABITS
  })

  const [completions, setCompletions] = useState(() => {
    const saved = localStorage.getItem('surya-ai-habit-completions')
    return saved ? JSON.parse(saved) : {}
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitIcon, setNewHabitIcon] = useState('✨')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    localStorage.setItem('surya-ai-habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('surya-ai-habit-completions', JSON.stringify(completions))
  }, [completions])

  const toggleHabit = (habitId) => {
    const key = `${habitId}-${today}`
    setCompletions(prev => {
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = true
      }
      return next
    })
  }

  const isCompleted = (habitId) => {
    return !!completions[`${habitId}-${today}`]
  }

  const getStreak = (habitId) => {
    let streak = 0
    const date = new Date()
    const MAX_DAYS = 365
    // Check if today is done, if not start from yesterday
    if (!completions[`${habitId}-${date.toISOString().split('T')[0]}`]) {
      date.setDate(date.getDate() - 1)
    }
    while (streak < MAX_DAYS) {
      const key = `${habitId}-${date.toISOString().split('T')[0]}`
      if (completions[key]) {
        streak++
        date.setDate(date.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  const getTotalCompletions = (habitId) => {
    return Object.keys(completions).filter(k => k.startsWith(`${habitId}-`)).length
  }

  const addHabit = () => {
    if (!newHabitName.trim()) return
    const habit = {
      id: Date.now(),
      name: newHabitName.trim(),
      icon: newHabitIcon || '✨',
      color: ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 6)],
    }
    setHabits(prev => [...prev, habit])
    setNewHabitName('')
    setNewHabitIcon('✨')
    setShowAddModal(false)
  }

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    // Clean up completions
    setCompletions(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(key => {
        if (key.startsWith(`${id}-`)) delete next[key]
      })
      return next
    })
  }

  // Generate last 30 days for heatmap
  const getLast30Days = () => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }

  const getHeatmapIntensity = (date) => {
    let count = 0
    habits.forEach(h => {
      if (completions[`${h.id}-${date}`]) count++
    })
    if (count === 0) return 0
    return Math.min(count / habits.length, 1)
  }

  const todayCompleted = habits.filter(h => isCompleted(h.id)).length
  const todayTotal = habits.length

  const iconOptions = ['✨', '💻', '🏋️', '📚', '🥗', '🧘', '✍️', '🎵', '🏃', '💤', '💊', '🎯', '🧠', '📝', '🌅']

  return (
    <div>
      {/* Today's Progress */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            📅 Today's Progress: <strong style={{ color: 'var(--text-primary)' }}>{todayCompleted}/{todayTotal}</strong>
          </p>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + New Habit
        </button>
      </div>

      {/* Habit Cards */}
      <div className="habits-grid">
        {habits.map(habit => {
          const completed = isCompleted(habit.id)
          const streak = getStreak(habit.id)
          const total = getTotalCompletions(habit.id)

          return (
            <div
              key={habit.id}
              className={`card habit-card ${completed ? 'completed' : ''}`}
              onClick={() => toggleHabit(habit.id)}
              style={{ '--habit-color': habit.color }}
            >
              <div className="habit-card-top">
                <div className="habit-icon-circle" style={{ background: `${habit.color}20`, color: habit.color }}>
                  {habit.icon}
                </div>
                <button
                  className="habit-delete"
                  onClick={(e) => { e.stopPropagation(); deleteHabit(habit.id) }}
                >
                  ×
                </button>
              </div>
              <div className="habit-name">{habit.name}</div>
              <div className="habit-stats-row">
                <span>🔥 {streak} day streak</span>
                <span>📊 {total} total</span>
              </div>
              <div className={`habit-check ${completed ? 'checked' : ''}`}>
                {completed ? '✓ Done' : 'Tap to complete'}
              </div>
            </div>
          )
        })}
      </div>

      {/* 30-Day Heatmap */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🗓️ 30-Day Activity
        </h3>
        <div className="heatmap-container">
          {getLast30Days().map(date => {
            const intensity = getHeatmapIntensity(date)
            const isToday = date === today
            return (
              <div
                key={date}
                className={`heatmap-cell ${isToday ? 'today' : ''}`}
                style={{
                  background: intensity > 0
                    ? `rgba(139, 92, 246, ${0.15 + intensity * 0.7})`
                    : 'rgba(255,255,255,0.03)',
                }}
                title={`${date}: ${Math.round(intensity * 100)}% complete`}
              >
                <span className="heatmap-day">
                  {new Date(date + 'T00:00:00').getDate()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>✨ New Habit</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewHabitIcon(icon)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    border: newHabitIcon === icon ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                    background: newHabitIcon === icon ? 'rgba(139,92,246,0.15)' : 'transparent',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Habit name (e.g., Morning Run)"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="add-btn" onClick={addHabit}>Create Habit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Habits
