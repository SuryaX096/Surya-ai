/**
 * Header Component
 * Displays current page title, badge, and time
 */
import { useState, useEffect } from 'react'

function Header({ title, badge }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  
  const formattedDate = time.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <header className="header">
      <div className="header-left">
        <h2>{title}</h2>
        {badge && <span className="page-badge">{badge}</span>}
      </div>
      <div className="header-right">
        <span style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)',
          fontWeight: 500 
        }}>
          {formattedDate}
        </span>
        <span style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-primary)',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums'
        }}>
          {formattedTime}
        </span>
      </div>
    </header>
  )
}

export default Header
