import { useState } from "react";

const NAV_LINKS = [
  {
    label: "Catalog",
    href: "/catalog",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="10" y1="8" x2="16" y2="8" />
        <line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
  },
  {
    label: "Members",
    href: "/members",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Circulation",
    href: "/circulation",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    label: "BookUpload",
    href: "/reports",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

// Usage: <LibraryNavbar activePage="Catalog" user={{ name: "Jane Doe", initials: "JD" }} />
function Navbar({ activePage = "Catalog", user = { name: "", initials: "" }, setActivePage }) {
  const [activeItem, setActiveItem] = useState(activePage);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --parchment: #f5f0e8;
          --gold: #b8860b;
          --gold-light: #d4a017;
          --gold-bright: #f0c040;
          --rust: #8b3a1a;
          --nav-bg: #1c1510;
          --nav-border: rgba(184,134,11,0.25);
          --nav-h: 68px;
          --radius: 8px;
        }

        .lms-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          height: var(--nav-h);
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
          display: flex;
          align-items: center;
          padding: 0 28px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.35);
        }
        .lms-nav::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }

        /* LOGO */
        .lms-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
          margin-right: 36px;
        }
        .lms-logo-mark {
          width: 38px; height: 38px;
          background: linear-gradient(145deg, var(--gold), var(--gold-light));
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(184,134,11,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
          flex-shrink: 0;
        }
        .lms-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .lms-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 700;
          color: var(--parchment);
          letter-spacing: 0.01em;
        }
        .lms-logo-sub {
          font-size: 9.5px; font-weight: 500;
          color: var(--gold);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        /* NAV LINKS */
        .lms-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }
        .lms-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: var(--radius);
          border: none;
          background: transparent;
          color: rgba(245,240,232,0.55);
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500;
          letter-spacing: 0.01em;
          white-space: nowrap;
          position: relative;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.18s, background 0.18s;
        }
        .lms-link:hover {
          color: var(--parchment);
          background: rgba(184,134,11,0.1);
        }
        .lms-link.active {
          color: var(--gold-bright);
          background: rgba(184,134,11,0.14);
        }
        .lms-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 14px; right: 14px;
          height: 2px;
          background: linear-gradient(90deg, var(--gold), var(--gold-light));
          border-radius: 2px 2px 0 0;
        }

        /* SEARCH */
        .lms-search {
          position: relative;
          margin-left: auto;
          margin-right: 16px;
          flex-shrink: 0;
        }
        .lms-search-icon {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          color: rgba(184,134,11,0.45);
          pointer-events: none;
          transition: color 0.2s;
        }
        .lms-search.focused .lms-search-icon { color: var(--gold); }
        .lms-search-input {
          height: 36px;
          padding: 0 36px 0 38px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(184,134,11,0.2);
          border-radius: 20px;
          color: var(--parchment);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          width: 200px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, width 0.3s;
        }
        .lms-search-input::placeholder { color: rgba(245,240,232,0.28); }
        .lms-search-input:focus {
          border-color: rgba(184,134,11,0.55);
          background: rgba(255,255,255,0.08);
          width: 250px;
        }
        .lms-search-clear {
          position: absolute;
          right: 10px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          color: rgba(245,240,232,0.3);
          cursor: pointer;
          display: flex; padding: 2px;
          transition: color 0.15s;
        }
        .lms-search-clear:hover { color: var(--gold); }

        /* AVATAR */
        .lms-divider {
          width: 1px; height: 28px;
          background: rgba(184,134,11,0.2);
          margin: 0 8px;
          flex-shrink: 0;
        }
        .lms-avatar-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 5px 10px 5px 5px;
          border-radius: 22px;
          border: 1px solid rgba(184,134,11,0.2);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.18s, border-color 0.18s;
        }
        .lms-avatar-btn:hover {
          background: rgba(184,134,11,0.1);
          border-color: rgba(184,134,11,0.4);
        }
        .lms-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--rust));
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          color: #fff; letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .lms-avatar-name {
          font-size: 12.5px; font-weight: 500;
          color: rgba(245,240,232,0.75);
          white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }

        /* MOBILE TOGGLE */
        .lms-mobile-toggle {
          display: none;
          margin-left: auto;
          width: 38px; height: 38px;
          border-radius: var(--radius);
          border: none; background: transparent;
          color: rgba(245,240,232,0.6);
          cursor: pointer;
          align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.18s;
        }
        .lms-mobile-toggle:hover {
          background: rgba(184,134,11,0.1);
          color: var(--parchment);
        }

        /* MOBILE MENU */
        .lms-mobile-menu {
          display: none;
          position: fixed;
          top: var(--nav-h); left: 0; right: 0;
          background: #1a1208;
          border-bottom: 1px solid var(--nav-border);
          padding: 12px 20px 20px;
          z-index: 99;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lms-mobile-search {
          width: 100%; height: 40px;
          padding: 0 14px; margin-bottom: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(184,134,11,0.25);
          border-radius: 8px;
          color: var(--parchment);
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; outline: none;
        }
        .lms-mobile-search::placeholder { color: rgba(245,240,232,0.3); }
        .lms-mobile-link {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 11px 14px; margin: 2px 0;
          border-radius: var(--radius);
          border: none; background: transparent;
          color: rgba(245,240,232,0.65);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          text-align: left; cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .lms-mobile-link:hover,
        .lms-mobile-link.active {
          background: rgba(184,134,11,0.12);
          color: var(--gold-bright);
        }

        @media (max-width: 860px) {
          .lms-links,
          .lms-search,
          .lms-divider,
          .lms-avatar-btn { display: none !important; }
          .lms-mobile-toggle { display: flex !important; }
          .lms-mobile-menu.open { display: block; }
        }
      `}</style>

      <nav className="lms-nav">
        {/* Logo */}
        <a className="lms-logo" href="/">
          <div className="lms-logo-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c1510" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="lms-logo-text">
            <span className="lms-logo-name">Bibliotheca</span>
            <span className="lms-logo-sub">Library System</span>
          </div>
        </a>

        {/* Desktop Links */}
  <div className="lms-links">
  {NAV_LINKS.map((item) => (
    <button
      key={item.label}
      className={`lms-link ${activeItem === item.label ? "active" : ""}`}
      onClick={() => {
        setActiveItem(item.label);       // keeps the orange active bar
        if (setActivePage) setActivePage(item.label); // informs App
      }}
    >
      {item.icon}
      {item.label}
    </button>
  ))}
</div>



        {/* Search */}
        <div className={`lms-search ${searchFocused ? "focused" : ""}`}>
          <span className="lms-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="lms-search-input"
            placeholder="Search books, members…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchVal && (
            <button className="lms-search-clear" onClick={() => setSearchVal("")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* User Avatar */}
        <div className="lms-divider" />
        <button className="lms-avatar-btn">
          <div className="lms-avatar">{user.initials || "?"}</div>
          {user.name && <span className="lms-avatar-name">{user.name}</span>}
        </button>

        {/* Mobile Toggle */}
        <button
          className="lms-mobile-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`lms-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <input className="lms-mobile-search" placeholder="Search books, members…" />
        {NAV_LINKS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`lms-mobile-link ${activeItem === item.label ? "active" : ""}`}
onClick={() => {
  setActiveItem(item.label);
  if (setActivePage) setActivePage(item.label);
  setMobileOpen(false);
}}
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}

export default Navbar;