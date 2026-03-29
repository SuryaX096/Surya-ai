/**
 * Settings Page
 * API key management, data controls, and app preferences
 */
import { useState } from 'react'

function Settings({ apiKey, setApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [exportMsg, setExportMsg] = useState('')

  const saveApiKey = () => {
    setApiKey(keyInput.trim())
    localStorage.setItem('surya-ai-key', keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const removeApiKey = () => {
    setApiKey('')
    setKeyInput('')
    localStorage.removeItem('surya-ai-key')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportData = () => {
    const data = {}
    const keys = [
      'surya-ai-tasks', 'surya-ai-notes', 'surya-ai-goals', 'surya-ai-chat',
      'surya-ai-focus-count', 'surya-ai-focus-minutes',
      'surya-ai-habits', 'surya-ai-habit-completions', 'surya-ai-dsa-problems',
      'surya-ai-kanban', 'surya-ai-snippets', 'surya-ai-bookmarks',
      'surya-ai-quiz-history', 'surya-ai-study-notes', 'surya-ai-trades',
    ]
    keys.forEach(key => {
      const val = localStorage.getItem(key)
      if (val) data[key] = val
    })

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `surya-ai-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg('✅ Backup downloaded!')
    setTimeout(() => setExportMsg(''), 3000)
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          const allowedPrefix = 'surya-ai-'
          Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith(allowedPrefix)) {
              localStorage.setItem(key, value)
            }
          })
          setExportMsg('✅ Data imported! Refresh the page to see changes.')
          setTimeout(() => setExportMsg(''), 4000)
        } catch {
          setExportMsg('❌ Invalid backup file.')
          setTimeout(() => setExportMsg(''), 3000)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const resetAllData = () => {
    const keys = [
      'surya-ai-tasks', 'surya-ai-notes', 'surya-ai-goals', 'surya-ai-chat',
      'surya-ai-focus-count', 'surya-ai-focus-minutes', 'surya-ai-key',
      'surya-ai-habits', 'surya-ai-habit-completions', 'surya-ai-dsa-problems',
      'surya-ai-kanban', 'surya-ai-snippets', 'surya-ai-bookmarks',
      'surya-ai-quiz-history', 'surya-ai-study-notes', 'surya-ai-trades',
    ]
    keys.forEach(key => localStorage.removeItem(key))
    setApiKey('')
    setKeyInput('')
    setShowResetConfirm(false)
    setExportMsg('🗑️ All data cleared. Refresh the page to reset.')
    setTimeout(() => setExportMsg(''), 4000)
  }

  // Calculate storage usage
  const getStorageSize = () => {
    let total = 0
    const keys = [
      'surya-ai-tasks', 'surya-ai-notes', 'surya-ai-goals', 'surya-ai-chat',
      'surya-ai-focus-count', 'surya-ai-focus-minutes',
      'surya-ai-habits', 'surya-ai-habit-completions', 'surya-ai-dsa-problems',
      'surya-ai-kanban', 'surya-ai-snippets', 'surya-ai-bookmarks',
      'surya-ai-quiz-history', 'surya-ai-study-notes', 'surya-ai-trades',
    ]
    keys.forEach(key => {
      const val = localStorage.getItem(key)
      if (val) total += val.length * 2 // UTF-16
    })
    if (total < 1024) return `${total} B`
    return `${(total / 1024).toFixed(1)} KB`
  }

  return (
    <div>
      {/* Status Message */}
      {(saved || exportMsg) && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--accent-green)',
          fontSize: '0.85rem',
          marginBottom: '20px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {saved ? '✅ Settings saved successfully!' : exportMsg}
        </div>
      )}

      {/* AI Configuration */}
      <div className="settings-section">
        <h3>🤖 AI Configuration</h3>
        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '14px' }}>
          <div className="setting-info">
            <div className="setting-label">Gemini API Key</div>
            <div className="setting-desc">
              Required for AI chat. Get your free key at{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-purple)', textDecoration: 'underline' }}
              >
                Google AI Studio
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              id="settings-api-key"
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your Gemini API key..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-family)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {showKey ? '🙈 Hide' : '👁 Show'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="save-settings-btn" onClick={saveApiKey}>
              💾 Save Key
            </button>
            {apiKey && (
              <button
                onClick={removeApiKey}
                style={{
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--accent-red)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                🗑️ Remove Key
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <h3>💾 Data Management</h3>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Export Backup</div>
            <div className="setting-desc">Download all your data as a JSON file</div>
          </div>
          <button
            id="export-data-btn"
            className="save-settings-btn"
            onClick={exportData}
            style={{ fontSize: '0.82rem', padding: '8px 18px' }}
          >
            📦 Export
          </button>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Import Backup</div>
            <div className="setting-desc">Restore data from a backup file</div>
          </div>
          <button
            id="import-data-btn"
            className="save-settings-btn"
            onClick={importData}
            style={{ fontSize: '0.82rem', padding: '8px 18px' }}
          >
            📥 Import
          </button>
        </div>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-label">Storage Used</div>
            <div className="setting-desc">Local browser storage usage</div>
          </div>
          <span style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(139, 92, 246, 0.15)',
            color: 'var(--accent-purple)',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}>
            {getStorageSize()}
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section">
        <h3>⚠️ Danger Zone</h3>
        <div className="setting-row" style={{
          borderColor: 'rgba(239, 68, 68, 0.2)',
        }}>
          <div className="setting-info">
            <div className="setting-label" style={{ color: 'var(--accent-red)' }}>
              Reset All Data
            </div>
            <div className="setting-desc">
              Permanently delete all tasks, notes, goals, chat history, and settings
            </div>
          </div>
          {showResetConfirm ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={resetAllData}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--gradient-danger)',
                  color: 'white',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              id="reset-data-btn"
              onClick={() => setShowResetConfirm(true)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--accent-red)',
                fontFamily: 'var(--font-family)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              🗑️ Reset
            </button>
          )}
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <h3>ℹ️ About</h3>
        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'white',
            }}>
              S
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                SuryaAI
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Personal AI Dashboard • v1.0.0
              </div>
            </div>
          </div>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>
            Built with React + Vite. Powered by Gemini AI. Your personal productivity command center
            for mastering DSA, building projects, and crushing placements. 💪
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
