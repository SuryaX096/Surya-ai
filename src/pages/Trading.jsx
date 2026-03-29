/**
 * Trading Journal
 * Log trades with entry/exit, P&L tracking, and notes
 */
import { useState, useEffect } from 'react'

function Trading() {
  const [trades, setTrades] = useState(() => {
    const s = localStorage.getItem('surya-ai-trades')
    return s ? JSON.parse(s) : []
  })
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    symbol: '', type: 'buy', entry: '', exit: '', qty: '1',
    date: new Date().toISOString().split('T')[0], notes: '', status: 'closed',
  })

  useEffect(() => { localStorage.setItem('surya-ai-trades', JSON.stringify(trades)) }, [trades])

  const addTrade = () => {
    if (!form.symbol.trim() || !form.entry) return
    const trade = {
      id: Date.now(), ...form,
      symbol: form.symbol.trim().toUpperCase(),
      entry: parseFloat(form.entry),
      exit: form.exit ? parseFloat(form.exit) : null,
      qty: parseInt(form.qty) || 1,
      notes: form.notes.trim(),
    }
    setTrades(p => [trade, ...p])
    setForm({ symbol: '', type: 'buy', entry: '', exit: '', qty: '1', date: new Date().toISOString().split('T')[0], notes: '', status: 'closed' })
    setShowModal(false)
  }

  const del = (id) => setTrades(p => p.filter(t => t.id !== id))

  const getPnL = (t) => {
    if (!t.exit) return null
    const diff = t.type === 'buy' ? t.exit - t.entry : t.entry - t.exit
    return diff * t.qty
  }

  const totalPnL = trades.reduce((sum, t) => sum + (getPnL(t) || 0), 0)
  const wins = trades.filter(t => (getPnL(t) || 0) > 0).length
  const losses = trades.filter(t => (getPnL(t) || 0) < 0).length
  const winRate = trades.length > 0 ? Math.round((wins / Math.max(wins + losses, 1)) * 100) : 0

  const filtered = trades.filter(t => {
    if (filter === 'wins') return (getPnL(t) || 0) > 0
    if (filter === 'losses') return (getPnL(t) || 0) < 0
    if (filter === 'open') return !t.exit
    return true
  })

  return (
    <div>
      {/* Stats */}
      <div className="analytics-overview" style={{ marginBottom: '20px' }}>
        <div className="card analytics-stat-card">
          <div className="analytics-stat-value">{trades.length}</div>
          <div className="analytics-stat-label">Total Trades</div>
        </div>
        <div className="card analytics-stat-card">
          <div className="analytics-stat-value" style={{ color: totalPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
          </div>
          <div className="analytics-stat-label">Total P&L</div>
        </div>
        <div className="card analytics-stat-card">
          <div className="analytics-stat-value" style={{ color: winRate >= 50 ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
            {winRate}%
          </div>
          <div className="analytics-stat-label">Win Rate</div>
        </div>
        <div className="card analytics-stat-card">
          <div className="analytics-stat-value">{wins}W / {losses}L</div>
          <div className="analytics-stat-label">Record</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="task-filters">
          {['all', 'wins', 'losses', 'open'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? '📋 All' : f === 'wins' ? '🟢 Wins' : f === 'losses' ? '🔴 Losses' : '⏳ Open'}
            </button>
          ))}
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>+ Log Trade</button>
      </div>

      {/* Trades List */}
      <div className="trading-list">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📉</div><h4>No trades</h4><p>Start logging your trades!</p></div>
        ) : filtered.map(t => {
          const pnl = getPnL(t)
          return (
            <div key={t.id} className="card" style={{ padding: '16px 20px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{t.symbol}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600,
                      background: t.type === 'buy' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: t.type === 'buy' ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>{t.type.toUpperCase()}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>×{t.qty}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Entry: ₹{t.entry} {t.exit ? `→ Exit: ₹${t.exit}` : '(Open)'}
                  </div>
                  {t.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>💡 {t.notes}</div>}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {pnl !== null && (
                    <span style={{
                      fontWeight: 800, fontSize: '1rem',
                      color: pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                      {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                    </span>
                  )}
                  <button className="task-delete" onClick={() => del(t.id)}>×</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>📉 Log Trade</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Symbol (RELIANCE, NIFTY)" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} autoFocus style={{ flex: 1 }} />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)' }}>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Entry ₹" value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} />
              <input type="number" placeholder="Exit ₹ (optional)" value={form.exit} onChange={e => setForm({ ...form, exit: e.target.value })} />
              <input type="number" placeholder="Qty" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} style={{ width: '80px' }} />
            </div>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'var(--font-family)', width: '100%' }} />
            <textarea placeholder="Notes / Strategy (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ minHeight: '60px' }} />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={addTrade}>Log Trade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trading
