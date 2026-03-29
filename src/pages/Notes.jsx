/**
 * Notes Page
 * Color-coded sticky notes with CRUD and modal editor
 */
import { useState, useEffect } from 'react'

const NOTE_COLORS = [
  { name: 'purple', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { name: 'blue', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  { name: 'green', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  { name: 'pink', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { name: 'yellow', gradient: 'linear-gradient(135deg, #f59e0b, #eab308)' },
]

function Notes() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('surya-ai-notes')
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: 'DSA Study Plan',
        body: 'Week 1: Arrays & Strings\nWeek 2: Linked Lists\nWeek 3: Stacks & Queues\nWeek 4: Trees & Graphs',
        color: 'purple',
        date: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'ViralCheckout Ideas',
        body: 'Add social proof popups, AI-powered product recommendations, and gamified checkout flow.',
        color: 'blue',
        date: new Date().toISOString(),
      },
    ]
  })

  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedColor, setSelectedColor] = useState('purple')

  // Persist notes
  useEffect(() => {
    localStorage.setItem('surya-ai-notes', JSON.stringify(notes))
  }, [notes])

  const openNewNote = () => {
    setEditingNote(null)
    setTitle('')
    setBody('')
    setSelectedColor('purple')
    setShowModal(true)
  }

  const openEditNote = (note) => {
    setEditingNote(note)
    setTitle(note.title)
    setBody(note.body)
    setSelectedColor(note.color)
    setShowModal(true)
  }

  const saveNote = () => {
    if (!title.trim() && !body.trim()) return

    if (editingNote) {
      // Update
      setNotes(prev => prev.map(n => n.id === editingNote.id
        ? { ...n, title: title.trim(), body: body.trim(), color: selectedColor, date: new Date().toISOString() }
        : n
      ))
    } else {
      // Create
      const newNote = {
        id: Date.now(),
        title: title.trim() || 'Untitled',
        body: body.trim(),
        color: selectedColor,
        date: new Date().toISOString(),
      }
      setNotes(prev => [newNote, ...prev])
    }
    setShowModal(false)
  }

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getGradient = (colorName) => {
    return NOTE_COLORS.find(c => c.name === colorName)?.gradient || NOTE_COLORS[0].gradient
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
        📝 {notes.length} note{notes.length !== 1 ? 's' : ''} saved
      </p>

      <div className="notes-grid">
        {/* New Note Card */}
        <div className="card new-note-card" onClick={openNewNote} id="new-note-btn">
          <div className="plus-icon">+</div>
          <span>New Note</span>
        </div>

        {/* Existing Notes */}
        {notes.map(note => (
          <div key={note.id} className="card note-card">
            <div className="note-color-bar" style={{ background: getGradient(note.color) }} />
            <div className="note-title">{note.title}</div>
            <div className="note-body">
              {note.body.length > 150 ? note.body.slice(0, 150) + '...' : note.body}
            </div>
            <div className="note-footer">
              <span className="note-date">{formatDate(note.date)}</span>
              <div className="note-actions">
                <button onClick={() => openEditNote(note)} aria-label="Edit note">✏️</button>
                <button className="delete-note" onClick={() => deleteNote(note.id)} aria-label="Delete note">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editingNote ? '✏️ Edit Note' : '📝 New Note'}</h3>
            
            {/* Color Picker */}
            <div className="modal-color-picker">
              {NOTE_COLORS.map(c => (
                <div
                  key={c.name}
                  className={`color-dot ${selectedColor === c.name ? 'active' : ''}`}
                  style={{ background: c.gradient }}
                  onClick={() => setSelectedColor(c.name)}
                />
              ))}
            </div>

            <input
              id="note-title-input"
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <textarea
              id="note-body-input"
              placeholder="Write your note here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={saveNote}>
                {editingNote ? 'Update' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
