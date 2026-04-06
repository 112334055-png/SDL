import { useState } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --parchment: #f5f0e8;
    --gold: #b8860b;
    --gold-light: #d4a017;
    --gold-bright: #f0c040;
    --rust: #8b3a1a;
    --modal-card: #221a0f;
    --nav-border: rgba(184,134,11,0.25);
    --error: #e05540;
    --success: #5fad6e;
    --radius: 8px;
  }

  .li-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,7,3,0.82);
    backdrop-filter: blur(6px);
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: overlayIn 0.22s ease;
  }
  @keyframes overlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .li-card {
    background: var(--modal-card);
    border: 1px solid rgba(184,134,11,0.28);
    border-radius: 18px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04);
    width: 100%;
    max-width: 440px;
    padding: 36px 36px 32px;
    position: relative;
    animation: cardIn 0.26s cubic-bezier(0.34,1.56,0.64,1);
    overflow: hidden;
  }
  .li-card::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(184,134,11,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Mode toggle pill — Member / Librarian */
  .li-mode-pill {
    display: flex;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(184,134,11,0.18);
    border-radius: 22px;
    padding: 4px;
    gap: 4px;
    margin-bottom: 28px;
  }
  .li-mode-btn {
    flex: 1;
    height: 34px;
    border: none;
    border-radius: 18px;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    color: rgba(245,240,232,0.45);
    letter-spacing: 0.01em;
  }
  .li-mode-btn.active {
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: #1c1510;
    box-shadow: 0 2px 12px rgba(184,134,11,0.4);
  }
  .li-mode-btn:not(.active):hover {
    color: rgba(245,240,232,0.75);
    background: rgba(184,134,11,0.08);
  }

  /* Librarian badge ribbon */
  .li-librarian-badge {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(184,134,11,0.08);
    border: 1px solid rgba(184,134,11,0.22);
    border-radius: var(--radius);
    padding: 10px 14px;
    margin-bottom: 20px;
    animation: errIn 0.2s ease;
  }
  .li-librarian-badge-icon {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--rust));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .li-librarian-badge-text { display: flex; flex-direction: column; gap: 2px; }
  .li-librarian-badge-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px; font-weight: 700;
    color: var(--gold-bright);
    letter-spacing: 0.03em;
  }
  .li-librarian-badge-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(245,240,232,0.38);
  }

  /* Close */
  .li-close {
    position: absolute;
    top: 16px; right: 16px;
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(184,134,11,0.2);
    background: transparent;
    color: rgba(245,240,232,0.4);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .li-close:hover {
    background: rgba(184,134,11,0.12);
    color: var(--gold-bright);
    border-color: rgba(184,134,11,0.45);
  }

  /* Header */
  .li-header { margin-bottom: 26px; }
  .li-logo-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .li-logo-mark {
    width: 34px; height: 34px;
    background: linear-gradient(145deg, var(--gold), var(--gold-light));
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 12px rgba(184,134,11,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
    flex-shrink: 0;
  }
  .li-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700;
    color: var(--parchment);
  }
  .li-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700;
    color: var(--parchment);
    line-height: 1.15;
    margin-bottom: 6px;
    transition: all 0.2s;
  }
  .li-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: rgba(245,240,232,0.42);
    line-height: 1.5;
  }

  /* Form */
  .li-form { display: flex; flex-direction: column; gap: 16px; }

  .li-field { display: flex; flex-direction: column; gap: 5px; }
  .li-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11.5px; font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(184,134,11,0.75);
  }
  .li-input-wrap { position: relative; }
  .li-input {
    width: 100%; height: 42px;
    padding: 0 40px 0 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(184,134,11,0.18);
    border-radius: var(--radius);
    color: var(--parchment);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .li-input::placeholder { color: rgba(245,240,232,0.22); }
  .li-input:focus {
    border-color: rgba(184,134,11,0.55);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(184,134,11,0.1);
  }
  .li-input.error {
    border-color: rgba(224,85,64,0.6);
    box-shadow: 0 0 0 3px rgba(224,85,64,0.1);
  }
  .li-input.valid {
    border-color: rgba(95,173,110,0.5);
  }
  .li-input-icon {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    display: flex; align-items: center;
  }
  .li-pw-toggle {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: rgba(184,134,11,0.4);
    cursor: pointer;
    display: flex; padding: 2px;
    transition: color 0.15s;
  }
  .li-pw-toggle:hover { color: var(--gold); }

  .li-error-msg {
    font-family: 'DM Sans', sans-serif;
    font-size: 11.5px;
    color: var(--error);
    display: flex; align-items: center; gap: 4px;
    animation: errIn 0.18s ease;
  }
  @keyframes errIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Forgot password */
  .li-forgot-row {
    display: flex; justify-content: flex-end;
    margin-top: -8px;
  }
  .li-forgot {
    background: none; border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 500;
    color: rgba(184,134,11,0.6);
    cursor: pointer;
    border-bottom: 1px solid transparent;
    padding: 0;
    transition: color 0.15s, border-color 0.15s;
  }
  .li-forgot:hover { color: var(--gold-bright); border-color: rgba(184,134,11,0.4); }

  /* Submit */
  .li-submit {
    height: 44px; width: 100%;
    border-radius: 22px; border: none;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: #1c1510;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(184,134,11,0.4);
    transition: filter 0.18s, box-shadow 0.18s, transform 0.12s;
    letter-spacing: 0.02em;
    margin-top: 4px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .li-submit:hover:not(:disabled) {
    filter: brightness(1.08);
    box-shadow: 0 6px 24px rgba(184,134,11,0.55);
    transform: translateY(-1px);
  }
  .li-submit:active:not(:disabled) { transform: translateY(0); }
  .li-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Librarian submit variant */
  .li-submit.librarian-mode {
    background: linear-gradient(135deg, #6b2d10, var(--rust));
    color: var(--parchment);
    box-shadow: 0 4px 18px rgba(139,58,26,0.45);
  }
  .li-submit.librarian-mode:hover:not(:disabled) {
    filter: brightness(1.12);
    box-shadow: 0 6px 24px rgba(139,58,26,0.6);
  }

  /* Divider */
  .li-divider-row {
    display: flex; align-items: center; gap: 10px;
  }
  .li-divider-line {
    flex: 1; height: 1px;
    background: rgba(184,134,11,0.12);
  }
  .li-divider-txt {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(245,240,232,0.22);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Librarian option at bottom */
  .li-librarian-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid rgba(184,134,11,0.18);
    background: rgba(139,58,26,0.06);
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s;
    margin-top: 2px;
  }
  .li-librarian-option:hover {
    background: rgba(139,58,26,0.14);
    border-color: rgba(139,58,26,0.4);
  }
  .li-librarian-option-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(184,134,11,0.15), rgba(139,58,26,0.2));
    border: 1px solid rgba(184,134,11,0.25);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: var(--gold);
    transition: background 0.18s;
  }
  .li-librarian-option:hover .li-librarian-option-icon {
    background: linear-gradient(135deg, rgba(184,134,11,0.25), rgba(139,58,26,0.3));
  }
  .li-librarian-option-text { flex: 1; }
  .li-librarian-option-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    color: rgba(245,240,232,0.8);
    line-height: 1;
    margin-bottom: 3px;
  }
  .li-librarian-option-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(245,240,232,0.35);
  }
  .li-librarian-option-arrow {
    color: rgba(184,134,11,0.4);
    transition: transform 0.18s, color 0.18s;
  }
  .li-librarian-option:hover .li-librarian-option-arrow {
    transform: translateX(3px);
    color: var(--gold);
  }

  /* Footer */
  .li-footer {
    text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: rgba(245,240,232,0.38);
  }
  .li-footer button {
    background: none; border: none;
    color: var(--gold);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    border-bottom: 1px solid rgba(184,134,11,0.35);
    padding: 0;
    transition: color 0.15s, border-color 0.15s;
  }
  .li-footer button:hover { color: var(--gold-bright); border-color: var(--gold-bright); }

  /* Success */
  .li-success {
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    padding: 12px 0 4px;
    animation: cardIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .li-success-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .li-success-icon.member {
    background: linear-gradient(135deg, rgba(95,173,110,0.15), rgba(95,173,110,0.08));
    border: 1.5px solid rgba(95,173,110,0.35);
    box-shadow: 0 0 40px rgba(95,173,110,0.2);
  }
  .li-success-icon.librarian {
    background: linear-gradient(135deg, rgba(184,134,11,0.2), rgba(139,58,26,0.15));
    border: 1.5px solid rgba(184,134,11,0.4);
    box-shadow: 0 0 40px rgba(184,134,11,0.25);
  }
  .li-success-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    color: var(--parchment);
    margin-bottom: 10px;
  }
  .li-success-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: rgba(245,240,232,0.45);
    line-height: 1.6;
    max-width: 300px;
  }

  /* Global error banner */
  .li-global-error {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px;
    background: rgba(224,85,64,0.1);
    border: 1px solid rgba(224,85,64,0.3);
    border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    color: #ff7b68;
    animation: errIn 0.2s ease;
  }
`;

// ── Validators ──────────────────────────────────────────────────────────────

const validators = {
  email: (v) => {
    if (!v.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address";
    return "";
  },
  staffId: (v) => {
    if (!v.trim()) return "Staff ID is required";
    if (!/^[A-Za-z0-9\-]{4,20}$/.test(v)) return "4–20 alphanumeric characters only";
    return "";
  },
  password: (v) => {
    if (!v) return "Password is required";
    if (v.length < 8) return "Must be at least 8 characters";
    if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter";
    if (!/[0-9]/.test(v)) return "Include at least one number";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) return "Include at least one special character";
    return "";
  },
};

// ── Small UI bits ───────────────────────────────────────────────────────────

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const FieldIcon = ({ state }) => {
  if (state === "valid")
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5fad6e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
  if (state === "error")
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e05540" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
  return null;
};

function Field({ label, name, type = "text", placeholder, value, onChange, onBlur, error, touched, showPwToggle, showPw, onTogglePw }) {
  const state = touched ? (error ? "error" : "valid") : "";
  return (
    <div className="li-field">
      <label className="li-label">{label}</label>
      <div className="li-input-wrap">
<input
  className={`li-input ${state}`}
  type={showPwToggle ? (showPw ? "text" : "password") : type}
  placeholder={placeholder}
  name={name}               // ✅ ADD THIS LINE
  value={value}
  onChange={onChange}
  onBlur={onBlur}
  autoComplete={name}
/>
        {showPwToggle ? (
          <button className="li-pw-toggle" type="button" onClick={onTogglePw} tabIndex={-1}>
            <EyeIcon open={showPw} />
          </button>
        ) : (
          state && <span className="li-input-icon"><FieldIcon state={state} /></span>
        )}
      </div>
      {touched && error && <div className="li-error-msg">⚠ {error}</div>}
    </div>
  );
}

// ── LoginModal ──────────────────────────────────────────────────────────────

function UserLogin({ onClose, onSignup, onLoginSuccess }) {
  const [mode, setMode] = useState("member"); // "member" | "librarian"
  const [form, setForm] = useState({ email: "", staffId: "", password: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [submitted, setSubmitted] = useState(false);
const [submitting, setSubmitting]   = useState(false); // ✅ ADD THIS

  const activeFields = mode === "member" ? ["email", "password"] : ["staffId", "password"];

  const validate = (name, value) => validators[name] ? validators[name](value) : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setGlobalError("");
    if (touched[name]) setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  const switchMode = (m) => {
    setMode(m);
    setTouched({});
    setErrors({});
    setGlobalError("");
  };

// ── In UserLogin.jsx — replace handleSubmit's fetch call with this ────────────

const handleSubmit = async () => {
  const newTouched = Object.fromEntries(activeFields.map((k) => [k, true]));
  const newErrors  = Object.fromEntries(activeFields.map((k) => [k, validate(k, form[k])]));
  setTouched((t) => ({ ...t, ...newTouched }));
  setErrors((er)  => ({ ...er,  ...newErrors  }));
  if (Object.values(newErrors).some((e) => e)) return;

  setSubmitting(true);
  setGlobalError("");

  try {
    const res  = await fetch("http://localhost:5000/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        mode:    mode,           // "member" | "librarian"
        email:   form.email,
        staffId: form.staffId,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setGlobalError(data.message || "Login failed");
      return;
    }

    // ✅ Save token for Authorization headers in future requests
    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data.user));

    setSubmitted(true);
    onLoginSuccess?.({
      name:    data.user.name,
      email:   data.user.email,
      staffId: data.user.staffId,
      role:    data.user.role,
      token:   data.token,
    });

  } catch (err) {
    setGlobalError("Network error. Is the server running?");
  } finally {
    setSubmitting(false);
  }
};


// ── In LibrarianApprovals.jsx — the API helper already reads the token ────────
// Make sure your apiFetch / API helper includes the Authorization header:

const API = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`http://localhost:5000${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),  // ✅ this line
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

  return (
    <>
      <style>{STYLE}</style>
      <div className="li-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
        <div className="li-card" role="dialog" aria-modal="true" aria-label="Log In">

          <button className="li-close" onClick={onClose} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {submitted ? (
            <div className="li-success">
              <div className={`li-success-icon ${mode}`}>
                {mode === "member" ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5fad6e" strokeWidth="2.2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1.5" fill="#f0c040" stroke="none" />
                  </svg>
                )}
              </div>
              <div className="li-success-title">
                {mode === "member" ? "Welcome back!" : "Librarian Access Granted"}
              </div>
              <div className="li-success-sub">
                {mode === "member"
                  ? "You have successfully logged in. Enjoy exploring the catalog."
                  : "You are now logged in with librarian privileges. Manage the collection with care."}
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="li-header">
                <div className="li-logo-row">
                  <div className="li-logo-mark">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1510" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <span className="li-logo-name">Bibliotheca</span>
                </div>
                <div className="li-title">
                  {mode === "member" ? "Welcome back" : "Librarian Portal"}
                </div>
                <div className="li-subtitle">
                  {mode === "member"
                    ? "Sign in to access your library account."
                    : "Restricted access — staff credentials required."}
                </div>
              </div>

              {/* Mode toggle */}
              <div className="li-mode-pill" role="tablist">
                <button
                  className={`li-mode-btn ${mode === "member" ? "active" : ""}`}
                  onClick={() => switchMode("member")}
                  role="tab"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  </svg>
                  Member
                </button>
                <button
                  className={`li-mode-btn ${mode === "librarian" ? "active" : ""}`}
                  onClick={() => switchMode("librarian")}
                  role="tab"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Librarian
                </button>
              </div>

              {/* Librarian badge */}
              {mode === "librarian" && (
                <div className="li-librarian-badge">
                  <div className="li-librarian-badge-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="li-librarian-badge-text">
                    <div className="li-librarian-badge-title">Staff Access Only</div>
                    <div className="li-librarian-badge-sub">Use your assigned Staff ID and credentials</div>
                  </div>
                </div>
              )}

              {/* Global error */}
              {globalError && (
                <div className="li-global-error" style={{ marginBottom: 16 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {globalError}
                </div>
              )}

              <div className="li-form">
                {/* Email (member) or Staff ID (librarian) */}
                {mode === "member" ? (
                  <Field
                    label="Email Address" name="email" type="email" placeholder="jane@example.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    error={errors.email} touched={touched.email}
                  />
                ) : (
                  <Field
                    label="Staff ID" name="staffId" placeholder="e.g. LIB-00142"
                    value={form.staffId} onChange={handleChange} onBlur={handleBlur}
                    error={errors.staffId} touched={touched.staffId}
                  />
                )}

                {/* Password */}
                <div>
                  <Field
                    label="Password" name="password" placeholder="Your password"
                    value={form.password} onChange={handleChange} onBlur={handleBlur}
                    error={errors.password} touched={touched.password}
                    showPwToggle showPw={showPw} onTogglePw={() => setShowPw((v) => !v)}
                  />
                  
                </div>

               <button
  className={`li-submit ${mode === "librarian" ? "librarian-mode" : ""}`}
  onClick={handleSubmit}
  disabled={submitting}   // ✅ prevent double-clicks
  type="button"
>
  {submitting ? (
    <>
      <div style={{
        width: 15, height: 15,
        border: "2px solid rgba(28,21,16,0.3)",
        borderTopColor: "#1c1510",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      Signing in…
    </>
  ) : (
    <>
      {mode === "librarian" && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
      {mode === "member" ? "Sign In" : "Sign In as Librarian"}
    </>
  )}
</button>

                {/* Divider */}
                <div className="li-divider-row">
                  <div className="li-divider-line" />
                  <span className="li-divider-txt">or</span>
                  <div className="li-divider-line" />
                </div>

                {/* Librarian quick-switch at bottom (only in member mode) */}
                {mode === "member" && (
                  <button
                    className="li-librarian-option"
                    type="button"
                    onClick={() => switchMode("librarian")}
                  >
                    <div className="li-librarian-option-icon">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                    </div>
                    <div className="li-librarian-option-text">
                      <div className="li-librarian-option-title">Login as Librarian</div>
                      <div className="li-librarian-option-sub">Access staff portal with your credentials</div>
                    </div>
                    <svg className="li-librarian-option-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}

                {/* Back to member (in librarian mode) */}
                {mode === "librarian" && (
                  <button
                    className="li-librarian-option"
                    type="button"
                    onClick={() => switchMode("member")}
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(184,134,11,0.12)" }}
                  >
                    <div className="li-librarian-option-icon" style={{ transform: "rotate(180deg)" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="li-librarian-option-text">
                      <div className="li-librarian-option-title">Login as Member</div>
                      <div className="li-librarian-option-sub">Switch to regular member login</div>
                    </div>
                    <svg className="li-librarian-option-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )}

                {/* Sign up link */}
                <div className="li-footer">
                  New to Bibliotheca?{" "}
                  <button onClick={() => { onClose?.(); onSignup?.(); }}>Create an account</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default UserLogin