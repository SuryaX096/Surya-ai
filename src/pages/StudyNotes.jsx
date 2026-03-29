/**
 * AI Study Notes Generator
 * Paste a topic and AI generates structured notes
 */
import { useState } from 'react'

const QUICK_TOPICS = [
  'Binary Trees', 'Dynamic Programming', 'Graph Algorithms', 'OOP Principles',
  'React Hooks', 'REST API Design', 'TCP/IP Model', 'SQL Joins',
  'Process vs Thread', 'Deadlock Prevention', 'Normalization in DBMS', 'JavaScript Closures',
]

function StudyNotes({ apiKey }) {
  const [topic, setTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedNotes, setSavedNotes] = useState(() => {
    const s = localStorage.getItem('surya-ai-study-notes')
    return s ? JSON.parse(s) : []
  })
  const [viewingNote, setViewingNote] = useState(null)

  const generate = async (t) => {
    const topicText = t || topic
    if (!topicText.trim()) return
    setLoading(true)
    setNotes('')
    setViewingNote(null)

    if (!apiKey) {
      setTimeout(() => {
        setNotes(`# ${topicText}\n\n## Overview\n${topicText} is a fundamental concept in computer science.\n\n## Key Points\n- Point 1: Core definition and understanding\n- Point 2: Common use cases and applications\n- Point 3: Time & space complexity considerations\n\n## Example\n\`\`\`\n// Example code would appear here with AI enabled\n\`\`\`\n\n## Interview Tips\n- Understand the fundamentals deeply\n- Practice with different variations\n- Know the trade-offs\n\n⚠️ *Add your Gemini API key in Settings for AI-generated notes!*`)
        setLoading(false)
      }, 800)
      return
    }

    try {
      const prompt = `Create comprehensive study notes on "${topicText}" for a BTech CSE student preparing for placements. Include:
1. Clear definition/overview
2. Key concepts with bullet points
3. Code example (in C++ or JavaScript, whichever is more relevant)
4. Common interview questions on this topic
5. Tips & tricks

Format using markdown with headers (##), bullet points, and code blocks. Keep it concise but thorough.`

      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 3000 }
          })
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API Error: ${res.status}`)
      }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate notes.'
      setNotes(text)
    } catch (err) {
      setNotes(`❌ Error: ${err.message}`)
    }
    setLoading(false)
  }

  const saveNote = () => {
    if (!notes || !topic) return
    const entry = { id: Date.now(), topic: topic || viewingNote?.topic, content: notes, date: new Date().toISOString() }
    const updated = [entry, ...savedNotes].slice(0, 30)
    setSavedNotes(updated)
    localStorage.setItem('surya-ai-study-notes', JSON.stringify(updated))
  }

  const deleteNote = (id) => {
    const updated = savedNotes.filter(n => n.id !== id)
    setSavedNotes(updated)
    localStorage.setItem('surya-ai-study-notes', JSON.stringify(updated))
  }

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h4 key={i} style={{ marginTop: '16px', marginBottom: '6px', color: 'var(--accent-purple)' }}>{line.slice(4)}</h4>
      if (line.startsWith('## ')) return <h3 key={i} style={{ marginTop: '20px', marginBottom: '8px', fontSize: '1.05rem' }}>{line.slice(3)}</h3>
      if (line.startsWith('# ')) return <h2 key={i} style={{ marginBottom: '12px', fontSize: '1.2rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{line.slice(2)}</h2>
      if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: '16px', marginBottom: '4px', fontSize: '0.9rem' }}>• {line.slice(2)}</div>
      if (line.startsWith('```')) return <div key={i} style={{ margin: '4px 0' }}></div>
      if (line.match(/^\d+\./)) return <div key={i} style={{ paddingLeft: '16px', marginBottom: '4px', fontSize: '0.9rem' }}>{line}</div>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '4px', color: 'var(--text-secondary)' }}>{line}</p>
    })
  }

  return (
    <div>
      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" placeholder="Enter a topic (e.g., Binary Trees, React Hooks...)" value={topic}
          onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generate()}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', fontSize: '0.9rem', outline: 'none' }} />
        <button className="add-btn" onClick={() => generate()} disabled={loading}>
          {loading ? '⏳ Generating...' : '🧠 Generate'}
        </button>
      </div>

      {/* Quick Topics */}
      {!notes && !loading && !viewingNote && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>⚡ QUICK TOPICS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {QUICK_TOPICS.map(t => (
              <button key={t} className="suggestion-chip" onClick={() => { setTopic(t); generate(t) }}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="ai-typing" style={{ justifyContent: 'center', marginBottom: '12px' }}><span></span><span></span><span></span></div>
          <p style={{ color: 'var(--text-muted)' }}>Generating notes on "{topic}"...</p>
        </div>
      )}

      {/* Generated Notes */}
      {notes && !loading && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>📄 GENERATED NOTES</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={saveNote} className="filter-btn active">💾 Save</button>
              <button onClick={() => navigator.clipboard.writeText(notes)} className="filter-btn">📋 Copy</button>
              <button onClick={() => { setNotes(''); setViewingNote(null) }} className="filter-btn">✕ Close</button>
            </div>
          </div>
          <div className="study-notes-content">{renderMarkdown(notes)}</div>
        </div>
      )}

      {/* Saved Notes */}
      {!notes && !loading && savedNotes.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>📚 Saved Notes ({savedNotes.length})</h3>
          {savedNotes.map(n => (
            <div key={n.id} className="card" style={{ padding: '16px 20px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => { setNotes(n.content); setTopic(n.topic); setViewingNote(n) }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{n.topic}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <button className="task-delete" onClick={e => { e.stopPropagation(); deleteNote(n.id) }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudyNotes
