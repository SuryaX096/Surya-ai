/**
 * Kanban Board
 * Project management with drag-and-drop columns
 */
import { useState, useEffect } from 'react'

const COLUMNS = ['todo', 'inprogress', 'review', 'done']
const COL_CFG = {
  todo: { label: '📋 To Do', color: 'var(--accent-blue)' },
  inprogress: { label: '🔨 In Progress', color: 'var(--accent-yellow)' },
  review: { label: '👀 Review', color: 'var(--accent-purple)' },
  done: { label: '✅ Done', color: 'var(--accent-green)' },
}

const LABELS = [
  { name: 'frontend', color: '#3b82f6' },
  { name: 'backend', color: '#10b981' },
  { name: 'bug', color: '#ef4444' },
  { name: 'feature', color: '#8b5cf6' },
  { name: 'design', color: '#ec4899' },
  { name: 'urgent', color: '#f59e0b' },
]

function Kanban() {
  const [cards, setCards] = useState(() => {
    const s = localStorage.getItem('surya-ai-kanban')
    return s ? JSON.parse(s) : [
      { id: 1, title: 'Design landing page', column: 'todo', label: 'design', desc: 'Hero section with CTA' },
      { id: 2, title: 'Setup payment API', column: 'todo', label: 'backend', desc: 'Integrate Razorpay' },
      { id: 3, title: 'Build product card', column: 'inprogress', label: 'frontend', desc: 'Reusable card component' },
      { id: 4, title: 'Fix mobile nav bug', column: 'inprogress', label: 'bug', desc: 'Menu not closing' },
      { id: 5, title: 'Social proof popups', column: 'review', label: 'feature', desc: '"X bought this" alerts' },
    ]
  })
  const [showModal, setShowModal] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [form, setForm] = useState({ title: '', desc: '', column: 'todo', label: 'feature' })
  const [dragId, setDragId] = useState(null)

  useEffect(() => { localStorage.setItem('surya-ai-kanban', JSON.stringify(cards)) }, [cards])

  const openAdd = (col = 'todo') => { setEditCard(null); setForm({ title: '', desc: '', column: col, label: 'feature' }); setShowModal(true) }
  const openEdit = (c) => { setEditCard(c); setForm({ title: c.title, desc: c.desc || '', column: c.column, label: c.label || 'feature' }); setShowModal(true) }

  const saveCard = () => {
    if (!form.title.trim()) return
    if (editCard) {
      setCards(p => p.map(c => c.id === editCard.id ? { ...c, ...form, title: form.title.trim(), desc: form.desc.trim() } : c))
    } else {
      setCards(p => [...p, { id: Date.now(), ...form, title: form.title.trim(), desc: form.desc.trim() }])
    }
    setShowModal(false)
  }

  const move = (id, col) => setCards(p => p.map(c => c.id === id ? { ...c, column: col } : c))
  const del = (id) => setCards(p => p.filter(c => c.id !== id))
  const getLabel = (n) => LABELS.find(l => l.name === n) || LABELS[3]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📋 {cards.length} cards</p>
        <button className="add-btn" onClick={() => openAdd()}>+ Add Card</button>
      </div>
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const cfg = COL_CFG[col]
          const colCards = cards.filter(c => c.column === col)
          return (
            <div key={col} className="kanban-column" onDragOver={e => e.preventDefault()} onDrop={() => { if (dragId) { move(dragId, col); setDragId(null) } }}>
              <div className="kanban-column-header">
                <span>{cfg.label}</span>
                <span className="kanban-count" style={{ background: `${cfg.color}20`, color: cfg.color }}>{colCards.length}</span>
              </div>
              <div className="kanban-cards">
                {colCards.map(card => {
                  const lb = getLabel(card.label)
                  return (
                    <div key={card.id} className="kanban-card" draggable onDragStart={() => setDragId(card.id)} onClick={() => openEdit(card)}>
                      <div className="kanban-card-label" style={{ background: lb.color }}>{card.label}</div>
                      <div className="kanban-card-title">{card.title}</div>
                      {card.desc && <div className="kanban-card-desc">{card.desc}</div>}
                      <div className="kanban-card-actions">
                        {col !== 'todo' && <button onClick={e => { e.stopPropagation(); move(card.id, COLUMNS[COLUMNS.indexOf(col) - 1]) }}>←</button>}
                        {col !== 'done' && <button onClick={e => { e.stopPropagation(); move(card.id, COLUMNS[COLUMNS.indexOf(col) + 1]) }}>→</button>}
                        <button className="kanban-delete" onClick={e => { e.stopPropagation(); del(card.id) }}>🗑️</button>
                      </div>
                    </div>
                  )
                })}
                <button className="kanban-add-card" onClick={() => openAdd(col)}>+ Add card</button>
              </div>
            </div>
          )
        })}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editCard ? '✏️ Edit Card' : '📋 New Card'}</h3>
            <input type="text" placeholder="Card title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
            <textarea placeholder="Description (optional)" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} style={{ minHeight: '80px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={form.column} onChange={e => setForm({ ...form, column: e.target.value })} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem' }}>
                {COLUMNS.map(c => <option key={c} value={c}>{COL_CFG[c].label}</option>)}
              </select>
              <select value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.85rem' }}>
                {LABELS.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
              </select>
            </div>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={saveCard}>{editCard ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Kanban
