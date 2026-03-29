/**
 * Chat Page
 * AI Chat interface with Gemini API integration
 * Fixes: AbortController, API key in header, double-split, response validation
 */
import { useState, useRef, useEffect, useCallback } from 'react'

const SYSTEM_PROMPT = `You are SuryaAI, a personal AI assistant for Surya — a 2nd year CSE BTech student. 
You help with coding (C++, DSA, Web Dev), project planning (viralcheckout), trading analysis, and general productivity.
Be concise, sharp, and encouraging. Use a mix of English and Hinglish when appropriate.
Always provide practical, actionable advice. When giving code, include comments.`

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

function Chat({ apiKey, onGoToSettings }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('surya-ai-chat')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  // Persist messages
  useEffect(() => {
    localStorage.setItem('surya-ai-chat', JSON.stringify(messages))
  }, [messages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const suggestions = [
    "Explain Linked Lists in C++",
    "Help me plan viralcheckout features",
    "Give me a DSA study plan for placements",
    "What's the best React state management in 2026?",
  ]

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    const userMsg = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `⚠️ **API key not configured.**\n\nTo enable AI chat, go to **Settings** and add your Gemini API key.\n\nYou can get a free key at [Google AI Studio](https://aistudio.google.com/apikey).\n\nIn the meantime, I'm here as a placeholder! 🤖`
        }])
        setIsLoading(false)
      }, 800)
      return
    }

    // Abort any previous in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      // Build conversation context for Gemini
      const contents = newMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          }
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData?.error?.message || `HTTP ${response.status}`
        throw new Error(errorMsg)
      }

      const data = await response.json()

      // Validate response structure
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!aiText) {
        const blockReason = data?.candidates?.[0]?.finishReason
        throw new Error(
          blockReason === 'SAFETY'
            ? 'Response blocked by safety filters. Try rephrasing.'
            : 'Empty response from AI. Please try again.'
        )
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiText }])
    } catch (error) {
      // Don't show error for intentional aborts
      if (error.name === 'AbortError') return

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Error:** ${error.message}\n\nPlease check your API key in Settings.`
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, apiKey, isLoading])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    abortRef.current?.abort()
    setMessages([])
    setIsLoading(false)
    localStorage.removeItem('surya-ai-chat')
  }

  // Pre-split lines once, not twice per render
  const renderMessageContent = (content) => {
    const lines = content.split('\n')
    return lines.map((line, j) => (
      <span key={j}>
        {line}
        {j < lines.length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="chat-container">
      {/* API Key Warning */}
      {!apiKey && (
        <div className="api-banner">
          <span>⚠️</span>
          <span>
            AI chat requires a Gemini API key. 
            <a onClick={onGoToSettings}> Go to Settings</a> to add your key (it's free!).
          </span>
        </div>
      )}

      {/* Messages or Welcome */}
      {messages.length === 0 ? (
        <div className="chat-welcome">
          <div className="welcome-icon">🤖</div>
          <h2>Hey Surya! I'm your AI.</h2>
          <p>Ask me anything about coding, DSA, projects, trading, or just brainstorm ideas together.</p>
          <div className="chat-suggestions">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="suggestion-chip"
                onClick={() => sendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="msg-avatar">
                {msg.role === 'user' ? 'S' : '✦'}
              </div>
              <div className="msg-content">
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-message assistant">
              <div className="msg-avatar">✦</div>
              <div className="msg-content">
                <div className="ai-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        {messages.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginBottom: '8px' 
          }}>
            <button
              onClick={clearChat}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-family)',
              }}
            >
              🗑️ Clear Chat
            </button>
          </div>
        )}
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-input"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            id="chat-send"
            className="chat-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
