// components/BookUpload.jsx
import { useState, useRef } from "react";

const STYLE = `
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
    --bg-dark: #1c1510;
    --card-bg: #2a2218;
    --card-border: rgba(184,134,11,0.2);
    --text-primary: rgba(245,240,232,0.95);
    --text-secondary: rgba(245,240,232,0.6);
    --error: #dc503c;
    --error-light: #ff8a75;
    --success: #3aaa8a;
    --radius: 12px;
    --shadow: 0 4px 24px rgba(0,0,0,0.3);
  }
  .bu-page {
    min-height: calc(100vh - 68px);
    background: linear-gradient(180deg, var(--bg-dark) 0%, #15100a 100%);
    padding: 24px 28px;
    font-family: 'DM Sans', sans-serif;
    color: var(--text-primary);
  }
  .bu-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
  }
  .bu-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px; font-weight: 700; color: var(--parchment);
    display: flex; align-items: center; gap: 10px; margin: 0;
  }
  .bu-back-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; background: transparent;
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--text-secondary); font-size: 13px; cursor: pointer;
    transition: all 0.2s;
  }
  .bu-back-btn:hover {
    background: rgba(184,134,11,0.1); color: var(--gold-bright);
    border-color: rgba(184,134,11,0.4);
  }
  .bu-card {
    background: var(--card-bg); border: 1px solid var(--card-border);
    border-radius: var(--radius); padding: 24px;
    box-shadow: var(--shadow); max-width: 800px; margin: 0 auto;
  }
  .bu-form { display: flex; flex-direction: column; gap: 20px; }
  .bu-section {
    padding-bottom: 20px; border-bottom: 1px solid var(--card-border);
  }
  .bu-section:last-child { border-bottom: none; padding-bottom: 0; }
  .bu-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 600; color: var(--parchment);
    margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;
  }
  .bu-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .bu-field { display: flex; flex-direction: column; gap: 6px; }
  .bu-label {
    font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; color: rgba(184,134,11,0.8);
  }
    /* Add this inside your STYLE template literal, after .bu-input styles */

.bu-select {
  width: 100%; padding: 12px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--card-border); border-radius: 8px;
  color: black; font-family: 'DM Sans', sans-serif;
  font-size: 14px; outline: none; transition: border-color 0.2s;
  appearance: none; /* Remove default arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(245,240,232,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
}

.bu-select:focus {
  border-color: rgba(184,134,11,0.5);
  background-color: rgba(255,255,255,0.08);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
}

.bu-select.error {
  border-color: rgba(220,60,40,0.6);
  box-shadow: 0 0 0 3px rgba(220,60,40,0.1);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ff8a75' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
}

.bu-select option {
  background: var(--card-bg);
  color: var(--parchment);
  padding: 8px;
}

.bu-select:disabled {
  opacity: 0.6; cursor: not-allowed;
}

/* Fix for date input styling */
.bu-input[type="date"] {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(245,240,232,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 36px;
}

.bu-input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
  .bu-input, .bu-select, .bu-textarea {
    width: 100%; padding: 12px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--card-border); border-radius: 8px;
    color: var(--parchment); font-family: 'DM Sans', sans-serif;
    font-size: 14px; outline: none; transition: border-color 0.2s;
  }
  .bu-input:focus, .bu-select:focus, .bu-textarea:focus {
    border-color: rgba(184,134,11,0.5);
    background: rgba(255,255,255,0.08);
  }
  .bu-input.error, .bu-select.error, .bu-textarea.error {
    border-color: rgba(220,60,40,0.6);
    box-shadow: 0 0 0 3px rgba(220,60,40,0.1);
  }
  .bu-textarea { min-height: 100px; resize: vertical; }
  .bu-error {
    font-size: 11px; color: var(--error-light); min-height: 16px;
  }
  .bu-hint {
    font-size: 11px; color: var(--text-secondary); margin-top: 4px;
  }
  
  /* Cover Upload */
  .bu-cover-wrap { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
  .bu-cover-preview {
    width: 120px; height: 180px; border-radius: 8px;
    background: rgba(255,255,255,0.05); border: 2px dashed var(--card-border);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0; position: relative;
    transition: border-color 0.2s;
  }
  .bu-cover-preview.has-image {
    border-style: solid; border-color: rgba(184,134,11,0.4);
  }
  .bu-cover-preview img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .bu-cover-placeholder {
    color: var(--text-secondary); font-size: 11px; text-align: center; padding: 8px;
  }
  .bu-cover-remove {
    position: absolute; top: 6px; right: 6px;
    width: 24px; height: 24px; border-radius: 50%;
    background: rgba(220,60,40,0.9); border: none;
    color: white; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 14px; transition: background 0.2s;
  }
  .bu-cover-remove:hover { background: var(--error); }
  .bu-upload-area {
    flex: 1; min-width: 200px;
    border: 2px dashed var(--card-border); border-radius: 8px;
    padding: 20px; text-align: center;
    background: rgba(255,255,255,0.03);
    transition: border-color 0.2s, background 0.2s;
    cursor: pointer;
  }
  .bu-upload-area:hover, .bu-upload-area.dragover {
    border-color: rgba(184,134,11,0.5);
    background: rgba(184,134,11,0.08);
  }
  .bu-upload-icon {
    font-size: 32px; margin-bottom: 8px; color: var(--gold-bright);
  }
  .bu-upload-text {
    font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;
  }
  .bu-upload-subtext {
    font-size: 11px; color: var(--text-secondary); opacity: 0.7;
  }
  .bu-file-input { display: none; }
  
  /* Submit */
  .bu-actions {
    display: flex; gap: 12px; justify-content: flex-end;
    padding-top: 20px; border-top: 1px solid var(--card-border);
    margin-top: 8px;
  }
  .bu-btn {
    padding: 12px 24px; border-radius: 8px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: flex;
    align-items: center; gap: 8px;
  }
  .bu-btn-secondary {
    background: transparent; border: 1px solid var(--card-border);
    color: var(--text-secondary);
  }
  .bu-btn-secondary:hover {
    background: rgba(184,134,11,0.1); color: var(--gold-bright);
    border-color: rgba(184,134,11,0.4);
  }
  .bu-btn-primary {
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: #1c1510; box-shadow: 0 4px 18px rgba(184,134,11,0.4);
  }
  .bu-btn-primary:hover:not(:disabled) {
    filter: brightness(1.08);
    box-shadow: 0 6px 24px rgba(184,134,11,0.55);
    transform: translateY(-1px);
  }
  .bu-btn:disabled {
    opacity: 0.5; cursor: not-allowed; transform: none !important;
  }
  
  /* Success State */
  .bu-success {
    text-align: center; padding: 40px 24px;
  }
  .bu-success-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(58,170,138,0.15), rgba(58,170,138,0.08));
    border: 2px solid rgba(58,170,138,0.4);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; font-size: 32px; color: var(--success);
  }
  .bu-success-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; color: var(--parchment);
    margin-bottom: 12px;
  }
  .bu-success-sub {
    color: var(--text-secondary); margin-bottom: 24px;
  }
  .bu-success-actions {
    display: flex; gap: 12px; justify-content: center;
  }
  
  /* Loading */
  .bu-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 24px; color: var(--text-secondary);
  }
  .bu-spinner {
    width: 32px; height: 32px; border: 3px solid rgba(184,134,11,0.2);
    border-top-color: var(--gold-bright); border-radius: 50%;
    animation: spin 1s linear infinite; margin-bottom: 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* Access Denied */
  .bu-access-denied {
    text-align: center; padding: 60px 24px; color: var(--text-secondary);
  }
  .bu-access-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.6; }

  /* API Error Box */
  .bu-api-error {
    background: rgba(220,60,40,0.12);
    border: 1px solid rgba(220,60,40,0.3);
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    font-size: 13px;
    color: var(--error-light);
    white-space: pre-wrap;
    font-family: 'DM Sans', sans-serif;
  }
  .bu-api-error-title {
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  @media (max-width: 768px) {
    .bu-page { padding: 16px; }
    .bu-cover-wrap { flex-direction: column; align-items: center; }
    .bu-upload-area { width: 100%; }
    .bu-actions { flex-direction: column-reverse; }
    .bu-btn { width: 100%; justify-content: center; }
  }
`;

// ── 🔒 GLOBAL REGEX PATTERNS (Strict - matches backend) ───────────────────
const REGEX = {
  title: /^[a-zA-Z0-9\s.'-]+$/,
  author: /^[a-zA-Z\s.'-]+$/,
  publisher: /^[a-zA-Z0-9\s.'-,]+$/,
  isbn: /^[0-9-]+$/,
};

// ── Validators ──────────────────────────────────────────────────────────────
const validators = {
  title: (v) => {
    if (!v?.trim()) return "Title is required";
    if (v.trim().length < 2) return "Must be at least 2 characters";
    if (!REGEX.title.test(v.trim())) return "No special characters allowed";
    return "";
  },
  author: (v) => {
    if (!v?.trim()) return "Author is required";
    if (v.trim().length < 2) return "Must be at least 2 characters";
    if (!REGEX.author.test(v.trim())) return "No special characters allowed";
    return "";
  },
  isbn: (v) => {
    if (!v?.trim()) return "ISBN is required";
    const clean = v.replace(/\s/g, "");
    if (!REGEX.isbn.test(clean)) return "Only numbers and hyphens allowed";
    const digits = clean.replace(/-/g, "");
    if (![10, 13].includes(digits.length)) return "ISBN must be 10 or 13 digits";
    return "";
  },
  genre: (v) => {
    if (!v?.trim()) return "Please select a genre";
    return "";
  },
 // Replace the existing publicationYear validator
publicationYear: (v) => {
  if (!v?.trim()) return "Publication date is required";
  
  // Check if it's a valid date string (YYYY-MM-DD)
  const date = new Date(v);
  if (isNaN(date.getTime())) return "Invalid date format";
  
  // Optional: Prevent future dates
  if (date > new Date()) return "Publication date cannot be in the future";
  
  // Optional: Prevent very old dates (e.g., before 1000 AD)
  if (date.getFullYear() < 1000) return "Please enter a valid publication year";
  
  return "";
},
  copies: (v) => {
    if (!v) return "Required";
    const num = parseInt(v);
    if (isNaN(num)) return "Numbers only";
    return "";
  },
  publisher: (v) => {
    if (!v?.trim()) return "";
    if (!REGEX.publisher.test(v.trim())) return "No special characters allowed";
    return "";
  },
};

const GENRES = [
  "Fiction", "Non-Fiction", "Mystery", "Sci-Fi", "Fantasy", "Romance",
  "Thriller", "Biography", "History", "Science", "Self-Help", "Poetry",
  "Young Adult", "Children", "Other"
];

// ── Icons ───────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Field Component ──────────────────────────────────────────────────────────
function Field({ label, name, type = "text", placeholder, value, onChange, error, hint, required, children }) {
  const hasError = !!error;
  return (
    <div className="bu-field">
      <label className="bu-label">
        {label} {required && <span style={{ color: "var(--error-light)" }}>*</span>}
      </label>
      {children || (
        <input
          className={`bu-input ${hasError ? "error" : ""}`}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
        />
      )}
      {hasError && <div className="bu-error">⚠ {error}</div>}
      {hint && !hasError && <div className="bu-hint">{hint}</div>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function BookUpload({ onBack, currentUser }) {
  const [form, setForm] = useState({
    title: "", author: "", isbn: "", genre: "",
    publicationYear: "", publisher: "", description: "", copies: "1"
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [apiError, setApiError] = useState(null); // ✅ NEW: Track API errors separately
  const fileInputRef = useRef(null);

  // 🔐 Librarian access check (optional - remove if you disabled auth)
  // if (!currentUser || currentUser.role !== "Librarian") { ... }

  const validate = (name, value) => validators[name]?.(value) || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setApiError(null); // Clear API error on any change
    if (errors[name]) {
      setErrors(er => ({ ...er, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors(er => ({ ...er, [name]: validate(name, value) }));
  };

  // ── Cover Image Handling ─────────────────────────────────────────────────
  const handleCoverSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors(er => ({ ...er, cover: "Please select an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(er => ({ ...er, cover: "Image must be under 5MB" }));
      return;
    }
    setCoverFile(file);
    setErrors(er => ({ ...er, cover: "" }));
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleCoverSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

 // BookUpload.jsx - fetchJSON helper
const fetchJSON = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  
  console.log("📡 API Request:", {
    url,
    method: options.method || "GET",
    isFormData,
    headers: options.headers,
  });

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      // ✅ ONLY set Content-Type for JSON, NOT for FormData
      ...(isFormData 
        ? {} // Let browser set multipart/form-data with boundary
        : { "Content-Type": "application/json" }
      ),
      ...options.headers,
    },
    ...options,
  });

  console.log("📡 API Response:", {
    status: res.status,
    statusText: res.statusText,
    contentType: res.headers.get("content-type"),
  });

  // Handle HTML error pages
  const contentType = res.headers.get("content-type");
  if (contentType && !contentType.includes("application/json") && !isFormData) {
    const text = await res.text();
    if (text.toLowerCase().includes("<!doctype")) {
      throw new Error(`Server returned HTML. Status: ${res.status}. Check backend.`);
    }
  }

  const data = await res.json().catch(e => {
    console.error("❌ JSON parse failed:", e);
    throw new Error("Invalid JSON response from server");
  });

  if (!res.ok || (data && data.success === false)) {
    throw new Error(data?.message || JSON.stringify(data.errors) || `Request failed: ${res.status}`);
  }
  
  return { success: true, data, status: res.status };
};

  // BookUpload.jsx - handleSubmit
const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  
  console.log("🚀 Submitting form");
  
  // ... validation code ...

  setSubmitting(true);
  
  try {
    const formData = new FormData();
    
    // ✅ Append ALL text fields
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
        console.log(`📦 Field: ${key} =`, value);
      }
    });
    
    // ✅ Append file if exists
    if (coverFile) {
      formData.append("coverImage", coverFile);
      console.log("📦 File:", coverFile.name, coverFile.size);
    }
    
    // ✅ Add metadata

    // 📡 Send request
    const result = await fetchJSON("/api/books/upload", {
      method: "POST",
      body: formData, // ✅ FormData, NOT JSON.stringify
    });

    console.log("✅ Success:", result.data);
    setSubmitted(true);
    
  } catch (err) {
    console.error("❌ Upload failed:", err);
    setApiError(err.message);
  } finally {
    setSubmitting(false);
  }
};

  const handleAddAnother = () => {
    setForm({
      title: "", author: "", isbn: "", genre: "",
      publicationYear: "", publisher: "", description: "", copies: "1"
    });
    setCoverFile(null);
    setCoverPreview(null);
    setErrors({});
    setApiError(null);
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Render Form ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <style>{STYLE}</style>
        <div className="bu-page">
          <div className="bu-card">
            <div className="bu-success">
              <div className="bu-success-icon"><CheckIcon /></div>
              <h2 className="bu-success-title">Book Added Successfully!</h2>
              <p className="bu-success-sub">
                "{form.title}" by {form.author} is now available in the catalog.
              </p>
              <div className="bu-success-actions">
                <button className="bu-btn bu-btn-secondary" onClick={onBack}>
                  ← View Catalog
                </button>
                <button className="bu-btn bu-btn-primary" onClick={handleAddAnother}>
                  + Add Another Book
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="bu-page">
        <div className="bu-header">
          <h1 className="bu-title">
            {onBack && (
              <button className="bu-back-btn" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
            )}
            📚 Add New Book
          </h1>
        </div>

        <div className="bu-card">
          {submitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ 
              position: "fixed", top: 68, left: 0, right: 0, 
              height: "3px", background: "rgba(184,134,11,0.2)", zIndex: 100 
            }}>
              <div style={{ 
                width: `${uploadProgress}%`, height: "100%",
                background: "linear-gradient(90deg, var(--gold), var(--gold-light))",
                transition: "width 0.2s"
              }} />
            </div>
          )}

          {/* ✅ NEW: Display API errors prominently */}
          {apiError && (
            <div className="bu-api-error">
              <div className="bu-api-error-title">⚠️ Upload Failed</div>
              {apiError}
              <div style={{ marginTop: 8, fontSize: 11, opacity: 0.8 }}>
                💡 Tip: Check browser console (F12) for detailed request/response logs
              </div>
            </div>
          )}

          <form className="bu-form" onSubmit={handleSubmit}>
            
            {/* Book Details Section */}
            <div className="bu-section">
              <h3 className="bu-section-title">📖 Book Details</h3>
              <div className="bu-grid">
                <Field
                  label="Title" name="title" placeholder="The Great Gatsby"
                  value={form.title} onChange={handleChange} onBlur={handleBlur}
                  error={errors.title} required
                />
                <Field
                  label="Author" name="author" placeholder="F. Scott Fitzgerald"
                  value={form.author} onChange={handleChange} onBlur={handleBlur}
                  error={errors.author} required
                />
              </div>
              <div className="bu-grid" style={{ marginTop: 16 }}>
                <Field
                  label="ISBN" name="isbn" placeholder="978-0-7432-7356-5"
                  value={form.isbn} onChange={handleChange} onBlur={handleBlur}
                  error={errors.isbn} required
                  hint="ISBN-10 or ISBN-13"
                />
                <Field
                  label="Genre" name="genre" 
                  error={errors.genre} required
                >
                  <select
                    className={`bu-select ${errors.genre ? "error" : ""}`}
                    name="genre"
                    value={form.genre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select genre...</option>
                    {GENRES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="bu-grid" style={{ marginTop: 16 }}>
              {/* OLD: Number input for year */}
<Field
  label="Publication Year" name="publicationYear" type="number"
  placeholder={new Date().getFullYear()}
  value={form.publicationYear} onChange={handleChange} onBlur={handleBlur}
  error={errors.publicationYear} required
/>


                <Field
                  label="Copies Available" name="copies" type="number"
                  placeholder="1" min="1" max="1000"
                  value={form.copies} onChange={handleChange} onBlur={handleBlur}
                  error={errors.copies} required
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <Field
                  label="Publisher" name="publisher" placeholder="Scribner"
                  value={form.publisher} onChange={handleChange} onBlur={handleBlur}
                  error={errors.publisher}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="bu-field">
                  <label className="bu-label">Description</label>
                  <textarea
                    className={`bu-textarea ${errors.description ? "error" : ""}`}
                    name="description"
                    placeholder="Brief description of the book..."
                    value={form.description}
                    onChange={handleChange}
                    rows="4"
                  />
                  {errors.description && <div className="bu-error">⚠ {errors.description}</div>}
                </div>
              </div>
            </div>

            {/* Cover Image Section */}
            <div className="bu-section">
              <h3 className="bu-section-title">🖼️ Cover Image</h3>
              <div className="bu-cover-wrap">
                <div className={`bu-cover-preview ${coverPreview ? "has-image" : ""}`}>
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover preview" />
                      <button type="button" className="bu-cover-remove" onClick={removeCover} title="Remove">
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="bu-cover-placeholder">No image</div>
                  )}
                </div>
                
                <div
                  className="bu-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="bu-upload-icon"><UploadIcon /></div>
                  <div className="bu-upload-text">
                    {coverFile ? coverFile.name : "Click or drag image here"}
                  </div>
                  <div className="bu-upload-subtext">PNG, JPG up to 5MB</div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="bu-file-input"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleCoverSelect(e.target.files[0])}
                  />
                </div>
              </div>
              {errors.cover && <div className="bu-error" style={{ marginTop: 8 }}>⚠ {errors.cover}</div>}
            </div>

            {/* Actions */}
            <div className="bu-actions">
              <button
                type="button"
                className="bu-btn bu-btn-secondary"
                onClick={onBack}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bu-btn bu-btn-primary"
                disabled={submitting || Object.keys(errors).some(k => errors[k])}
              >
                {submitting ? (
                  <>
                    <div className="bu-spinner" />
                    Uploading...
                  </>
                ) : (
                  "➕ Add to Catalog"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default BookUpload;