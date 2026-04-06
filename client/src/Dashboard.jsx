// Dashboard.jsx
import React from "react";

/**
 * Props
 * ─────
 * user          { name, initials, role: "Member"|"Librarian", email } | null
 * isLoggedIn    bool
 * setActivePage fn(label)
 */
function Dashboard({ user = null, isLoggedIn = false, setActivePage }) {
  const isLibrarian = isLoggedIn && user?.role === "Librarian";
  const isMember = isLoggedIn && user?.role === "Member";

  // Mock data – replace with real API calls in production
  const memberStats = {
    borrowed: 3,
    reservations: 1,
    fines: 0,
    recent: [
      { id: 1, title: "The Midnight Library", due: "2026-04-15", status: "active" },
      { id: 2, title: "Project Hail Mary", due: "2026-04-20", status: "active" },
      { id: 3, title: "Klara and the Sun", due: "2026-03-30", status: "returned" },
    ],
  };

  const librarianStats = {
    totalBooks: 12480,
    activeMembers: 342,
    pendingReservations: 18,
    overdueItems: 7,
    recentActivity: [
      { id: 1, action: "Book checked out", user: "Alex M.", book: "Dune", time: "2 min ago" },
      { id: 2, action: "New member registered", user: "Samira K.", time: "15 min ago" },
      { id: 3, action: "Reservation fulfilled", user: "Jordan P.", book: "Atomic Habits", time: "1 hr ago" },
    ],
  };

  const quickActions = isLibrarian
    ? [
        { label: "Add New Book", icon: "📚", page: "BookUpload" },
        { label: "Manage Members", icon: "👥", page: "Members" },
        { label: "Circulation Desk", icon: "🔄", page: "Circulation" },
        { label: "View Reports", icon: "📊", page: "Settings" },
      ]
    : isMember
    ? [
        { label: "Browse Catalog", icon: "🔍", page: "Catalog" },
        { label: "My Borrows", icon: "📖", page: "My Borrows" },
        { label: "Make Reservation", icon: "🔖", page: "Reservations" },
        { label: "Borrowing History", icon: "🕒", page: "History" },
      ]
    : [
        { label: "Explore Catalog", icon: "🔍", page: "Catalog" },
        { label: "Create Account", icon: "✨", action: "signup" },
        { label: "Learn More", icon: "ℹ️", action: "about" },
      ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --parchment: #f5f0e8;
          --gold: #b8860b;
          --gold-light: #d4a017;
          --gold-bright: #f0c040;
          --rust: #8b3a1a;
          --teal: #2a7a6a;
          --teal-light: #3aaa8a;
          --bg-dark: #1c1510;
          --card-bg: #2a2218;
          --card-border: rgba(184,134,11,0.2);
          --text-primary: rgba(245,240,232,0.95);
          --text-secondary: rgba(245,240,232,0.6);
          --radius: 12px;
          --shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .lms-dashboard {
          min-height: calc(100vh - 68px);
          background: linear-gradient(180deg, var(--bg-dark) 0%, #15100a 100%);
          padding: 28px;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
        }
        .lms-dashboard-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
        }
        .lms-welcome {
          display: flex; flex-direction: column; gap: 4px;
        }
        .lms-welcome-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: var(--parchment);
          margin: 0;
        }
        .lms-welcome-sub {
          font-size: 14px; color: var(--text-secondary);
          margin: 0;
        }
        .lms-date-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; background: rgba(184,134,11,0.12);
          border: 1px solid var(--card-border); border-radius: 20px;
          font-size: 12px; color: var(--gold-bright);
          font-weight: 500;
        }
        .lms-stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px; margin-bottom: 28px;
        }
        .lms-stat-card {
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: var(--radius); padding: 18px;
          display: flex; flex-direction: column; gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lms-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          border-color: rgba(184,134,11,0.4);
        }
        .lms-stat-icon {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; background: rgba(184,134,11,0.15);
          color: var(--gold-bright);
        }
        .role-member .lms-stat-icon {
          background: rgba(58,170,138,0.15); color: #5fdbb0;
        }
        .lms-stat-value {
          font-size: 24px; font-weight: 700; color: var(--parchment);
          margin: 0;
        }
        .lms-stat-label {
          font-size: 13px; color: var(--text-secondary); margin: 0;
        }
        .lms-section {
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: var(--radius); padding: 20px; margin-bottom: 24px;
        }
        .lms-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 600; color: var(--parchment);
          margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;
        }
        .lms-quick-actions {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }
        .lms-action-btn {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 16px 12px; background: rgba(255,255,255,0.04);
          border: 1px solid var(--card-border); border-radius: var(--radius);
          color: var(--text-primary); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .lms-action-btn:hover {
          background: rgba(184,134,11,0.15);
          border-color: rgba(184,134,11,0.4);
          transform: translateY(-1px);
        }
        .lms-action-icon {
          font-size: 22px;
        }
        .lms-list {
          display: flex; flex-direction: column; gap: 10px;
        }
        .lms-list-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 14px; background: rgba(255,255,255,0.03);
          border-radius: 8px; border-left: 3px solid var(--gold);
        }
        .role-member .lms-list-item { border-left-color: var(--teal-light); }
        .lms-list-item.returned { border-left-color: rgba(245,240,232,0.3); opacity: 0.7; }
        .lms-item-title {
          font-weight: 500; font-size: 14px; color: var(--parchment);
        }
        .lms-item-meta {
          font-size: 12px; color: var(--text-secondary);
        }
        .lms-item-status {
          font-size: 11px; font-weight: 600; padding: 4px 10px;
          border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .lms-status-active {
          background: rgba(58,170,138,0.15); color: #5fdbb0;
        }
        .lms-status-overdue {
          background: rgba(220,60,40,0.15); color: #ff8a75;
        }
        .lms-status-returned {
          background: rgba(245,240,232,0.1); color: var(--text-secondary);
        }
        .lms-empty-state {
          text-align: center; padding: 32px 16px; color: var(--text-secondary);
        }
        .lms-empty-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.6; }
        @media (max-width: 768px) {
          .lms-dashboard { padding: 16px; }
          .lms-dashboard-header { flex-direction: column; align-items: flex-start; }
          .lms-welcome-title { font-size: 24px; }
        }
      `}</style>

      <div className={`lms-dashboard ${isLoggedIn ? (isLibrarian ? "role-librarian" : "role-member") : ""}`}>
        {/* Header */}
        <div className="lms-dashboard-header">
          <div className="lms-welcome">
            <h1 className="lms-welcome-title">
              {isLoggedIn 
                ? `Welcome back, ${user?.name?.split(' ')[0] || 'Friend'}!` 
                : "Welcome to Bibliotheca"}
            </h1>
            <p className="lms-welcome-sub">
              {isLibrarian 
                ? "Manage your library operations" 
                : isMember 
                  ? "Track your borrows and discoveries" 
                  : "Explore our collection of stories"}
            </p>
          </div>
          <div className="lms-date-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="lms-stats-grid">
          {isLibrarian ? (
            <>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">📚</div>
                <p className="lms-stat-value">{librarianStats.totalBooks.toLocaleString()}</p>
                <p className="lms-stat-label">Total Books</p>
              </div>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">👥</div>
                <p className="lms-stat-value">{librarianStats.activeMembers}</p>
                <p className="lms-stat-label">Active Members</p>
              </div>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">🔖</div>
                <p className="lms-stat-value">{librarianStats.pendingReservations}</p>
                <p className="lms-stat-label">Pending Reservations</p>
              </div>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">⚠️</div>
                <p className="lms-stat-value">{librarianStats.overdueItems}</p>
                <p className="lms-stat-label">Overdue Items</p>
              </div>
            </>
          ) : isMember ? (
            <>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">📖</div>
                <p className="lms-stat-value">{memberStats.borrowed}</p>
                <p className="lms-stat-label">Currently Borrowed</p>
              </div>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">🔖</div>
                <p className="lms-stat-value">{memberStats.reservations}</p>
                <p className="lms-stat-label">Reservations</p>
              </div>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">💰</div>
                <p className="lms-stat-value">${memberStats.fines}</p>
                <p className="lms-stat-label">Outstanding Fines</p>
              </div>
              <div className="lms-stat-card" style={{ cursor: 'pointer' }} onClick={() => setActivePage?.("Catalog")}>
                <div className="lms-stat-icon">✨</div>
                <p className="lms-stat-value">Explore</p>
                <p className="lms-stat-label">New Arrivals</p>
              </div>
            </>
          ) : (
            <>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">📚</div>
                <p className="lms-stat-value">12K+</p>
                <p className="lms-stat-label">Books Available</p>
              </div>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">🌍</div>
                <p className="lms-stat-value">50+</p>
                <p className="lms-stat-label">Genres</p>
              </div>
              <div className="lms-stat-card">
                <div className="lms-stat-icon">👥</div>
                <p className="lms-stat-value">2K+</p>
                <p className="lms-stat-label">Happy Readers</p>
              </div>
              <div className="lms-stat-card" style={{ cursor: 'pointer' }} onClick={() => setActivePage?.("Catalog")}>
                <div className="lms-stat-icon">🔍</div>
                <p className="lms-stat-value">Browse</p>
                <p className="lms-stat-label">Catalog</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lms-section">
          <h2 className="lms-section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Quick Actions
          </h2>
          <div className="lms-quick-actions">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="lms-action-btn"
                onClick={() => {
                  if (action.page) setActivePage?.(action.page);
                  else if (action.action === "signup") alert("Sign up flow would open here");
                  else if (action.action === "about") alert("About Bibliotheca would open here");
                }}
              >
                <span className="lms-action-icon">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity / Borrows */}
        <div className="lms-section">
          <h2 className="lms-section-title">
            {isLibrarian ? "🕒 Recent Activity" : isMember ? "📚 Your Recent Borrows" : "✨ Featured Collections"}
          </h2>
          
          {isLibrarian ? (
            <div className="lms-list">
              {librarianStats.recentActivity.map((item) => (
                <div key={item.id} className="lms-list-item">
                  <div>
                    <div className="lms-item-title">{item.action}</div>
                    <div className="lms-item-meta">
                      {item.user && <span>{item.user} • </span>}
                      {item.book && <span>{item.book} • </span>}
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isMember ? (
            memberStats.recent.length > 0 ? (
              <div className="lms-list">
                {memberStats.recent.map((item) => (
                  <div key={item.id} className={`lms-list-item ${item.status === 'returned' ? 'returned' : ''}`}>
                    <div>
                      <div className="lms-item-title">{item.title}</div>
                      <div className="lms-item-meta">Due: {new Date(item.due).toLocaleDateString()}</div>
                    </div>
                    <span className={`lms-item-status ${
                      item.status === 'active' ? 'lms-status-active' : 'lms-status-returned'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lms-empty-state">
                <div className="lms-empty-icon">📭</div>
                <p>No active borrows yet</p>
                <button 
                  className="lms-action-btn" 
                  style={{ marginTop: 12, width: 'auto', padding: '10px 20px' }}
                  onClick={() => setActivePage?.("Catalog")}
                >
                  Browse Catalog
                </button>
              </div>
            )
          ) : (
            <div className="lms-list">
              {["The Silent Patient", "Educated", "Sapiens", "The Vanishing Half"].map((book, i) => (
                <div key={i} className="lms-list-item" style={{ borderLeftColor: 'var(--gold-light)' }}>
                  <div>
                    <div className="lms-item-title">{book}</div>
                    <div className="lms-item-meta">Bestseller • Available now</div>
                  </div>
                  <button 
                    className="lms-item-status lms-status-active"
                    style={{ background: 'rgba(184,134,11,0.15)', color: 'var(--gold-bright)' }}
                    onClick={() => setActivePage?.("Catalog")}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;