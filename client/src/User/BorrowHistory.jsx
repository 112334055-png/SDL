// User/BorrowHistory.jsx
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000";

// ── helpers ───────────────────────────────────────────────────────────────────
const apiFetch = async (url) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

const getCoverUrl = (coverImage) => {
  if (!coverImage) return null;
  if (coverImage.startsWith("http://") || coverImage.startsWith("https://")) return coverImage;
  return `${API_BASE}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const daysBetween = (a, b) =>
  Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));

const isOverdue = (record) =>
  record.status === "approved" &&
  new Date(record.requestedReturnDate) < new Date();

// ── status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "#f0a840", bg: "rgba(212,134,26,0.12)",  border: "rgba(212,134,26,0.3)",  dot: "#f0a840", icon: "⏳" },
  approved: { label: "Approved", color: "#5fdbb0", bg: "rgba(58,170,138,0.12)",  border: "rgba(58,170,138,0.3)",  dot: "#5fdbb0", icon: "✓"  },
  rejected: { label: "Rejected", color: "#ff8a75", bg: "rgba(224,85,64,0.12)",   border: "rgba(224,85,64,0.3)",   dot: "#ff8a75", icon: "✕"  },
  returned: { label: "Returned", color: "#a0a0f0", bg: "rgba(120,120,180,0.12)", border: "rgba(120,120,180,0.3)", dot: "#a0a0f0", icon: "↩"  },
  overdue:  { label: "Overdue",  color: "#ff6b55", bg: "rgba(255,60,30,0.12)",   border: "rgba(255,60,30,0.3)",   dot: "#ff6b55", icon: "⚠"  },
};

const getStatusKey = (record) =>
  isOverdue(record) ? "overdue" : record.status;

// ── Tab counts ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "approved", label: "Active"   },
  { key: "returned", label: "Returned" },
  { key: "rejected", label: "Rejected" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function BorrowHistory({ currentUser, onBack }) {
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [tab,        setTab]        = useState("all");
  const [expanded,   setExpanded]   = useState(null); // _id of expanded card

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch("/api/circulation/my");
        setRecords(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // filter by tab
  const filtered = records.filter((r) => {
    if (tab === "all") return true;
    if (tab === "approved") return r.status === "approved"; // active = approved
    return r.status === tab;
  });

  // counts per tab
  const counts = records.reduce((acc, r) => {
    acc.all = (acc.all || 0) + 1;
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  // summary stats
  const totalBorrowed  = records.length;
  const totalReturned  = records.filter((r) => r.status === "returned").length;
  const totalActive    = records.filter((r) => r.status === "approved").length;
  const totalOverdue   = records.filter(isOverdue).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .bh-wrap {
          min-height: calc(100vh - 68px);
          background: linear-gradient(160deg, #1c1510 0%, #130e09 60%, #1a1208 100%);
          padding: 32px 32px 60px;
          font-family: 'DM Sans', sans-serif;
          color: #f5f0e8;
          position: relative;
        }

        /* subtle grain overlay */
        .bh-wrap::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.6;
        }

        .bh-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }

        /* ── Header ── */
        .bh-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
        }
        .bh-title-group { display: flex; flex-direction: column; gap: 4px; }
        .bh-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 700; color: #f5f0e8;
          display: flex; align-items: center; gap: 12px;
        }
        .bh-subtitle { font-size: 13px; color: rgba(245,240,232,0.4); }
        .bh-back-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 8px;
          border: 1px solid rgba(184,134,11,0.25);
          background: transparent; color: rgba(245,240,232,0.6);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          cursor: pointer; transition: all 0.18s; white-space: nowrap;
          flex-shrink: 0;
        }
        .bh-back-btn:hover { background: rgba(184,134,11,0.1); color: #f0c040; border-color: rgba(184,134,11,0.45); }

        /* ── Stats row ── */
        .bh-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 28px;
        }
        .bh-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(184,134,11,0.15);
          border-radius: 12px;
          padding: 16px 18px;
          display: flex; flex-direction: column; gap: 4px;
          transition: border-color 0.2s;
        }
        .bh-stat:hover { border-color: rgba(184,134,11,0.3); }
        .bh-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; line-height: 1;
        }
        .bh-stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(245,240,232,0.4); }

        /* ── Tabs ── */
        .bh-tabs {
          display: flex; gap: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(184,134,11,0.15);
          border-radius: 10px; padding: 4px;
          margin-bottom: 20px;
          width: fit-content; flex-wrap: wrap;
        }
        .bh-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 7px; border: none;
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          color: rgba(245,240,232,0.4);
          transition: background 0.18s, color 0.18s;
        }
        .bh-tab.active { background: rgba(184,134,11,0.18); color: #f0c040; }
        .bh-tab:not(.active):hover { color: rgba(245,240,232,0.75); background: rgba(184,134,11,0.07); }
        .bh-tab-count {
          min-width: 18px; height: 18px; border-radius: 9px; padding: 0 5px;
          background: rgba(184,134,11,0.2); color: #f0c040;
          font-size: 11px; display: flex; align-items: center; justify-content: center;
        }
        .bh-tab.active .bh-tab-count { background: rgba(184,134,11,0.45); }

        /* ── Card list ── */
        .bh-list { display: flex; flex-direction: column; gap: 12px; }

        .bh-card {
          background: #221a0e;
          border: 1px solid rgba(184,134,11,0.18);
          border-radius: 14px; overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
          animation: bhCardIn 0.3s ease both;
        }
        .bh-card:hover { border-color: rgba(184,134,11,0.35); box-shadow: 0 6px 28px rgba(0,0,0,0.4); }
        @keyframes bhCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bh-card-main {
          display: flex; gap: 16px; padding: 16px 18px;
          align-items: center; cursor: pointer;
        }

        /* cover */
        .bh-cover {
          width: 48px; height: 68px; flex-shrink: 0;
          border-radius: 7px; overflow: hidden;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(184,134,11,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .bh-cover img { width:100%; height:100%; object-fit:cover; display:block; }

        /* body */
        .bh-card-body { flex: 1; min-width: 0; }
        .bh-book-title {
          font-size: 14.5px; font-weight: 600; color: #f5f0e8;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .bh-book-author { font-size: 12px; color: rgba(245,240,232,0.4); margin-bottom: 8px; }
        .bh-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .bh-chip {
          display: flex; align-items: center; gap: 4px;
          font-size: 11.5px; color: rgba(245,240,232,0.45);
        }
        .bh-chip svg { color: rgba(184,134,11,0.5); flex-shrink: 0; }

        /* status pill */
        .bh-status {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 20px;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.03em;
          flex-shrink: 0;
        }
        .bh-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor; flex-shrink: 0;
        }

        /* chevron */
        .bh-chevron {
          color: rgba(245,240,232,0.25); flex-shrink: 0;
          transition: transform 0.2s, color 0.2s;
        }
        .bh-card:hover .bh-chevron { color: rgba(245,240,232,0.5); }
        .bh-chevron.open { transform: rotate(180deg); color: #f0c040; }

        /* expanded detail */
        .bh-detail {
          padding: 0 18px 18px;
          border-top: 1px solid rgba(184,134,11,0.1);
          animation: bhDetailIn 0.2s ease;
        }
        @keyframes bhDetailIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bh-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 0;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(184,134,11,0.12);
          border-radius: 10px; overflow: hidden;
          margin-top: 14px;
        }
        .bh-detail-cell {
          padding: 12px 16px;
          border-right: 1px solid rgba(184,134,11,0.1);
          border-bottom: 1px solid rgba(184,134,11,0.1);
        }
        .bh-detail-cell:last-child { border-right: none; }
        .bh-detail-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(184,134,11,0.55); margin-bottom: 4px;
        }
        .bh-detail-value { font-size: 13px; color: rgba(245,240,232,0.8); font-weight: 500; }
        .bh-detail-value.gold  { color: #f0c040; }
        .bh-detail-value.green { color: #5fdbb0; }
        .bh-detail-value.red   { color: #ff8a75; }
        .bh-detail-value.warn  { color: #f0a840; }
        .bh-detail-value.muted { color: rgba(245,240,232,0.35); }

        /* timeline dot */
        .bh-timeline {
          display: flex; align-items: flex-start; gap: 12px;
          margin-top: 14px; padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(184,134,11,0.1);
          border-radius: 10px;
        }
        .bh-timeline-line { display: flex; flex-direction: column; align-items: center; gap: 0; padding-top: 3px; }
        .bh-tl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .bh-tl-seg { width: 2px; flex: 1; min-height: 20px; background: rgba(184,134,11,0.15); margin: 2px 0; }
        .bh-timeline-events { flex: 1; display: flex; flex-direction: column; gap: 14px; }
        .bh-tl-event { display: flex; flex-direction: column; gap: 2px; }
        .bh-tl-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(184,134,11,0.55); }
        .bh-tl-value { font-size: 13px; color: rgba(245,240,232,0.75); }

        /* note banner */
        .bh-note {
          margin-top: 10px; padding: 10px 14px;
          border-radius: 8px; font-size: 12.5px;
          font-style: italic; color: rgba(245,240,232,0.5);
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(184,134,11,0.1);
          display: flex; gap: 8px; align-items: flex-start;
        }

        /* overdue banner */
        .bh-overdue-banner {
          margin-top: 10px; padding: 10px 14px;
          border-radius: 8px; font-size: 12.5px; font-weight: 600;
          color: #ff8a75;
          background: rgba(255,60,30,0.08);
          border: 1px solid rgba(255,60,30,0.25);
          display: flex; gap: 8px; align-items: center;
        }

        /* empty */
        .bh-empty {
          text-align: center; padding: 64px 20px;
          color: rgba(245,240,232,0.3);
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .bh-empty-icon { font-size: 52px; opacity: 0.45; }
        .bh-empty-title { font-family: 'Playfair Display', serif; font-size: 20px; color: rgba(245,240,232,0.5); }
        .bh-empty-sub { font-size: 13px; }

        /* error */
        .bh-error {
          background: rgba(220,60,40,0.1); border: 1px solid rgba(220,60,40,0.3);
          border-radius: 10px; padding: 16px 20px;
          color: #ff8a75; font-size: 13.5px;
          display: flex; gap: 10px; align-items: center;
        }

        /* loading */
        .bh-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; padding: 60px;
          color: rgba(245,240,232,0.35); font-size: 14px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bh-spinner {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid rgba(184,134,11,0.2);
          border-top-color: #b8860b;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .bh-wrap { padding: 20px 16px 48px; }
          .bh-stats { grid-template-columns: repeat(2, 1fr); }
          .bh-card-main { flex-wrap: wrap; }
          .bh-detail-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="bh-wrap">
        <div className="bh-inner">

          {/* ── Header ── */}
          <div className="bh-header">
            <div className="bh-title-group">
              <div className="bh-title">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Borrow History
              </div>
              <div className="bh-subtitle">
                {currentUser?.name ? `${currentUser.name}'s` : "Your"} complete borrowing record
              </div>
            </div>
            {onBack && (
              <button className="bh-back-btn" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>
            )}
          </div>

          {/* ── Stats ── */}
          {!loading && !error && (
            <div className="bh-stats">
              <div className="bh-stat">
                <div className="bh-stat-value" style={{ color: "#f0c040" }}>{totalBorrowed}</div>
                <div className="bh-stat-label">Total Requests</div>
              </div>
              <div className="bh-stat">
                <div className="bh-stat-value" style={{ color: "#5fdbb0" }}>{totalActive}</div>
                <div className="bh-stat-label">Currently Active</div>
              </div>
              <div className="bh-stat">
                <div className="bh-stat-value" style={{ color: "#a0a0f0" }}>{totalReturned}</div>
                <div className="bh-stat-label">Returned</div>
              </div>
              <div className="bh-stat">
                <div className="bh-stat-value" style={{ color: totalOverdue > 0 ? "#ff6b55" : "rgba(245,240,232,0.35)" }}>
                  {totalOverdue}
                </div>
                <div className="bh-stat-label">Overdue</div>
              </div>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="bh-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`bh-tab ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {(counts[t.key === "approved" ? "approved" : t.key] || counts.all) > 0 && (
                  <span className="bh-tab-count">
                    {t.key === "all" ? counts.all || 0
                      : t.key === "approved" ? (counts.approved || 0)
                      : (counts[t.key] || 0)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {loading && (
            <div className="bh-loading">
              <div className="bh-spinner" />
              Loading your borrow history…
            </div>
          )}

          {error && (
            <div className="bh-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="bh-empty">
              <div className="bh-empty-icon">📭</div>
              <div className="bh-empty-title">
                {tab === "all" ? "No borrows yet" : `No ${tab} requests`}
              </div>
              <div className="bh-empty-sub">
                {tab === "all"
                  ? "Your borrow history will appear here once you request a book."
                  : `You have no ${tab} borrow requests.`}
              </div>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="bh-list">
              {filtered.map((record, i) => {
                const statusKey = getStatusKey(record);
                const sc        = STATUS_CONFIG[statusKey];
                const coverUrl  = getCoverUrl(record.book?.coverImage);
                const isOpen    = expanded === record._id;
                const overdue   = isOverdue(record);
                const daysLeft  = record.status === "approved"
                  ? daysBetween(new Date(), record.requestedReturnDate)
                  : null;

                return (
                  <div
                    key={record._id}
                    className="bh-card"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {/* ── Main row ── */}
                    <div
                      className="bh-card-main"
                      onClick={() => setExpanded(isOpen ? null : record._id)}
                    >
                      {/* Cover */}
                      <div className="bh-cover">
                        {coverUrl ? (
                          <img src={coverUrl} alt={record.book?.title}
                            onError={(e) => { e.target.style.display = "none"; }} />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="rgba(245,240,232,0.2)" strokeWidth="1.5">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                          </svg>
                        )}
                      </div>

                      {/* Book info */}
                      <div className="bh-card-body">
                        <div className="bh-book-title">{record.book?.title || "Unknown Book"}</div>
                        <div className="bh-book-author">by {record.book?.author || "Unknown"}</div>
                        <div className="bh-chips">
                          {/* genre */}
                          {record.book?.genre && (
                            <span className="bh-chip">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                              </svg>
                              {record.book.genre}
                            </span>
                          )}
                          {/* requested date */}
                          <span className="bh-chip">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {formatDate(record.createdAt)}
                          </span>
                          {/* days left / overdue */}
                          {record.status === "approved" && (
                            <span className="bh-chip" style={{ color: overdue ? "#ff6b55" : "#5fdbb0" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {overdue ? `${daysBetween(record.requestedReturnDate, new Date())}d overdue` : `${daysLeft}d left`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status pill */}
                      <div
                        className="bh-status"
                        style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}
                      >
                        <span className="bh-status-dot" style={{ background: sc.color }} />
                        {sc.label}
                      </div>

                      {/* Chevron */}
                      <svg
                        className={`bh-chevron ${isOpen ? "open" : ""}`}
                        width="15" height="15" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.2"
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>

                    {/* ── Expanded detail ── */}
                    {isOpen && (
                      <div className="bh-detail">
                        {/* Overdue warning */}
                        {overdue && (
                          <div className="bh-overdue-banner">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            This book is {daysBetween(record.requestedReturnDate, new Date())} day(s) overdue. Please return it to the library.
                          </div>
                        )}

                        {/* Detail grid */}
                        <div className="bh-detail-grid">
                          <div className="bh-detail-cell">
                            <div className="bh-detail-label">Requested On</div>
                            <div className="bh-detail-value">{formatDate(record.createdAt)}</div>
                          </div>
                          <div className="bh-detail-cell">
                            <div className="bh-detail-label">Return By</div>
                            <div className={`bh-detail-value ${overdue ? "red" : "gold"}`}>
                              {formatDate(record.requestedReturnDate)}
                            </div>
                          </div>
                          {record.approvedAt && (
                            <div className="bh-detail-cell">
                              <div className="bh-detail-label">Approved On</div>
                              <div className="bh-detail-value green">{formatDate(record.approvedAt)}</div>
                            </div>
                          )}
                          {record.actualReturnDate && (
                            <div className="bh-detail-cell">
                              <div className="bh-detail-label">Returned On</div>
                              <div className="bh-detail-value green">{formatDate(record.actualReturnDate)}</div>
                            </div>
                          )}
                          {record.actionBy && (
                            <div className="bh-detail-cell">
                              <div className="bh-detail-label">
                                {record.status === "approved" || record.status === "returned"
                                  ? "Approved By" : "Actioned By"}
                              </div>
                              <div className="bh-detail-value">
                                {record.actionBy.firstName} {record.actionBy.lastName}
                              </div>
                            </div>
                          )}
                          <div className="bh-detail-cell">
                            <div className="bh-detail-label">Status</div>
                            <div
                              className="bh-detail-value"
                              style={{ color: sc.color, textTransform: "capitalize" }}
                            >
                              {sc.icon} {sc.label}
                            </div>
                          </div>
                          {record.book?.isbn && (
                            <div className="bh-detail-cell">
                              <div className="bh-detail-label">ISBN</div>
                              <div className="bh-detail-value muted">{record.book.isbn}</div>
                            </div>
                          )}
                        </div>

                        {/* Librarian note */}
                        {record.actionNote && (
                          <div className="bh-note">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="rgba(184,134,11,0.5)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span><strong style={{ color: "rgba(184,134,11,0.7)" }}>Librarian note:</strong> {record.actionNote}</span>
                          </div>
                        )}

                        {/* Duration for returned books */}
                        {record.status === "returned" && record.approvedAt && record.actualReturnDate && (
                          <div className="bh-note" style={{ marginTop: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="rgba(120,120,180,0.6)" strokeWidth="2" style={{ flexShrink: 0 }}>
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span style={{ color: "#a0a0f0" }}>
                              Borrowed for <strong>{daysBetween(record.approvedAt, record.actualReturnDate)} days</strong>
                              {" "}(approved {formatDate(record.approvedAt)} → returned {formatDate(record.actualReturnDate)})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
}