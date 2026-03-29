/**
 * VoiceAssistant Component
 * Always-visible floating mic button with voice command processing.
 * Uses Web Speech API (SpeechRecognition + SpeechSynthesis).
 * 
 * Supported commands:
 *   Navigation: "open tasks", "go to analytics", "show settings"
 *   AI Chat:    "ask AI <question>", "hey surya <question>"
 *   Timer:      "start timer", "stop timer", "start focus"
 *   Tasks:      "add task <title>", "how many tasks"
 *   Info:       "what's my progress", "read stats"
 *   System:     "stop listening", "close", "help"
 */
import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Page routing map ───────────────────────────────────────────
const NAV_MAP = {
  dashboard: ['dashboard', 'home', 'main', 'overview'],
  chat: ['chat', 'ai', 'ai chat', 'gemini', 'assistant'],
  tasks: ['tasks', 'task', 'to do', 'todo', 'to-do'],
  notes: ['notes', 'note', 'sticky notes'],
  goals: ['goals', 'goal', 'targets', 'objectives'],
  focus: ['focus', 'timer', 'pomodoro', 'focus timer'],
  habits: ['habits', 'habit', 'streaks', 'daily habits'],
  analytics: ['analytics', 'stats', 'statistics', 'insights', 'progress'],
  dsa: ['dsa', 'dsa tracker', 'leetcode', 'problems', 'coding problems'],
  kanban: ['kanban', 'kanban board', 'board', 'projects', 'project board'],
  snippets: ['snippets', 'snippet', 'code snippets', 'code'],
  bookmarks: ['bookmarks', 'bookmark', 'links', 'resources', 'saved links'],
  quiz: ['quiz', 'ai quiz', 'test', 'take quiz', 'take a quiz'],
  studynotes: ['study notes', 'study', 'notes generator', 'generate notes'],
  trading: ['trading', 'trades', 'trade', 'trading journal', 'journal'],
  settings: ['settings', 'setting', 'config', 'configuration', 'preferences'],
}

// ─── Greetings for responses ────────────────────────────────────
const GREETINGS = [
  'Sure thing, Surya!',
  'On it, boss!',
  'Got it!',
  'Right away!',
  'Done, bhai!',
  'Here you go!',
]

const randomGreeting = () => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]

function VoiceAssistant({ onNavigate, activePage, apiKey }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const recognitionRef = useRef(null)
  const feedbackTimerRef = useRef(null)

  // ─── Check browser support ──────────────────────────────────
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const speechSupported = !!SpeechRecognition

  // ─── Text-to-Speech ─────────────────────────────────────────
  const speak = useCallback((text, callback) => {
    if (!window.speechSynthesis) return callback?.()
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.05
    utterance.pitch = 1.0
    utterance.volume = 0.9
    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha')
    )
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => { setIsSpeaking(false); callback?.() }
    utterance.onerror = () => { setIsSpeaking(false); callback?.() }
    window.speechSynthesis.speak(utterance)
  }, [])

  // ─── Show toast feedback ────────────────────────────────────
  const showToast = useCallback((msg, duration = 3000) => {
    setFeedback(msg)
    setShowFeedback(true)
    clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = setTimeout(() => setShowFeedback(false), duration)
  }, [])

  // ─── Resolve a navigation keyword to page key ──────────────
  const resolveNavPage = useCallback((text) => {
    const lower = text.toLowerCase().trim()
    for (const [page, keywords] of Object.entries(NAV_MAP)) {
      if (keywords.some(kw => lower.includes(kw))) return page
    }
    return null
  }, [])

  // ─── Ask Gemini via API ─────────────────────────────────────
  const askAI = useCallback(async (question) => {
    if (!apiKey) {
      return "You haven't set up your API key yet. Go to Settings to add your Gemini key."
    }
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: question }] }],
            systemInstruction: {
              parts: [{
                text: `You are SuryaAI voice assistant for Surya, a 2nd year CSE BTech student. 
                Keep responses VERY short (2-3 sentences max) since they'll be spoken aloud.
                Be conversational and encouraging. Mix English with light Hinglish.`
              }]
            },
            generationConfig: { temperature: 0.8, maxOutputTokens: 150 }
          })
        }
      )
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response."
    } catch {
      return "Sorry, there was an error connecting to the AI. Check your API key."
    }
  }, [apiKey])

  // ─── Get stats summary ──────────────────────────────────────
  const getStatsSummary = useCallback(() => {
    const tasks = JSON.parse(localStorage.getItem('surya-ai-tasks') || '[]')
    const dsa = JSON.parse(localStorage.getItem('surya-ai-dsa-problems') || '[]')
    const focusMins = parseInt(localStorage.getItem('surya-ai-focus-minutes') || '0')
    const sessions = parseInt(localStorage.getItem('surya-ai-focus-count') || '0')
    const done = tasks.filter(t => t.done).length
    const pending = tasks.length - done

    return `You have ${tasks.length} tasks, ${done} completed and ${pending} pending. ` +
      `${dsa.length} DSA problems solved. ` +
      `${sessions} focus sessions totaling ${focusMins} minutes. ` +
      (pending > 3 ? `You've got some catching up to do, Surya!` : `Looking solid, keep it up!`)
  }, [])

  // ─── Process the voice command ──────────────────────────────
  const processCommand = useCallback(async (text) => {
    const lower = text.toLowerCase().trim()
    if (!lower) return

    setIsProcessing(true)
    showToast(`🎤 "${text}"`, 4000)

    // ── 1. Navigation commands ──
    const navPrefixes = ['open', 'go to', 'show', 'navigate to', 'switch to', 'take me to']
    for (const prefix of navPrefixes) {
      if (lower.startsWith(prefix)) {
        const target = lower.slice(prefix.length).trim()
        const page = resolveNavPage(target)
        if (page) {
          onNavigate(page)
          const msg = `${randomGreeting()} Opening ${NAV_MAP[page][0]}.`
          showToast(`✅ ${msg}`)
          speak(msg)
          setIsProcessing(false)
          return
        }
      }
    }
    // Also handle bare page names
    const directPage = resolveNavPage(lower)
    if (directPage && !lower.startsWith('ask') && !lower.startsWith('hey') && lower.split(' ').length <= 3) {
      onNavigate(directPage)
      const msg = `${randomGreeting()} Opening ${NAV_MAP[directPage][0]}.`
      showToast(`✅ ${msg}`)
      speak(msg)
      setIsProcessing(false)
      return
    }

    // ── 2. AI Chat commands ──
    const aiPrefixes = ['ask ai', 'hey surya', 'ask surya', 'tell me', 'explain', 'what is', 'what are', 'how to', 'how do']
    let aiQuestion = null
    for (const prefix of aiPrefixes) {
      if (lower.startsWith(prefix)) {
        aiQuestion = text.slice(prefix.length).trim() || text
        break
      }
    }
    if (aiQuestion) {
      showToast('🧠 Thinking...', 10000)
      speak('Let me think about that.')
      const answer = await askAI(aiQuestion)
      showToast(`🤖 ${answer}`, 8000)
      speak(answer)
      setIsProcessing(false)
      return
    }

    // ── 3. Focus timer commands ──
    if (lower.includes('start timer') || lower.includes('start focus') || lower.includes('start pomodoro')) {
      onNavigate('focus')
      showToast('⏱️ Opening Focus Timer — press Start!')
      speak(`${randomGreeting()} Opening the focus timer. Hit start when you're ready!`)
      setIsProcessing(false)
      return
    }

    // ── 4. Stats / Progress commands ──
    if (lower.includes('my progress') || lower.includes('my stats') || lower.includes('how am i doing') || lower.includes('read stats') || lower.includes('how many tasks')) {
      const summary = getStatsSummary()
      showToast(`📊 ${summary}`, 6000)
      speak(summary)
      setIsProcessing(false)
      return
    }

    // ── 5. Add task command ──
    if (lower.startsWith('add task') || lower.startsWith('create task') || lower.startsWith('new task')) {
      const taskTitle = text.replace(/^(add|create|new)\s+task\s*/i, '').trim()
      if (taskTitle) {
        const tasks = JSON.parse(localStorage.getItem('surya-ai-tasks') || '[]')
        tasks.push({ id: crypto.randomUUID?.() || Date.now(), text: taskTitle, done: false, priority: 'medium' })
        localStorage.setItem('surya-ai-tasks', JSON.stringify(tasks))
        showToast(`✅ Task added: "${taskTitle}"`)
        speak(`Done! I've added "${taskTitle}" to your tasks.`)
      } else {
        showToast('⚠️ Say "add task" followed by the task name')
        speak('Tell me the task name after "add task".')
      }
      setIsProcessing(false)
      return
    }

    // ── 6. Take quiz command ──
    if (lower.includes('take quiz') || lower.includes('start quiz') || lower.includes('quiz me')) {
      onNavigate('quiz')
      showToast('🧪 Opening AI Quiz!')
      speak(`${randomGreeting()} Let's test your knowledge!`)
      setIsProcessing(false)
      return
    }

    // ── 7. Help command ──
    if (lower.includes('help') || lower.includes('what can you do') || lower.includes('commands')) {
      setShowHelp(true)
      speak('Here are the commands I understand. Check the screen!')
      setIsProcessing(false)
      return
    }

    // ── 8. Stop commands ──
    if (lower.includes('stop listening') || lower.includes('stop') || lower === 'close' || lower === 'cancel') {
      speak('Okay, going quiet now.')
      stopListening()
      setIsProcessing(false)
      return
    }

    // ── 9. Greeting ──
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good evening')) {
      const hour = new Date().getHours()
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
      const msg = `${greeting}, Surya! I'm ready to help. Just say a command or ask me anything!`
      showToast(`👋 ${msg}`)
      speak(msg)
      setIsProcessing(false)
      return
    }

    // ── 10. Fallback — send to AI ──
    showToast('🧠 Let me ask AI...', 8000)
    const answer = await askAI(text)
    showToast(`🤖 ${answer}`, 8000)
    speak(answer)
    setIsProcessing(false)

  }, [onNavigate, resolveNavPage, askAI, getStatsSummary, speak, showToast])

  // ─── Initialize Speech Recognition ─────────────────────────
  useEffect(() => {
    if (!speechSupported) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += t
        } else {
          interimTranscript += t
        }
      }
      setTranscript(finalTranscript || interimTranscript)
      if (finalTranscript) {
        processCommand(finalTranscript)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setTranscript('')
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        showToast('🎤 No speech detected. Try again!')
      } else if (event.error === 'not-allowed') {
        showToast('⚠️ Microphone access denied. Please allow mic permission.')
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [speechSupported, processCommand, showToast])

  // ─── Start / Stop listening ─────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    window.speechSynthesis?.cancel()
    setTranscript('')
    setIsProcessing(false)
    try {
      recognitionRef.current.start()
      setIsListening(true)
      showToast('🎤 Listening... speak now!')
    } catch (err) {
      // Already started
      console.warn('Recognition error:', err)
    }
  }, [isListening, showToast])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()
    setIsListening(false)
    setIsSpeaking(false)
    setTranscript('')
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening || isSpeaking) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, isSpeaking, startListening, stopListening])

  // ─── Keyboard shortcut: Ctrl+Shift+V ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault()
        toggleListening()
      }
      if (e.key === 'Escape' && (isListening || showHelp)) {
        stopListening()
        setShowHelp(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleListening, isListening, stopListening, showHelp])

  if (!speechSupported) return null

  return (
    <>
      {/* ── Floating Mic Button ── */}
      <button
        id="voice-btn"
        className={`voice-fab ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={toggleListening}
        title="Voice Command (Ctrl+Shift+V)"
        aria-label="Toggle voice assistant"
      >
        <span className="voice-fab-icon">
          {isListening ? '🎤' : isSpeaking ? '🔊' : isProcessing ? '🧠' : '🎙️'}
        </span>
        {isListening && (
          <span className="voice-pulse-ring" />
        )}
      </button>

      {/* ── Listening Overlay ── */}
      {isListening && (
        <div className="voice-overlay" onClick={stopListening}>
          <div className="voice-overlay-content" onClick={e => e.stopPropagation()}>
            <div className="voice-waveform">
              <span /><span /><span /><span /><span />
            </div>
            <div className="voice-status">Listening...</div>
            {transcript && (
              <div className="voice-transcript">"{transcript}"</div>
            )}
            <button className="voice-stop-btn" onClick={stopListening}>
              ✕ Stop
            </button>
            <div className="voice-hint">
              Try: "Open tasks" • "Ask AI about DP" • "My progress" • "Help"
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Feedback ── */}
      {showFeedback && (
        <div className={`voice-toast ${showFeedback ? 'show' : ''}`}>
          {feedback}
        </div>
      )}

      {/* ── Help Modal ── */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h3>🎙️ Voice Commands</h3>
            <div className="voice-help-grid">
              <div className="voice-help-section">
                <div className="voice-help-title">📍 Navigation</div>
                <div className="voice-help-cmd">"Open tasks"</div>
                <div className="voice-help-cmd">"Go to analytics"</div>
                <div className="voice-help-cmd">"Show settings"</div>
              </div>
              <div className="voice-help-section">
                <div className="voice-help-title">🤖 AI Chat</div>
                <div className="voice-help-cmd">"Ask AI about binary trees"</div>
                <div className="voice-help-cmd">"Hey Surya, explain DP"</div>
                <div className="voice-help-cmd">"How to reverse a linked list"</div>
              </div>
              <div className="voice-help-section">
                <div className="voice-help-title">✅ Tasks</div>
                <div className="voice-help-cmd">"Add task submit assignment"</div>
                <div className="voice-help-cmd">"How many tasks"</div>
              </div>
              <div className="voice-help-section">
                <div className="voice-help-title">📊 Info</div>
                <div className="voice-help-cmd">"What's my progress"</div>
                <div className="voice-help-cmd">"Read stats"</div>
              </div>
              <div className="voice-help-section">
                <div className="voice-help-title">⏱️ Timer</div>
                <div className="voice-help-cmd">"Start focus timer"</div>
                <div className="voice-help-cmd">"Start pomodoro"</div>
              </div>
              <div className="voice-help-section">
                <div className="voice-help-title">🧪 Learning</div>
                <div className="voice-help-cmd">"Take quiz"</div>
                <div className="voice-help-cmd">"Open DSA tracker"</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Shortcut: <kbd style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', fontSize: '0.72rem' }}>Ctrl+Shift+V</kbd>
              </span>
              <button className="add-btn" onClick={() => setShowHelp(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VoiceAssistant
