// components/MembersList.jsx
import React, { useState, useEffect } from "react";

/**
 * Props
 * ─────
 * onBack?          fn() - Optional callback to return to previous view
 * currentUser      { role } - To verify librarian access
 */
function MembersList({ onBack, currentUser }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | blocked
  const [actionLoading, setActionLoading] = useState(null);

  // ── 🔧 HELPER: Safe JSON fetch with HTML detection ─────────────────────
  const fetchJSON = async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
      });

      // 🔍 Detect if response is HTML (likely error page)
      const contentType = res.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
        const text = await res.text();
        console.error(`❌ Expected JSON from ${url}, received:`, contentType);
        console.error("Response preview:", text.substring(0, 300));
        
        if (text.toLowerCase().includes("<!doctype") || text.toLowerCase().includes("<html")) {
          throw new Error(
            `Server returned HTML instead of JSON.\n\n` +
            `Status: ${res.status} ${res.statusText}\n` +
            `URL: ${url}\n\n` +
            `💡 Possible causes:\n` +
            `• Backend server not running on expected port\n` +
            `• Proxy not configured in frontend\n` +
            `• API route not registered in Express\n` +
            `• Static files middleware catching API requests`
          );
        }
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      // Parse JSON
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }
      
      return { success: true, data, status: res.status };
      
    } catch (err) {
      // Network errors, JSON parse errors, etc.
      if (err.name === "SyntaxError" && err.message.includes("Unexpected token")) {
        throw new Error(
          `Failed to parse API response as JSON.\n\n` +
          `This usually means the backend returned HTML (like a 404 page).\n` +
          `Check: Is your backend running? Is the proxy configured?\n\n` +
          `Original error: ${err.message}`
        );
      }
      throw err;
    }
  };

 

  // ── Initial fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchMembers();
  }, []);

  // ── Search with debounce ──────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const debounce = setTimeout(() => {
        fetchMembers(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    } else if (!searchQuery) {
      fetchMembers();
    }
  }, [searchQuery]);

// ── In MembersList.jsx — TWO changes needed ───────────────────────────────────

// CHANGE 1: Add this constant at the top of the file (line ~1, after imports)
const API_BASE = "http://localhost:5000";


// CHANGE 2: Update fetchMembers to use API_BASE + send Authorization header
const fetchMembers = async (query = "") => {
  try {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    const url = query
      ? `${API_BASE}/api/users/search?query=${encodeURIComponent(query)}`
      : `${API_BASE}/api/users/members`;  // ✅ was "/api/users/members" — hit Vite, not Express

    console.log(`🔍 Fetching: ${url}`);

    const result = await fetchJSON(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),  // ✅ send JWT
      },
    });

    if (result.success) {
      setMembers(result.data.data || []);
    }
  } catch (err) {
    console.error("❌ Fetch members error:", err);
    setError(err.message || "Failed to load members");
  } finally {
    setLoading(false);
  }
};


// CHANGE 3: Same fix for handleToggleBlock
const handleToggleBlock = async (userId, currentStatus) => {
  const newStatus = !currentStatus;
  const action = newStatus ? "block" : "unblock";

  setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, isBlocked: newStatus } : m)));
  setActionLoading(userId);

  const token = localStorage.getItem("token");

  try {
    const result = await fetchJSON(`${API_BASE}/api/users/${userId}/block`, {  // ✅ absolute URL
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ block: newStatus }),
    });
    console.log(`✅ User ${action}ed:`, result.data);
  } catch (err) {
    console.error(`❌ Failed to ${action} user:`, err);
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, isBlocked: currentStatus } : m)));
    alert(`Failed to ${action} user:\n\n${err.message}`);
  } finally {
    setActionLoading(null);
  }
};

  // ── Filter members ────────────────────────────────────────────────────
  const filteredMembers = members.filter(member => {
    if (filter === "active") return !member.isBlocked;
    if (filter === "blocked") return member.isBlocked;
    return true;
  });

  // ── Format date helper ────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ── Render connection test button (dev only) ──────────────────────────
  const renderConnectionTest = () => {
    if (process.env.NODE_ENV !== "development") return null;
    
    return (
      <button
        onClick={async () => {
          try {
            const res = await fetch("/api/health");
            const data = await res.json();
            alert(`✅ Backend connected!\n\n${JSON.stringify(data, null, 2)}`);
          } catch (err) {
            alert(`❌ Backend connection failed:\n\n${err.message}`);
          }
        }}
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          padding: "8px 16px",
          background: "rgba(58,170,138,0.2)",
          border: "1px solid rgba(58,170,138,0.4)",
          borderRadius: "8px",
          color: "#5fdbb0",
          fontSize: "11px",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        🔌 Test API
      </button>
    );
  };

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
          --danger: #dc503c;
          --danger-light: #ff8a75;
          --success: #3aaa8a;
          --radius: 12px;
          --shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .lms-members-page {
          min-height: calc(100vh - 68px);
          background: linear-gradient(180deg, var(--bg-dark) 0%, #15100a 100%);
          padding: 24px 28px;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
        }
        .lms-members-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .lms-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700; color: var(--parchment);
          display: flex; align-items: center; gap: 10px; margin: 0;
        }
        .lms-back-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; background: transparent;
          border: 1px solid var(--card-border); border-radius: 8px;
          color: var(--text-secondary); font-size: 13px; cursor: pointer;
          transition: all 0.2s;
        }
        .lms-back-btn:hover {
          background: rgba(184,134,11,0.1); color: var(--gold-bright);
          border-color: rgba(184,134,11,0.4);
        }
        .lms-controls {
          display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .lms-search-input {
          flex: 1; min-width: 200px; max-width: 320px;
          height: 40px; padding: 0 16px 0 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--card-border); border-radius: 8px;
          color: var(--parchment); font-family: 'DM Sans', sans-serif;
          font-size: 14px; outline: none;
          transition: border-color 0.2s;
          background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: 12px center;
        }
        .lms-search-input:focus {
          border-color: rgba(184,134,11,0.5);
          background-color: rgba(255,255,255,0.08);
        }
        .lms-filter-group {
          display: flex; gap: 4px; background: rgba(255,255,255,0.04);
          padding: 4px; border-radius: 8px; border: 1px solid var(--card-border);
        }
        .lms-filter-btn {
          padding: 8px 14px; border: none; background: transparent;
          color: var(--text-secondary); font-size: 13px; font-weight: 500;
          border-radius: 6px; cursor: pointer; transition: all 0.15s;
        }
        .lms-filter-btn.active, .lms-filter-btn:hover {
          background: rgba(184,134,11,0.15); color: var(--gold-bright);
        }
        .lms-members-count {
          font-size: 13px; color: var(--text-secondary);
          margin-left: auto; display: flex; align-items: center; gap: 6px;
        }
        .lms-table-wrap {
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: var(--radius); overflow: hidden;
          box-shadow: var(--shadow);
        }
        .lms-table {
          width: 100%; border-collapse: collapse; font-size: 14px;
        }
        .lms-table th {
          text-align: left; padding: 14px 18px;
          background: rgba(184,134,11,0.08); border-bottom: 1px solid var(--card-border);
          font-weight: 600; color: var(--gold-bright); font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .lms-table td {
          padding: 14px 18px; border-bottom: 1px solid rgba(184,134,11,0.1);
          color: var(--text-primary); vertical-align: middle;
        }
        .lms-table tr:last-child td { border-bottom: none; }
        .lms-table tr:hover { background: rgba(184,134,11,0.06); }
        .lms-user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, var(--teal-light), #1a5c4a);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .lms-user-info {
          display: flex; flex-direction: column; gap: 2px;
        }
        .lms-user-name { font-weight: 500; color: var(--parchment); }
        .lms-user-email { font-size: 12px; color: var(--text-secondary); }
        .lms-status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px; font-size: 11px;
          font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .lms-status-active {
          background: rgba(58,170,138,0.15); color: #5fdbb0;
        }
        .lms-status-blocked {
          background: rgba(220,60,40,0.15); color: var(--danger-light);
        }
        .lms-toggle-btn {
          padding: 6px 14px; border-radius: 6px; border: none;
          font-size: 12px; font-weight: 500; cursor: pointer;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
        }
        .lms-toggle-btn.block {
          background: rgba(220,60,40,0.15); color: var(--danger-light);
          border: 1px solid rgba(220,60,40,0.3);
        }
        .lms-toggle-btn.block:hover {
          background: rgba(220,60,40,0.25); color: #ff6b55;
        }
        .lms-toggle-btn.unblock {
          background: rgba(58,170,138,0.15); color: #5fdbb0;
          border: 1px solid rgba(58,170,138,0.3);
        }
        .lms-toggle-btn.unblock:hover {
          background: rgba(58,170,138,0.25); color: #7fffd4;
        }
        .lms-toggle-btn:disabled {
          opacity: 0.6; cursor: not-allowed; transform: none !important;
        }
        .lms-empty-state {
          text-align: center; padding: 48px 24px; color: var(--text-secondary);
        }
        .lms-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.5; }
        .lms-loading {
          display: flex; justify-content: center; padding: 40px;
          color: var(--text-secondary); font-size: 14px;
        }
        .lms-error {
          background: rgba(220,60,40,0.1); border: 1px solid rgba(220,60,40,0.3);
          color: var(--danger-light); padding: 14px 18px; border-radius: 8px;
          margin-bottom: 16px; font-size: 14px; white-space: pre-wrap;
        }
        .lms-error-details {
          margin-top: 12px; padding: 12px;
          background: rgba(0,0,0,0.2); border-radius: 6px;
          font-size: 11px; color: var(--text-secondary);
          max-height: 200px; overflow-y: auto;
        }
        .lms-table-responsive {
          overflow-x: auto;
        }
        @media (max-width: 768px) {
          .lms-members-page { padding: 16px; }
          .lms-table { font-size: 13px; }
          .lms-table th, .lms-table td { padding: 12px 14px; }
          .lms-user-info { max-width: 150px; }
          .lms-controls { flex-direction: column; }
          .lms-search-input { max-width: 100%; }
        }
      `}</style>

      <div className="lms-members-page">
        {/* Header */}
        <div className="lms-members-header">
          <h1 className="lms-page-title">
            {onBack && (
              <button className="lms-back-btn" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
            )}
            👥 Member Management
          </h1>
        </div>

        {/* Controls */}
        <div className="lms-controls">
          <input
            type="text"
            className="lms-search-input"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="lms-filter-group">
            {["all", "active", "blocked"].map((f) => (
              <button
                key={f}
                className={`lms-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="lms-members-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="lms-error">
            ⚠️ {error.split('\n')[0]}
            {error.includes('💡') && (
              <div className="lms-error-details">
                <strong>Debug hints:</strong><br/>
                {error.split('💡')[1]?.split('\n').filter(l => l.trim()).map((line, i) => (
                  <span key={i}>• {line.trim()}<br/></span>
                ))}
                <br/>
                <strong>Quick fixes:</strong><br/>
                • Ensure backend is running: <code>node server.js</code><br/>
                • Check proxy in package.json: <code>"proxy": "http://localhost:5000"</code><br/>
                • Verify route exists: <code>GET /api/users/members</code><br/>
                • Test manually: <code>curl http://localhost:5000/api/health</code>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="lms-loading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite", marginRight: 8 }}>
              <path d="M21 12a9 9 0 1 1-6.22-8.55" />
            </svg>
            Loading members...
          </div>
        )}

        {/* Members Table */}
        {!loading && !error && (
          <div className="lms-table-wrap">
            <div className="lms-table-responsive">
              <table className="lms-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Contact</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="lms-user-avatar">
                              {member.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                            </div>
                            <div className="lms-user-info">
                              <span className="lms-user-name">{member.name}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="lms-user-info">
                            <span className="lms-user-email">{member.email}</span>
                            {member.phone && <span className="lms-user-email">{member.phone}</span>}
                          </div>
                        </td>
                        <td>{formatDate(member.joinedAt)}</td>
                        <td>
                          <span className={`lms-status-badge ${member.isBlocked ? "lms-status-blocked" : "lms-status-active"}`}>
                            {member.isBlocked ? "🔒 Blocked" : "✓ Active"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`lms-toggle-btn ${member.isBlocked ? "unblock" : "block"}`}
                            onClick={() => handleToggleBlock(member.id, member.isBlocked)}
                            disabled={actionLoading === member.id}
                          >
                            {actionLoading === member.id ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                                  <path d="M21 12a9 9 0 1 1-6.22-8.55" />
                                </svg>
                                Processing...
                              </>
                            ) : member.isBlocked ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                  <path d="m4.93 4.93 14.14 14.14" />
                                </svg>
                                Unblock
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                </svg>
                                Block
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
                        <div className="lms-empty-state">
                          <div className="lms-empty-icon">🔍</div>
                          <p>{searchQuery ? "No members match your search" : "No members found"}</p>
                          {searchQuery && (
                            <button 
                              className="lms-back-btn" 
                              style={{ marginTop: 12 }}
                              onClick={() => setSearchQuery("")}
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dev-only connection test button */}
        {renderConnectionTest()}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default MembersList;