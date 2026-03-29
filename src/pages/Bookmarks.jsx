/**
 * Bookmarks Page
 * Save and organize learning resources with categories
 */
import { useState, useEffect } from 'react'

const CATEGORIES = ['DSA', 'Web Dev', 'System Design', 'YouTube', 'Documentation', 'Tools', 'Articles', 'Other']

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    const s = localStorage.getItem('surya-ai-bookmarks')
    return s ? JSON.parse(s) : [
      { id: 1, title: 'Striver SDE Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', category: 'DSA', desc: 'Top 191 DSA problems for placements' },
      { id: 2, title: 'React Documentation', url: 'https://react.dev', category: 'Documentation', desc: 'Official React docs' },
      { id: 3, title: 'NeetCode 150', url: 'https://neetcode.io/practice', category: 'DSA', desc: 'Curated LeetCode practice list' },
    ]
  })
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', url: '', category: 'DSA', desc: '' })

  useEffect(() => { localStorage.setItem('surya-ai-bookmarks', JSON.stringify(bookmarks)) }, [bookmarks])

  const add = () => {
    if (!form.title.trim() || !form.url.trim()) return
    setBookmarks(p => [{ id: Date.now(), ...form, title: form.title.trim(), url: form.url.trim(), desc: form.desc.trim() }, ...p])
    setForm({ title: '', url: '', category: 'DSA', desc: '' })
    setShowModal(false)
  }

  const del = (id) => setBookmarks(p => p.filter(b => b.id !== id))

  const filtered = bookmarks.filter(b => {
    if (filter !== 'all' && b.category !== filter) return false
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const usedCats = [...new Set(bookmarks.map(b => b.category))]

  const getFavicon = (url) => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { return null }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <input type="text" placeholder="Search bookmarks..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem', outline: 'none' }} />
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Add Bookmark</button>
      </div>

      {usedCats.length > 0 && (
        <div className="task-filters" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>📁 All</button>
          {usedCats.map(c => (
            <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
      )}

      <div className="bookmarks-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔗</div><h4>No bookmarks</h4><p>Save your learning resources here!</p></div>
        ) : filtered.map(b => (
          <div key={b.id} className="card bookmark-item">
            <div className="bookmark-content">
              <div className="bookmark-favicon">
                {getFavicon(b.url) ? <img src={getFavicon(b.url)} alt="" width="20" height="20" /> : '🔗'}
              </div>
              <div className="bookmark-info">
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="bookmark-title">{b.title}</a>
                {b.desc && <div className="bookmark-desc">{b.desc}</div>}
                <div className="bookmark-meta">
                  <span className="bookmark-category">{b.category}</span>
                  <span className="bookmark-url">{(() => { try { return new URL(b.url).hostname } catch { return b.url } })()}</span>
                </div>
              </div>
            </div>
            <button className="task-delete" onClick={() => del(b.id)}>×</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🔗 Add Bookmark</h3>
            <input type="text" placeholder="Title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
            <input type="text" placeholder="URL (https://...)" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <textarea placeholder="Description (optional)" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ minHeight: '60px' }} />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={add}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookmarks
