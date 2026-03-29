/**
 * DSA Problem Tracker
 * Log problems solved by topic, difficulty, and platform
 */
import { useState, useEffect } from 'react'

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
  'Trees', 'Graphs', 'DP', 'Binary Search', 'Recursion',
  'Sorting', 'Hashing', 'Greedy', 'Bit Manipulation', 'Math',
  'Two Pointers', 'Sliding Window', 'Heap', 'Trie', 'Other',
]

const PLATFORMS = ['LeetCode', 'Codeforces', 'GFG', 'CodeChef', 'HackerRank', 'Other']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

function DSATracker() {
  const [problems, setProblems] = useState(() => {
    const saved = localStorage.getItem('surya-ai-dsa-problems')
    return saved ? JSON.parse(saved) : []
  })

  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [topicFilter, setTopicFilter] = useState('all')

  const [form, setForm] = useState({
    name: '', topic: 'Arrays', difficulty: 'Medium',
    platform: 'LeetCode', link: '', notes: '',
  })

  useEffect(() => {
    localStorage.setItem('surya-ai-dsa-problems', JSON.stringify(problems))
  }, [problems])

  const addProblem = () => {
    if (!form.name.trim()) return
    const problem = {
      id: Date.now(),
      ...form,
      name: form.name.trim(),
      link: form.link.trim(),
      notes: form.notes.trim(),
      date: new Date().toISOString(),
      solved: true,
    }
    setProblems(prev => [problem, ...prev])
    setForm({ name: '', topic: 'Arrays', difficulty: 'Medium', platform: 'LeetCode', link: '', notes: '' })
    setShowModal(false)
  }

  const deleteProblem = (id) => {
    setProblems(prev => prev.filter(p => p.id !== id))
  }

  const filtered = problems.filter(p => {
    if (filter !== 'all' && p.difficulty.toLowerCase() !== filter) return false
    if (topicFilter !== 'all' && p.topic !== topicFilter) return false
    return true
  })

  // Stats
  const topicCount = {}
  const diffCount = { Easy: 0, Medium: 0, Hard: 0 }
  problems.forEach(p => {
    topicCount[p.topic] = (topicCount[p.topic] || 0) + 1
    diffCount[p.difficulty] = (diffCount[p.difficulty] || 0) + 1
  })

  const topTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div>
      {/* Stats Bar */}
      <div className="dsa-stats-bar">
        <div className="dsa-stat">
          <span className="dsa-stat-value">{problems.length}</span>
          <span className="dsa-stat-label">Total Solved</span>
        </div>
        <div className="dsa-stat">
          <span className="dsa-stat-value" style={{ color: 'var(--accent-green)' }}>{diffCount.Easy}</span>
          <span className="dsa-stat-label">Easy</span>
        </div>
        <div className="dsa-stat">
          <span className="dsa-stat-value" style={{ color: 'var(--accent-yellow)' }}>{diffCount.Medium}</span>
          <span className="dsa-stat-label">Medium</span>
        </div>
        <div className="dsa-stat">
          <span className="dsa-stat-value" style={{ color: 'var(--accent-red)' }}>{diffCount.Hard}</span>
          <span className="dsa-stat-label">Hard</span>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Log Problem
        </button>
      </div>

      {/* Top Topics */}
      {topTopics.length > 0 && (
        <div className="dsa-top-topics">
          {topTopics.map(([topic, count]) => (
            <div
              key={topic}
              className={`dsa-topic-chip ${topicFilter === topic ? 'active' : ''}`}
              onClick={() => setTopicFilter(topicFilter === topic ? 'all' : topic)}
            >
              {topic} <strong>{count}</strong>
            </div>
          ))}
          {topicFilter !== 'all' && (
            <button
              className="dsa-topic-chip"
              onClick={() => setTopicFilter('all')}
              style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      )}

      {/* Difficulty Filters */}
      <div className="task-filters" style={{ marginBottom: '16px' }}>
        {['all', 'easy', 'medium', 'hard'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '📋 All' : f === 'easy' ? '🟢 Easy' : f === 'medium' ? '🟡 Medium' : '🔴 Hard'}
          </button>
        ))}
      </div>

      {/* Problems List */}
      <div className="dsa-problems-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💻</div>
            <h4>No problems logged</h4>
            <p>{filter === 'all' && topicFilter === 'all' ? 'Start logging your DSA practice!' : 'No problems match this filter.'}</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="card dsa-problem-item">
              <div className="dsa-problem-header">
                <div>
                  <div className="dsa-problem-name">
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer">{p.name}</a>
                    ) : p.name}
                  </div>
                  <div className="dsa-problem-meta">
                    <span className={`dsa-diff ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                    <span className="dsa-topic-badge">{p.topic}</span>
                    <span className="dsa-platform">{p.platform}</span>
                    <span className="dsa-date">
                      {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <button className="task-delete" onClick={() => deleteProblem(p.id)}>×</button>
              </div>
              {p.notes && (
                <div className="dsa-problem-notes">💡 {p.notes}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Problem Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <h3>💻 Log DSA Problem</h3>
            <input
              type="text"
              placeholder="Problem name (e.g., Two Sum)"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <select
                value={form.topic}
                onChange={e => setForm({ ...form, topic: e.target.value })}
                style={{
                  flex: 1, padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem',
                }}
              >
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={form.difficulty}
                onChange={e => setForm({ ...form, difficulty: e.target.value })}
                style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem',
                }}
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={form.platform}
                onChange={e => setForm({ ...form, platform: e.target.value })}
                style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem',
                }}
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                type="text"
                placeholder="Problem link (optional)"
                value={form.link}
                onChange={e => setForm({ ...form, link: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            <textarea
              placeholder="Notes / approach used (optional)"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{ minHeight: '80px' }}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={addProblem}>Log Problem</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DSATracker
