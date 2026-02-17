import { useEffect, useState } from "react";

// ── NAV LINKS ──────────────────────────────────────────────
const NAV_LINKS = [
  {
    label: "Catalog", href: "/catalog",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="10" y1="8" x2="16" y2="8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  },
  {
    label: "Members", href: "/members",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: "Circulation", href: "/circulation",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  },
  {
    label: "Reports", href: "/reports",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    label: "Settings", href: "/settings",
    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

const QUICK_LINKS = [
  { label: "Browse Catalog",    href: "/catalog",     desc: "Search & explore the full collection" },
  { label: "Register Member",   href: "/members/new", desc: "Add a new library member" },
  { label: "Check Out a Book",  href: "/circulation", desc: "Issue a book to a member" },
  { label: "View Reports",      href: "/reports",     desc: "Insights & overdue summaries" },
];



// ── HOME PAGE ──────────────────────────────────────────────
function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.json())
      .then(data => { setMessage(data.message); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Library Management System
          </span>

          <h1 className="hero-title">Welcome to<br /><em>Bibliotheca</em></h1>

          <div className="hero-message">
            {loading && (
              <span className="hero-msg loading">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </span>
            )}
            {!loading && !error && message && (
              <p className="hero-msg">{message}</p>
            )}
            {error && (
              <p className="hero-msg error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Could not reach the server
              </p>
            )}
          </div>

          <div className="hero-actions">
            <a href="/catalog" className="btn-primary">Browse Catalog</a>
            <a href="/circulation" className="btn-ghost">Check Out a Book</a>
          </div>
        </div>

        {/* Decorative book stack */}
        <div className="hero-art" aria-hidden="true">
          <div className="book b1" />
          <div className="book b2" />
          <div className="book b3" />
          <div className="book b4" />
          <div className="book b5" />
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-section">
        <p className="section-label">Quick Access</p>
        <div className="quick-grid">
          {QUICK_LINKS.map((q) => (
            <a key={q.label} href={q.href} className="quick-card">
              <span className="quick-label">{q.label}</span>
              <span className="quick-desc">{q.desc}</span>
              <span className="quick-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --parchment: #f5f0e8;
          --cream:     #faf7f2;
          --ink:       #1a1208;
          --muted:     #7a6a52;
          --gold:      #b8860b;
          --gold-l:    #d4a017;
          --gold-br:   #f0c040;
          --rust:      #8b3a1a;
          --nav-bg:    #1c1510;
          --nav-bdr:   rgba(184,134,11,0.25);
          --nav-h:     68px;
          --r:         8px;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); }

        /* ── NAVBAR ── */
        .lms-nav {
          position: sticky; top: 0; z-index: 100;
          height: var(--nav-h); background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-bdr);
          display: flex; align-items: center; padding: 0 28px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.35);
        }
        .lms-nav::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }
        .lms-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; margin-right: 36px; }
        .lms-logo-mark {
          width: 38px; height: 38px; flex-shrink: 0; border-radius: 6px;
          background: linear-gradient(145deg, var(--gold), var(--gold-l));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(184,134,11,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .lms-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .lms-logo-name { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--parchment); letter-spacing: 0.01em; }
        .lms-logo-sub  { font-size: 9.5px; font-weight: 500; color: var(--gold); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }

        .lms-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .lms-link {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: var(--r);
          border: none; background: transparent;
          color: rgba(245,240,232,0.55);
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          white-space: nowrap; position: relative; cursor: pointer;
          text-decoration: none;
          transition: color .18s, background .18s;
        }
        .lms-link:hover { color: var(--parchment); background: rgba(184,134,11,0.1); }

        .lms-search { position: relative; margin-left: auto; margin-right: 16px; flex-shrink: 0; }
        .lms-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(184,134,11,0.45); pointer-events: none; transition: color .2s; }
        .lms-search.focused .lms-search-icon { color: var(--gold); }
        .lms-search-input {
          height: 36px; padding: 0 36px 0 38px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(184,134,11,0.2); border-radius: 20px;
          color: var(--parchment); font-family: 'DM Sans', sans-serif; font-size: 13px;
          width: 200px; outline: none;
          transition: border-color .2s, background .2s, width .3s;
        }
        .lms-search-input::placeholder { color: rgba(245,240,232,0.28); }
        .lms-search-input:focus { border-color: rgba(184,134,11,0.55); background: rgba(255,255,255,0.08); width: 250px; }
        .lms-search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(245,240,232,0.3); cursor: pointer; display: flex; padding: 2px; transition: color .15s; }
        .lms-search-clear:hover { color: var(--gold); }

        .lms-divider { width: 1px; height: 28px; background: rgba(184,134,11,0.2); margin: 0 8px; flex-shrink: 0; }
        .lms-avatar-btn { display: flex; align-items: center; gap: 9px; padding: 5px 10px 5px 5px; border-radius: 22px; border: 1px solid rgba(184,134,11,0.2); background: rgba(255,255,255,0.04); cursor: pointer; flex-shrink: 0; transition: background .18s, border-color .18s; }
        .lms-avatar-btn:hover { background: rgba(184,134,11,0.1); border-color: rgba(184,134,11,0.4); }
        .lms-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--rust)); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.02em; flex-shrink: 0; }
        .lms-avatar-name { font-size: 12.5px; font-weight: 500; color: rgba(245,240,232,0.75); white-space: nowrap; font-family: 'DM Sans', sans-serif; }

        .lms-mobile-toggle { display: none; margin-left: auto; width: 38px; height: 38px; border-radius: var(--r); border: none; background: transparent; color: rgba(245,240,232,0.6); cursor: pointer; align-items: center; justify-content: center; flex-shrink: 0; transition: background .18s; }
        .lms-mobile-toggle:hover { background: rgba(184,134,11,0.1); color: var(--parchment); }

        .lms-mobile-menu { display: none; position: fixed; top: var(--nav-h); left: 0; right: 0; background: #1a1208; border-bottom: 1px solid var(--nav-bdr); padding: 12px 20px 20px; z-index: 99; animation: slideDown .2s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .lms-mobile-search { width: 100%; height: 40px; padding: 0 14px; margin-bottom: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(184,134,11,0.25); border-radius: 8px; color: var(--parchment); font-family: 'DM Sans', sans-serif; font-size: 13.5px; outline: none; }
        .lms-mobile-search::placeholder { color: rgba(245,240,232,0.3); }
        .lms-mobile-link { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; margin: 2px 0; border-radius: var(--r); border: none; background: transparent; color: rgba(245,240,232,0.65); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; text-align: left; cursor: pointer; text-decoration: none; transition: background .15s, color .15s; }
        .lms-mobile-link:hover { background: rgba(184,134,11,0.12); color: var(--gold-br); }

        @media (max-width: 860px) {
          .lms-links, .lms-search, .lms-divider, .lms-avatar-btn { display: none !important; }
          .lms-mobile-toggle { display: flex !important; }
          .lms-mobile-menu.open { display: block; }
        }

        /* ── HOME PAGE ── */
        .home-page { min-height: calc(100vh - var(--nav-h)); }

        /* Hero */
        .hero {
          display: flex; align-items: center; justify-content: space-between;
          padding: 72px 64px 80px;
          background: linear-gradient(135deg, #1a1208 0%, #2a1e0e 55%, #1c1510 100%);
          position: relative; overflow: hidden;
          border-bottom: 1px solid rgba(184,134,11,0.18);
        }
        .hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 70% 50%, rgba(184,134,11,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner { position: relative; z-index: 1; max-width: 520px; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 13px; border-radius: 20px;
          border: 1px solid rgba(184,134,11,0.35);
          background: rgba(184,134,11,0.08);
          font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--gold);
          margin-bottom: 24px;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 700; line-height: 1.1;
          color: var(--parchment); margin-bottom: 20px;
        }
        .hero-title em { color: var(--gold-br); font-style: italic; }

        .hero-message { min-height: 28px; margin-bottom: 36px; }
        .hero-msg {
          display: flex; align-items: center; gap: 8px;
          font-size: 15px; color: rgba(245,240,232,0.55); line-height: 1.6;
        }
        .hero-msg.error { color: #e07070; }
        .hero-msg.loading { gap: 5px; }
        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(184,134,11,0.6);
          animation: pulse 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: .2s; }
        .dot:nth-child(3) { animation-delay: .4s; }
        @keyframes pulse { 0%,100% { opacity: .3; transform: scale(.8); } 50% { opacity: 1; transform: scale(1); } }

        .hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .btn-primary {
          padding: 11px 26px; border-radius: var(--r);
          background: linear-gradient(135deg, var(--gold), var(--gold-l));
          color: #1a1208; font-weight: 600; font-size: 14px;
          text-decoration: none; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 18px rgba(184,134,11,0.35);
          transition: transform .15s, box-shadow .15s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(184,134,11,0.45); }
        .btn-ghost {
          padding: 11px 24px; border-radius: var(--r);
          border: 1px solid rgba(184,134,11,0.3);
          color: rgba(245,240,232,0.7); font-size: 14px; font-weight: 500;
          text-decoration: none; font-family: 'DM Sans', sans-serif;
          transition: border-color .18s, color .18s, background .18s;
        }
        .btn-ghost:hover { border-color: rgba(184,134,11,0.6); color: var(--parchment); background: rgba(184,134,11,0.07); }

        /* Decorative books */
        .hero-art {
          position: relative; flex-shrink: 0;
          width: 180px; height: 200px;
          display: flex; align-items: flex-end; gap: 10px;
        }
        .book {
          border-radius: 4px 8px 8px 4px;
          box-shadow: inset -3px 0 6px rgba(0,0,0,0.3), 2px 4px 16px rgba(0,0,0,0.4);
          transition: transform .2s;
        }
        .book:hover { transform: translateY(-8px); }
        .b1 { width: 28px; height: 140px; background: linear-gradient(180deg, #5c3a1e, #3d2510); }
        .b2 { width: 34px; height: 175px; background: linear-gradient(180deg, #1a4a6b, #102e44); }
        .b3 { width: 30px; height: 155px; background: linear-gradient(180deg, var(--gold), #8a6008); }
        .b4 { width: 26px; height: 120px; background: linear-gradient(180deg, #4a3060, #2c1a40); }
        .b5 { width: 32px; height: 165px; background: linear-gradient(180deg, #2d5a2d, #1a3a1a); }

        @media (max-width: 720px) { .hero { padding: 48px 28px 56px; } .hero-art { display: none; } }

        /* Quick Links */
        .quick-section { padding: 56px 64px; }
        .section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--muted);
          margin-bottom: 20px;
        }
        .quick-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .quick-card {
          display: flex; flex-direction: column; gap: 6px;
          padding: 22px 22px 18px;
          background: #fff; border: 1px solid rgba(0,0,0,0.07);
          border-radius: 12px; text-decoration: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          position: relative; overflow: hidden;
          transition: transform .18s, box-shadow .18s, border-color .18s;
        }
        .quick-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--gold-l));
          opacity: 0; transition: opacity .18s;
        }
        .quick-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); border-color: rgba(184,134,11,0.2); }
        .quick-card:hover::before { opacity: 1; }
        .quick-label { font-size: 14.5px; font-weight: 600; color: var(--ink); }
        .quick-desc  { font-size: 12.5px; color: var(--muted); line-height: 1.5; }
        .quick-arrow { margin-top: auto; padding-top: 10px; color: rgba(184,134,11,0.4); transition: color .18s, transform .18s; }
        .quick-card:hover .quick-arrow { color: var(--gold); transform: translateX(3px); }

        @media (max-width: 720px) { .quick-section { padding: 40px 24px; } }
      `}</style>

\      <Home />
    </>
  );
}