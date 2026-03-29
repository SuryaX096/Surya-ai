/**
 * Code Snippets Page
 * Save reusable code snippets with language tags and copy functionality
 */
import { useState, useEffect } from 'react'

const LANGUAGES = ['C++', 'JavaScript', 'Python', 'Java', 'TypeScript', 'HTML', 'CSS', 'SQL', 'Bash', 'Other']

function Snippets() {
  const [snippets, setSnippets] = useState(() => {
    const s = localStorage.getItem('surya-ai-snippets')
    return s ? JSON.parse(s) : [
      { id: 1, title: 'Binary Search Template', lang: 'C++', code: 'int binarySearch(vector<int>& arr, int target) {\n  int lo = 0, hi = arr.size() - 1;\n  while (lo <= hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (arr[mid] == target) return mid;\n    else if (arr[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}', tags: ['DSA', 'search'] },
      { id: 2, title: 'Debounce Function', lang: 'JavaScript', code: 'function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}', tags: ['utils', 'performance'] },
    ]
  })
  const [showModal, setShowModal] = useState(false)
  const [editSnippet, setEditSnippet] = useState(null)
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('all')
  const [copied, setCopied] = useState(null)
  const [form, setForm] = useState({ title: '', lang: 'C++', code: '', tags: '' })

  useEffect(() => { localStorage.setItem('surya-ai-snippets', JSON.stringify(snippets)) }, [snippets])

  const openAdd = () => { setEditSnippet(null); setForm({ title: '', lang: 'C++', code: '', tags: '' }); setShowModal(true) }
  const openEdit = (s) => { setEditSnippet(s); setForm({ title: s.title, lang: s.lang, code: s.code, tags: s.tags.join(', ') }); setShowModal(true) }

  const save = () => {
    if (!form.title.trim() || !form.code.trim()) return
    const data = { title: form.title.trim(), lang: form.lang, code: form.code, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    if (editSnippet) {
      setSnippets(p => p.map(s => s.id === editSnippet.id ? { ...s, ...data } : s))
    } else {
      setSnippets(p => [{ id: Date.now(), ...data }, ...p])
    }
    setShowModal(false)
  }

  const del = (id) => setSnippets(p => p.filter(s => s.id !== id))

  const copy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = snippets.filter(s => {
    if (langFilter !== 'all' && s.lang !== langFilter) return false
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false
    return true
  })

  const usedLangs = [...new Set(snippets.map(s => s.lang))]

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <input type="text" placeholder="Search snippets..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem', outline: 'none' }} />
        <button className="add-btn" onClick={openAdd}>+ New Snippet</button>
      </div>

      {usedLangs.length > 0 && (
        <div className="task-filters" style={{ marginBottom: '16px' }}>
          <button className={`filter-btn ${langFilter === 'all' ? 'active' : ''}`} onClick={() => setLangFilter('all')}>All</button>
          {usedLangs.map(l => (
            <button key={l} className={`filter-btn ${langFilter === l ? 'active' : ''}`} onClick={() => setLangFilter(l)}>{l}</button>
          ))}
        </div>
      )}

      <div className="snippets-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💡</div><h4>No snippets</h4><p>Save your first code snippet!</p></div>
        ) : filtered.map(s => (
          <div key={s.id} className="card snippet-card">
            <div className="snippet-header">
              <div>
                <div className="snippet-title">{s.title}</div>
                <div className="snippet-meta">
                  <span className="snippet-lang">{s.lang}</span>
                  {s.tags.map(t => <span key={t} className="snippet-tag">{t}</span>)}
                </div>
              </div>
              <div className="snippet-actions">
                <button onClick={() => copy(s.code, s.id)} className={copied === s.id ? 'copied' : ''}>
                  {copied === s.id ? '✓ Copied' : '📋 Copy'}
                </button>
                <button onClick={() => openEdit(s)}>✏️</button>
                <button onClick={() => del(s.id)} className="del">🗑️</button>
              </div>
            </div>
            <pre className="snippet-code"><code>{s.code}</code></pre>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>{editSnippet ? '✏️ Edit Snippet' : '💡 New Snippet'}</h3>
            <input type="text" placeholder="Snippet title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={form.lang} onChange={e => setForm({ ...form, lang: e.target.value })}
                style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem' }}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} style={{ flex: 1 }} />
            </div>
            <textarea placeholder="Paste your code here..." value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
              style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre', tabSize: 2 }} />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={save}>{editSnippet ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Snippets
