// Admin/LibrarianApprovals.jsx
import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:5000";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --parchment: #f5f0e8;
    --gold: #b8860b;
    --gold-light: #d4a017;
    --gold-bright: #f0c040;
    --rust: #8b3a1a;
    --dark: #1c1510;
    --card: #2a2016;
    --border: rgba(184,134,11,0.22);
    --border-h: rgba(184,134,11,0.45);
    --success: #3aaa8a;
    --error: #e05540;
    --warn: #d4861a;
    --radius: 12px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes toastIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseGold { 0%,100% { box-shadow: 0 0 0 0 rgba(184,134,11,0.4); } 50% { box-shadow: 0 0 0 6px rgba(184,134,11,0); } }

  /* ── Wrapper ── */
  .la-wrap {
    padding: 28px 32px;
    min-height: calc(100vh - 68px);
    background: linear-gradient(180deg, #1c1510 0%, #130e09 100%);
    font-family: 'DM Sans', sans-serif;
    color: var(--parchment);
  }

  /* ── Page header ── */
  .la-page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 28px; flex-wrap: wrap; gap: 14px;
  }
  .la-page-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: var(--parchment);
    display: flex; align-items: center; gap: 14px;
  }
  .la-page-sub {
    font-size: 13px; color: rgba(245,240,232,0.4);
    margin-top: 5px; font-family: 'DM Sans', sans-serif;
  }
  .la-pending-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 26px; height: 26px; padding: 0 8px;
    border-radius: 13px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: #1c1510; font-size: 12px; font-weight: 700;
    animation: pulseGold 2s infinite;
  }

  .la-header-actions { display: flex; gap: 10px; align-items: center; }

  .la-refresh-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent; color: rgba(245,240,232,0.6);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.18s;
  }
  .la-refresh-btn:hover { background: rgba(184,134,11,0.1); color: var(--gold-bright); border-color: var(--border-h); }
  .la-refresh-btn.spinning svg { animation: spin 0.7s linear infinite; }

  /* ── Stats bar ── */
  .la-stats {
    display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .la-stat-card {
    flex: 1; min-width: 120px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    display: flex; flex-direction: column; gap: 4px;
    transition: border-color 0.18s;
  }
  .la-stat-card:hover { border-color: var(--border-h); }
  .la-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700;
  }
  .la-stat-num.pending-color  { color: #f0a840; }
  .la-stat-num.approved-color { color: #5fdbb0; }
  .la-stat-num.rejected-color { color: #ff8a75; }
  .la-stat-num.returned-color { color: #a0a0f0; }
  .la-stat-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: rgba(245,240,232,0.38);
  }

  /* ── Tab strip ── */
  .la-tab-strip {
    display: flex; gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 11px; padding: 4px;
    margin-bottom: 24px; width: fit-content;
  }
  .la-tab {
    padding: 8px 20px; border-radius: 8px; border: none;
    background: transparent; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    color: rgba(245,240,232,0.4);
    display: flex; align-items: center; gap: 8px;
    transition: background 0.18s, color 0.18s;
  }
  .la-tab.active { background: rgba(184,134,11,0.18); color: var(--gold-bright); }
  .la-tab:not(.active):hover { color: rgba(245,240,232,0.8); background: rgba(184,134,11,0.07); }
  .la-tab-chip {
    min-width: 20px; height: 20px; border-radius: 10px; padding: 0 6px;
    background: rgba(184,134,11,0.2); color: var(--gold-bright);
    font-size: 11px; display: flex; align-items: center; justify-content: center;
    transition: background 0.18s;
  }
  .la-tab.active .la-tab-chip { background: rgba(184,134,11,0.45); }

  /* ── Search bar ── */
  .la-search-wrap { position: relative; margin-bottom: 18px; }
  .la-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(184,134,11,0.45); pointer-events: none; }
  .la-search {
    width: 100%; max-width: 400px;
    height: 40px; padding: 0 14px 0 40px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border); border-radius: 8px;
    color: var(--parchment); font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .la-search::placeholder { color: rgba(245,240,232,0.22); }
  .la-search:focus { border-color: var(--border-h); box-shadow: 0 0 0 3px rgba(184,134,11,0.1); }

  /* ── Request card ── */
  .la-list { display: flex; flex-direction: column; gap: 14px; }

  .la-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.18s;
    animation: fadeUp 0.22s ease both;
  }
  .la-card:hover { border-color: var(--border-h); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }

  .la-card-main {
    display: flex; gap: 18px; padding: 20px 22px; align-items: flex-start;
  }

  /* Book cover */
  .la-cover {
    width: 56px; height: 80px; border-radius: 8px;
    overflow: hidden; flex-shrink: 0;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .la-cover img { width: 100%; height: 100%; object-fit: cover; }

  /* Card info */
  .la-info { flex: 1; min-width: 0; }
  .la-book-title {
    font-size: 15px; font-weight: 600; color: var(--parchment);
    margin-bottom: 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .la-book-author { font-size: 12.5px; color: rgba(245,240,232,0.42); margin-bottom: 12px; }

  .la-chips { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-bottom: 12px; }
  .la-chip {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: rgba(245,240,232,0.5);
  }
  .la-chip svg { color: rgba(184,134,11,0.55); flex-shrink: 0; }
  .la-chip strong { color: rgba(245,240,232,0.82); font-weight: 500; }

  /* Status pill */
  .la-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 20px;
    font-size: 11.5px; font-weight: 600; letter-spacing: 0.03em;
  }
  .la-pill.pending  { background: rgba(212,134,26,0.12); border: 1px solid rgba(212,134,26,0.3);  color: #f0a840; }
  .la-pill.approved { background: rgba(58,170,138,0.12); border: 1px solid rgba(58,170,138,0.3);  color: #5fdbb0; }
  .la-pill.rejected { background: rgba(224,85,64,0.12);  border: 1px solid rgba(224,85,64,0.3);   color: #ff8a75; }
  .la-pill.returned { background: rgba(120,120,180,0.12);border: 1px solid rgba(120,120,180,0.3); color: #a0a0f0; }

  /* Actions */
  .la-actions { display: flex; gap: 8px; align-items: flex-start; flex-shrink: 0; flex-wrap: wrap; }

  .la-btn {
    height: 38px; padding: 0 16px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    border: none; transition: filter 0.18s, transform 0.12s, background 0.18s;
  }
  .la-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .la-btn:active:not(:disabled) { transform: translateY(0); }
  .la-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .la-btn-approve {
    background: linear-gradient(135deg, #3aaa8a, #2d9070);
    color: #fff; box-shadow: 0 2px 10px rgba(58,170,138,0.3);
  }
  .la-btn-approve:hover:not(:disabled) { filter: brightness(1.1); }

  .la-btn-reject {
    background: rgba(224,85,64,0.12);
    border: 1px solid rgba(224,85,64,0.35) !important;
    color: #ff8a75;
  }
  .la-btn-reject:hover:not(:disabled) { background: rgba(224,85,64,0.22); }

  .la-btn-return {
    background: rgba(120,120,180,0.12);
    border: 1px solid rgba(120,120,180,0.3) !important;
    color: #a0a0f0;
  }
  .la-btn-return:hover:not(:disabled) { background: rgba(120,120,180,0.22); }

  /* Reject modal */
  .la-reject-modal-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(8,5,2,0.82); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeUp 0.18s ease;
  }
  .la-reject-modal {
    background: #221a0f;
    border: 1px solid var(--border-h);
    border-radius: 16px; padding: 28px;
    width: 100%; max-width: 420px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7);
    animation: fadeUp 0.22s cubic-bezier(0.34,1.4,0.64,1);
  }
  .la-reject-modal h3 {
    font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700;
    color: var(--parchment); margin-bottom: 6px;
  }
  .la-reject-modal p { font-size: 13px; color: rgba(245,240,232,0.45); margin-bottom: 18px; }
  .la-reject-textarea {
    width: 100%; min-height: 90px; resize: vertical;
    padding: 12px; border-radius: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border); color: var(--parchment);
    font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none;
    transition: border-color 0.2s;
    margin-bottom: 16px;
  }
  .la-reject-textarea:focus { border-color: var(--border-h); }
  .la-reject-textarea::placeholder { color: rgba(245,240,232,0.22); }
  .la-reject-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .la-reject-cancel {
    padding: 9px 18px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    color: rgba(245,240,232,0.6); font-family: 'DM Sans', sans-serif;
    font-size: 13px; cursor: pointer; transition: all 0.18s;
  }
  .la-reject-cancel:hover { background: rgba(255,255,255,0.05); color: var(--parchment); }
  .la-reject-confirm {
    padding: 9px 18px; border-radius: 8px; border: none;
    background: rgba(224,85,64,0.75); color: #fff;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: background 0.18s;
  }
  .la-reject-confirm:hover { background: rgba(224,85,64,1); }

  /* Action note strip */
  .la-note-strip {
    padding: 11px 22px 14px;
    border-top: 1px solid rgba(184,134,11,0.1);
    background: rgba(0,0,0,0.18);
    display: flex; flex-direction: column; gap: 3px;
  }
  .la-note-strip-label { font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(184,134,11,0.5); }
  .la-note-strip-by { font-size: 12px; color: rgba(245,240,232,0.38); }
  .la-note-strip-text { font-size: 12.5px; color: rgba(245,240,232,0.5); font-style: italic; }

  /* Empty */
  .la-empty {
    text-align: center; padding: 70px 20px;
    color: rgba(245,240,232,0.3); font-size: 14px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .la-empty-icon { font-size: 46px; opacity: 0.45; }

  /* Toast */
  .la-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 999;
    padding: 14px 20px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: toastIn 0.25s cubic-bezier(0.34,1.4,0.64,1);
    max-width: 360px;
  }
  .la-toast.success { background: #1b3a2e; border: 1px solid rgba(58,170,138,0.4); color: #5fdbb0; }
  .la-toast.error   { background: #3a1b18; border: 1px solid rgba(224,85,64,0.4);  color: #ff8a75; }

  /* Spinner inline */
  .la-spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @media (max-width: 680px) {
    .la-wrap { padding: 16px; }
    .la-card-main { flex-direction: column; }
    .la-actions { justify-content: flex-start; }
    .la-stats { gap: 8px; }
    .la-tab-strip { overflow-x: auto; }
  }
`;

/* ── helpers ── */
const API = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getCoverUrl = (coverImage) => {
  if (!coverImage) return null;
  if (coverImage.startsWith("http")) return coverImage;
  return `${API_BASE}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`;
};

const TABS = [
  { key: "pending",  label: "Pending",  color: "pending-color"  },
  { key: "approved", label: "Approved", color: "approved-color" },
  { key: "rejected", label: "Rejected", color: "rejected-color" },
  { key: "returned", label: "Returned", color: "returned-color" },
];

/* ── Reject modal ── */
function RejectModal({ request, onConfirm, onCancel, loading }) {
  const [note, setNote] = useState("Rejected by librarian");
  return (
    <div className="la-reject-modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="la-reject-modal">
        <h3>Reject Request</h3>
        <p>
          Rejecting <strong style={{ color: "var(--parchment)" }}>{request.book?.title}</strong> requested by{" "}
          <strong style={{ color: "var(--parchment)" }}>{request.member?.firstName} {request.member?.lastName}</strong>.
        </p>
        <textarea
          className="la-reject-textarea"
          placeholder="Reason for rejection (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
        <div className="la-reject-actions">
          <button className="la-reject-cancel" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="la-reject-confirm" onClick={() => onConfirm(note)} disabled={loading}>
            {loading ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function LibrarianApprovals({ currentUser, onBack }) {
  const [requests, setRequests]   = useState([]);
  const [counts, setCounts]       = useState({ pending: 0, approved: 0, rejected: 0, returned: 0 });
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]             = useState("pending");
  const [search, setSearch]       = useState("");
  const [acting, setActing]       = useState({});
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCounts = async () => {
    try {
      const results = await Promise.all(
        TABS.map((t) => API(`/api/circulation/all?status=${t.key}`))
      );
      const c = {};
      TABS.forEach((t, i) => { c[t.key] = (results[i].data || []).length; });
      setCounts(c);
    } catch (_) {}
  };

  const fetchRequests = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await API(`/api/circulation/all?status=${tab}`);
      setRequests(data.data || []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchRequests();
    fetchCounts();
  }, [tab]);

  const setAct = (id, val) => setActing((a) => ({ ...a, [id]: val }));

  const handleApprove = async (id) => {
    setAct(id, true);
    try {
      await API(`/api/circulation/${id}/approve`, { method: "PATCH" });
      showToast("Request approved ✓");
      fetchRequests();
      fetchCounts();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAct(id, false);
    }
  };

  const handleReject = async (id, note) => {
    setAct(id, true);
    try {
      await API(`/api/circulation/${id}/reject`, { method: "PATCH", body: JSON.stringify({ note }) });
      showToast("Request rejected");
      setRejectTarget(null);
      fetchRequests();
      fetchCounts();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAct(id, false);
    }
  };

  const handleReturn = async (id) => {
    setAct(id, true);
    try {
      await API(`/api/circulation/${id}/return`, { method: "PATCH" });
      showToast("Book marked as returned ✓");
      fetchRequests();
      fetchCounts();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAct(id, false);
    }
  };

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.book?.title?.toLowerCase().includes(q) ||
      r.book?.author?.toLowerCase().includes(q) ||
      r.member?.firstName?.toLowerCase().includes(q) ||
      r.member?.lastName?.toLowerCase().includes(q) ||
      r.member?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <style>{STYLE}</style>

      <div className="la-wrap">

        {/* Page header */}
        <div className="la-page-header">
          <div>
            <div className="la-page-title">
              Borrow Requests
              {counts.pending > 0 && <span className="la-pending-badge">{counts.pending}</span>}
            </div>
            <div className="la-page-sub">Review, approve or reject member borrow requests</div>
          </div>
          <div className="la-header-actions">
            {onBack && (
              <button
                onClick={onBack}
                style={{ padding: "9px 16px", borderRadius: "8px", border: "1px solid rgba(184,134,11,0.2)", background: "transparent", color: "rgba(245,240,232,0.6)", fontFamily: "'DM Sans',sans-serif", fontSize: "13px", cursor: "pointer" }}
              >
                ← Back
              </button>
            )}
            <button
              className={`la-refresh-btn ${refreshing ? "spinning" : ""}`}
              onClick={() => { fetchRequests(true); fetchCounts(); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="la-stats">
          {TABS.map((t) => (
            <div key={t.key} className="la-stat-card" onClick={() => setTab(t.key)} style={{ cursor: "pointer" }}>
              <div className={`la-stat-num ${t.color}`}>{counts[t.key]}</div>
              <div className="la-stat-label">{t.label}</div>
            </div>
          ))}
        </div>

        {/* Tab strip */}
        <div className="la-tab-strip">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`la-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {counts[t.key] > 0 && <span className="la-tab-chip">{counts[t.key]}</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="la-search-wrap">
          <span className="la-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className="la-search"
            type="text"
            placeholder="Search by book, author, or member…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "rgba(245,240,232,0.4)" }}>
            <div className="la-spinner" style={{ margin: "0 auto 14px", width: 24, height: 24, borderWidth: 3 }} />
            Loading requests…
          </div>
        ) : filtered.length === 0 ? (
          <div className="la-empty">
            <div className="la-empty-icon">📭</div>
            <div>{search ? "No requests match your search" : `No ${tab} requests`}</div>
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: 13 }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="la-list">
            {filtered.map((req, idx) => {
              const coverUrl = getCoverUrl(req.book?.coverImage);
              const isActing = acting[req._id];

              return (
                <div key={req._id} className="la-card" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="la-card-main">

                    {/* Cover */}
                    <div className="la-cover">
                      {coverUrl
                        ? <img src={coverUrl} alt={req.book?.title} onError={(e) => e.target.style.display = "none"} />
                        : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.18)" strokeWidth="1.4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      }
                    </div>

                    {/* Info */}
                    <div className="la-info">
                      <div className="la-book-title">{req.book?.title || "Unknown Book"}</div>
                      <div className="la-book-author">by {req.book?.author || "Unknown"} · {req.book?.genre}</div>

                      <div className="la-chips">
                        <div className="la-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <strong>{req.member?.firstName} {req.member?.lastName}</strong>
                        </div>
                        <div className="la-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          {req.member?.email}
                        </div>
                        <div className="la-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          Requested: <strong>{fmt(req.createdAt)}</strong>
                        </div>
                        <div className="la-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Return by: <strong>{fmt(req.requestedReturnDate)}</strong>
                        </div>
                      </div>

                      <span className={`la-pill ${req.status}`}>
                        {{ pending: "⏳", approved: "✅", rejected: "✗", returned: "↩" }[req.status]}
                        {" "}{req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="la-actions">
                      {req.status === "pending" && (
                        <>
                          <button
                            className="la-btn la-btn-approve"
                            onClick={() => handleApprove(req._id)}
                            disabled={isActing}
                          >
                            {isActing ? <div className="la-spinner" /> : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                            Approve
                          </button>
                          <button
                            className="la-btn la-btn-reject"
                            onClick={() => setRejectTarget(req)}
                            disabled={isActing}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <button
                          className="la-btn la-btn-return"
                          onClick={() => handleReturn(req._id)}
                          disabled={isActing}
                        >
                          {isActing ? <div className="la-spinner" /> : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.37"/></svg>
                          )}
                          Mark Returned
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action note strip */}
                  {(req.status !== "pending") && req.actionBy && (
                    <div className="la-note-strip">
                      <div className="la-note-strip-label">
                        {req.status === "approved" ? "Approved" : req.status === "rejected" ? "Rejected" : "Processed"} by
                      </div>
                      <div className="la-note-strip-by">
                        {req.actionBy?.firstName} {req.actionBy?.lastName} · {fmt(req.actionAt)}
                        {req.status === "returned" && req.actualReturnDate && ` · Returned: ${fmt(req.actualReturnDate)}`}
                      </div>
                      {req.actionNote && <div className="la-note-strip-text">"{req.actionNote}"</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          request={rejectTarget}
          loading={!!acting[rejectTarget._id]}
          onConfirm={(note) => handleReject(rejectTarget._id, note)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`la-toast ${toast.type}`}>
          {toast.type === "success"
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.message}
        </div>
      )}
    </>
  );
}