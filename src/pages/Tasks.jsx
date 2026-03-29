/**
 * Tasks Page
 * Full task manager with priorities, filtering, and persistence
 */
import { useState, useEffect } from 'react'

function Tasks() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('surya-ai-tasks')
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Complete DSA Array problems', priority: 'high', done: false },
      { id: 2, text: 'Build viralcheckout homepage', priority: 'high', done: false },
      { id: 3, text: 'Study React hooks', priority: 'medium', done: false },
      { id: 4, text: 'Practice Linked List problems', priority: 'medium', done: false },
      { id: 5, text: 'Read about system design basics', priority: 'low', done: false },
    ]
  })
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')

  // Persist tasks
  useEffect(() => {
    localStorage.setItem('surya-ai-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (!input.trim()) return
    const newTask = {
      id: Date.now(),
      text: input.trim(),
      priority,
      done: false,
    }
    setTasks(prev => [newTask, ...prev])
    setInput('')
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTask()
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.done
    if (filter === 'completed') return t.done
    if (filter === 'high') return t.priority === 'high' && !t.done
    return true
  })

  const completedCount = tasks.filter(t => t.done).length
  const totalCount = tasks.length

  return (
    <div>
      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
      }}>
        <span>📋 Total: <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong></span>
        <span>✅ Done: <strong style={{ color: 'var(--accent-green)' }}>{completedCount}</strong></span>
        <span>🔥 Pending: <strong style={{ color: 'var(--accent-yellow)' }}>{totalCount - completedCount}</strong></span>
      </div>

      {/* Add Task */}
      <div className="task-input-row">
        <input
          id="task-input"
          type="text"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <select 
          id="task-priority-select"
          value={priority} 
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <button id="add-task-btn" className="add-btn" onClick={addTask}>
          + Add
        </button>
      </div>

      {/* Filters */}
      <div className="task-filters">
        {['all', 'active', 'completed', 'high'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '📋 All' : f === 'active' ? '⏳ Active' : f === 'completed' ? '✅ Done' : '🔥 High Priority'}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>No tasks here</h4>
            <p>{filter === 'all' ? 'Add a task above to get started!' : 'No tasks match this filter.'}</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`task-item ${task.done ? 'completed' : ''}`}
            >
              <button
                className={`task-checkbox ${task.done ? 'checked' : ''}`}
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.done ? '✓' : ''}
              </button>
              <span className="task-text">{task.text}</span>
              <span className={`task-priority ${task.priority}`}>
                {task.priority}
              </span>
              <button
                className="task-delete"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Tasks
