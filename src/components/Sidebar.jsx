/**
 * Sidebar Component
 * Navigation sidebar with brand, categorized nav items, and user info
 */
function Sidebar({ activePage, onNavigate, pages }) {
  return (
    <aside className="sidebar" id="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <h1>SuryaAI</h1>
        <p>Personal Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Main</div>
        {['dashboard', 'chat', 'analytics'].map(key => (
          <button
            key={key}
            id={`nav-${key}`}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="icon">{pages[key].icon}</span>
            {pages[key].label}
          </button>
        ))}

        <div className="nav-section-title">Productivity</div>
        {['tasks', 'notes', 'goals', 'habits', 'focus'].map(key => (
          <button
            key={key}
            id={`nav-${key}`}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="icon">{pages[key].icon}</span>
            {pages[key].label}
          </button>
        ))}

        <div className="nav-section-title">Learning</div>
        {['dsa', 'quiz', 'studynotes', 'snippets', 'bookmarks'].map(key => (
          <button
            key={key}
            id={`nav-${key}`}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="icon">{pages[key].icon}</span>
            {pages[key].label}
          </button>
        ))}

        <div className="nav-section-title">Projects & Finance</div>
        {['kanban', 'trading'].map(key => (
          <button
            key={key}
            id={`nav-${key}`}
            className={`nav-item ${activePage === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="icon">{pages[key].icon}</span>
            {pages[key].label}
          </button>
        ))}

        <div className="nav-section-title">System</div>
        <button
          id="nav-settings"
          className={`nav-item ${activePage === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <span className="icon">⚙️</span>
          Settings
        </button>
      </nav>

      {/* User Info */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">S</div>
          <div className="user-details">
            <div className="name">Surya</div>
            <div className="role">CSE • 2nd Year</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
