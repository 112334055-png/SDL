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
    --nav-bg: #1c1510;
    --modal-bg: #1a1208;
    --modal-card: #221a0f;
    --nav-border: rgba(184,134,11,0.25);
    --error: #e05540;
    --success: #5fad6e;
    --radius: 8px;
  }

  .su-overlay {
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

  .su-card {
    background: var(--modal-card);
    border: 1px solid rgba(184,134,11,0.28);
    border-radius: 18px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04);
    width: 100%;
    max-width: 460px;
    padding: 36px 36px 32px;
    position: relative;
    animation: cardIn 0.26s cubic-bezier(0.34,1.56,0.64,1);
    overflow: hidden;
  }
  .su-card::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(184,134,11,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Close */
  .su-close {
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
  .su-close:hover {
    background: rgba(184,134,11,0.12);
    color: var(--gold-bright);
    border-color: rgba(184,134,11,0.45);
  }

  /* Header */
  .su-header { margin-bottom: 28px; }
  .su-logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .su-logo-mark {
    width: 34px; height: 34px;
    background: linear-gradient(145deg, var(--gold), var(--gold-light));
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 12px rgba(184,134,11,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
    flex-shrink: 0;
  }
  .su-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700;
    color: var(--parchment);
  }
  .su-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700;
    color: var(--parchment);
    line-height: 1.15;
    margin-bottom: 6px;
  }
  .su-subtitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: rgba(245,240,232,0.42);
    line-height: 1.5;
  }

  /* Form */
  .su-form { display: flex; flex-direction: column; gap: 16px; }

  .su-row { display: flex; gap: 12px; }
  .su-row .su-field { flex: 1; }

  .su-field { display: flex; flex-direction: column; gap: 5px; }
  .su-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11.5px; font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(184,134,11,0.75);
  }

  .su-input-wrap { position: relative; }
  .su-input {
    width: 100%;
    height: 42px;
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
  .su-input::placeholder { color: rgba(245,240,232,0.22); }
  .su-input:focus {
    border-color: rgba(184,134,11,0.55);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(184,134,11,0.1);
  }
  .su-input.error {
    border-color: rgba(224,85,64,0.6);
    box-shadow: 0 0 0 3px rgba(224,85,64,0.1);
  }
  .su-input.valid {
    border-color: rgba(95,173,110,0.5);
  }

  .su-input-icon {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: rgba(184,134,11,0.35);
    transition: color 0.2s;
    display: flex; align-items: center;
  }
  .su-input:focus ~ .su-input-icon { color: rgba(184,134,11,0.65); }
  .su-input.error ~ .su-input-icon { color: rgba(224,85,64,0.55); }
  .su-input.valid ~ .su-input-icon { color: rgba(95,173,110,0.7); }

  .su-pw-toggle {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: rgba(184,134,11,0.4);
    cursor: pointer;
    display: flex; padding: 2px;
    transition: color 0.15s;
  }
  .su-pw-toggle:hover { color: var(--gold); }

  /* Error / hint text */
  .su-error-msg {
    font-family: 'DM Sans', sans-serif;
    font-size: 11.5px;
    color: var(--error);
    min-height: 16px;
    display: flex; align-items: center; gap: 4px;
    animation: errIn 0.18s ease;
  }
  @keyframes errIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Password strength */
  .su-strength-row {
    display: flex;
    gap: 4px;
    margin-top: 4px;
  }
  .su-strength-bar {
    flex: 1; height: 3px;
    border-radius: 3px;
    background: rgba(255,255,255,0.08);
    transition: background 0.3s;
  }
  .su-strength-bar.filled-1 { background: var(--error); }
  .su-strength-bar.filled-2 { background: #d4861a; }
  .su-strength-bar.filled-3 { background: var(--gold-light); }
  .su-strength-bar.filled-4 { background: var(--success); }
  .su-strength-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    margin-top: 2px;
    transition: color 0.3s;
  }

  /* Terms */
  .su-terms {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
  }
  .su-checkbox {
    width: 16px; height: 16px;
    min-width: 16px;
    border: 1px solid rgba(184,134,11,0.35);
    border-radius: 4px;
    background: rgba(255,255,255,0.04);
    margin-top: 1px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .su-checkbox.checked {
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border-color: var(--gold);
  }
  .su-terms-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: rgba(245,240,232,0.45);
    line-height: 1.5;
  }
  .su-terms-text a {
    color: var(--gold);
    text-decoration: none;
    border-bottom: 1px solid rgba(184,134,11,0.3);
    transition: color 0.15s, border-color 0.15s;
  }
  .su-terms-text a:hover { color: var(--gold-bright); border-color: var(--gold-bright); }

  /* Submit */
  .su-submit {
    height: 44px;
    width: 100%;
    border-radius: 22px;
    border: none;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: #1c1510;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(184,134,11,0.4);
    transition: filter 0.18s, box-shadow 0.18s, transform 0.12s;
    letter-spacing: 0.02em;
    margin-top: 4px;
    position: relative;
    overflow: hidden;
  }
  .su-submit:hover:not(:disabled) {
    filter: brightness(1.08);
    box-shadow: 0 6px 24px rgba(184,134,11,0.55);
    transform: translateY(-1px);
  }
  .su-submit:active:not(:disabled) { transform: translateY(0); }
  .su-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Footer link */
  .su-footer {
    text-align: center;
    margin-top: 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: rgba(245,240,232,0.38);
  }
  .su-footer button {
    background: none; border: none;
    color: var(--gold);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border-bottom: 1px solid rgba(184,134,11,0.35);
    padding: 0;
    transition: color 0.15s, border-color 0.15s;
  }
  .su-footer button:hover { color: var(--gold-bright); border-color: var(--gold-bright); }

  /* Success screen */
  .su-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 12px 0 4px;
    animation: cardIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .su-success-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(95,173,110,0.15), rgba(95,173,110,0.08));
    border: 1.5px solid rgba(95,173,110,0.35);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 0 40px rgba(95,173,110,0.2);
  }
  .su-success-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700;
    color: var(--parchment);
    margin-bottom: 10px;
  }
  .su-success-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    color: rgba(245,240,232,0.45);
    line-height: 1.6;
    max-width: 320px;
  }

  .su-divider-row {
    display: flex; align-items: center; gap: 10px; margin: 2px 0;
  }
  .su-divider-line {
    flex: 1; height: 1px;
    background: rgba(184,134,11,0.12);
  }
  .su-divider-txt {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    color: rgba(245,240,232,0.22);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`;

// ── Validators ──────────────────────────────────────────────────────────────

const validators = {
  firstName: (v) => {
    if (!v.trim()) return "First name is required";
    if (/[^a-zA-Z\s'-]/.test(v)) return "No special characters or numbers allowed";
    if (v.trim().length < 2) return "Must be at least 2 characters";
    return "";
  },
  lastName: (v) => {
    if (!v.trim()) return "Last name is required";
    if (/[^a-zA-Z\s'-]/.test(v)) return "No special characters or numbers allowed";
    if (v.trim().length < 2) return "Must be at least 2 characters";
    return "";
  },
  email: (v) => {
    if (!v.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address";
    return "";
  },
  phone: (v) => {
    if (!v.trim()) return "Phone number is required";
    const digits = v.replace(/\D/g, "");
    if (digits.length < 10) return "Must be at least 10 digits";
    if (digits.length > 15) return "Phone number too long";
    if (!/^[\d\s\-\+\(\)]{7,20}$/.test(v)) return "Invalid phone format";
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
  confirmPassword: (v, pwd) => {
    if (!v) return "Please confirm your password";
    if (v !== pwd) return "Passwords do not match";
    return "";
  },
};

function getPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
  return score;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#e05540", "#d4861a", "#d4a017", "#5fad6e"];

// ── Icons ───────────────────────────────────────────────────────────────────

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FieldIcon = ({ state }) => {
  if (state === "valid")
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5fad6e" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  if (state === "error")
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e05540" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  return null;
};

// ── Field Component ──────────────────────────────────────────────────────────

function Field({ label, name, type = "text", placeholder, value, onChange, onBlur, error, touched, showPwToggle, showPw, onTogglePw, children }) {
  const state = touched ? (error ? "error" : "valid") : "";
  return (
    <div className="su-field">
      <label className="su-label">{label}</label>
      <div className="su-input-wrap">
       <input
  className={`su-input ${state}`}
  type={showPwToggle ? (showPw ? "text" : "password") : type}
  placeholder={placeholder}
  name={name}               // ✅ ADD THIS
  value={value}
  onChange={onChange}
  onBlur={onBlur}
  autoComplete={name}
/>
        {showPwToggle ? (
          <button className="su-pw-toggle" type="button" onClick={onTogglePw} tabIndex={-1}>
            <EyeIcon open={showPw} />
          </button>
        ) : (
          state && (
            <span className="su-input-icon">
              <FieldIcon state={state} />
            </span>
          )
        )}
      </div>
      {touched && error && <div className="su-error-msg">⚠ {error}</div>}
      {children}
    </div>
  );
}


function UserSignup({ onClose, onLogin }) {
  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "Member"   // ✅ ADD THIS
});
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (name, value) => {
    if (name === "confirmPassword") return validators.confirmPassword(value, form.password);
    return validators[name] ? validators[name](value) : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors((er) => ({ ...er, [name]: validate(name, value) }));
    }
    // re-validate confirmPassword live if password changes
    if (name === "password" && touched.confirmPassword) {
      setErrors((er) => ({ ...er, confirmPassword: validators.confirmPassword(form.confirmPassword, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  const allValid =
    Object.keys(validators).every((k) => !validate(k, k === "confirmPassword" ? form.confirmPassword : form[k])) &&
    agreed;

const handleSubmit = async () => {
  // ✅ Mark all fields as touched for validation
  const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
  
  // ✅ Validate all fields
  const allErrors = Object.fromEntries(
    Object.keys(validators).map((k) => [
      k,
      validate(k, k === "confirmPassword" ? form.confirmPassword : form[k]),
    ])
  );

  // ✅ Update state
  setTouched(allTouched);
  setErrors(allErrors);

  // ✅ Check if all valid and terms agreed
  const hasErrors = Object.values(allErrors).some((e) => e);
  if (hasErrors || !agreed) {
    // Show first error if any
    const firstError = Object.values(allErrors).find((e) => e);
    if (firstError) alert(firstError);
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ✅ Send complete form data
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: "Member"
      }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("✅ Signup Success:", data);
      setSubmitted(true);
    } else {
      console.error("❌ Signup Failed:", data);
      alert(data.message || "Signup failed");
    }
  } catch (err) {
    console.error("❌ Network Error:", err);
    alert("Server error. Please try again.");
  }
};

  const strength = getPasswordStrength(form.password);

  return (
    <>
      <style>{STYLE}</style>
      <div className="su-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
        <div className="su-card" role="dialog" aria-modal="true" aria-label="Sign Up">
          <button className="su-close" onClick={onClose} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {submitted ? (
            <div className="su-success">
              <div className="su-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5fad6e" strokeWidth="2.2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="su-success-title">Welcome to Bibliotheca!</div>
              <div className="su-success-sub">
                Your account has been created successfully. You can now log in and start exploring the catalog.
              </div>
            </div>
          ) : (
            <>
              <div className="su-header">
                <div className="su-logo-row">
                  <div className="su-logo-mark">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1510" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <span className="su-logo-name">Bibliotheca</span>
                </div>
                <div className="su-title">Create your account</div>
                <div className="su-subtitle">Join our library and start your reading journey.</div>
              </div>

              <div className="su-form">
                {/* Name row */}
                <div className="su-row">
                  <Field
                    label="First Name" name="firstName" placeholder="Jane"
                    value={form.firstName} onChange={handleChange} onBlur={handleBlur}
                    error={errors.firstName} touched={touched.firstName}
                  />
                  <Field
                    label="Last Name" name="lastName" placeholder="Doe"
                    value={form.lastName} onChange={handleChange} onBlur={handleBlur}
                    error={errors.lastName} touched={touched.lastName}
                  />
                </div>

                {/* Email */}
                <Field
                  label="Email Address" name="email" type="email" placeholder="jane@example.com"
                  value={form.email} onChange={handleChange} onBlur={handleBlur}
                  error={errors.email} touched={touched.email}
                />

                {/* Phone */}
                <Field
                  label="Phone Number" name="phone" type="tel" placeholder="+1 (555) 000-0000"
                  value={form.phone} onChange={handleChange} onBlur={handleBlur}
                  error={errors.phone} touched={touched.phone}
                />

                {/* Password */}
                <Field
                  label="Password" name="password" placeholder="Min 8 chars, upper, number, symbol"
                  value={form.password} onChange={handleChange} onBlur={handleBlur}
                  error={errors.password} touched={touched.password}
                  showPwToggle showPw={showPw} onTogglePw={() => setShowPw((v) => !v)}
                >
                  {form.password && (
                    <>
                      <div className="su-strength-row">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`su-strength-bar ${strength >= n ? `filled-${strength}` : ""}`}
                          />
                        ))}
                      </div>
                      <div className="su-strength-label" style={{ color: strengthColors[strength] }}>
                        {strengthLabels[strength]}
                      </div>
                    </>
                  )}
                </Field>

                {/* Confirm Password */}
                <Field
                  label="Confirm Password" name="confirmPassword" placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                  error={errors.confirmPassword} touched={touched.confirmPassword}
                  showPwToggle showPw={showConfirm} onTogglePw={() => setShowConfirm((v) => !v)}
                />

                {/* Terms */}
                <div
                  className="su-terms"
                  onClick={() => setAgreed((v) => !v)}
                  role="checkbox"
                  aria-checked={agreed}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && setAgreed((v) => !v)}
                >
                  <div className={`su-checkbox ${agreed ? "checked" : ""}`}>
                    {agreed && <CheckIcon />}
                  </div>
                  <span className="su-terms-text">
                    I agree to the <a href="#" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and{" "}
                    <a href="#" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
                  </span>
                </div>

                {/* Submit */}
                <button
                  className="su-submit"
                  onClick={handleSubmit}
                  disabled={false}
                  type="button"
                >
                  Create Account
                </button>

                <div className="su-divider-row">
                  <div className="su-divider-line" />
                  <span className="su-divider-txt">or</span>
                  <div className="su-divider-line" />
                </div>

                <div className="su-footer">
                  Already a member?{" "}
                  <button onClick={onLogin}>Log in</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default UserSignup;

