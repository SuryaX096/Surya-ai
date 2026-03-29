/**
 * AI Quiz Mode
 * Gemini-powered quiz generation for DSA/CS topics
 */
import { useState } from 'react'

const QUIZ_TOPICS = [
  'Arrays & Strings', 'Linked Lists', 'Trees & BST', 'Graphs & BFS/DFS',
  'Dynamic Programming', 'Sorting Algorithms', 'OOP Concepts', 'OS Concepts',
  'DBMS & SQL', 'Computer Networks', 'React & JavaScript', 'System Design Basics',
]

function Quiz({ apiKey }) {
  const [topic, setTopic] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)
  const [history, setHistory] = useState(() => {
    const s = localStorage.getItem('surya-ai-quiz-history')
    return s ? JSON.parse(s) : []
  })

  const generateQuiz = async (selectedTopic) => {
    setTopic(selectedTopic)
    setQuiz(null)
    setAnswers({})
    setSubmitted(false)
    setScore(null)
    setLoading(true)

    if (!apiKey) {
      // Demo mode
      setTimeout(() => {
        setQuiz({
          topic: selectedTopic,
          questions: [
            { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
            { q: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Array', 'Tree'], correct: 1 },
            { q: 'What does DFS stand for?', options: ['Data File System', 'Depth First Search', 'Dynamic Flow Sort', 'Direct File Search'], correct: 1 },
            { q: 'Which sorting algorithm is stable?', options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'], correct: 2 },
            { q: 'What is the space complexity of recursive fibonacci?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(2^n)'], correct: 1 },
          ]
        })
        setLoading(false)
      }, 1000)
      return
    }

    try {
      const prompt = `Generate a quiz with exactly 5 multiple-choice questions about "${selectedTopic}" for a CS/BTech student preparing for placements. Return ONLY valid JSON in this exact format, no markdown:
{"topic":"${selectedTopic}","questions":[{"q":"question text","options":["A","B","C","D"],"correct":0}]}
where "correct" is the 0-based index of the correct answer. Make questions challenging but fair.`

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
            generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
          })
        }
      )
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API Error: ${res.status}`)
      }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Validate quiz structure
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          parsed.questions = parsed.questions.filter(q =>
            q.q && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correct === 'number'
          )
          if (parsed.questions.length > 0) {
            setQuiz(parsed)
          } else {
            throw new Error('AI returned questions in invalid format')
          }
        } else {
          throw new Error('No valid questions in response')
        }
      } else {
        throw new Error('Could not parse quiz from AI response')
      }
    } catch (err) {
      setQuiz({ topic: selectedTopic, questions: [], error: err.message })
    }
    setLoading(false)
  }

  const submitQuiz = () => {
    if (!quiz?.questions?.length) return
    let correct = 0
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++
    })
    const s = { correct, total: quiz.questions.length, pct: Math.round((correct / quiz.questions.length) * 100) }
    setScore(s)
    setSubmitted(true)
    const entry = { topic: quiz.topic, ...s, date: new Date().toISOString() }
    const newHistory = [entry, ...history].slice(0, 20)
    setHistory(newHistory)
    localStorage.setItem('surya-ai-quiz-history', JSON.stringify(newHistory))
  }

  return (
    <div>
      {!quiz && !loading ? (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            🧪 {apiKey ? 'AI-generated quizzes powered by Gemini' : 'Demo mode — add API key in Settings for AI-generated quizzes'}
          </p>
          <div className="quiz-topics-grid">
            {QUIZ_TOPICS.map(t => (
              <button key={t} className="card quiz-topic-btn" onClick={() => generateQuiz(t)}>
                <span className="quiz-topic-icon">🧠</span>
                <span>{t}</span>
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>📊 Recent Scores</h3>
              <div className="quiz-history">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{h.topic}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 14px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.85rem',
                      background: h.pct >= 80 ? 'rgba(16,185,129,0.15)' : h.pct >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: h.pct >= 80 ? 'var(--accent-green)' : h.pct >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)',
                    }}>
                      {h.correct}/{h.total} ({h.pct}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : loading ? (
        <div className="empty-state">
          <div className="ai-typing" style={{ justifyContent: 'center', padding: '40px' }}><span></span><span></span><span></span></div>
          <h4>Generating quiz on {topic}...</h4>
        </div>
      ) : quiz?.error ? (
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <h4>Failed to generate quiz</h4>
          <p>{quiz.error}</p>
          <button className="add-btn" style={{ marginTop: '16px' }} onClick={() => { setQuiz(null); setLoading(false) }}>Try Again</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>🧪 {quiz.topic}</h3>
            <button className="filter-btn" onClick={() => { setQuiz(null); setSubmitted(false); setScore(null) }}>← Back</button>
          </div>

          {score && (
            <div className="card" style={{
              padding: '20px', marginBottom: '20px', textAlign: 'center',
              background: score.pct >= 80 ? 'rgba(16,185,129,0.08)' : score.pct >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
              borderColor: score.pct >= 80 ? 'rgba(16,185,129,0.3)' : score.pct >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{score.pct}%</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{score.correct}/{score.total} correct</div>
              <div style={{ fontSize: '0.85rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                {score.pct >= 80 ? '🔥 Excellent!' : score.pct >= 50 ? '💪 Good try!' : '📚 Keep practicing!'}
              </div>
            </div>
          )}

          {quiz.questions.map((q, qi) => (
            <div key={qi} className="card quiz-question" style={{ padding: '20px', marginBottom: '12px' }}>
              <div className="quiz-q-number">Q{qi + 1}</div>
              <div className="quiz-q-text">{q.q}</div>
              <div className="quiz-options">
                {q.options.map((opt, oi) => {
                  let cls = 'quiz-option'
                  if (submitted) {
                    if (oi === q.correct) cls += ' correct'
                    else if (answers[qi] === oi) cls += ' wrong'
                  } else if (answers[qi] === oi) cls += ' selected'
                  return (
                    <button key={oi} className={cls} onClick={() => !submitted && setAnswers(p => ({ ...p, [qi]: oi }))}>
                      <span className="quiz-opt-letter">{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {!submitted && quiz.questions.length > 0 && (
            <button className="add-btn" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }} onClick={submitQuiz}>
              Submit Quiz
            </button>
          )}
          {submitted && (
            <button className="add-btn" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }} onClick={() => generateQuiz(quiz.topic)}>
              🔄 Retake Quiz
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Quiz
