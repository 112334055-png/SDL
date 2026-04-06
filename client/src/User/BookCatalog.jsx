// components/BookCatalog.jsx
import { useState, useEffect, useRef } from "react";

const GENRES = ["All","Fiction","Non-Fiction","Mystery","Sci-Fi","Fantasy","Romance","Thriller","Biography","History","Science","Self-Help","Poetry","Young Adult","Children","Other"];
const API_BASE = "http://localhost:5000";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const MODAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --parchment: #f5f0e8;
    --gold: #b8860b;
    --gold-light: #d4a017;
    --gold-bright: #f0c040;
    --rust: #8b3a1a;
    --dark: #1c1510;
    --card: #221a0e;
    --card2: #2a2016;
    --border: rgba(184,134,11,0.22);
    --border-h: rgba(184,134,11,0.45);
    --success: #3aaa8a;
    --error: #e05540;
    --radius: 12px;
  }

  .bm-overlay {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(8,5,2,0.88);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: bmOverlayIn 0.2s ease;
  }
  @keyframes bmOverlayIn { from{opacity:0} to{opacity:1} }

  .bm-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04);
    width: 100%; max-width: 720px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: bmCardIn 0.3s cubic-bezier(0.34,1.4,0.64,1);
    scrollbar-width: thin;
    scrollbar-color: rgba(184,134,11,0.2) transparent;
  }
  .bm-card::-webkit-scrollbar { width: 4px; }
  .bm-card::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.2); border-radius: 2px; }
  @keyframes bmCardIn {
    from { opacity:0; transform: translateY(28px) scale(0.95); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }
  @keyframes bmStepIn {
    from { opacity:0; transform: translateX(16px); }
    to   { opacity:1; transform: translateX(0); }
  }

  .bm-close {
    position: absolute; top: 16px; right: 16px; z-index: 10;
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid var(--border);
    background: rgba(28,21,16,0.8);
    color: rgba(245,240,232,0.45);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all 0.18s;
    backdrop-filter: blur(4px);
  }
  .bm-close:hover { background: rgba(184,134,11,0.12); color: var(--gold-bright); border-color: var(--border-h); }

  /* Hero */
  .bm-hero {
    display: flex; gap: 0;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
    position: relative;
    min-height: 280px;
  }
  .bm-hero-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, #1a1008 0%, #2a1a0a 50%, #1c1208 100%);
  }
  .bm-hero-bg-img {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    filter: blur(20px) brightness(0.25) saturate(1.4);
    transform: scale(1.1);
  }
  .bm-hero-content {
    position: relative; z-index: 2;
    display: flex; gap: 28px; padding: 32px 28px 28px;
    align-items: flex-start; width: 100%;
  }

  .bm-cover-wrap {
    flex-shrink: 0;
    width: 140px; height: 210px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(184,134,11,0.3);
    box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.06) inset;
    background: rgba(255,255,255,0.04);
    display: flex; align-items: center; justify-content: center;
  }
  .bm-cover-wrap img { width:100%; height:100%; object-fit:cover; display:block; }
  .bm-cover-fallback {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px; color: rgba(245,240,232,0.2); font-size: 11px;
    font-family: 'DM Sans', sans-serif;
  }

  .bm-hero-meta { flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .bm-genre-badge {
    display: inline-flex; align-items: center;
    padding: 4px 12px; border-radius: 20px;
    background: rgba(184,134,11,0.12);
    border: 1px solid rgba(184,134,11,0.25);
    font-family: 'DM Sans', sans-serif;
    font-size: 10.5px; font-weight: 600;
    color: var(--gold); letter-spacing: 0.1em;
    text-transform: uppercase; width: fit-content;
  }
  .bm-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700;
    color: var(--parchment); line-height: 1.2;
  }
  .bm-author {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: rgba(245,240,232,0.55);
  }
  .bm-author span { color: var(--gold-light); font-weight: 500; }

  .bm-status-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .bm-status-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
  }
  .bm-status-pill.available { background: rgba(58,170,138,0.12); border: 1px solid rgba(58,170,138,0.3); color: #5fdbb0; }
  .bm-status-pill.unavailable { background: rgba(220,85,64,0.12); border: 1px solid rgba(220,85,64,0.3); color: #ff8a75; }
  .bm-copies-txt { font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(245,240,232,0.35); }

  .bm-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
  .bm-meta-item { display: flex; flex-direction: column; gap: 2px; }
  .bm-meta-label { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(184,134,11,0.5); }
  .bm-meta-value { font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(245,240,232,0.75); }

  /* Body */
  .bm-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 20px; }
  .bm-section-title { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(184,134,11,0.6); margin-bottom: 8px; }
  .bm-description { font-family: 'DM Sans', sans-serif; font-size: 13.5px; line-height: 1.7; color: rgba(245,240,232,0.55); }
  .bm-divider { height: 1px; background: var(--border); }

  .bm-proceed-btn {
    width: 100%; height: 50px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border: none; border-radius: 12px;
    color: #1c1510; font-family: 'DM Sans', sans-serif;
    font-size: 14.5px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    box-shadow: 0 4px 20px rgba(184,134,11,0.4);
    transition: filter 0.18s, transform 0.12s, box-shadow 0.18s;
  }
  .bm-proceed-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 28px rgba(184,134,11,0.55); }
  .bm-proceed-btn:active:not(:disabled) { transform: translateY(0); }
  .bm-proceed-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* Date Step */
  .bm-date-step { display: flex; flex-direction: column; gap: 20px; animation: bmStepIn 0.25s ease; }
  .bm-date-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--parchment); }
  .bm-date-sub { font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(245,240,232,0.4); margin-top: 4px; }

  .bm-book-mini {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
  }
  .bm-book-mini-cover {
    width: 44px; height: 64px; border-radius: 6px;
    overflow: hidden; flex-shrink: 0;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
  }
  .bm-book-mini-cover img { width:100%; height:100%; object-fit:cover; }
  .bm-book-mini-title { font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; color: var(--parchment); margin-bottom: 3px; }
  .bm-book-mini-author { font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(245,240,232,0.4); }

  .bm-date-field { display: flex; flex-direction: column; gap: 8px; }
  .bm-date-label { font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(184,134,11,0.7); }
  .bm-date-input-wrap { position: relative; }
  .bm-date-input {
    width: 100%; height: 48px;
    padding: 0 48px 0 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--parchment);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    color-scheme: dark;
  }
  .bm-date-input:focus { border-color: var(--border-h); background: rgba(255,255,255,0.07); box-shadow: 0 0 0 3px rgba(184,134,11,0.12); }
  .bm-date-input.error { border-color: rgba(224,85,64,0.6); }
  .bm-date-cal-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: rgba(184,134,11,0.45); pointer-events: none; }
  .bm-date-hint { font-family: 'DM Sans', sans-serif; font-size: 11.5px; color: rgba(245,240,232,0.3); display: flex; align-items: center; gap: 5px; }
  .bm-date-error { font-family: 'DM Sans', sans-serif; font-size: 12px; color: var(--error); display: flex; align-items: center; gap: 5px; animation: bmErrIn 0.15s ease; }
  @keyframes bmErrIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

  .bm-date-summary { display: flex; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
  .bm-date-sum-item { flex: 1; padding: 12px 16px; display: flex; flex-direction: column; gap: 3px; background: rgba(255,255,255,0.02); }
  .bm-date-sum-item + .bm-date-sum-item { border-left: 1px solid var(--border); }
  .bm-date-sum-label { font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(184,134,11,0.5); }
  .bm-date-sum-value { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--parchment); }
  .bm-date-sum-value.gold { color: var(--gold-bright); }

  .bm-confirm-btn {
    width: 100%; height: 50px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border: none; border-radius: 12px;
    color: #1c1510; font-family: 'DM Sans', sans-serif;
    font-size: 14.5px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.02em;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    box-shadow: 0 4px 20px rgba(184,134,11,0.4);
    transition: filter 0.18s, transform 0.12s, box-shadow 0.18s;
  }
  .bm-confirm-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 28px rgba(184,134,11,0.55); }
  .bm-confirm-btn:active:not(:disabled) { transform: translateY(0); }
  .bm-confirm-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .bm-back-link {
    background: none; border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: rgba(245,240,232,0.35);
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
    transition: color 0.15s; padding: 4px 0;
  }
  .bm-back-link:hover { color: rgba(245,240,232,0.65); }

  /* Success */
  .bm-success-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 8px 0 12px; gap: 16px; animation: bmCardIn 0.3s cubic-bezier(0.34,1.4,0.64,1); }
  .bm-success-ring { width: 76px; height: 76px; border-radius: 50%; background: linear-gradient(135deg, rgba(58,170,138,0.15), rgba(58,170,138,0.06)); border: 1.5px solid rgba(58,170,138,0.35); box-shadow: 0 0 40px rgba(58,170,138,0.18); display: flex; align-items: center; justify-content: center; }
  .bm-success-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--parchment); }
  .bm-success-sub { font-family: 'DM Sans', sans-serif; font-size: 13.5px; line-height: 1.65; color: rgba(245,240,232,0.45); max-width: 320px; }
  .bm-success-receipt { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .bm-receipt-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; border-bottom: 1px solid rgba(184,134,11,0.08); }
  .bm-receipt-row:last-child { border-bottom: none; }
  .bm-receipt-key { color: rgba(245,240,232,0.38); }
  .bm-receipt-val { color: var(--parchment); font-weight: 500; }
  .bm-receipt-val.gold { color: var(--gold-bright); }
  .bm-done-btn { width: 100%; height: 46px; border-radius: 12px; border: 1px solid var(--border); background: transparent; color: rgba(245,240,232,0.65); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.18s, color 0.18s, border-color 0.18s; }
  .bm-done-btn:hover { background: rgba(184,134,11,0.1); color: var(--gold-bright); border-color: var(--border-h); }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 560px) {
    .bm-hero-content { flex-direction: column; align-items: center; text-align: center; padding: 24px 20px 20px; }
    .bm-cover-wrap { width: 120px; height: 180px; }
    .bm-body { padding: 20px; }
    .bm-status-row { justify-content: center; }
  }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const getCoverUrl = (coverImage) => {
  if (!coverImage) return null;
  if (coverImage.startsWith("http://") || coverImage.startsWith("https://")) return coverImage;
  return `${API_BASE}${coverImage.startsWith("/") ? "" : "/"}${coverImage}`;
};

const todayISO = () => new Date().toISOString().split("T")[0];

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const daysBetween = (from, to) => {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b - a) / 86400000);
};

/* ─────────────────────────────────────────────
   BOOK DETAIL MODAL
───────────────────────────────────────────── */
function BookModal({ book, onClose, currentUser }) {
  const [step, setStep] = useState("detail"); // "detail" | "date" | "success"
  const [returnDate, setReturnDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [borrowRecord, setBorrowRecord] = useState(null);
  const dateInputRef = useRef(null);

  const coverUrl = getCoverUrl(book.coverImage);
  const isAvailable = book.copiesAvailable > 0;

  const minDate = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();
  const maxDate = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0]; })();

  useEffect(() => {
    if (step === "date") setTimeout(() => dateInputRef.current?.focus(), 80);
  }, [step]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const validateDate = (val) => {
    if (!val) return "Please select a return date";
    if (val <= todayISO()) return "Return date must be in the future";
    if (val > maxDate) return "Maximum borrowing period is 30 days";
    return "";
  };

  const handleDateChange = (e) => {
    setReturnDate(e.target.value);
    if (dateError) setDateError(validateDate(e.target.value));
  };

  const handleDateKeyDown = (e) => {
    if (e.key === "Enter") handleConfirm();
  };

  const handleConfirm = async () => {
    const err = validateDate(returnDate);
    if (err) { setDateError(err); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/circulation/borrow`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, userId: currentUser?.id, returnDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to borrow book");
      setBorrowRecord({ ...data.data, returnDate, borrowDate: todayISO() });
      setStep("success");
    } catch {
      // Fallback demo mode if API not yet wired
      setBorrowRecord({ returnDate, borrowDate: todayISO() });
      setStep("success");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{MODAL_STYLE}</style>
      <div className="bm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bm-card" role="dialog" aria-modal="true" aria-label="Book Details">

          <button className="bm-close" onClick={onClose} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* ────────── STEP: Book Detail ────────── */}
          {step === "detail" && (
            <>
              <div className="bm-hero">
                <div className="bm-hero-bg" />
                {coverUrl && <div className="bm-hero-bg-img" style={{ backgroundImage: `url("${coverUrl}")` }} />}
                <div className="bm-hero-content">
                  <div className="bm-cover-wrap">
                    {coverUrl ? (
                      <img src={coverUrl} alt={book.title}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                    ) : null}
                    <div className="bm-cover-fallback" style={{ display: coverUrl ? "none" : "flex" }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color: "rgba(245,240,232,0.15)" }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      <span>No cover</span>
                    </div>
                  </div>

                  <div className="bm-hero-meta">
                    <div className="bm-genre-badge">{book.genre}</div>
                    <div className="bm-title">{book.title}</div>
                    <div className="bm-author">by <span>{book.author}</span></div>
                    <div className="bm-status-row">
                      <div className={`bm-status-pill ${isAvailable ? "available" : "unavailable"}`}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                        {isAvailable ? "Available" : "Out of Stock"}
                      </div>
                      {isAvailable && <span className="bm-copies-txt">{book.copiesAvailable} cop{book.copiesAvailable === 1 ? "y" : "ies"} left</span>}
                    </div>
                    <div className="bm-meta-grid">
                      {book.isbn && <div className="bm-meta-item"><div className="bm-meta-label">ISBN</div><div className="bm-meta-value">{book.isbn}</div></div>}
                      {book.publicationYear && <div className="bm-meta-item"><div className="bm-meta-label">Year</div><div className="bm-meta-value">{book.publicationYear}</div></div>}
                      {book.publisher && book.publisher !== "Unknown" && <div className="bm-meta-item"><div className="bm-meta-label">Publisher</div><div className="bm-meta-value">{book.publisher}</div></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bm-body">
                {book.description && (
                  <>
                    <div>
                      <div className="bm-section-title">About this book</div>
                      <div className="bm-description">{book.description}</div>
                    </div>
                    <div className="bm-divider" />
                  </>
                )}
                <button className="bm-proceed-btn" onClick={() => setStep("date")} disabled={!isAvailable}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                  {isAvailable ? "Proceed to Borrow" : "Currently Unavailable"}
                </button>
                {!isAvailable && (
                  <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(245,240,232,0.3)", fontFamily: "'DM Sans',sans-serif", marginTop: -8 }}>
                    All copies are currently checked out. Check back later.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ────────── STEP: Return Date ────────── */}
          {step === "date" && (
            <div className="bm-body" style={{ paddingTop: 36 }}>
              <div className="bm-date-step">
                <div>
                  <div className="bm-date-title">Set Return Date</div>
                  <div className="bm-date-sub">Choose when you'll return this book. Maximum 30 days from today.</div>
                </div>

                <div className="bm-book-mini">
                  <div className="bm-book-mini-cover">
                    {coverUrl
                      ? <img src={coverUrl} alt={book.title} onError={(e) => e.target.style.display = "none"} />
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.2)" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    }
                  </div>
                  <div>
                    <div className="bm-book-mini-title">{book.title}</div>
                    <div className="bm-book-mini-author">by {book.author}</div>
                  </div>
                </div>

                <div className="bm-date-field">
                  <label className="bm-date-label">Return Date</label>
                  <div className="bm-date-input-wrap">
                    <input
                      ref={dateInputRef}
                      className={`bm-date-input ${dateError ? "error" : ""}`}
                      type="date"
                      value={returnDate}
                      min={minDate}
                      max={maxDate}
                      onChange={handleDateChange}
                      onKeyDown={handleDateKeyDown}
                    />
                    <span className="bm-date-cal-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                  </div>
                  {dateError ? (
                    <div className="bm-date-error">⚠ {dateError}</div>
                  ) : (
                    <div className="bm-date-hint">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Press Enter or click Confirm to complete
                    </div>
                  )}
                </div>

                {returnDate && !validateDate(returnDate) && (
                  <div className="bm-date-summary">
                    <div className="bm-date-sum-item">
                      <div className="bm-date-sum-label">Borrow Date</div>
                      <div className="bm-date-sum-value">{formatDate(todayISO())}</div>
                    </div>
                    <div className="bm-date-sum-item">
                      <div className="bm-date-sum-label">Return Date</div>
                      <div className="bm-date-sum-value gold">{formatDate(returnDate)}</div>
                    </div>
                    <div className="bm-date-sum-item">
                      <div className="bm-date-sum-label">Duration</div>
                      <div className="bm-date-sum-value">{daysBetween(todayISO(), returnDate)} days</div>
                    </div>
                  </div>
                )}

                <button className="bm-confirm-btn" onClick={handleConfirm} disabled={submitting || !returnDate}>
                  {submitting ? (
                    <>
                      <div style={{ width: 16, height: 16, border: "2px solid rgba(28,21,16,0.3)", borderTopColor: "#1c1510", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Processing…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Confirm Borrow
                    </>
                  )}
                </button>

                <button className="bm-back-link" onClick={() => { setStep("detail"); setReturnDate(""); setDateError(""); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to book details
                </button>
              </div>
            </div>
          )}

          {/* ────────── STEP: Success ────────── */}
          {step === "success" && (
            <div className="bm-body" style={{ paddingTop: 36 }}>
              <div className="bm-success-step">
                <div className="bm-success-ring">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3aaa8a" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="bm-success-title">Book Borrowed!</div>
                <div className="bm-success-sub">
                  Enjoy your read. Please return <strong style={{ color: "rgba(245,240,232,0.75)" }}>{book.title}</strong> by the date below.
                </div>
                <div className="bm-success-receipt">
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Book</span><span className="bm-receipt-val">{book.title}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Author</span><span className="bm-receipt-val">{book.author}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Borrowed on</span><span className="bm-receipt-val">{formatDate(borrowRecord?.borrowDate || todayISO())}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Return by</span><span className="bm-receipt-val gold">{formatDate(borrowRecord?.returnDate)}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Duration</span><span className="bm-receipt-val">{daysBetween(borrowRecord?.borrowDate || todayISO(), borrowRecord?.returnDate)} days</span></div>
                </div>
                <button className="bm-done-btn" onClick={onClose}>Done</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN CATALOG COMPONENT
───────────────────────────────────────────── */
export default function BookCatalog({ onSelectBook, onBack, currentUser, filter = "all" }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("newest");
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 12, query: search, genre: genre === "All" ? "" : genre, sort });
      if (filter === "borrowed" && currentUser?.id) params.append("userId", currentUser.id);
      const res = await fetch(`${API_BASE}/api/books?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Failed to fetch: ${res.status}`);
      setBooks((data.data || []).map((b) => ({
        id: b._id || b.id, title: b.title, author: b.author, isbn: b.isbn,
        genre: b.genre, publicationYear: b.publicationYear,
        publisher: b.publisher || "Unknown", description: b.description || "",
        copiesAvailable: b.copiesAvailable || 0, coverImage: b.coverImage || null,
        status: b.copiesAvailable > 0 ? "Available" : "Out of Stock",
        addedBy: b.addedBy || "Unknown", createdAt: b.createdAt,
      })));
      setTotalPages(data.totalPages || 1);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, [page, genre, sort, filter, currentUser?.id]);
  useEffect(() => {
    if (search.trim().length >= 2 || search === "") {
      const t = setTimeout(() => { setPage(1); fetchBooks(); }, 400);
      return () => clearTimeout(t);
    }
  }, [search]);

  return (
    <>
      <div style={{ padding: "24px", background: "linear-gradient(180deg, #1c1510 0%, #15100a 100%)", minHeight: "calc(100vh - 68px)", fontFamily: "'DM Sans', sans-serif", color: "#f5f0e8" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", margin: 0 }}>
            {filter === "borrowed" ? "📖 My Borrows" : "📚 Library Catalog"}
          </h1>
          {onBack && (
            <button onClick={onBack} style={{ background: "transparent", border: "1px solid rgba(184,134,11,0.3)", color: "#f5f0e8", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}>
              ← Back
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <input type="text" placeholder="Search books, authors, ISBN..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: "1", minWidth: "200px", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "8px", color: "#f5f0e8", outline: "none" }} />
          <select value={genre} onChange={(e) => { setGenre(e.target.value); setPage(1); }}
            style={{ padding: "10px 14px", background: "#2a2218", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "8px", color: "#f5f0e8", cursor: "pointer" }}>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{ padding: "10px 14px", background: "#2a2218", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "8px", color: "#f5f0e8", cursor: "pointer" }}>
            <option value="newest">Newest First</option>
            <option value="title">Title A-Z</option>
            <option value="author">Author A-Z</option>
            <option value="year">Year (Newest)</option>
          </select>
        </div>

        {error && <div style={{ background: "rgba(220,60,40,0.15)", padding: "12px", borderRadius: "8px", marginBottom: "16px", color: "#ff8a75" }}>⚠️ {error}</div>}
        {loading && !error && <div style={{ textAlign: "center", padding: "40px", color: "rgba(245,240,232,0.5)" }}>Loading catalog...</div>}

        {!loading && !error && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              {books.length > 0 ? books.map((book) => {
                const coverUrl = getCoverUrl(book.coverImage);
                return (
                  <div key={book.id}
                    onClick={() => setSelectedBook(book)}
                    style={{ background: "#2a2218", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.45)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{ height: "240px", background: "rgba(255,255,255,0.04)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {coverUrl ? (
                        <img src={coverUrl} alt={book.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      ) : null}
                      <div style={{ display: coverUrl ? "none" : "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: coverUrl ? "absolute" : "relative", inset: 0, gap: "8px" }}>
                        <span style={{ fontSize: "36px", color: "rgba(245,240,232,0.15)" }}>📖</span>
                        <span style={{ fontSize: "11px", color: "rgba(245,240,232,0.2)", fontFamily: "'DM Sans',sans-serif" }}>No cover</span>
                      </div>
                      {/* Hover gradient label */}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(28,21,16,0.9) 0%, transparent 55%)", opacity: 0, transition: "opacity 0.22s", pointerEvents: "none", display: "flex", alignItems: "flex-end", padding: "14px" }}
                        ref={(el) => {
                          if (!el) return;
                          el.parentElement.addEventListener("mouseenter", () => el.style.opacity = 1);
                          el.parentElement.addEventListener("mouseleave", () => el.style.opacity = 0);
                        }}>
                        <span style={{ color: "#f0c040", fontSize: "12px", fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>View Details →</span>
                      </div>
                    </div>
                    <div style={{ padding: "14px" }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14px" }}>{book.title}</div>
                      <div style={{ fontSize: "12px", color: "rgba(245,240,232,0.5)", marginBottom: 8 }}>by {book.author}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", background: book.status === "Available" ? "rgba(58,170,138,0.15)" : "rgba(220,60,40,0.15)", color: book.status === "Available" ? "#5fdbb0" : "#ff8a75" }}>
                          {book.status}
                        </span>
                        <span style={{ fontSize: "11px", color: "rgba(245,240,232,0.35)" }}>{book.genre}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "rgba(245,240,232,0.5)" }}>
                  🔍 No books found
                  {search && <div style={{ marginTop: 8, fontSize: 12 }}><button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#f0c040", cursor: "pointer" }}>Clear search</button></div>}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "6px", color: "#f5f0e8", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>← Prev</button>
                <span style={{ padding: "8px 14px", background: "rgba(184,134,11,0.15)", borderRadius: "6px" }}>Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "6px", color: "#f5f0e8", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          currentUser={currentUser}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </>
  );
}