/**
 * Goals Page
 * Track progress toward major goals with progress bars
 */
import { useState, useEffect } from 'react'

function Goals() {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('surya-ai-goals')
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Master DSA (150 Problems)', progress: 20, target: 150, unit: 'problems' },
      { id: 2, title: 'Build ViralCheckout MVP', progress: 15, target: 100, unit: '%' },
      { id: 3, title: 'Learn System Design Basics', progress: 5, target: 30, unit: 'topics' },
    ]
  })

  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newUnit, setNewUnit] = useState('tasks')

  // Persist
  useEffect(() => {
    localStorage.setItem('surya-ai-goals', JSON.stringify(goals))
  }, [goals])

  const addGoal = () => {
    if (!newTitle.trim() || !newTarget) return
    const goal = {
      id: Date.now(),
      title: newTitle.trim(),
      progress: 0,
      target: parseInt(newTarget),
      unit: newUnit,
    }
    setGoals(prev => [...prev, goal])
    setNewTitle('')
    setNewTarget('')
    setShowModal(false)
  }

  const incrementGoal = (id, amount = 1) => {
    setGoals(prev => prev.map(g =>
      g.id === id
        ? { ...g, progress: Math.min(g.progress + amount, g.target) }
        : g
    ))
  }

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const getPercentage = (progress, target) => {
    return Math.round((progress / target) * 100)
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          🎯 {goals.length} active goal{goals.length !== 1 ? 's' : ''}
        </p>
        <button className="add-btn" id="add-goal-btn" onClick={() => setShowModal(true)}>
          + New Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h4>No goals yet</h4>
            <p>Set your first goal and start tracking progress!</p>
          </div>
        ) : (
          goals.map(goal => {
            const pct = getPercentage(goal.progress, goal.target)
            return (
              <div key={goal.id} className="card goal-item">
                <div className="goal-header">
                  <span className="goal-title">
                    {pct >= 100 ? '🏆 ' : ''}{goal.title}
                  </span>
                  <span className="goal-percentage">{pct}%</span>
                </div>
                <div className="goal-progress-bar">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100
                        ? 'var(--gradient-success)'
                        : pct >= 50
                          ? 'var(--gradient-cool)'
                          : 'var(--gradient-primary)',
                    }}
                  />
                </div>
                <div className="goal-meta">
                  <span>{goal.progress} / {goal.target} {goal.unit}</span>
                  <div className="goal-actions">
                    {pct < 100 && (
                      <>
                        <button
                          className="goal-increment"
                          onClick={() => incrementGoal(goal.id, 1)}
                        >
                          +1
                        </button>
                        <button
                          className="goal-increment"
                          onClick={() => incrementGoal(goal.id, 5)}
                        >
                          +5
                        </button>
                      </>
                    )}
                    <button
                      className="goal-delete-btn"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* New Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🎯 New Goal</h3>
            <input
              id="goal-title-input"
              type="text"
              placeholder="Goal title (e.g., Solve 200 DSA Problems)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                id="goal-target-input"
                type="number"
                placeholder="Target number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                style={{ flex: 1 }}
              />
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="tasks">tasks</option>
                <option value="problems">problems</option>
                <option value="chapters">chapters</option>
                <option value="projects">projects</option>
                <option value="hours">hours</option>
                <option value="%">%</option>
                <option value="topics">topics</option>
              </select>
            </div>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={addGoal}>Create Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals
