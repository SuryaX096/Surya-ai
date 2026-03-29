/**
 * Focus Timer Page
 * Pomodoro timer with work/break modes, circular progress, and session tracking
 */
import { useState, useEffect, useRef, useCallback } from 'react'

const MODES = {
  work: { label: 'Focus', duration: 25 * 60, color: 'var(--accent-purple)' },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: 'var(--accent-green)' },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: 'var(--accent-blue)' },
}

function Focus() {
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(() => {
    return parseInt(localStorage.getItem('surya-ai-focus-count') || '0')
  })
  const [totalMinutes, setTotalMinutes] = useState(() => {
    return parseInt(localStorage.getItem('surya-ai-focus-minutes') || '0')
  })

  const intervalRef = useRef(null)

  const currentMode = MODES[mode]
  const totalDuration = currentMode.duration
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100

  // Persist stats
  useEffect(() => {
    localStorage.setItem('surya-ai-focus-count', sessions.toString())
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('surya-ai-focus-minutes', totalMinutes.toString())
  }, [totalMinutes])

  // Play a notification sound (using Web Audio API)
  const playNotification = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {
      // Audio not available, skip
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            playNotification()

            // If a work session completed
            if (mode === 'work') {
              setSessions(s => s + 1)
              setTotalMinutes(m => m + Math.round(MODES.work.duration / 60))
            }

            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode, playNotification])

  // Update document title with timer
  useEffect(() => {
    if (isRunning) {
      const mins = Math.floor(timeLeft / 60)
      const secs = timeLeft % 60
      document.title = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} — ${currentMode.label} | SuryaAI`
    } else {
      document.title = 'SuryaAI — Personal AI Dashboard'
    }
    return () => {
      document.title = 'SuryaAI — Personal AI Dashboard'
    }
  }, [timeLeft, isRunning, currentMode.label])

  const switchMode = (newMode) => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setMode(newMode)
    setTimeLeft(MODES[newMode].duration)
  }

  const toggleTimer = () => {
    if (timeLeft === 0) {
      // Reset timer first
      setTimeLeft(currentMode.duration)
    }
    setIsRunning(prev => !prev)
  }

  const resetTimer = () => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setTimeLeft(currentMode.duration)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatHours = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
  }

  return (
    <div className="pomodoro-container">
      {/* Timer Circle */}
      <div
        className="pomodoro-circle"
        style={{ '--progress': `${progress}%` }}
      >
        <div className="pomodoro-time">{formatTime(timeLeft)}</div>
        <div className="pomodoro-label">{currentMode.label}</div>
      </div>

      {/* Controls */}
      <div className="pomodoro-controls">
        <button
          id="focus-toggle-btn"
          className="pomo-btn primary"
          onClick={toggleTimer}
        >
          {timeLeft === 0 ? '🔄 Restart' : isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          id="focus-reset-btn"
          className="pomo-btn secondary"
          onClick={resetTimer}
        >
          ↻ Reset
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="pomodoro-modes">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            className={`mode-btn ${mode === key ? 'active' : ''}`}
            onClick={() => switchMode(key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="pomodoro-stats">
        <div className="pomo-stat">
          <div className="pomo-stat-value">{sessions}</div>
          <div className="pomo-stat-label">Sessions</div>
        </div>
        <div className="pomo-stat">
          <div className="pomo-stat-value">{formatHours(totalMinutes)}</div>
          <div className="pomo-stat-label">Total Focus</div>
        </div>
        <div className="pomo-stat">
          <div className="pomo-stat-value">{Math.round(totalMinutes / Math.max(sessions, 1))}m</div>
          <div className="pomo-stat-label">Avg Session</div>
        </div>
      </div>

      {/* Motivational message when timer completes */}
      {timeLeft === 0 && (
        <div style={{
          marginTop: '28px',
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          background: mode === 'work' 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(139, 92, 246, 0.1)',
          border: mode === 'work' 
            ? '1px solid rgba(16, 185, 129, 0.3)' 
            : '1px solid rgba(139, 92, 246, 0.3)',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
            {mode === 'work' ? '🎉' : '💪'}
          </div>
          <div style={{ 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            fontSize: '0.95rem',
            marginBottom: '4px' 
          }}>
            {mode === 'work' 
              ? 'Focus session complete!' 
              : 'Break over — time to grind!'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {mode === 'work' 
              ? 'Take a well-deserved break, Surya 🧃' 
              : 'Start a new focus session and keep moving forward 🚀'}
          </div>
        </div>
      )}
    </div>
  )
}

export default Focus
