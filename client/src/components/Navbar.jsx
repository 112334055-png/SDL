import { useState, useRef, useEffect } from "react";

// ── Nav links per role ─────────────────────────────────────────────────────────

const MEMBER_NAV_LINKS = [
  {
    label: "Home",
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
    label: "My Borrows",
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
    label: "Books",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "History",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const LIBRARIAN_NAV_LINKS = [
  {
    label: "Home",
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
    label: "BookUpload",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Approval",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const GUEST_NAV_LINKS = [MEMBER_NAV_LINKS[0]]; // guests only see Catalog

// ── Navbar Component ───────────────────────────────────────────────────────────
/**
 * Props
 * ─────
 * activePage          string
 * setActivePage       fn(label)
 * isLoggedIn          bool
 * user                { name, initials, role: "Member"|"Librarian", email } | null
 * onLogin             fn
 * onSignup            fn
 * onLogout            fn  — calls backend + clears state in App
 * onProfile           fn
 * onLoginAsLibrarian  fn(targetRole?)  — switches role via backend in App
 */
function Navbar({
  activePage = "Catalog",
  isLoggedIn = false,
  user = null,
  setActivePage,
  onLogin,
  onSignup,
  onLogout,
  onProfile,
  onLoginAsLibrarian,
}) {
  const isLibrarian = isLoggedIn && user?.role === "Librarian";

  const NAV_LINKS = !isLoggedIn
    ? GUEST_NAV_LINKS
    : isLibrarian
    ? LIBRARIAN_NAV_LINKS
    : MEMBER_NAV_LINKS;

  const [activeItem, setActiveItem] = useState(activePage);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync with external activePage changes (e.g. after role switch resets page)
  useEffect(() => { setActiveItem(activePage); }, [activePage]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (label) => {
    setActiveItem(label);
    if (setActivePage) setActivePage(label);
  };

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
          --teal: #2a7a6a;
          --teal-light: #3aaa8a;
          --nav-bg: #1c1510;
          --nav-border: rgba(184,134,11,0.25);
          --nav-h: 68px;
          --radius: 8px;
        }
        /* Role-specific accent on nav border */
        .lms-nav.role-member { border-bottom-color: rgba(58,170,138,0.3); }
        .lms-nav.role-librarian { border-bottom-color: rgba(184,134,11,0.4); }

        /* Role pill */
        .lms-role-pill {
          display: inline-flex; align-items: center;
          padding: 2px 8px; border-radius: 20px;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          margin-left: 6px; flex-shrink: 0;
        }
        .lms-role-pill.librarian {
          background: rgba(212,160,23,0.18); color: var(--gold-bright);
          border: 1px solid rgba(212,160,23,0.4);
        }
        .lms-role-pill.member {
          background: rgba(58,170,138,0.15); color: #5fdbb0;
          border: 1px solid rgba(58,170,138,0.35);
        }

        .lms-nav {
          position: sticky; top: 0; z-index: 100;
          height: var(--nav-h);
          background: var(--nav-bg);
          border-bottom: 1px solid var(--nav-border);
          display: flex; align-items: center;
          padding: 0 28px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.35);
          transition: border-color 0.35s;
        }
        .lms-nav::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          opacity: 0.4; pointer-events: none;
        }

        /* Logo */
        .lms-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; margin-right: 36px; }
        .lms-logo-mark {
          width: 38px; height: 38px;
          background: linear-gradient(145deg, var(--gold), var(--gold-light));
          border-radius: 6px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(184,134,11,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
          flex-shrink: 0;
        }
        .lms-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .lms-logo-name { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--parchment); letter-spacing: 0.01em; }
        .lms-logo-sub { font-size: 9.5px; font-weight: 500; color: var(--gold); letter-spacing: 0.14em; text-transform: uppercase; margin-top: 2px; }

        /* Nav links */
        .lms-links { display: flex; align-items: center; gap: 2px; flex: 1; }
        .lms-link {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: var(--radius); border: none;
          background: transparent; color: rgba(245,240,232,0.55);
          font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
          letter-spacing: 0.01em; white-space: nowrap; position: relative;
          cursor: pointer; transition: color 0.18s, background 0.18s;
        }
        .lms-link:hover { color: var(--parchment); background: rgba(184,134,11,0.1); }
        .lms-link.active { color: var(--gold-bright); background: rgba(184,134,11,0.14); }
        .role-member .lms-link.active { color: #5fdbb0; background: rgba(58,170,138,0.1); }
        .lms-link.active::after {
          content: ''; position: absolute;
          bottom: -1px; left: 14px; right: 14px; height: 2px;
          background: linear-gradient(90deg, var(--gold), var(--gold-light));
          border-radius: 2px 2px 0 0;
        }
        .role-member .lms-link.active::after {
          background: linear-gradient(90deg, var(--teal-light), #5fdbb0);
        }

        /* Search */
        .lms-search { position: relative; margin-left: auto; margin-right: 16px; flex-shrink: 0; }
        .lms-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: rgba(184,134,11,0.45); pointer-events: none; transition: color 0.2s;
        }
        .lms-search.focused .lms-search-icon { color: var(--gold); }
        .lms-search-input {
          height: 36px; padding: 0 36px 0 38px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(184,134,11,0.2); border-radius: 20px;
          color: var(--parchment); font-family: 'DM Sans', sans-serif;
          font-size: 13px; width: 200px; outline: none;
          transition: border-color 0.2s, background 0.2s, width 0.3s;
        }
        .lms-search-input::placeholder { color: rgba(245,240,232,0.28); }
        .lms-search-input:focus { border-color: rgba(184,134,11,0.55); background: rgba(255,255,255,0.08); width: 250px; }
        .lms-search-clear {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: rgba(245,240,232,0.3);
          cursor: pointer; display: flex; padding: 2px; transition: color 0.15s;
        }
        .lms-search-clear:hover { color: var(--gold); }

        /* Auth buttons */
        .lms-auth-group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .lms-btn-login {
          height: 36px; padding: 0 18px; border-radius: 20px;
          border: 1px solid rgba(184,134,11,0.4); background: transparent;
          color: rgba(245,240,232,0.8); font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
        }
        .lms-btn-login:hover { border-color: var(--gold); color: var(--gold-bright); background: rgba(184,134,11,0.08); }
        .lms-btn-signup {
          height: 36px; padding: 0 18px; border-radius: 20px; border: none;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          color: #1c1510; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; box-shadow: 0 2px 10px rgba(184,134,11,0.35); white-space: nowrap;
          transition: box-shadow 0.18s, transform 0.12s, filter 0.18s;
        }
        .lms-btn-signup:hover { filter: brightness(1.1); box-shadow: 0 4px 16px rgba(184,134,11,0.5); transform: translateY(-1px); }

        /* Avatar */
        .lms-divider { width: 1px; height: 28px; background: rgba(184,134,11,0.2); margin: 0 8px; flex-shrink: 0; }
        .lms-profile-wrap { position: relative; flex-shrink: 0; }
        .lms-avatar-btn {
          display: flex; align-items: center; gap: 9px;
          padding: 5px 10px 5px 5px; border-radius: 22px;
          border: 1px solid rgba(184,134,11,0.2); background: rgba(255,255,255,0.04);
          cursor: pointer; flex-shrink: 0; transition: background 0.18s, border-color 0.18s;
        }
        .lms-avatar-btn:hover, .lms-avatar-btn.open { background: rgba(184,134,11,0.1); border-color: rgba(184,134,11,0.4); }
        .lms-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), var(--rust));
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.02em; flex-shrink: 0;
        }
        /* Teal avatar for members */
        .role-member .lms-avatar { background: linear-gradient(135deg, var(--teal-light), #1a5c4a); }
        .lms-avatar-info { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
        .lms-avatar-name { font-size: 12.5px; font-weight: 500; color: rgba(245,240,232,0.85); white-space: nowrap; font-family: 'DM Sans', sans-serif; line-height: 1; }
        .lms-avatar-role { font-size: 10px; font-weight: 400; color: var(--gold); white-space: nowrap; font-family: 'DM Sans', sans-serif; line-height: 1; letter-spacing: 0.04em; text-transform: uppercase; }
        .role-member .lms-avatar-role { color: #5fdbb0; }
        .lms-chevron { color: rgba(245,240,232,0.4); transition: transform 0.2s; flex-shrink: 0; }
        .lms-chevron.open { transform: rotate(180deg); }

        /* Dropdown */
        .lms-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0; min-width: 210px;
          background: #221a0f; border: 1px solid rgba(184,134,11,0.28); border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03);
          padding: 6px; z-index: 200; animation: dropFade 0.18s ease; overflow: hidden;
        }
        @keyframes dropFade { from { opacity: 0; transform: translateY(-6px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .lms-dropdown-header { padding: 10px 12px 8px; border-bottom: 1px solid rgba(184,134,11,0.15); margin-bottom: 4px; }
        .lms-dropdown-header-top { display: flex; align-items: center; gap: 8px; }
        .lms-dropdown-header-name { font-family: 'Playfair Display', serif; font-size: 13.5px; color: var(--parchment); font-weight: 600; }
        .lms-dropdown-header-email { font-size: 11px; color: rgba(245,240,232,0.4); font-family: 'DM Sans', sans-serif; margin-top: 2px; }
        .lms-dropdown-item {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 9px 12px; border-radius: 8px; border: none; background: transparent;
          color: rgba(245,240,232,0.7); font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500; text-align: left; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .lms-dropdown-item:hover { background: rgba(184,134,11,0.12); color: var(--parchment); }
        .lms-dropdown-item.librarian:hover { background: rgba(184,134,11,0.18); color: var(--gold-bright); }
        .lms-dropdown-item.danger { color: rgba(220,80,60,0.75); }
        .lms-dropdown-item.danger:hover { background: rgba(220,60,40,0.1); color: #ff6b55; }
        .lms-dropdown-sep { height: 1px; background: rgba(184,134,11,0.12); margin: 4px 0; }
        .lms-dropdown-item-icon { width: 16px; height: 16px; flex-shrink: 0; opacity: 0.75; }
        .lms-dropdown-item:hover .lms-dropdown-item-icon { opacity: 1; }

        /* Mobile toggle */
        .lms-mobile-toggle {
          display: none; margin-left: auto; width: 38px; height: 38px;
          border-radius: var(--radius); border: none; background: transparent;
          color: rgba(245,240,232,0.6); cursor: pointer;
          align-items: center; justify-content: center; flex-shrink: 0;
          transition: background 0.18s;
        }
        .lms-mobile-toggle:hover { background: rgba(184,134,11,0.1); color: var(--parchment); }

        /* Mobile menu */
        .lms-mobile-menu {
          display: none; position: fixed; top: var(--nav-h); left: 0; right: 0;
          background: #1a1208; border-bottom: 1px solid var(--nav-border);
          padding: 12px 20px 20px; z-index: 99; animation: slideDown 0.2s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .lms-mobile-search {
          width: 100%; height: 40px; padding: 0 14px; margin-bottom: 10px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(184,134,11,0.25);
          border-radius: 8px; color: var(--parchment); font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; outline: none;
        }
        .lms-mobile-search::placeholder { color: rgba(245,240,232,0.3); }
        .lms-mobile-link {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 11px 14px; margin: 2px 0;
          border-radius: var(--radius); border: none; background: transparent;
          color: rgba(245,240,232,0.65); font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; text-align: left; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .lms-mobile-link:hover, .lms-mobile-link.active { background: rgba(184,134,11,0.12); color: var(--gold-bright); }
        .lms-mobile-sep { height: 1px; background: rgba(184,134,11,0.15); margin: 8px 0; }
        .lms-mobile-auth { display: flex; gap: 8px; margin-top: 4px; }
        .lms-mobile-auth .lms-btn-login, .lms-mobile-auth .lms-btn-signup { flex: 1; height: 40px; }

        @media (max-width: 860px) {
          .lms-links, .lms-search, .lms-divider, .lms-avatar-btn, .lms-auth-group { display: none !important; }
          .lms-mobile-toggle { display: flex !important; }
          .lms-mobile-menu.open { display: block; }
        }
      `}</style>

      <nav className={`lms-nav ${isLoggedIn ? (isLibrarian ? "role-librarian" : "role-member") : ""}`}>
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
          {/* Role pill visible next to logo when logged in */}
          {isLoggedIn && user?.role && (
            <span className={`lms-role-pill ${isLibrarian ? "librarian" : "member"}`}>
              {user.role}
            </span>
          )}
        </a>

        {/* Desktop nav – role-specific links */}
        <div className="lms-links">
          {NAV_LINKS.map((item) => (
            <button
              key={item.label}
              className={`lms-link ${activeItem === item.label ? "active" : ""}`}
              onClick={() => handleNavClick(item.label)}
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
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="lms-search-input"
            placeholder={isLibrarian ? "Search books, members…" : "Search books…"}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchVal && (
            <button className="lms-search-clear" onClick={() => setSearchVal("")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* LOGGED OUT */}
        {!isLoggedIn && (
          <>
            <div className="lms-divider" />
            <div className="lms-auth-group">
              <button className="lms-btn-login" onClick={onLogin}>Log In</button>
              <button className="lms-btn-signup" onClick={onSignup}>Sign Up</button>
            </div>
          </>
        )}

        {/* LOGGED IN */}
        {isLoggedIn && (
          <>
            <div className="lms-divider" />
            <div className="lms-profile-wrap" ref={dropdownRef}>
              <button
                className={`lms-avatar-btn ${dropdownOpen ? "open" : ""}`}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="lms-avatar">{user?.initials || "?"}</div>
                {user?.name && (
                  <div className="lms-avatar-info">
                    <span className="lms-avatar-name">{user.name}</span>
                    {user.role && <span className="lms-avatar-role">{user.role}</span>}
                  </div>
                )}
                <svg className={`lms-chevron ${dropdownOpen ? "open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="lms-dropdown" role="menu">
                  <div className="lms-dropdown-header">
                    <div className="lms-dropdown-header-top">
                      <div className="lms-dropdown-header-name">{user?.name}</div>
                      {user?.role && (
                        <span className={`lms-role-pill ${isLibrarian ? "librarian" : "member"}`}>
                          {user.role}
                        </span>
                      )}
                    </div>
                    {user?.email && <div className="lms-dropdown-header-email">{user.email}</div>}
                  </div>

                  {/* My Profile */}
                  <button className="lms-dropdown-item" role="menuitem"
                    onClick={() => { setDropdownOpen(false); if (onProfile) onProfile(); }}>
                    <svg className="lms-dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    My Profile
                  </button>

                  {/* Switch to Librarian (only shown for Members) */}
                  {!isLibrarian && (
<button
  className="lms-dropdown-item librarian"
  role="menuitem"
  onClick={() => {
    setDropdownOpen(false);
    if (onLogin) onLogin("Librarian");
  }}
>
                      <svg className="lms-dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                      Login as Librarian
                    </button>
                  )}

                  {/* Switch back to Member (only shown for Librarians) */}
                  {isLibrarian && (
                    <button className="lms-dropdown-item" role="menuitem"
                      onClick={() => { setDropdownOpen(false); if (onLoginAsLibrarian) onLoginAsLibrarian("Member"); }}>
                      <svg className="lms-dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      Switch to Member View
                    </button>
                  )}

                  <div className="lms-dropdown-sep" />

                  {/* Logout */}
                  <button className="lms-dropdown-item danger" role="menuitem"
                    onClick={() => { setDropdownOpen(false); if (onLogout) onLogout(); }}>
                    <svg className="lms-dropdown-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile toggle */}
        <button className="lms-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`lms-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <input className="lms-mobile-search" placeholder={isLibrarian ? "Search books, members…" : "Search books…"} />
        {NAV_LINKS.map((item) => (
          <button
            key={item.label}
            className={`lms-mobile-link ${activeItem === item.label ? "active" : ""}`}
            onClick={() => { handleNavClick(item.label); setMobileOpen(false); }}
          >
            {item.icon}{item.label}
          </button>
        ))}
        <div className="lms-mobile-sep" />
        {!isLoggedIn ? (
          <div className="lms-mobile-auth">
            <button className="lms-btn-login" onClick={() => { setMobileOpen(false); if (onLogin) onLogin(); }}>Log In</button>
            <button className="lms-btn-signup" onClick={() => { setMobileOpen(false); if (onSignup) onSignup(); }}>Sign Up</button>
          </div>
        ) : (
          <>
            <button className="lms-mobile-link" onClick={() => { setMobileOpen(false); if (onProfile) onProfile(); }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              My Profile
            </button>
            {!isLibrarian && (
              <button className="lms-mobile-link" onClick={() => { setMobileOpen(false); if (onLoginAsLibrarian) onLoginAsLibrarian(); }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Login as Librarian
              </button>
            )}
            {isLibrarian && (
              <button className="lms-mobile-link" onClick={() => { setMobileOpen(false); if (onLoginAsLibrarian) onLoginAsLibrarian("Member"); }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
                Switch to Member View
              </button>
            )}
            <button className="lms-mobile-link" style={{ color: "rgba(220,80,60,0.8)" }}
              onClick={() => { setMobileOpen(false); if (onLogout) onLogout(); }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default Navbar;