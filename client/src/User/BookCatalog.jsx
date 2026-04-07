// components/BookCatalog.jsx
import { useState, useEffect, useRef } from "react";

const GENRES = ["All","Fiction","Non-Fiction","Mystery","Sci-Fi","Fantasy","Romance","Thriller","Biography","History","Science","Self-Help","Poetry","Young Adult","Children","Other"];
const API_BASE = "http://localhost:5000";

/* ─────────────────────────────────────────────
   SHARED STYLES
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
    --warn: #d4861a;
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
    border-radius: 10px; overflow: hidden;
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
  .bm-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--parchment); line-height: 1.2; }
  .bm-author { font-family: 'DM Sans', sans-serif; font-size: 14px; color: rgba(245,240,232,0.55); }
  .bm-author span { color: var(--gold-light); font-weight: 500; }
  .bm-status-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .bm-status-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
  }
  .bm-status-pill.available { background: rgba(58,170,138,0.12); border: 1px solid rgba(58,170,138,0.3); color: #5fdbb0; }
  .bm-status-pill.unavailable { background: rgba(220,85,64,0.12); border: 1px solid rgba(220,85,64,0.3); color: #ff8a75; }
  .bm-status-pill.pending { background: rgba(212,134,26,0.12); border: 1px solid rgba(212,134,26,0.3); color: #f0a840; }
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

  /* Info banner */
  .bm-info-banner {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; line-height: 1.5;
    animation: bmStepIn 0.2s ease;
  }
  .bm-info-banner.warn { background: rgba(212,134,26,0.08); border-color: rgba(212,134,26,0.3); color: #f0a840; }
  .bm-info-banner.info { background: rgba(58,170,138,0.08); border-color: rgba(58,170,138,0.3); color: #5fdbb0; }

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
    border: 1px solid var(--border); border-radius: 10px;
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
    border: 1px solid var(--border); border-radius: 10px;
    color: var(--parchment);
    font-family: 'DM Sans', sans-serif; font-size: 15px; outline: none;
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

  /* Success / Pending step */
  .bm-success-step { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 8px 0 12px; gap: 16px; animation: bmCardIn 0.3s cubic-bezier(0.34,1.4,0.64,1); }
  .bm-success-ring { width: 76px; height: 76px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .bm-success-ring.green { background: linear-gradient(135deg, rgba(58,170,138,0.15), rgba(58,170,138,0.06)); border: 1.5px solid rgba(58,170,138,0.35); box-shadow: 0 0 40px rgba(58,170,138,0.18); }
  .bm-success-ring.gold { background: linear-gradient(135deg, rgba(184,134,11,0.2), rgba(212,134,26,0.1)); border: 1.5px solid rgba(184,134,11,0.4); box-shadow: 0 0 40px rgba(184,134,11,0.2); }
  .bm-success-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--parchment); }
  .bm-success-sub { font-family: 'DM Sans', sans-serif; font-size: 13.5px; line-height: 1.65; color: rgba(245,240,232,0.45); max-width: 320px; }
  .bm-success-receipt { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .bm-receipt-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; border-bottom: 1px solid rgba(184,134,11,0.08); }
  .bm-receipt-row:last-child { border-bottom: none; }
  .bm-receipt-key { color: rgba(245,240,232,0.38); }
  .bm-receipt-val { color: var(--parchment); font-weight: 500; }
  .bm-receipt-val.gold { color: var(--gold-bright); }
  .bm-receipt-val.warn { color: #f0a840; }
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
   LIBRARIAN APPROVAL PANEL STYLES
───────────────────────────────────────────── */
const APPROVAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .la-wrap {
    padding: 28px 28px;
    min-height: calc(100vh - 68px);
    background: linear-gradient(180deg, #1c1510 0%, #15100a 100%);
    font-family: 'DM Sans', sans-serif;
    color: #f5f0e8;
  }

  .la-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
  }
  .la-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700; color: #f5f0e8;
    display: flex; align-items: center; gap: 12px;
  }
  .la-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 24px; height: 24px; padding: 0 8px;
    border-radius: 12px;
    background: linear-gradient(135deg, #b8860b, #d4a017);
    color: #1c1510; font-size: 12px; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
  }

  .la-tabs {
    display: flex; gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(184,134,11,0.18);
    border-radius: 10px; padding: 4px;
    margin-bottom: 24px; width: fit-content;
  }
  .la-tab {
    padding: 7px 18px; border-radius: 7px; border: none;
    background: transparent; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    color: rgba(245,240,232,0.45); display: flex; align-items: center; gap: 7px;
    transition: background 0.18s, color 0.18s;
  }
  .la-tab.active {
    background: rgba(184,134,11,0.18); color: #f0c040;
  }
  .la-tab:not(.active):hover { color: rgba(245,240,232,0.75); background: rgba(184,134,11,0.07); }
  .la-tab-count {
    min-width: 18px; height: 18px; border-radius: 9px; padding: 0 5px;
    background: rgba(184,134,11,0.3); color: #f0c040;
    font-size: 11px; display: flex; align-items: center; justify-content: center;
  }
  .la-tab.active .la-tab-count { background: rgba(184,134,11,0.5); }

  .la-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px;
    border: 1px solid rgba(184,134,11,0.25);
    background: transparent; color: rgba(245,240,232,0.6);
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    cursor: pointer; transition: all 0.18s;
  }
  .la-refresh-btn:hover { background: rgba(184,134,11,0.1); color: #f0c040; border-color: rgba(184,134,11,0.4); }
  .la-refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }

  /* Request cards */
  .la-list { display: flex; flex-direction: column; gap: 14px; }

  .la-card {
    background: #2a2016;
    border: 1px solid rgba(184,134,11,0.2);
    border-radius: 14px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .la-card:hover { border-color: rgba(184,134,11,0.38); box-shadow: 0 6px 28px rgba(0,0,0,0.35); }

  .la-card-main {
    display: flex; gap: 16px; padding: 18px 20px; align-items: flex-start;
  }

  .la-cover {
    width: 52px; height: 74px; border-radius: 7px;
    overflow: hidden; flex-shrink: 0;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(184,134,11,0.2);
    display: flex; align-items: center; justify-content: center;
  }
  .la-cover img { width:100%; height:100%; object-fit:cover; }

  .la-card-body { flex: 1; min-width: 0; }
  .la-book-title { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: #f5f0e8; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .la-book-author { font-size: 12.5px; color: rgba(245,240,232,0.45); margin-bottom: 10px; }

  .la-meta-row { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-bottom: 10px; }
  .la-meta-chip {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: rgba(245,240,232,0.5);
  }
  .la-meta-chip svg { color: rgba(184,134,11,0.55); flex-shrink: 0; }
  .la-meta-chip strong { color: rgba(245,240,232,0.8); font-weight: 500; }

  /* Status pill */
  .la-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11.5px; font-weight: 600; letter-spacing: 0.03em;
  }
  .la-status.pending  { background: rgba(212,134,26,0.12); border: 1px solid rgba(212,134,26,0.3); color: #f0a840; }
  .la-status.approved { background: rgba(58,170,138,0.12); border: 1px solid rgba(58,170,138,0.3); color: #5fdbb0; }
  .la-status.rejected { background: rgba(224,85,64,0.12);  border: 1px solid rgba(224,85,64,0.3);  color: #ff8a75; }
  .la-status.returned { background: rgba(120,120,180,0.12);border: 1px solid rgba(120,120,180,0.3);color: #a0a0f0; }

  /* Action buttons */
  .la-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
  .la-btn-approve {
    height: 38px; padding: 0 18px;
    background: linear-gradient(135deg, #3aaa8a, #2d9070);
    border: none; border-radius: 8px;
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 2px 10px rgba(58,170,138,0.3);
    transition: filter 0.18s, transform 0.12s;
  }
  .la-btn-approve:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
  .la-btn-approve:disabled { opacity: 0.45; cursor: not-allowed; }

  .la-btn-reject {
    height: 38px; padding: 0 18px;
    background: rgba(224,85,64,0.12);
    border: 1px solid rgba(224,85,64,0.35);
    border-radius: 8px;
    color: #ff8a75; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: background 0.18s, transform 0.12s;
  }
  .la-btn-reject:hover:not(:disabled) { background: rgba(224,85,64,0.22); transform: translateY(-1px); }
  .la-btn-reject:disabled { opacity: 0.45; cursor: not-allowed; }

  .la-btn-return {
    height: 38px; padding: 0 18px;
    background: rgba(120,120,180,0.12);
    border: 1px solid rgba(120,120,180,0.3);
    border-radius: 8px;
    color: #a0a0f0; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: background 0.18s;
  }
  .la-btn-return:hover:not(:disabled) { background: rgba(120,120,180,0.22); }
  .la-btn-return:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Action note section */
  .la-note-row {
    padding: 12px 20px 16px;
    border-top: 1px solid rgba(184,134,11,0.12);
    background: rgba(0,0,0,0.15);
    display: flex; flex-direction: column; gap: 6px;
  }
  .la-note-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(184,134,11,0.55); }
  .la-note-value { font-size: 12.5px; color: rgba(245,240,232,0.5); font-style: italic; }
  .la-note-by { font-size: 11px; color: rgba(245,240,232,0.3); }

  /* Empty state */
  .la-empty {
    text-align: center; padding: 60px 20px;
    color: rgba(245,240,232,0.3);
    font-size: 14px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .la-empty-icon { font-size: 44px; opacity: 0.5; }

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
  @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .la-toast.success { background: #1e3d30; border: 1px solid rgba(58,170,138,0.4); color: #5fdbb0; }
  .la-toast.error   { background: #3d1e1a; border: 1px solid rgba(224,85,64,0.4);  color: #ff8a75; }

  @media (max-width: 640px) {
    .la-card-main { flex-direction: column; }
    .la-actions { justify-content: flex-start; flex-wrap: wrap; }
    .la-wrap { padding: 16px; }
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
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const daysBetween = (from, to) => {
  const a = new Date(from);
  const b = new Date(to);
  return Math.max(1, Math.round((b - a) / 86400000));
};

const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  // ✅ DEBUG: Log full request details
  console.log("🔐 apiFetch called:", {
    url: `${API_BASE}${url}`,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 40) + "..." : null,
    method: options.method || "GET",
    body: options.body ? JSON.parse(options.body) : undefined,
  });
  
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });
    
    // ✅ DEBUG: Log response metadata
    console.log("📡 apiFetch response:", {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      contentType: res.headers.get("content-type"),
    });
    
    // ✅ Parse response based on content type
    const contentType = res.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
      console.log("📦 apiFetch JSON data:", data);
    } else {
      const text = await res.text();
      console.log("📦 apiFetch non-JSON response:", text.substring(0, 200));
      data = { message: text };
    }
    
    // ✅ Throw error with full details
    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${res.status}`;
      console.error("❌ apiFetch error response:", {
        status: res.status,
        message: errorMsg,
        fullData: data,
        url: `${API_BASE}${url}`,
      });
      throw new Error(errorMsg);
    }
    
    return data;
  } catch (err) {
    // ✅ DEBUG: Log network/other errors
    console.error("❌ apiFetch network/error:", {
      message: err.message,
      name: err.name,
      stack: err.stack?.split("\n")[0],
      url: `${API_BASE}${url}`,
    });
    throw err;
  }
};

/* ─────────────────────────────────────────────
   BOOK DETAIL MODAL  (member-side)
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   BOOK DETAIL MODAL  (member-side) - FIXED
───────────────────────────────────────────── */
function BookModal({ book, onClose, currentUser }) {
  const [step, setStep] = useState("detail");
  const [returnDate, setReturnDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestRecord, setRequestRecord] = useState(null);
  const [apiError, setApiError] = useState("");
  const [existingRequest, setExistingRequest] = useState(null);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const dateInputRef = useRef(null);
  
  const coverUrl = getCoverUrl(book.coverImage);
  const isAvailable = book.copiesAvailable > 0;

  const minDate = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })();
  const maxDate = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split("T")[0]; })();



// BookCatalog.jsx - BookModal component

useEffect(() => {
  if (!currentUser) {
    setCheckingRequest(false);
    return;
  }
  
  const userId = currentUser.id || currentUser._id;
  if (!userId) {
    setCheckingRequest(false);
    return;
  }
  
  let cancelled = false;
  
  const checkExisting = async () => {
    try {
// ✅ CORRECT - backend gets userId from JWT token via req.user
const data = await apiFetch("/api/circulation/my-requests?status=approved");
      if (cancelled) return;
      
      const records = data.data || [];
      
      // ✅ Get target book ID as clean string
      const targetBookId = String(book.id || book._id || "").trim();
      
      console.log("🔍 Matching debug:", {
        targetBookId,
        recordsCount: records.length,
        firstRecord: records[0] ? {
          id: records[0]._id,
          status: records[0].status,
          bookType: typeof records[0].book,
          bookValue: records[0].book,
        } : null,
      });
      
    const match = records.find(r => {
  const rBookId = String(r.book?._id || r.book || "").trim();
  const targetBookId = String(book.id || book._id || "").trim();
  return rBookId === targetBookId && (r.status === "pending" || r.status === "approved");
});

      if (!cancelled) {
        console.log("🎯 Match result:", {
          found: !!match,
          status: match?.status,
          existingRequest: match ? { _id: match._id, status: match.status } : null,
        });
        setExistingRequest(match || null);
      }
    } catch (err) {
      if (!cancelled) {
        console.warn("⚠️ checkExisting error:", err.message);
        setExistingRequest(null);
      }
    } finally {
      if (!cancelled) {
        setCheckingRequest(false);
      }
    }
  };
  
  checkExisting();
  return () => { cancelled = true; };
  
}, [book.id, book._id, currentUser?.id, currentUser?._id]);
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

 const handleSubmitRequest = async () => {
  const err = validateDate(returnDate);
  if (err) { setDateError(err); return; }
  
  setSubmitting(true);
  setApiError("");
  
  try {
    const data = await apiFetch("/api/circulation/request", {
      method: "POST",
      body: JSON.stringify({
        bookId: book.id || book._id,
        requestedReturnDate: returnDate,
      }),
    });
    
    setRequestRecord(data.data);
    setExistingRequest(data.data); // Update local state
    setStep("pending");
    
  } catch (err) {
    // ✅ Handle 409 Conflict (already borrowed)
    if (err.message?.includes("already") || err.message?.includes("checked out")) {
      // ✅ Update state to disable button immediately
      setExistingRequest({ status: "approved", book: book.id || book._id });
      setApiError("This book is already in your borrowed list.");
    } else {
      setApiError(err.message);
    }
  } finally {
    setSubmitting(false);
  }
};

  // ✅ FIXED: Button state logic
  const isAlreadyBorrowed = existingRequest?.status === "approved";
  const hasPendingRequest = existingRequest?.status === "pending";
  
  const proceedDisabled =
    !isAvailable ||                    // Book out of stock
    !currentUser ||                    // Not logged in
    checkingRequest ||                 // Still checking API
    isAlreadyBorrowed ||               // ✅ Already borrowed (APPROVED)
    hasPendingRequest;                 // ✅ Already has pending request
 
  const proceedLabel = (() => {
    if (!currentUser) return "Login to Borrow";
    if (!isAvailable) return "Currently Unavailable";
    if (checkingRequest) return "Checking…";
    if (isAlreadyBorrowed) return "✓ Already Borrowed";  // ✅ Clear message
    if (hasPendingRequest) return "⏳ Request Pending";   // ✅ Clear message
    return "Proceed to Borrow";
  })();

  // Debug: Log button state on every render
console.log("🎨 Button render:", {
  isAvailable,
  currentUser: !!currentUser,
  checkingRequest,
  isAlreadyBorrowed: existingRequest?.status === "approved",
  hasPendingRequest: existingRequest?.status === "pending",
  proceedDisabled,
  proceedLabel,
});

  // ✅ Show appropriate banner when book is already borrowed
  const renderStatusBanner = () => {
    if (isAlreadyBorrowed) {
      return (
        <div className="bm-info-banner info" style={{ marginTop: -8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>
            You have this book checked out. 
            <strong style={{ color: "#5fdbb0", marginLeft: 4 }}>
              Return by {formatDate(existingRequest.requestedReturnDate)}
            </strong>
          </span>
        </div>
      );
    }
    if (hasPendingRequest) {
      return (
        <div className="bm-info-banner warn" style={{ marginTop: -8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Your borrow request is pending librarian approval.</span>
        </div>
      );
    }
    return null;
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

          {/* ── DETAIL STEP ── */}
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

                {/* Login prompt if not logged in */}
                {!currentUser && (
                  <div className="bm-info-banner warn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Please <strong>log in</strong> to borrow books from the library.
                  </div>
                )}

                {/* ✅ Status banner for borrowed/pending */}
                {renderStatusBanner()}

                <button
                  className="bm-proceed-btn"
                  onClick={() => !proceedDisabled && setStep("date")}
                  disabled={proceedDisabled}
                  title={proceedDisabled ? proceedLabel : undefined}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                  </svg>
                  {proceedLabel}
                </button>

                {!isAvailable && !existingRequest && (
                  <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(245,240,232,0.3)", fontFamily: "'DM Sans',sans-serif", marginTop: -8 }}>
                    All copies are currently checked out.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── DATE STEP ── */}
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
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.2)" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
                  </div>
                  <div>
                    <div className="bm-book-mini-title">{book.title}</div>
                    <div className="bm-book-mini-author">by {book.author}</div>
                  </div>
                </div>

                {/* Approval notice */}
                <div className="bm-info-banner warn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Your request will be <strong>sent to a librarian for approval</strong>. You'll be notified once it's approved.</span>
                </div>

                <div className="bm-date-field">
                  <label className="bm-date-label">Requested Return Date</label>
                  <div className="bm-date-input-wrap">
                    <input
                      ref={dateInputRef}
                      className={`bm-date-input ${dateError ? "error" : ""}`}
                      type="date" value={returnDate}
                      min={minDate} max={maxDate}
                      onChange={handleDateChange}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitRequest()}
                    />
                    <span className="bm-date-cal-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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
                      Select date and click Submit Request
                    </div>
                  )}
                </div>

                {returnDate && !validateDate(returnDate) && (
                  <div className="bm-date-summary">
                    <div className="bm-date-sum-item">
                      <div className="bm-date-sum-label">Requested On</div>
                      <div className="bm-date-sum-value">{formatDate(new Date().toISOString())}</div>
                    </div>
                    <div className="bm-date-sum-item">
                      <div className="bm-date-sum-label">Return By</div>
                      <div className="bm-date-sum-value gold">{formatDate(returnDate)}</div>
                    </div>
                    <div className="bm-date-sum-item">
                      <div className="bm-date-sum-label">Duration</div>
                      <div className="bm-date-sum-value">{daysBetween(new Date(), new Date(returnDate))} days</div>
                    </div>
                  </div>
                )}

                {apiError && (
                  <div className="bm-date-error" style={{ fontSize: 13, padding: "10px 14px", background: "rgba(224,85,64,0.1)", borderRadius: 8, border: "1px solid rgba(224,85,64,0.25)" }}>
                    ⚠ {apiError}
                  </div>
                )}

                <button className="bm-confirm-btn" onClick={handleSubmitRequest} disabled={submitting || !returnDate}>
                  {submitting ? (
                    <>
                      <div style={{ width: 16, height: 16, border: "2px solid rgba(28,21,16,0.3)", borderTopColor: "#1c1510", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Submit Borrow Request
                    </>
                  )}
                </button>

                <button className="bm-back-link" onClick={() => { setStep("detail"); setReturnDate(""); setDateError(""); setApiError(""); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to book details
                </button>
              </div>
            </div>
          )}

          {/* ── PENDING STEP ── */}
          {step === "pending" && (
            <div className="bm-body" style={{ paddingTop: 36 }}>
              <div className="bm-success-step">
                <div className="bm-success-ring gold">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f0c040" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="bm-success-title">Request Submitted!</div>
                <div className="bm-success-sub">
                  Your borrow request is <strong style={{ color: "#f0a840" }}>pending librarian approval</strong>. You'll be notified once it's reviewed.
                </div>
                <div className="bm-success-receipt">
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Book</span><span className="bm-receipt-val">{book.title}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Author</span><span className="bm-receipt-val">{book.author}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Requested On</span><span className="bm-receipt-val">{formatDate(new Date().toISOString())}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Return By</span><span className="bm-receipt-val gold">{formatDate(returnDate)}</span></div>
                  <div className="bm-receipt-row"><span className="bm-receipt-key">Status</span><span className="bm-receipt-val warn">⏳ Pending Approval</span></div>
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
   LIBRARIAN APPROVAL PANEL
───────────────────────────────────────────── */
export function LibrarianApprovals({ currentUser }) {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("pending"); // pending | approved | rejected | returned
  const [acting, setActing]       = useState({}); // requestId → true
  const [toast, setToast]         = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await apiFetch(`/api/circulation/all?status=${tab}`);
      setRequests(data.data || []);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [tab]);

  const handleApprove = async (requestId) => {
    setActing((a) => ({ ...a, [requestId]: true }));
    try {
      await apiFetch(`/api/circulation/${requestId}/approve`, { method: "PATCH" });
      showToast("Request approved successfully!");
      fetchRequests();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActing((a) => ({ ...a, [requestId]: false }));
    }
  };

  const handleReject = async (requestId) => {
    setActing((a) => ({ ...a, [requestId]: true }));
    try {
      await apiFetch(`/api/circulation/${requestId}/reject`, { method: "PATCH", body: JSON.stringify({ note: "Rejected by librarian" }) });
      showToast("Request rejected.");
      fetchRequests();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActing((a) => ({ ...a, [requestId]: false }));
    }
  };

  const handleMarkReturned = async (requestId) => {
    setActing((a) => ({ ...a, [requestId]: true }));
    try {
      await apiFetch(`/api/circulation/${requestId}/return`, { method: "PATCH" });
      showToast("Book marked as returned!");
      fetchRequests();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActing((a) => ({ ...a, [requestId]: false }));
    }
  };

  const TABS = [
    { key: "pending",  label: "Pending",  icon: "⏳" },
    { key: "approved", label: "Approved", icon: "✅" },
    { key: "rejected", label: "Rejected", icon: "❌" },
    { key: "returned", label: "Returned", icon: "↩️" },
  ];

  return (
    <>
      <style>{APPROVAL_STYLE}</style>

      <div className="la-wrap">
        <div className="la-header">
          <div className="la-title">
            Borrow Requests
            {tab === "pending" && requests.length > 0 && (
              <span className="la-badge">{requests.length}</span>
            )}
          </div>
          <button
            className={`la-refresh-btn ${refreshing ? "spinning" : ""}`}
            onClick={() => fetchRequests(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="la-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`la-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "rgba(245,240,232,0.4)", fontFamily: "'DM Sans',sans-serif" }}>
            Loading requests…
          </div>
        ) : requests.length === 0 ? (
          <div className="la-empty">
            <div className="la-empty-icon">📭</div>
            <div>No {tab} requests</div>
          </div>
        ) : (
          <div className="la-list">
            {requests.map((req) => {
              const coverUrl = getCoverUrl(req.book?.coverImage);
              const isActing = acting[req._id];
              const member = req.member;
              const book   = req.book;

              return (
                <div key={req._id} className="la-card">
                  <div className="la-card-main">
                    {/* Book cover */}
                    <div className="la-cover">
                      {coverUrl
                        ? <img src={coverUrl} alt={book?.title} onError={(e) => e.target.style.display = "none"} />
                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.2)" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      }
                    </div>

                    {/* Info */}
                    <div className="la-card-body">
                      <div className="la-book-title">{book?.title || "Unknown Book"}</div>
                      <div className="la-book-author">by {book?.author || "Unknown"} · {book?.genre}</div>

                      <div className="la-meta-row">
                        {/* Member */}
                        <div className="la-meta-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          <strong>{member?.firstName} {member?.lastName}</strong>
                        </div>
                        {/* Email */}
                        <div className="la-meta-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                          </svg>
                          {member?.email}
                        </div>
                        {/* Requested on */}
                        <div className="la-meta-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          Requested: <strong>{formatDate(req.createdAt)}</strong>
                        </div>
                        {/* Return date */}
                        <div className="la-meta-chip">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          Return by: <strong>{formatDate(req.requestedReturnDate)}</strong>
                        </div>
                      </div>

                      {/* Status */}
                      <span className={`la-status ${req.status}`}>
                        {{ pending: "⏳", approved: "✅", rejected: "✗", returned: "↩" }[req.status]}
                        {" "}{req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="la-actions">
                      {req.status === "pending" && (
                        <>
                          <button
                            className="la-btn-approve"
                            onClick={() => handleApprove(req._id)}
                            disabled={isActing}
                          >
                            {isActing ? (
                              <div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                            Approve
                          </button>
                          <button
                            className="la-btn-reject"
                            onClick={() => handleReject(req._id)}
                            disabled={isActing}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            Reject
                          </button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <button
                          className="la-btn-return"
                          onClick={() => handleMarkReturned(req._id)}
                          disabled={isActing}
                        >
                          {isActing ? (
                            <div style={{ width: 13, height: 13, border: "2px solid rgba(160,160,240,0.3)", borderTopColor: "#a0a0f0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="1 4 1 10 7 10"/>
                              <path d="M3.51 15a9 9 0 1 0 .49-3.37"/>
                            </svg>
                          )}
                          Mark Returned
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action note for acted-upon requests */}
                  {(req.status === "approved" || req.status === "rejected" || req.status === "returned") && req.actionBy && (
                    <div className="la-note-row">
                      <div className="la-note-label">
                        {req.status === "approved" ? "Approved" : req.status === "rejected" ? "Rejected" : "Processed"} by
                      </div>
                      <div className="la-note-by">
                        {req.actionBy?.firstName} {req.actionBy?.lastName} · {formatDate(req.actionAt)}
                        {req.status === "returned" && req.actualReturnDate && ` · Returned: ${formatDate(req.actualReturnDate)}`}
                      </div>
                      {req.actionNote && <div className="la-note-value">"{req.actionNote}"</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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

  // ✅ Define fetchBooks FIRST, before any useEffects
  const fetchBooks = async () => {
    console.log("🔍 fetchBooks called:", { 
      filter, 
      currentUser: currentUser ? { id: currentUser.id, _id: currentUser._id, name: currentUser.name } : null 
    });
    
    setLoading(true); 
    setError(null);
    
    try {
      if (filter === "borrowed") {
        // 🔹 Get user ID - try both formats
        const userId = currentUser?.id || currentUser?._id;
        
        if (!userId) {
          console.log("⏳ No userId yet, waiting for currentUser to load...");
          setBooks([]);
          setTotalPages(1);
          setLoading(false);
          return;
        }
        
        console.log("✅ Fetching borrowed books for userId:", userId);
        
        // 🔹 Fetch user's approved borrow requests
const data = await apiFetch("/api/circulation/my");
const approvedOnly = { ...data, data: (data.data || []).filter(r => r.status === "approved") };

        
        // 🔹 Transform to book-like objects
        const borrowedBooks = (data.data || []).map(record => {
          console.log("📚 Mapping record:", {
            recordId: record._id,
            bookValue: record.book,
            bookType: typeof record.book,
          });
          
          return {
            id: record.book?._id || record.book?.id || record.book,
            title: record.book?.title || "Unknown Book",
            author: record.book?.author || "Unknown",
            isbn: record.book?.isbn || "",
            genre: record.book?.genre || "",
            publicationYear: record.book?.publicationYear || "",
            publisher: record.book?.publisher || "Unknown",
            description: record.book?.description || "",
            copiesAvailable: record.book?.copiesAvailable || 0,
            coverImage: record.book?.coverImage || null,
            status: "Borrowed",
            
            // ✅ Borrow-specific fields
            borrowId: record._id,
            requestedReturnDate: record.requestedReturnDate,
            actualReturnDate: record.actualReturnDate,
            actionNote: record.actionNote,
            borrowedAt: record.createdAt,
            approvedAt: record.actionAt,
          };
        });
        
        console.log("✅ Borrowed books loaded:", borrowedBooks.length);
        setBooks(borrowedBooks);
        setTotalPages(1);
        
      } else {
        // 🔹 Normal catalog fetch
        const params = new URLSearchParams({ 
          page, 
          limit: 12, 
          query: search, 
          genre: genre === "All" ? "" : genre, 
          sort 
        });
        
        const res = await fetch(`${API_BASE}/api/books?${params.toString()}`);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed: ${res.status}`);
        }
        
        setBooks((data.data || []).map((b) => ({
          id: b._id || b.id, 
          title: b.title, 
          author: b.author, 
          isbn: b.isbn,
          genre: b.genre, 
          publicationYear: b.publicationYear,
          publisher: b.publisher || "Unknown", 
          description: b.description || "",
          copiesAvailable: b.copiesAvailable || 0, 
          coverImage: b.coverImage || null,
          status: b.copiesAvailable > 0 ? "Available" : "Out of Stock",
        })));
        setTotalPages(data.totalPages || 1);
      }
      
    } catch (err) { 
      console.error("❌ Fetch error:", err);
      
      if (filter === "borrowed") {
        setBooks([]);
        setError("Could not load your borrowed books. Please try again.");
      } else {
        setError(err.message);
      }
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ 1. Fetch books when filter/search/sort/page changes
  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, genre, sort, filter, search]);

  // ✅ 2. Debounced search
  useEffect(() => {
    if (search.trim().length >= 2 || search === "") {
      const t = setTimeout(() => { 
        setPage(1); 
        fetchBooks(); 
      }, 400);
      return () => clearTimeout(t);
    }
  }, [search]);

  // ✅ 3. CRITICAL: Re-fetch borrowed books when currentUser ID becomes available
  useEffect(() => {
    if (filter === "borrowed") {
      const userId = currentUser?.id || currentUser?._id;
      if (userId) {
        console.log("🔄 currentUser ID ready, fetching borrowed books...");
        fetchBooks();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentUser?.id, currentUser?._id]);

  return (
    <>
      <div style={{ padding: "24px", background: "linear-gradient(180deg, #1c1510 0%, #15100a 100%)", minHeight: "calc(100vh - 68px)", fontFamily: "'DM Sans', sans-serif", color: "#f5f0e8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", margin: 0 }}>{filter === "borrowed" ? "📖 My Borrows" : "📚 Library Catalog"}</h1>
          {onBack && (<button onClick={onBack} style={{ background: "transparent", border: "1px solid rgba(184,134,11,0.3)", color: "#f5f0e8", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}>← Back</button>)}
        </div>
        {filter !== "borrowed" && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <input type="text" placeholder="Search books, authors, ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: "1", minWidth: "200px", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "8px", color: "#f5f0e8", outline: "none" }} />
            <select value={genre} onChange={(e) => { setGenre(e.target.value); setPage(1); }} style={{ padding: "10px 14px", background: "#2a2218", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "8px", color: "#f5f0e8", cursor: "pointer" }}>{GENRES.map((g) => <option key={g} value={g}>{g}</option>)}</select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} style={{ padding: "10px 14px", background: "#2a2218", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "8px", color: "#f5f0e8", cursor: "pointer" }}><option value="newest">Newest First</option><option value="title">Title A-Z</option><option value="author">Author A-Z</option><option value="year">Year (Newest)</option></select>
          </div>
        )}
        {filter === "borrowed" && (<div style={{ marginBottom: "20px", color: "rgba(245,240,232,0.4)", fontSize: "13px" }}>Showing your borrowed books • Sorted by borrow date</div>)}
        {error && <div style={{ background: "rgba(220,60,40,0.15)", padding: "12px", borderRadius: "8px", marginBottom: "16px", color: "#ff8a75" }}>⚠️ {error}</div>}
        {loading && !error && <div style={{ textAlign: "center", padding: "40px", color: "rgba(245,240,232,0.5)" }}>Loading catalog…</div>}
        {!loading && !error && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              {books.length > 0 ? books.map((book) => {
                const coverUrl = getCoverUrl(book.coverImage);
                const isBorrowedView = filter === "borrowed";
                return (
                  <div key={book.id || book.borrowId} onClick={() => !isBorrowedView && setSelectedBook(book)} style={{ background: "#2a2218", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "12px", overflow: "hidden", cursor: isBorrowedView ? "default" : "pointer", transition: "transform 0.2s, box-shadow 0.2s", opacity: isBorrowedView ? 0.95 : 1 }} onMouseOver={(e) => { if (!isBorrowedView) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.45)"; } }} onMouseOut={(e) => { if (!isBorrowedView) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; } }}>
                    <div style={{ height: "240px", background: "rgba(255,255,255,0.04)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {coverUrl ? (<img src={coverUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />) : null}
                      <div style={{ position: coverUrl ? "absolute" : "relative", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}><span style={{ fontSize: "36px", color: "rgba(245,240,232,0.15)" }}>📖</span><span style={{ fontSize: "11px", color: "rgba(245,240,232,0.2)", fontFamily: "'DM Sans',sans-serif" }}>No cover</span></div>
                      {isBorrowedView && (<div style={{ position: "absolute", top: 10, right: 10, padding: "4px 10px", background: "rgba(58,170,138,0.9)", color: "#fff", borderRadius: "12px", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Borrowed</div>)}
                    </div>
                    <div style={{ padding: "14px" }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14px" }}>{book.title}</div>
                      <div style={{ fontSize: "12px", color: "rgba(245,240,232,0.5)", marginBottom: 8 }}>by {book.author}</div>
                      {isBorrowedView ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", background: "rgba(58,170,138,0.15)", color: "#5fdbb0", fontWeight: "500" }}>✓ Borrowed</span></div>
                          <div style={{ fontSize: "11px", color: "rgba(245,240,232,0.4)" }}>📅 Return by: <strong style={{ color: "#f5f0e8" }}>{formatDate(book.requestedReturnDate)}</strong></div>
                          {book.actionNote && (<div style={{ fontSize: "10px", color: "rgba(245,240,232,0.3)", fontStyle: "italic" }}>"{book.actionNote}"</div>)}
                        </div>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", background: book.status === "Available" ? "rgba(58,170,138,0.15)" : "rgba(220,60,40,0.15)", color: book.status === "Available" ? "#5fdbb0" : "#ff8a75" }}>{book.status}</span><span style={{ fontSize: "11px", color: "rgba(245,240,232,0.35)" }}>{book.genre}</span></div>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "rgba(245,240,232,0.5)" }}>
                  {filter === "borrowed" ? "📭 You haven't borrowed any books yet" : "🔍 No books found"}
                  {search && filter !== "borrowed" && (<div style={{ marginTop: 8, fontSize: 12 }}><button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#f0c040", cursor: "pointer" }}>Clear search</button></div>)}
                </div>
              )}
            </div>
            {totalPages > 1 && (<div style={{ display: "flex", justifyContent: "center", gap: "8px" }}><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "6px", color: "#f5f0e8", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>← Prev</button><span style={{ padding: "8px 14px", background: "rgba(184,134,11,0.15)", borderRadius: "6px" }}>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "6px", color: "#f5f0e8", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}>Next →</button></div>)}
          </>
        )}
      </div>
      {selectedBook && (<BookModal book={selectedBook} currentUser={currentUser} onClose={() => setSelectedBook(null)} />)}
    </>
  );
}