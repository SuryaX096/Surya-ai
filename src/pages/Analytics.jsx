/**
 * Analytics Page
 * Visual charts and stats for productivity tracking
 */
import { useState, useEffect } from 'react'

function Analytics() {
  const [stats, setStats] = useState({
    tasks: [], notes: [], goals: [],
    focusSessions: 0, focusMinutes: 0,
    habitCompletions: {},
  })

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('surya-ai-tasks') || '[]')
    const notes = JSON.parse(localStorage.getItem('surya-ai-notes') || '[]')
    const goals = JSON.parse(localStorage.getItem('surya-ai-goals') || '[]')
    const focusSessions = parseInt(localStorage.getItem('surya-ai-focus-count') || '0')
    const focusMinutes = parseInt(localStorage.getItem('surya-ai-focus-minutes') || '0')
    const habitCompletions = JSON.parse(localStorage.getItem('surya-ai-habit-completions') || '{}')
    const habits = JSON.parse(localStorage.getItem('surya-ai-habits') || '[]')
    const dsaProblems = JSON.parse(localStorage.getItem('surya-ai-dsa-problems') || '[]')

    setStats({ tasks, notes, goals, focusSessions, focusMinutes, habitCompletions, habits, dsaProblems })
  }, [])

  const completedTasks = stats.tasks.filter(t => t.done).length
  const pendingTasks = stats.tasks.filter(t => !t.done).length
  const highPriority = stats.tasks.filter(t => t.priority === 'high' && !t.done).length

  // Goals progress
  const avgGoalProgress = stats.goals.length > 0
    ? Math.round(stats.goals.reduce((sum, g) => sum + (g.progress / g.target) * 100, 0) / stats.goals.length)
    : 0

  // Focus stats
  const formatHours = (mins) => {
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  // Weekly habit completion rate
  const getWeeklyHabitRate = () => {
    const completions = stats.habitCompletions
    const habits = stats.habits || []
    let total = 0
    let completed = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      habits.forEach(h => {
        total++
        if (completions[`${h.id}-${dateStr}`]) completed++
      })
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  // DSA topic breakdown
  const getDSAByTopic = () => {
    const problems = stats.dsaProblems || []
    const topicMap = {}
    problems.forEach(p => {
      topicMap[p.topic] = (topicMap[p.topic] || 0) + 1
    })
    return Object.entries(topicMap).sort((a, b) => b[1] - a[1])
  }

  // Task priority breakdown for bar chart
  const tasksByPriority = {
    high: stats.tasks.filter(t => t.priority === 'high').length,
    medium: stats.tasks.filter(t => t.priority === 'medium').length,
    low: stats.tasks.filter(t => t.priority === 'low').length,
  }
  const maxTasks = Math.max(tasksByPriority.high, tasksByPriority.medium, tasksByPriority.low, 1)

  const weeklyHabitRate = getWeeklyHabitRate()
  const dsaTopics = getDSAByTopic()
  const totalDSA = (stats.dsaProblems || []).length

  return (
    <div>
      {/* Overview Cards */}
      <div className="analytics-overview">
        <div className="card analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>📊</div>
          <div className="analytics-stat-value">{stats.tasks.length}</div>
          <div className="analytics-stat-label">Total Tasks</div>
          <div className="analytics-stat-sub">{completedTasks} done • {pendingTasks} pending</div>
        </div>
        <div className="card analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)' }}>⏱️</div>
          <div className="analytics-stat-value">{formatHours(stats.focusMinutes)}</div>
          <div className="analytics-stat-label">Focus Time</div>
          <div className="analytics-stat-sub">{stats.focusSessions} sessions completed</div>
        </div>
        <div className="card analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>🎯</div>
          <div className="analytics-stat-value">{avgGoalProgress}%</div>
          <div className="analytics-stat-label">Avg Goal Progress</div>
          <div className="analytics-stat-sub">{stats.goals.length} active goals</div>
        </div>
        <div className="card analytics-stat-card">
          <div className="analytics-stat-icon" style={{ background: 'rgba(236,72,153,0.15)', color: 'var(--accent-pink)' }}>🔥</div>
          <div className="analytics-stat-value">{weeklyHabitRate}%</div>
          <div className="analytics-stat-label">Weekly Habit Rate</div>
          <div className="analytics-stat-sub">Last 7 days consistency</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-row">
        {/* Task Priority Distribution */}
        <div className="card" style={{ padding: '22px', flex: 1 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
            📋 Tasks by Priority
          </h3>
          <div className="bar-chart">
            <div className="bar-row">
              <span className="bar-label">🔴 High</span>
              <div className="bar-track">
                <div className="bar-fill" style={{
                  width: `${(tasksByPriority.high / maxTasks) * 100}%`,
                  background: 'var(--gradient-danger)',
                }} />
              </div>
              <span className="bar-value">{tasksByPriority.high}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">🟡 Medium</span>
              <div className="bar-track">
                <div className="bar-fill" style={{
                  width: `${(tasksByPriority.medium / maxTasks) * 100}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                }} />
              </div>
              <span className="bar-value">{tasksByPriority.medium}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">🟢 Low</span>
              <div className="bar-track">
                <div className="bar-fill" style={{
                  width: `${(tasksByPriority.low / maxTasks) * 100}%`,
                  background: 'var(--gradient-success)',
                }} />
              </div>
              <span className="bar-value">{tasksByPriority.low}</span>
            </div>
          </div>

          {/* Completion Ring */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <div className="completion-ring" style={{
              '--pct': `${stats.tasks.length > 0 ? Math.round((completedTasks / stats.tasks.length) * 100) : 0}%`,
            }}>
              <span>{stats.tasks.length > 0 ? Math.round((completedTasks / stats.tasks.length) * 100) : 0}%</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Completion Rate</div>
          </div>
        </div>

        {/* DSA Progress + Goals */}
        <div className="card" style={{ padding: '22px', flex: 1 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
            💻 DSA Progress
          </h3>
          {totalDSA > 0 ? (
            <>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {totalDSA}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                problems solved
              </div>
              <div className="bar-chart">
                {dsaTopics.slice(0, 6).map(([topic, count]) => (
                  <div className="bar-row" key={topic}>
                    <span className="bar-label" style={{ minWidth: '90px' }}>{topic}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{
                        width: `${(count / dsaTopics[0][1]) * 100}%`,
                        background: 'var(--gradient-cool)',
                      }} />
                    </div>
                    <span className="bar-value">{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon">📝</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Start tracking DSA problems to see stats here
              </p>
            </div>
          )}

          {/* Goals mini view */}
          {stats.goals.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>
                🎯 GOALS OVERVIEW
              </div>
              {stats.goals.map(goal => {
                const pct = Math.round((goal.progress / goal.target) * 100)
                return (
                  <div key={goal.id} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{goal.title}</span>
                      <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div className="goal-progress-bar" style={{ height: '5px' }}>
                      <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="card" style={{
        padding: '24px',
        marginTop: '20px',
        background: 'rgba(139,92,246,0.05)',
        borderColor: 'rgba(139,92,246,0.15)',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
          📈 PRODUCTIVITY SUMMARY
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
          You've completed <strong style={{ color: 'var(--accent-green)' }}>{completedTasks} tasks</strong>,
          logged <strong style={{ color: 'var(--accent-purple)' }}>{formatHours(stats.focusMinutes)}</strong> of focus time across
          <strong style={{ color: 'var(--accent-blue)' }}> {stats.focusSessions} sessions</strong>,
          written <strong style={{ color: 'var(--accent-cyan)' }}>{stats.notes.length} notes</strong>,
          {totalDSA > 0 && <> solved <strong style={{ color: 'var(--accent-yellow)' }}>{totalDSA} DSA problems</strong>,</>}
          and have <strong style={{ color: 'var(--accent-pink)' }}>{highPriority} high-priority</strong> tasks remaining.
          {weeklyHabitRate >= 80 ? ' Amazing consistency this week! 🔥' :
           weeklyHabitRate >= 50 ? ' Good progress — keep the momentum! 💪' :
           ' Time to step up the game, Surya! 🚀'}
        </p>
      </div>
    </div>
  )
}

export default Analytics
