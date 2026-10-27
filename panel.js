/**
 * TeleVault — Channel scanner panel (rendered inside a Shadow DOM)
 * Copyright (c) 2026 Adham Idiboyev (@SuperMix)
 */
(() => {
  const U = () => window.TMD_UTILS;
  const S = (p) => window.TMD_SETTINGS.get(p);

  const TYPES = [
    { id: "photo", label: "Rasm", color: "#F0B64E" },
    { id: "video", label: "Video", color: "#4FB3F6" },
    { id: "gif", label: "GIF", color: "#B48CF2" },
    { id: "round", label: "Dumaloq video", color: "#F28C6A" },
    { id: "document", label: "Fayl", color: "#9AA9B8" },
    { id: "audio", label: "Musiqa", color: "#5CCB8F" },
    { id: "voice", label: "Ovozli", color: "#3DD6C4" }
  ];
  const TYPE = Object.fromEntries(TYPES.map((t) => [t.id, t]));

  const ICONS = {
    scan: '<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M4 12h16"/>',
    download: '<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"/>',
    settings: '<path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 8v5m0 3.5v.01M10.3 3.9 2.6 17.3A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.7L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
    skip: '<path d="m6 6 7 6-7 6V6Zm11 0v12"/>',
    export: '<path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/>',
    sync: '<path d="M19.5 12a7.5 7.5 0 0 1-12.9 5.2M4.5 12a7.5 7.5 0 0 1 12.9-5.2"/><path d="M17.5 3v3.8h-3.8M6.5 21v-3.8h3.8"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    eyeOff: '<path d="M4 4l16 16M9.9 6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.7M6.6 7.7A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1"/><path d="M10 10.1a2.8 2.8 0 0 0 3.9 3.9"/>',
    pause: '<path d="M8.5 6v12M15.5 6v12"/>',
    play: '<path d="M8 5.5v13l10.5-6.5L8 5.5Z"/>',
    retry: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/>',
    up: '<path d="M12 19V5m0 0-6 6m6-6 6 6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    history: '<path d="M12 7.5V12l3 2"/><circle cx="12" cy="12" r="8.5"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
    photo: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m4 16 4.5-4.5 4 4 2.5-2.5L20 17.5"/><circle cx="15.5" cy="9.5" r="1.5"/>',
    video: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m10 9.2 5 2.8-5 2.8V9.2Z"/>',
    gif: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M10 10.5H8.5a1.5 1.5 0 0 0 0 3H10v-1.3M12.5 10v4M15.5 14v-4h2M15.5 12h1.5"/>',
    round: '<circle cx="12" cy="12" r="8.5"/><path d="m10.5 9.5 4 2.5-4 2.5v-5Z"/>',
    document: '<path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8L14 3.5Z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4"/>',
    audio: '<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
    voice: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>'
  };
  const icon = (name, size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const STYLES = `
  :host { all: initial; }
  .root [hidden]:not(.panel) { display: none !important; }
  * { box-sizing: border-box; }
  .root {
    --bg:#121A23; --surface:#1A2531; --surface2:#213041; --line:#273444; --text:#E8EEF4; --muted:#8B9AAA;
    --accent:#4FB3F6; --accent-ink:#06131D; --ok:#5CCB8F; --bad:#F06A6A; --warn:#F0B64E;
    --shadow: 0 18px 48px rgba(3,8,14,.55);
    font: 13px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
  .root.light {
    --bg:#FFFFFF; --surface:#F3F6F9; --surface2:#E8EEF3; --line:#E0E7EE; --text:#15202B; --muted:#627386;
    --accent:#1F8FE0; --accent-ink:#FFFFFF; --ok:#239A5C; --bad:#D64545; --warn:#B7790F;
    --shadow: 0 18px 48px rgba(20,40,60,.18);
  }
  button { font: inherit; color: inherit; cursor: pointer; border: 0; background: none; }
  button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .launcher {
    position: fixed; bottom: 84px; z-index: 2147483000; width: 46px; height: 46px; border-radius: 15px;
    display: grid; place-items: center; background: var(--accent); color: var(--accent-ink);
    box-shadow: 0 10px 28px rgba(0,0,0,.35); transition: transform .15s ease;
  }
  .launcher:hover { transform: translateY(-2px); }
  .launcher[data-side="right"] { right: 18px; } .launcher[data-side="left"] { left: 18px; }

  .panel {
    position: fixed; top: 12px; bottom: 12px; z-index: 2147483001; width: min(420px, calc(100vw - 24px));
    display: flex; flex-direction: column; background: var(--bg); border: 1px solid var(--line);
    border-radius: 18px; box-shadow: var(--shadow); overflow: hidden;
    transition: transform .22s cubic-bezier(.2,.8,.2,1), opacity .18s;
  }
  .panel[data-side="right"] { right: 12px; } .panel[data-side="left"] { left: 12px; }
  .panel[hidden] { display: flex; pointer-events: none; opacity: 0; }
  .panel[hidden][data-side="right"] { transform: translateX(24px); }
  .panel[hidden][data-side="left"] { transform: translateX(-24px); }
  @media (prefers-reduced-motion: reduce) { .panel, .launcher { transition: none; } }

  header { display: flex; align-items: center; gap: 10px; padding: 14px 14px 10px 18px; }
  .who { flex: 1; min-width: 0; }
  .who h2 { margin: 0; font-size: 16px; font-weight: 650; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .who p { margin: 1px 0 0; color: var(--muted); font-size: 12px; }
  .icon-btn { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; color: var(--muted); }
  .icon-btn:hover { background: var(--surface); color: var(--text); }

  .scanbar { padding: 4px 18px 14px; display: grid; gap: 10px; }
  .primary {
    height: 40px; border-radius: 12px; background: var(--accent); color: var(--accent-ink);
    font-weight: 650; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 16px;
  }
  .primary:disabled { opacity: .45; cursor: default; }
  .primary.danger { background: color-mix(in srgb, var(--bad) 16%, transparent); color: var(--bad); }
  .ghost { height: 40px; border-radius: 12px; padding: 0 14px; background: var(--surface); display: inline-flex; align-items: center; gap: 8px; }
  .ghost:hover { background: var(--surface2); }
  .scan-actions { display: flex; gap: 8px; }
  .scan-actions > button { flex: 1; min-width: 0; }
  .scan-actions .ghost { justify-content: center; flex: 0 0 auto; }
  .hint { color: var(--muted); font-size: 12px; margin: 0; }
  .cp { display: grid; grid-template-columns: 32px 1fr auto; gap: 10px; align-items: center; padding: 10px 10px 10px 12px;
    border-radius: 12px; background: var(--surface); border: 1px solid var(--line); }
  .cp .ic { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center;
    background: color-mix(in srgb, var(--ok) 16%, transparent); color: var(--ok); }
  .cp .t { font-weight: 600; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cp .m { color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .link { color: var(--muted); font-size: 12px; padding: 6px 8px; border-radius: 8px; }
  .link:hover { color: var(--bad); background: color-mix(in srgb, var(--bad) 10%, transparent); }
  .launcher .badge { position: absolute; top: -6px; right: -6px; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px;
    background: var(--bad); color: #fff; font-size: 11px; font-weight: 700; display: grid; place-items: center; box-shadow: 0 0 0 2px var(--bg); }
  .views button span.hot { background: var(--ok); color: #06131D; }
  .crow { grid-template-columns: 22px 34px 1fr auto 30px !important; }
  .crow .pbar { grid-column: 3 / 6 !important; }
  .crow .st.pending { color: var(--warn); }
  .eye { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; color: var(--muted); opacity: .55; }
  .eye:hover { background: var(--surface2); opacity: 1; }
  .eye.on { color: var(--accent); opacity: 1; }
  .mwatch { margin: 0 18px 10px; color: var(--muted); font-size: 12px; display: flex; gap: 6px; align-items: center; }
  .mwatch svg { flex: none; } .mwatch b { color: var(--text); }
  .mwatch { flex-wrap: wrap; } .link.inline { padding: 2px 6px; color: var(--accent); } .link.inline:hover { color: var(--accent); background: var(--surface); }
  .glyph { overflow: hidden; position: relative; }
  .glyph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .glyph.has-img::after { content: ""; position: absolute; right: 3px; bottom: 3px; width: 7px; height: 7px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 1.5px var(--bg); }
  .prio { width: 26px; height: 26px; border-radius: 7px; display: inline-grid; place-items: center; color: var(--muted); }
  .prio:hover { background: var(--surface2); color: var(--accent); }
  .st.next { color: var(--accent); }
  .prio.cancel:hover { color: var(--bad); }
  .ftoggle { position: relative; width: 34px; height: 34px; flex: none; border-radius: 10px; border: 1px solid var(--line); display: grid; place-items: center; color: var(--muted); }
  .ftoggle[aria-expanded="true"], .ftoggle:hover { color: var(--text); background: var(--surface); }
  .ftoggle i { position: absolute; top: -5px; right: -5px; min-width: 16px; height: 16px; border-radius: 8px; background: var(--accent); color: var(--accent-ink); font: 700 10px/16px system-ui; font-style: normal; text-align: center; padding: 0 4px; }
  .filters { margin: 0 18px 12px; padding: 12px; border-radius: 12px; background: var(--surface); display: grid; gap: 10px; }
  .filters label { display: grid; grid-template-columns: 100px 1fr; align-items: center; gap: 10px; color: var(--muted); font-size: 12px; }
  .filters input { height: 32px; border-radius: 9px; border: 1px solid var(--line); background: var(--bg); color: var(--text); padding: 0 10px; font: inherit; min-width: 0; width: 100%; }
  .filters .pair { display: flex; gap: 6px; align-items: center; }
  .seg2 { display: flex; gap: 2px; padding: 2px; border-radius: 9px; background: var(--bg); border: 1px solid var(--line); }
  .seg2 button { flex: 1; height: 26px; border-radius: 7px; color: var(--muted); font-size: 11.5px; white-space: nowrap; padding: 0 4px; }
  .seg2 button[aria-pressed="true"] { background: var(--surface2); color: var(--text); }
  .filters .fx { display: flex; justify-content: space-between; align-items: center; }
  .views { display: flex; margin: 0 18px 12px; padding: 3px; gap: 2px; border-radius: 11px; background: var(--surface); }
  .views button { flex: 1; height: 30px; border-radius: 8px; color: var(--muted); font-weight: 550; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
  .views button[aria-pressed="true"] { background: var(--bg); color: var(--text); box-shadow: 0 1px 2px rgba(0,0,0,.18); }
  .views button span { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: var(--surface2); font-size: 11px; display: inline-grid; place-items: center; }
  .panel[data-view="multi"] .single, .panel[data-view="single"] .multi { display: none !important; }
  .multi.list { padding-top: 6px; }
  .mhead { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 0 18px 10px; }
  .crow { display: grid; grid-template-columns: 22px 34px 1fr auto; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 11px; cursor: pointer; }
  .crow:hover { background: var(--surface); }
  .crow input { width: 16px; height: 16px; accent-color: var(--accent); margin: 0; cursor: pointer; }
  .crow .av { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 14px;
    background: color-mix(in srgb, var(--c) 20%, transparent); color: var(--c); }
  .crow .st { font-weight: 600; }
  .crow.active { background: color-mix(in srgb, var(--accent) 8%, transparent); }
  .crow .pbar { grid-column: 3 / 5; height: 3px; border-radius: 2px; background: var(--surface2); overflow: hidden; margin-top: -2px; }
  .crow .pbar > div { height: 100%; background: var(--accent); width: 0; transition: width .2s; }
  .notice { margin: 0 18px 12px; padding: 10px 12px; border-radius: 11px; background: color-mix(in srgb, var(--ok) 12%, transparent); color: var(--ok); }
  .hint b { color: var(--text); font-weight: 600; }

  .composition { padding: 0 18px 12px; }
  .bar { display: flex; height: 10px; border-radius: 6px; overflow: hidden; background: var(--surface); gap: 2px; }
  .bar span { display: block; height: 100%; min-width: 3px; transition: flex-grow .3s ease; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .chip {
    display: inline-flex; align-items: center; gap: 7px; height: 30px; padding: 0 10px 0 9px; border-radius: 9px;
    background: var(--surface); color: var(--muted); border: 1px solid transparent;
  }
  .chip i { width: 8px; height: 8px; border-radius: 3px; background: var(--c); opacity: .45; }
  .chip b { color: var(--text); font-weight: 600; }
  .chip[aria-pressed="true"] { border-color: color-mix(in srgb, var(--c) 55%, transparent); color: var(--text); background: color-mix(in srgb, var(--c) 12%, var(--surface)); }
  .chip[aria-pressed="true"] i { opacity: 1; }
  .chip:disabled { opacity: .4; cursor: default; }

  .tools { display: flex; gap: 8px; padding: 0 18px 10px; align-items: center; }
  .search { flex: 1; height: 34px; border-radius: 10px; border: 1px solid var(--line); background: transparent; color: var(--text); padding: 0 11px; font: inherit; min-width: 0; }
  .search::placeholder { color: var(--muted); }
  select { height: 34px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--text); padding: 0 8px; font: inherit; }
  .selall { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); white-space: nowrap; cursor: pointer; }

  .list { flex: 1; overflow: auto; border-top: 1px solid var(--line); padding: 4px 8px 8px; overscroll-behavior: contain; }
  .row { display: grid; grid-template-columns: 22px 34px 1fr auto; gap: 10px; align-items: center; padding: 8px 10px; border-radius: 11px; cursor: pointer; }
  .row:hover { background: var(--surface); }
  .row input { width: 16px; height: 16px; accent-color: var(--accent); margin: 0; cursor: pointer; }
  .glyph { width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; font-size: 11px; font-weight: 700;
    background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); }
  .txt { min-width: 0; }
  .txt .t { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .txt .m { display: flex; gap: 10px; color: var(--muted); font-size: 12px; white-space: nowrap; overflow: hidden; }
  .txt .m .tag { padding: 0 6px; border-radius: 5px; background: var(--surface2); color: var(--text); font-size: 11px; line-height: 17px; }
  .txt .m .tag.ok { background: color-mix(in srgb, var(--ok) 16%, transparent); color: var(--ok); }
  .st { color: var(--muted); font-size: 12px; display: inline-flex; align-items: center; gap: 4px; min-width: 18px; justify-content: flex-end; }
  .st.done { color: var(--ok); } .st.failed { color: var(--bad); } .st.downloading { color: var(--accent); }
  .row .pbar { grid-column: 3 / 5; height: 3px; border-radius: 2px; background: var(--surface2); overflow: hidden; margin-top: -2px; }
  .row .pbar > div { height: 100%; background: var(--accent); width: 0; }
  .more { width: 100%; height: 36px; margin-top: 6px; border-radius: 10px; color: var(--accent); }
  .more:hover { background: var(--surface); }

  .empty { padding: 36px 26px; text-align: center; color: var(--muted); }
  .empty h3 { margin: 0 0 6px; color: var(--text); font-size: 15px; font-weight: 600; }
  .empty p { margin: 0; }
  .error { margin: 0 18px 12px; padding: 10px 12px; border-radius: 11px; background: color-mix(in srgb, var(--bad) 12%, transparent); color: var(--bad); }

  footer { border-top: 1px solid var(--line); padding: 12px 14px 14px 18px; display: grid; gap: 10px; background: var(--bg); }
  .sum { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
  .sum strong { font-size: 15px; font-weight: 650; }
  .sum span { color: var(--muted); font-size: 12px; text-align: right; }
  .actions { display: flex; gap: 8px; }
  .actions .primary { flex: 1; }
  .overall { height: 6px; border-radius: 4px; background: var(--surface); overflow: hidden; }
  .overall > div { height: 100%; width: 0; background: var(--accent); transition: width .25s; }
  .progress-line { height: 4px; border-radius: 3px; background: var(--surface); overflow: hidden; }
  .progress-line > div { height: 100%; width: 30%; background: var(--accent); animation: slide 1.2s infinite ease-in-out; }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(340%); } }
  `;

  const state = {
    open: false,
    adapter: null,
    peer: null,
    items: [],
    active: new Set(), // active type filters
    selected: new Set(),
    query: "",
    sort: "new",
    renderLimit: 300,
    scanning: false,
    scanned: 0,
    downloading: false,
    controller: null,
    error: "",
    notice: "",
    syncMode: false,  // current scan is "only new"
    view: "single",   // "single" | "multi"
    multi: { selected: null, status: {}, titles: {}, pending: {}, running: false, controller: null, current: null, error: "" },
    control: null,
    meter: null,
    filtersOpen: false,
    checkpoint: null,
    folderName: "",
    target: null
  };

  const refreshPeer = () => {
    const adapter = window.TMD_SCANNER.pickAdapter();
    state.peer = adapter.peer();
    state.checkpoint = window.TMD_SETTINGS.getCheckpoint(state.peer?.id);
    window.TMD_SCANNER.savedFolderName().then((n) => {
      if (n !== state.folderName) { state.folderName = n; if (state.open) renderScanbar(); }
    });
  };

  const fmtWhen = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString(undefined, { day: "numeric", month: "short", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined, hour: "2-digit", minute: "2-digit" });
  };

  let shadow, els;

  const typeAllowed = (it) => S(`scan.types.${it.type}`) !== false;
  const sizeAllowed = (it) => !S("scan.minSizeMB") || !it.size || it.size >= S("scan.minSizeMB") * 1048576;
  const listOf = (v) => String(v || "").toLowerCase().split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
  /** Duration / extension / keyword / forward filters from settings. */
  const extraAllowed = (it) => {
    const minD = S("scan.minDurationMin") * 60, maxD = S("scan.maxDurationMin") * 60;
    if (it.duration && ((minD && it.duration < minD) || (maxD && it.duration > maxD))) return false;
    const exts = listOf(S("scan.extensions")).map((e) => e.replace(/^\./, ""));
    if (exts.length && !exts.includes((U().extOf(it.fileName) || U().MIME_EXT[it.mime] || "").toLowerCase())) return false;
    const kws = String(S("scan.keywords") || "").toLowerCase().split(/[,;]+/).map((x) => x.trim()).filter(Boolean);
    if (kws.length) {
      const text = `${it.caption || it.albumCaption || ""} ${it.fileName || ""}`.toLowerCase();
      if (!kws.some((k) => text.includes(k))) return false;
    }
    const fwd = S("scan.forwarded");
    if ((fwd === "only" && !it.fwd) || (fwd === "exclude" && it.fwd)) return false;
    return true;
  };
  const allowed = (it) => typeAllowed(it) && sizeAllowed(it) && extraAllowed(it);
  const activeFilters = () =>
    [S("scan.minDurationMin"), S("scan.maxDurationMin"), S("scan.minSizeMB"), S("scan.extensions"), S("scan.keywords"), S("scan.forwarded") !== "all"]
      .filter(Boolean).length;
  const pool = () => state.items.filter(allowed);

  /** Download speed from the queue's byte counter (smoothed). */
  const createMeter = (control) => ({
    t: performance.now(), b: control.bytes, speed: 0,
    tick() {
      const now = performance.now();
      const dt = (now - this.t) / 1000;
      if (dt >= 0.8) {
        const inst = Math.max(0, control.bytes - this.b) / dt;
        this.speed = this.speed ? this.speed * 0.65 + inst * 0.35 : inst;
        this.t = now;
        this.b = control.bytes;
      }
      return control.paused ? 0 : this.speed;
    }
  });
  const fmtEta = (sec) => {
    if (!isFinite(sec) || sec <= 0) return "";
    if (sec < 60) return "1 daqiqadan kam";
    const m = Math.round(sec / 60);
    return m < 60 ? `~${m} daq` : `~${Math.floor(m / 60)} soat ${m % 60} daq`;
  };

  const visible = () => {
    const q = state.query.toLowerCase();
    let list = pool().filter(
      (it) => state.active.has(it.type) &&
        (!q || (it.caption || it.albumCaption || "").toLowerCase().includes(q) || (it.fileName || "").toLowerCase().includes(q))
    );
    if (state.sort === "old") list = list.slice().reverse();
    else if (state.sort === "big") list = list.slice().sort((a, b) => (b.size || 0) - (a.size || 0));
    return list;
  };

  const counts = () => {
    const c = {};
    for (const it of pool()) {
      c[it.type] ||= { n: 0, size: 0 };
      c[it.type].n++;
      c[it.type].size += it.size || 0;
    }
    return c;
  };

  const applyTheme = () => {
    const pref = S("ui.theme");
    const telegramDark =
      document.documentElement.classList.contains("night") ||
      document.documentElement.classList.contains("theme-dark") ||
      document.body.classList.contains("night");
    const dark = pref === "dark" || (pref === "auto" && telegramDark) ||
      (pref === "auto" && !document.documentElement.className && matchMedia("(prefers-color-scheme: dark)").matches);
    els.root.classList.toggle("light", !dark);
    const side = S("ui.panelSide");
    els.panel.dataset.side = side;
    els.launcher.dataset.side = side;
    els.launcher.hidden = !S("ui.showLauncher") || state.open;
  };

  /* ------------------------------ Rendering ------------------------------ */

  const renderHeader = () => {
    const peer = state.peer || { title: "Kanal skaneri" };
    const adapter = window.TMD_SCANNER.pickAdapter();
    if (state.view === "multi") {
      els.title.textContent = "Kanallar";
      els.sub.textContent = "Tanlangan kanallardan faqat oxirgi yuklashdan keyingi media yuklanadi";
      return;
    }
    els.title.textContent = peer.title;
    els.sub.textContent =
      adapter.name === "api"
        ? "To'liq skan: kanal tarixi to'g'ridan-to'g'ri o'qiladi"
        : "Ko'ruvchi rejimi: media birma-bir varaqlanadi (faqat rasm va video)";
  };

  const renderScanbar = () => {
    const max = S("scan.maxPosts");
    const cp = state.checkpoint;
    const busy = state.scanning || state.downloading;

    // "Only new" button: shown once the chat has a checkpoint
    els.syncBtn.hidden = !cp || (state.scanning && !state.syncMode);
    els.scanBtn.hidden = state.scanning && state.syncMode;
    if (state.scanning && state.syncMode) {
      els.syncBtn.className = "primary danger";
      els.syncBtn.innerHTML = `${icon("stop")} To'xtatish`;
    } else {
      els.syncBtn.className = "primary";
      els.syncBtn.innerHTML = `${icon("sync")} Yangilarini yuklash`;
    }
    els.syncBtn.disabled = state.downloading || (state.scanning && !state.syncMode);

    if (state.scanning && !state.syncMode) {
      els.scanBtn.className = "primary danger";
      els.scanBtn.innerHTML = `${icon("stop")} Skanni to'xtatish`;
    } else if (cp) {
      els.scanBtn.className = "ghost";
      els.scanBtn.innerHTML = `${icon("scan", 16)} To'liq skan`;
    } else {
      els.scanBtn.className = "primary";
      els.scanBtn.innerHTML = `${icon("scan")} ${state.items.length ? "Qayta skanerlash" : "Kanalni skanerlash"}`;
    }
    els.scanBtn.disabled = state.downloading;

    if (state.scanning) {
      els.scanHint.innerHTML = state.syncMode
        ? `Oxirgi yuklashdan keyingi postlar o'qilmoqda: <b>${state.scanned}</b> ta post, <b>${pool().length}</b> ta yangi media`
        : `<b>${state.scanned}</b> ta post ko'rildi, <b>${pool().length}</b> ta media topildi`;
    } else if (cp) {
      els.scanHint.innerHTML = S("sync.autoDownload")
        ? `<b>Yangilarini yuklash</b> faqat oxirgi yuklashdan keyin chiqqan medialarni topadi va darhol yuklaydi.`
        : `<b>Yangilarini yuklash</b> faqat oxirgi yuklashdan keyin chiqqan medialarni topib, belgilab beradi.`;
    } else {
      els.scanHint.innerHTML = state.items.length
        ? `<b>${state.scanned}</b> ta post ko'rib chiqildi. Oxirgi <b>${max}</b> ta postgacha skanerlanadi.`
        : `Ochiq chatdagi oxirgi <b>${max}</b> ta post tekshiriladi. Yuklagandan keyin bu kanal uchun <b>Yangilarini yuklash</b> tugmasi paydo bo'ladi.`;
    }
    els.scanProgress.hidden = !state.scanning;

    els.cp.hidden = !cp;
    if (cp) {
      const upTo = cp.date ? `${new Date(cp.date * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })} gacha` : "";
      els.cpTitle.textContent = cp.at ? `Oxirgi yuklash: ${fmtWhen(cp.at)}` : "Bu kanaldan avval yuklangan";
      els.cpMeta.textContent = [upTo, cp.count ? `${cp.count} ta fayl` : "",
        S("download.saveMode") === "folder" && state.folderName ? `papka: ${state.folderName}` : ""].filter(Boolean).join(" · ");
      els.cpReset.disabled = busy;
    }

    els.error.hidden = !state.error;
    els.error.textContent = state.error;
    els.notice.hidden = !state.notice || !!state.error;
    els.notice.textContent = state.notice;
  };

  const renderComposition = () => {
    const c = counts();
    const total = Object.values(c).reduce((a, b) => a + b.n, 0);
    els.comp.hidden = !total;
    els.bar.innerHTML = TYPES.filter((t) => c[t.id])
      .map((t) => `<span style="flex-grow:${c[t.id].n};background:${t.color}" title="${t.label}: ${c[t.id].n}"></span>`)
      .join("");
    els.chips.innerHTML = TYPES.filter((t) => c[t.id])
      .map((t) => `<button class="chip" style="--c:${t.color}" data-type="${t.id}" aria-pressed="${state.active.has(t.id)}"
          title="${U().formatBytes(c[t.id].size) || ""}"><i></i>${t.label} <b>${c[t.id].n}</b></button>`)
      .join("");
  };

  const rowHTML = (it) => {
    const t = TYPE[it.type];
    const title = it.fileName || (it.caption || "").split("\n")[0] || `${t.label} #${it.id}`;
    const date = it.date ? new Date(it.date * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : it.dateText || "";
    const meta = [date, U().formatBytes(it.size), U().formatDuration(it.duration)].filter(Boolean)
      .map((m) => `<span>${esc(m)}</span>`).join("") +
      (it.albumId ? `<span class="tag" title="Bitta postdagi albom">${it.albumSize > 1 ? `Albom ${it.albumIndex}/${it.albumSize}` : "Albom"}</span>` : "") +
      (it.resumed ? `<span class="tag ok" title="Avvalgi qismdan davom ettirildi">davom</span>` : "");
    const pct = it.state === "downloading" && it.size ? Math.floor((it.done * 100) / it.size) : null;
    const canPrio = state.downloading && it.state === "queued" && !it.prioritized;
    const canCancel = state.downloading && ["queued", "starting", "downloading"].includes(it.state);
    const st = (canPrio
      ? `<button class="prio" data-prio title="Navbatda birinchi qilish">${icon("up", 15)}</button>`
      : `<span class="lbl">${{
          queued: it.prioritized ? "keyingi" : "navbatda", starting: "…", downloading: pct !== null ? `${pct}%` : "…",
          done: icon("check", 16), failed: icon("alert", 16), skipped: icon("skip", 15), cancelled: "—"
        }[it.state] || ""}</span>`) +
      (canCancel ? `<button class="prio cancel" data-cancel title="Shu faylni bekor qilish">${icon("close", 14)}</button>` : "");
    const th = S("ui.thumbnails") ? thumbs.cache.get(it.key) : null;
    return `<div class="row" data-key="${esc(it.key)}" role="checkbox" aria-checked="${state.selected.has(it.key)}">
      <input type="checkbox" tabindex="-1" ${state.selected.has(it.key) ? "checked" : ""}>
      <div class="glyph ${th?.url ? "has-img" : ""}" style="--c:${t.color}" title="${t.label}" ${S("ui.thumbnails") && !thumbs.cache.has(it.key) ? `data-thumb="${esc(it.key)}"` : ""}>${th?.url ? `<img src="${esc(th.url)}" alt="" loading="lazy">` : icon(it.type, 18)}</div>
      <div class="txt"><div class="t">${esc(title)}</div><div class="m">${meta}</div></div>
      <div class="st ${it.prioritized && it.state === "queued" ? "next" : it.state || ""}" title="${esc(it.error || (it.state === "skipped" ? "Avval yuklangan, o'tkazib yuborildi" : ""))}">${st}</div>
      ${it.state === "downloading" ? `<div class="pbar"><div style="width:${pct || 0}%"></div></div>` : ""}
    </div>`;
  };

  const renderList = () => {
    const list = visible();
    if (!state.items.length) {
      els.list.innerHTML = state.scanning
        ? `<div class="empty"><h3>Skanerlanmoqda</h3><p>Topilgan media shu yerda paydo bo'ladi.</p></div>`
        : state.syncMode
        ? `<div class="empty"><h3>Hammasi yuklangan</h3><p>Oxirgi yuklashdan keyin kanalga yangi media qo'shilmagan.</p></div>`
        : `<div class="empty"><h3>Kanalni oching va skanerlang</h3><p>Rasm, video, fayl va audiolar turlari bo'yicha ajratib ko'rsatiladi. Keraklilarini belgilab, bir martada yuklab olasiz.</p></div>`;
    } else if (!list.length) {
      els.list.innerHTML = `<div class="empty"><h3>Mos media yo'q</h3><p>Yuqoridagi turlarni yoqing yoki qidiruvni tozalang.</p></div>`;
    } else {
      const shown = list.slice(0, state.renderLimit);
      els.list.innerHTML = shown.map(rowHTML).join("") +
        (list.length > shown.length ? `<button class="more" data-more>Yana ${Math.min(300, list.length - shown.length)} tasini ko'rsatish (${list.length - shown.length} qoldi)</button>` : "");
    }
    els.selall.hidden = !list.length;
    els.selallBox.checked = list.length > 0 && list.every((it) => state.selected.has(it.key));
    observeThumbs();
  };

  /* ------------------------------ Thumbnails ------------------------------ */

  const thumbs = { cache: new Map(), queue: [], active: 0, io: null };
  const pumpThumbs = () => {
    while (thumbs.active < 3 && thumbs.queue.length) {
      const it = thumbs.queue.shift();
      if (thumbs.cache.has(it.key) || !state.adapter?.thumb) continue;
      thumbs.cache.set(it.key, null);
      thumbs.active++;
      const own = state.adapter.name === "api";
      state.adapter.thumb(it)
        .then((url) => {
          thumbs.cache.set(it.key, url ? { url, own } : false);
          const g = els.list.querySelector(`.row[data-key="${CSS.escape(it.key)}"] .glyph`);
          if (g && url) {
            g.classList.add("has-img");
            g.innerHTML = `<img src="${esc(url)}" alt="">`;
          }
        })
        .catch(() => thumbs.cache.set(it.key, false))
        .finally(() => { thumbs.active--; pumpThumbs(); });
    }
  };
  const observeThumbs = () => {
    if (!S("ui.thumbnails")) return;
    thumbs.io ||= new IntersectionObserver((entries) => {
      const byKey = new Map(state.items.map((i) => [i.key, i]));
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        thumbs.io.unobserve(e.target);
        const it = byKey.get(e.target.dataset.thumb);
        if (it) thumbs.queue.push(it);
      }
      pumpThumbs();
    }, { root: els.list, rootMargin: "200px" });
    els.list.querySelectorAll(".glyph[data-thumb]").forEach((g) => thumbs.io.observe(g));
  };
  const clearThumbs = () => {
    thumbs.cache.forEach((v) => v?.own && URL.revokeObjectURL(v.url));
    thumbs.cache.clear();
    thumbs.queue = [];
  };

  /* ------------------------------ Filters ------------------------------ */

  const renderFilters = () => {
    const n = activeFilters();
    els.ftoggle.innerHTML = icon("filter", 17) + (n ? `<i>${n}</i>` : "");
    els.ftoggle.setAttribute("aria-expanded", state.filtersOpen);
    els.filters.hidden = !state.filtersOpen;
    if (!state.filtersOpen) return;
    els.filters.querySelectorAll("[data-f]").forEach((el) => {
      if (el.matches(":focus")) return;
      const v = S(el.dataset.f);
      el.value = el.type === "number" ? (v || "") : v ?? "";
    });
    els.filters.querySelectorAll(".seg2 button").forEach((b) => b.setAttribute("aria-pressed", b.value === S("scan.forwarded")));
  };
  let filterTimer;
  const patchFilter = (path, value) => {
    clearTimeout(filterTimer);
    filterTimer = setTimeout(() => window.TMD_SETTINGS.patch(path, value), 450);
  };

  const renderFooter = () => {
    const sel = visible().filter((it) => state.selected.has(it.key));
    const bytes = sel.reduce((a, b) => a + (b.size || 0), 0);
    els.footer.hidden = !state.items.length;
    if (state.downloading) {
      const q = state.queue || [];
      const finished = q.filter((it) => ["done", "failed", "skipped", "cancelled"].includes(it.state)).length;
      const done = q.filter((it) => it.state === "done").length;
      const failed = q.filter((it) => it.state === "failed").length;
      const skipped = q.filter((it) => it.state === "skipped").length;
      const speed = state.meter?.tick() || 0;
      const left = q.reduce((a, it) => a + (["queued", "starting", "downloading"].includes(it.state) ? Math.max(0, (it.size || 0) - (it.done || 0)) : 0), 0);
      const paused = state.control?.paused;
      els.sumMain.textContent = paused ? `Pauza · ${finished} / ${q.length}` : `${finished} / ${q.length} tayyor`;
      els.sumSide.textContent = [
        speed > 1024 && `${U().formatBytes(speed)}/s`,
        speed > 1024 && left && `${fmtEta(left / speed)} qoldi`,
        failed && `${failed} xato`, skipped && `${skipped} o'tkazildi`
      ].filter(Boolean).join(" · ") || (done ? `${done} yuklandi` : "");
      els.overall.hidden = false;
      const totalBytes = q.reduce((a, it) => a + (it.size || 0), 0);
      const doneBytes = q.reduce((a, it) => a + (["done", "skipped"].includes(it.state) ? it.size || 0 : it.done || 0), 0);
      els.overallFill.style.width = totalBytes ? `${(doneBytes * 100) / totalBytes}%` : q.length ? `${(finished * 100) / q.length}%` : "0";
      els.dlBtn.className = "primary danger";
      els.dlBtn.innerHTML = `${icon("stop")} To'xtatish`;
      els.dlBtn.disabled = false;
      els.pauseBtn.hidden = false;
      els.pauseBtn.innerHTML = paused ? `${icon("play", 16)} Davom` : `${icon("pause", 16)} Pauza`;
      els.exportBtn.hidden = true;
      els.retryBtn.hidden = true;
    } else {
      els.sumMain.textContent = `${sel.length} ta tanlandi`;
      const q = state.queue || [];
      const n = (st) => q.filter((it) => it.state === st).length;
      const result = [n("done") && `${n("done")} yuklandi`, n("skipped") && `${n("skipped")} o'tkazildi`,
        n("failed") && `${n("failed")} xato`, n("cancelled") && `${n("cancelled")} bekor`].filter(Boolean).join(", ");
      els.sumSide.textContent = result ? `Oxirgi yuklash: ${result}` : bytes ? U().formatBytes(bytes) : "";
      els.overall.hidden = true;
      els.dlBtn.className = "primary";
      els.dlBtn.innerHTML = `${icon("download")} Yuklab olish`;
      els.dlBtn.disabled = !sel.length || state.scanning;
      els.pauseBtn.hidden = true;
      els.exportBtn.hidden = false;
      const failedN = n("failed");
      els.retryBtn.hidden = !failedN;
      els.retryBtn.innerHTML = `${icon("retry", 16)} Xatolar (${failedN})`;
      els.retryBtn.title = "Xato bo'lgan fayllarni qayta yuklash";
    }
    els.exportBtn.disabled = !state.items.length;
  };

  const renderAll = () => {
    applyTheme();
    renderViews();
    if (state.view === "multi") renderMulti();
    renderHeader();
    renderScanbar();
    renderComposition();
    renderFilters();
    renderList();
    renderFooter();
  };

  let rafPending = false;
  const scheduleRender = () => {
    if (rafPending) return;
    rafPending = true;
    setTimeout(() => {
      rafPending = false;
      renderScanbar();
      renderComposition();
      renderList();
      renderFooter();
    }, 250);
  };

  /* ------------------------------ Actions ------------------------------ */

  const startScan = () => (state.scanning ? state.controller?.abort() : !state.multi.running && runScan({ sync: false }));

  /**
   * "Yangilarini yuklash": reads history only up to the checkpoint, then downloads what's new.
   * Called straight from the click so the folder prompt still has a user gesture.
   */
  const startSync = async () => {
    if (state.scanning) {
      state.controller?.abort();
      return;
    }
    if (state.multi.running) return;
    refreshPeer();
    if (!state.checkpoint) return;
    const auto = S("sync.autoDownload");
    // Ask for the folder now (needs the click); the scan runs meanwhile
    const targetPromise = auto ? window.TMD_SCANNER.prepareTarget(state.peer?.title || "Telegram", { reuse: true }) : null;
    targetPromise?.catch(() => {});
    const items = await runScan({ sync: true });
    if (!items) return;
    const fresh = items.filter((it) => !window.TMD_SETTINGS.isDownloaded(it.key));
    if (!fresh.length) {
      state.notice = "Yangi media yo'q. Kanal oxirgi yuklashdan beri o'zgarmagan.";
      renderAll();
      return;
    }
    state.selected = new Set(fresh.map((it) => it.key));
    state.notice = `${fresh.length} ta yangi media topildi.`;
    renderAll();
    if (auto) runDownload(fresh, targetPromise);
  };

  const runScan = async ({ sync }) => {
    const adapter = window.TMD_SCANNER.pickAdapter();
    state.adapter = adapter;
    state.peer = adapter.peer();
    state.checkpoint = window.TMD_SETTINGS.getCheckpoint(state.peer?.id);
    state.syncMode = sync;
    state.notice = "";
    clearThumbs();
    let result = null;
    state.items = [];
    state.queue = null;
    state.queueAll = null;
    state.selected.clear();
    state.scanned = 0;
    state.error = "";
    state.renderLimit = 300;
    state.scanning = true;
    state.controller = new AbortController();
    renderAll();
    try {
      const items = await adapter.scan({
        // "Only new" stops at the checkpoint, so the post limit doesn't apply
        limit: sync ? 100000 : S("scan.maxPosts"),
        since: sync ? state.checkpoint : null,
        signal: state.controller.signal,
        filter: { dateFrom: S("scan.dateFrom"), dateTo: S("scan.dateTo"), pageDelay: S("scan.pageDelay") },
        onProgress: ({ scanned, items }) => {
          state.scanned = scanned;
          state.items = items.slice();
          scheduleRender();
        }
      });
      state.items = items;
      result = items;
    } catch (err) {
      if (err?.name !== "AbortError") {
        state.error = err?.message || String(err);
        U().logger.error("Scan failed: " + state.error);
      }
    } finally {
      state.scanning = false;
      state.active = new Set(pool().map((it) => it.type));
      pool().forEach((it) => state.selected.add(it.key));
      renderAll();
    }
    return result ? pool() : null;
  };

  const startDownload = () => {
    if (state.downloading) {
      state.controller?.abort();
      return;
    }
    const items = visible().filter((it) => state.selected.has(it.key));
    if (!items.length || state.multi.running) return;
    // The folder picker must open inside the click — no awaits before this call
    runDownload(items, window.TMD_SCANNER.prepareTarget(state.peer?.title || "Telegram"));
  };

  const saveCheckpoint = () => {
    const q = state.queue;
    const peerId = state.peer?.id;
    if (!q?.length || !peerId || !state.adapter) return;
    const prev = window.TMD_SETTINGS.getStoredCheckpoint(peerId);
    // Whole original queue, so a successful retry lets the checkpoint move past the old failures
    const all = state.queueAll && q.every((it) => state.queueAll.includes(it)) ? state.queueAll : q;
    const next = window.TMD_SCANNER.nextCheckpoint(all, prev, state.adapter.name, state.peer.title);
    if (next) {
      window.TMD_SETTINGS.setCheckpoint(peerId, next);
      state.checkpoint = next;
    }
  };

  let footerTicker;
  const retryFailed = () => {
    const failed = (state.queue || []).filter((it) => it.state === "failed");
    if (!failed.length || state.downloading || state.multi.running) return;
    runDownload(failed, window.TMD_SCANNER.prepareTarget(state.peer?.title || "Telegram", { reuse: true }));
  };
  const togglePause = () => {
    const c = state.control;
    if (!c) return;
    c.paused ? c.resume() : c.pause();
    renderFooter();
  };

  const runDownload = (items, targetPromise) => {
    targetPromise
      .then(async (target) => {
        state.downloading = true;
        if (!(state.queueAll && items.every((it) => state.queueAll.includes(it)))) state.queueAll = items;
        state.queue = items;
        state.controller = new AbortController();
        state.control = window.TMD_SCANNER.createControl();
        state.meter = createMeter(state.control);
        state.error = "";
        items.forEach((it) => { it.prioritized = false; });
        renderAll();
        footerTicker = setInterval(renderFooter, 1000);
        await window.TMD_SCANNER.runQueue({
          items,
          adapter: state.adapter,
          channel: state.peer?.title || "Telegram",
          target,
          control: state.control,
          peer: state.peer,
          signal: state.controller.signal,
          onUpdate: (item, progressOnly) => {
            if (progressOnly && item) {
              const row = els.list.querySelector(`.row[data-key="${CSS.escape(item.key)}"]`);
              const pct = item.size ? Math.floor((item.done * 100) / item.size) : 0;
              row?.querySelector(".pbar > div")?.style.setProperty("width", pct + "%");
              const st = row?.querySelector(".st .lbl");
              if (st) st.textContent = `${pct}%`;
              return;
            }
            scheduleRender();
          }
        });
      })
      .catch((err) => {
        if (err?.name !== "AbortError") state.error = "Papka tanlanmadi: " + (err?.message || err);
      })
      .finally(() => {
        clearInterval(footerTicker);
        state.downloading = false;
        saveCheckpoint();
        const q = state.queue || [];
        const done = q.filter((it) => it.state === "done").length;
        const failed = q.filter((it) => it.state === "failed").length;
        if (done || failed) {
          window.TMD_SETTINGS.notify(
            `${state.peer?.title || "Telegram"}: yuklash tugadi`,
            [`${done} ta fayl yuklandi`, failed && `${failed} ta xato`].filter(Boolean).join(", ")
          );
        }
        if (state.syncMode && state.queue) {
          const n = state.queue.filter((it) => it.state === "done").length;
          state.notice = n ? `${n} ta yangi fayl yuklandi.` : state.notice;
        }
        refreshPeer();
        renderAll();
      });
  };

  const resetCheckpoint = () => {
    const peerId = state.peer?.id;
    if (!peerId) return;
    window.TMD_SETTINGS.setCheckpoint(peerId, { cleared: true, at: Date.now() });
    state.checkpoint = null;
    state.notice = "Belgi tozalandi. Keyingi skan butun tarixni ko'rib chiqadi.";
    renderAll();
  };

  const exportList = () => {
    const rows = state.items.map((it) => ({
      id: it.id, type: it.type, date: it.date ? new Date(it.date * 1000).toISOString() : it.dateText || "",
      size: it.size || 0, duration: it.duration || 0, fileName: it.fileName || "", caption: it.caption || "",
      status: it.state || ""
    }));
    const name = `${U().sanitize(state.peer?.title || "channel", 60)}_scan.json`;
    U().saveBlob(new Blob([JSON.stringify({ channel: state.peer?.title, scannedAt: new Date().toISOString(), items: rows }, null, 2)], { type: "application/json" }), name);
  };

  /* ------------------------- Multi-channel update ------------------------- */

  const AV_COLORS = ["#4FB3F6", "#F0B64E", "#5CCB8F", "#B48CF2", "#F28C6A", "#3DD6C4", "#F06A6A"];
  const multiAvailable = () => !!window.rootScope?.managers?.appMessagesManager && U().isWebK();
  const channelsList = () => (multiAvailable() ? window.TMD_SETTINGS.allCheckpoints() : []);
  const chTitle = (c) => c.title || state.multi.titles[c.peerId] || `Kanal ${c.peerId}`;
  const watchedSet = () => new Set((S("sync.watched") || []).map(String));

  // Fill in names for channels that only came from download history
  const resolveTitles = (list) => {
    const api = window.TMD_SCANNER.adapters.webkApi;
    list.filter((c) => !c.title && !(c.peerId in state.multi.titles)).forEach((c) => {
      state.multi.titles[c.peerId] = "";
      api.peerTitle(c.peerId).then((t) => {
        if (!t) return;
        state.multi.titles[c.peerId] = t;
        if (state.view === "multi") renderMulti();
      });
    });
  };

  const multiSelected = (list) => {
    if (!state.multi.selected) state.multi.selected = new Set(list.map((c) => c.peerId));
    return state.multi.selected;
  };

  const toggleWatch = (peerId) => {
    const w = watchedSet();
    w.has(peerId) ? w.delete(peerId) : w.add(peerId);
    window.TMD_SETTINGS.patch("sync.watched", [...w]);
    if (w.has(peerId) && !watch.next) watch.next = Date.now() + 60000;
  };

  const pendingTotal = () => Object.values(state.multi.pending).reduce((a, b) => a + b, 0);

  const statusText = (st) => {
    if (!st) return { side: "", meta: null };
    switch (st.phase) {
      case "wait": return { side: "navbatda", meta: "Navbatda" };
      case "scan": return { side: "…", meta: `Skanerlanmoqda: ${st.scanned} ta post, ${st.found} ta yangi media` };
      case "download": return { side: `${st.finished}/${st.total}`, meta: `Yuklanmoqda: ${st.finished} / ${st.total}` + (st.failed ? `, ${st.failed} xato` : "") };
      case "pending": return { side: `${st.found}`, meta: `${st.found} ta yangi media bor. Yuklash uchun "Tanlanganlarni yangilash"ni bosing` };
      case "none": return { side: icon("check", 16), meta: "Yangi media yo'q" + (st.at ? ` · ${fmtWhen(st.at)}` : "") };
      case "ok": return { side: st.done ? `+${st.done}` : icon("check", 16), meta: [`${st.done} ta yangi fayl yuklandi`, st.skipped && `${st.skipped} o'tkazildi`, st.failed && `${st.failed} xato`].filter(Boolean).join(", ") };
      case "stopped": return { side: "—", meta: "To'xtatildi" + (st.done ? `, ${st.done} ta yuklangan` : "") };
      case "error": return { side: icon("alert", 16), meta: "Xato: " + st.error };
      default: return { side: "", meta: null };
    }
  };

  const renderMulti = () => {
    const list = channelsList();
    resolveTitles(list);
    const sel = multiSelected(list);
    const m = state.multi;
    const w = watchedSet();
    els.merror.hidden = !m.error;
    els.merror.textContent = m.error;
    const nWatch = list.filter((c) => w.has(c.peerId)).length;
    els.mwatch.innerHTML = nWatch
      ? `${icon("eye", 14)} <b>${nWatch}</b> ta kuzatilmoqda · har ${S("sync.watchMinutes")} daq` +
        (watch.next && !m.running ? ` · keyingi ${new Date(Math.max(watch.next, Date.now())).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : "") +
        (m.running ? "" : ` <button class="link inline" data-act="watch-now">Hozir tekshirish</button>`)
      : `${icon("eye", 14)} Ko'z belgisini bossangiz, kanal Telegram ochiq turganda avtomatik tekshiriladi.`;
    els.mwatch.hidden = !list.length;
    if (!multiAvailable()) {
      els.mlist.innerHTML = `<div class="empty"><h3>Faqat Web K'da ishlaydi</h3><p>Bir nechta kanalni birdan yangilash uchun Telegram'ning Web K versiyasini oching (web.telegram.org/k).</p></div>`;
    } else if (!list.length) {
      els.mlist.innerHTML = `<div class="empty"><h3>Hali kanal yo'q</h3><p>Biror kanaldan media yuklab oling. Shundan keyin u shu ro'yxatga qo'shiladi va keyingi safar faqat yangilari yuklanadi.</p></div>`;
    } else {
      els.mlist.innerHTML = list.map((c) => {
        const st = m.status[c.peerId];
        const { side, meta } = statusText(st);
        const title = chTitle(c);
        const info = meta ?? [c.at ? `oxirgi yuklash ${fmtWhen(c.at)}` : "avval yuklangan", c.count ? `${c.count} ta fayl` : ""].filter(Boolean).join(" · ");
        const pct = st?.phase === "download" && st.total ? (st.finished * 100) / st.total : 0;
        const on = w.has(c.peerId);
        const cls = st?.phase === "error" ? "failed" : st?.phase === "ok" || st?.phase === "none" ? "done" : st?.phase === "pending" ? "pending" : st ? "downloading" : "";
        return `<div class="crow ${m.current === c.peerId ? "active" : ""}" data-peer="${esc(c.peerId)}" role="checkbox" aria-checked="${sel.has(c.peerId)}">
          <input type="checkbox" tabindex="-1" ${sel.has(c.peerId) ? "checked" : ""} ${m.running ? "disabled" : ""}>
          <div class="av" style="--c:${AV_COLORS[Math.abs(U().hashCode(c.peerId)) % AV_COLORS.length]}">${esc((title.trim()[0] || "#").toUpperCase())}</div>
          <div class="txt"><div class="t">${esc(title)}</div><div class="m"><span>${esc(info)}</span></div></div>
          <div class="st ${cls}">${side}</div>
          <button class="eye ${on ? "on" : ""}" data-watch aria-pressed="${on}" title="${on ? "Kuzatuvni o'chirish" : "Avtomatik kuzatish"}">${icon(on ? "eye" : "eyeOff", 16)}</button>
          ${st?.phase === "download" ? `<div class="pbar"><div style="width:${pct}%"></div></div>` : ""}
        </div>`;
      }).join("");
    }
    const n = list.filter((c) => sel.has(c.peerId)).length;
    els.mall.checked = list.length > 0 && n === list.length;
    els.mall.disabled = m.running || !list.length;
    if (m.running) {
      const ids = m.queue || [];
      const finished = ids.filter((id) => ["none", "ok", "error", "stopped", "pending"].includes(m.status[id]?.phase)).length;
      const newFiles = ids.reduce((a, id) => a + (m.status[id]?.done || 0), 0);
      const speed = m.meter?.tick() || 0;
      els.msum.textContent = `${finished} / ${ids.length} kanal${m.auto ? " · avtomatik" : ""}`;
      els.mside.textContent = [newFiles && `${newFiles} ta yangi fayl`, speed > 1024 && `${U().formatBytes(speed)}/s`].filter(Boolean).join(" · ");
      els.moverall.hidden = false;
      els.moverallFill.style.width = ids.length ? `${(finished * 100) / ids.length}%` : "0";
      els.mBtn.className = "primary danger";
      els.mBtn.innerHTML = `${icon("stop")} To'xtatish`;
      els.mBtn.disabled = false;
    } else {
      const ids = m.queue || [];
      const total = ids.reduce((a, id) => a + (m.status[id]?.done || 0), 0);
      const pend = pendingTotal();
      els.msum.textContent = `${n} ta kanal tanlandi`;
      els.mside.textContent = pend ? `${pend} ta yangi media kutmoqda` : ids.length ? `Oxirgi yangilash: ${total} ta yangi fayl` : "";
      els.moverall.hidden = true;
      els.mBtn.className = "primary";
      els.mBtn.innerHTML = `${icon("sync")} Tanlanganlarni yangilash`;
      els.mBtn.disabled = !n || state.scanning || state.downloading;
    }
  };

  const renderViews = () => {
    const show = multiAvailable() || state.view === "multi";
    els.views.hidden = !show;
    const count = channelsList().length;
    const pend = pendingTotal();
    els.viewCount.textContent = pend ? `+${pend}` : count;
    els.viewCount.classList.toggle("hot", !!pend);
    els.viewCount.hidden = !count;
    els.viewBtns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === state.view));
    els.panel.dataset.view = state.view;
    els.badge.textContent = pend > 99 ? "99+" : pend;
    els.badge.hidden = !pend;
  };

  let multiPending = false;
  const scheduleMulti = () => {
    if (multiPending) return;
    multiPending = true;
    setTimeout(() => {
      multiPending = false;
      if (state.open && state.view === "multi") renderMulti();
      renderViews();
    }, 250);
  };

  /**
   * Reads each chat from its checkpoint and downloads what's new.
   * auto: started by the watcher — without folder permission it only counts new media.
   */
  const runMulti = async (chosen, rootPromise, { auto = false } = {}) => {
    const m = state.multi;
    const api = window.TMD_SCANNER.adapters.webkApi;
    m.running = true;
    m.auto = auto;
    m.error = "";
    m.controller = new AbortController();
    m.control = window.TMD_SCANNER.createControl();
    m.meter = createMeter(m.control);
    m.queue = chosen.map((c) => c.peerId);
    m.status = Object.fromEntries(chosen.map((c) => [c.peerId, { phase: "wait", done: 0 }]));
    const ticker = setInterval(scheduleMulti, 1000);
    scheduleMulti();

    const signal = m.controller.signal;
    let root = null;
    try {
      root = await rootPromise;
    } catch (err) {
      clearInterval(ticker);
      m.running = false;
      m.status = {};
      m.queue = null;
      if (err?.name !== "AbortError") m.error = "Papka tanlanmadi: " + (err?.message || err);
      renderMulti();
      return;
    }
    const scanOnly = auto && S("download.saveMode") === "folder" && !root;
    const summary = [];

    for (const c of chosen) {
      const st = m.status[c.peerId];
      if (signal.aborted) { st.phase = "stopped"; continue; }
      m.current = c.peerId;
      const cp = window.TMD_SETTINGS.getCheckpoint(c.peerId) || c;
      const title = cp.title || (await api.peerTitle(c.peerId)) || chTitle(c);
      try {
        Object.assign(st, { phase: "scan", scanned: 0, found: 0 });
        scheduleMulti();
        const found = await api.scan({
          peerId: c.peerId,
          since: cp,
          limit: 100000,
          signal,
          filter: { dateFrom: S("scan.dateFrom"), dateTo: S("scan.dateTo"), pageDelay: S("scan.pageDelay") },
          onProgress: ({ scanned, items }) => {
            st.scanned = scanned;
            st.found = items.length;
            scheduleMulti();
          }
        });
        const fresh = found.filter((it) => allowed(it) && !window.TMD_SETTINGS.isDownloaded(it.key));
        if (!fresh.length) {
          Object.assign(st, { phase: "none", at: Date.now() });
          delete m.pending[c.peerId];
          scheduleMulti();
          continue;
        }
        if (scanOnly) {
          Object.assign(st, { phase: "pending", found: fresh.length });
          m.pending[c.peerId] = fresh.length;
          summary.push(`${title}: ${fresh.length}`);
          scheduleMulti();
          continue;
        }

        const target = await window.TMD_SCANNER.targetFor(root, title);
        Object.assign(st, { phase: "download", total: fresh.length, finished: 0, done: 0, failed: 0, skipped: 0 });
        scheduleMulti();
        const tally = () => {
          st.finished = fresh.filter((it) => ["done", "failed", "skipped", "cancelled"].includes(it.state)).length;
          st.done = fresh.filter((it) => it.state === "done").length;
          st.failed = fresh.filter((it) => it.state === "failed").length;
          st.skipped = fresh.filter((it) => it.state === "skipped").length;
        };
        await window.TMD_SCANNER.runQueue({
          items: fresh, adapter: api, channel: title, target, signal,
          control: m.control, peer: { id: c.peerId, title },
          onUpdate: (item, progressOnly) => { if (!progressOnly) { tally(); scheduleMulti(); } }
        });
        tally();
        const next = window.TMD_SCANNER.nextCheckpoint(fresh, window.TMD_SETTINGS.getStoredCheckpoint(c.peerId), "api", title);
        if (next) window.TMD_SETTINGS.setCheckpoint(c.peerId, next);
        st.phase = signal.aborted ? "stopped" : "ok";
        if (!st.failed) delete m.pending[c.peerId];
        if (st.done) summary.push(`${title}: +${st.done}`);
      } catch (err) {
        if (err?.name === "AbortError") st.phase = "stopped";
        else { st.phase = "error"; st.error = err?.message || String(err); U().logger.error(`Kanal ${title}: ${st.error}`); }
      }
      scheduleMulti();
    }
    clearInterval(ticker);
    m.running = false;
    m.current = null;
    if (summary.length) {
      const files = chosen.reduce((a, c) => a + (m.status[c.peerId]?.done || 0), 0);
      window.TMD_SETTINGS.notify(
        scanOnly ? `${pendingTotal()} ta yangi media topildi` : `${files} ta yangi fayl yuklandi`,
        summary.slice(0, 6).join("\n") + (scanOnly ? "\nYuklash uchun panelni oching." : ""),
        { force: auto }
      );
    }
    renderViews();
    renderMulti();
  };

  const startMulti = () => {
    const m = state.multi;
    if (m.running) {
      m.controller?.abort();
      return;
    }
    const list = channelsList();
    const sel = multiSelected(list);
    const chosen = list.filter((c) => sel.has(c.peerId));
    if (!chosen.length || state.scanning || state.downloading) return;
    // Folder prompt must start inside the click
    runMulti(chosen, window.TMD_SCANNER.prepareRoot({ reuse: true }));
  };

  /* --------------------------- Automatic watching --------------------------- */

  const watch = { next: 0 };
  const checkWatchedNow = () => {
    watch.next = 1;
    watchTick();
  };
  const watchTick = () => {
    const ids = watchedSet();
    if (!ids.size || !multiAvailable()) return;
    if (!watch.next) watch.next = Date.now() + 60000; // first check a minute after Telegram loads
    if (Date.now() < watch.next) return;
    if (state.scanning || state.downloading || state.multi.running) return; // busy: retry on the next tick
    watch.next = Date.now() + Math.max(5, S("sync.watchMinutes")) * 60000;
    const list = channelsList().filter((c) => ids.has(c.peerId));
    if (!list.length) return;
    const rootPromise = S("download.saveMode") === "folder" ? window.TMD_SCANNER.silentRoot() : Promise.resolve(null);
    runMulti(list, rootPromise, { auto: true });
  };

  const setView = (view) => {
    if (state.view === view) return;
    state.view = view;
    renderAll();
  };

  const toggle = (open = !state.open) => {
    state.open = open;
    els.panel.hidden = !open;
    if (open) {
      if (!state.scanning && !state.downloading) {
        const before = state.peer?.id;
        refreshPeer();
        if (before && before !== state.peer?.id) { state.items = []; state.queue = null; state.selected.clear(); state.notice = ""; }
      }
      renderAll();
      els.scanBtn.focus();
    } else applyTheme();
  };

  /* ------------------------------ Mount ------------------------------ */

  const mount = () => {
    if (document.getElementById("tmd-scanner-host")) return;
    const host = document.createElement("div");
    host.id = "tmd-scanner-host";
    document.body.appendChild(host);
    shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${STYLES}</style>
    <div class="root">
      <button class="launcher" title="TeleVault — kanal skaneri (Alt+Shift+D)" aria-label="TeleVault kanal skanerini ochish">${icon("download", 21)}<span class="badge" hidden></span></button>
      <aside class="panel" hidden role="dialog" aria-label="TeleVault kanal skaneri">
        <header>
          <div class="who"><h2></h2><p></p></div>
          <button class="icon-btn" data-act="settings" title="Sozlamalar" aria-label="Sozlamalar">${icon("settings")}</button>
          <button class="icon-btn" data-act="close" title="Yopish" aria-label="Yopish">${icon("close")}</button>
        </header>
        <div class="views" hidden role="tablist">
          <button data-view="single" aria-pressed="true">Shu kanal</button>
          <button data-view="multi" aria-pressed="false">Kanallar <span></span></button>
        </div>
        <p class="mwatch multi" hidden></p>
        <div class="mhead multi">
          <label class="selall"><input type="checkbox" data-mall> Hammasini belgilash</label>
        </div>
        <p class="error multi" data-merror hidden></p>
        <div class="list multi" data-mlist role="list"></div>
        <footer class="multi">
          <div class="sum"><strong data-msum></strong><span data-mside></span></div>
          <div class="overall" data-moverall hidden><div></div></div>
          <div class="actions"><button class="primary" data-act="multi"></button></div>
        </footer>
        <div class="scanbar single">
          <div class="cp" hidden>
            <div class="ic">${icon("history", 17)}</div>
            <div style="min-width:0"><div class="t"></div><div class="m"></div></div>
            <button class="link" data-act="reset-cp" title="Bu kanal uchun oxirgi yuklash belgisini o'chirish">Tozalash</button>
          </div>
          <div class="scan-actions">
            <button class="primary" data-act="sync" hidden></button>
            <button class="primary" data-act="scan"></button>
          </div>
          <div class="progress-line" hidden><div></div></div>
          <p class="hint"></p>
        </div>
        <p class="error single" hidden></p>
        <p class="notice single" hidden></p>
        <div class="composition single" hidden><div class="bar"></div><div class="chips"></div></div>
        <div class="tools single">
          <input class="search" type="search" placeholder="Matn yoki fayl nomi bo'yicha qidirish" aria-label="Qidirish">
          <select aria-label="Tartib"><option value="new">Yangilari</option><option value="old">Eskilari</option><option value="big">Kattalari</option></select>
          <button class="ftoggle" data-act="filters" title="Filtrlar" aria-expanded="false"></button>
        </div>
        <div class="filters single" hidden>
          <label>Davomiylik, daq <span class="pair"><input type="number" min="0" data-f="scan.minDurationMin" placeholder="dan"> — <input type="number" min="0" data-f="scan.maxDurationMin" placeholder="gacha"></span></label>
          <label>Minimal hajm, MB <input type="number" min="0" data-f="scan.minSizeMB" placeholder="0"></label>
          <label>Kengaytmalar <input type="text" data-f="scan.extensions" placeholder="pdf, zip, mp3" spellcheck="false"></label>
          <label>Kalit so'zlar <input type="text" data-f="scan.keywords" placeholder="dars, #python" spellcheck="false"></label>
          <label>Forward <span class="seg2"><button value="all">Hammasi</button><button value="only">Faqat forward</button><button value="exclude">Forwardsiz</button></span></label>
          <div class="fx"><span class="hint">Davomiylik faqat video va audioga ta'sir qiladi.</span><button class="link" data-act="clear-filters">Tozalash</button></div>
        </div>
        <div class="tools single"><label class="selall"><input type="checkbox"> Ko'rinayotganlarning hammasini belgilash</label></div>
        <div class="list single" role="list"></div>
        <footer class="single" hidden>
          <div class="sum"><strong></strong><span></span></div>
          <div class="overall" hidden><div></div></div>
          <div class="actions">
            <button class="ghost" data-act="export" title="Skan natijasini JSON qilib saqlash">${icon("export", 16)} Ro'yxat</button>
            <button class="ghost" data-act="retry" hidden></button>
            <button class="ghost" data-act="pause" hidden></button>
            <button class="primary" data-act="download"></button>
          </div>
        </footer>
      </aside>
    </div>`;

    const $ = (s) => shadow.querySelector(s);
    els = {
      root: $(".root"), launcher: $(".launcher"), panel: $(".panel"),
      title: $(".who h2"), sub: $(".who p"),
      scanBtn: $('[data-act="scan"]'), scanHint: $(".scanbar .hint"), scanProgress: $(".progress-line"),
      syncBtn: $('[data-act="sync"]'), cp: $(".cp"), cpTitle: $(".cp .t"), cpMeta: $(".cp .m"), cpReset: $('[data-act="reset-cp"]'),
      notice: $(".notice.single"),
      views: $(".views"), viewBtns: shadow.querySelectorAll(".views button"), viewCount: $('.views [data-view="multi"] span'),
      mall: $("[data-mall]"), mlist: $("[data-mlist]"), merror: $("[data-merror]"), msum: $("[data-msum]"), mside: $("[data-mside]"),
      moverall: $("[data-moverall]"), moverallFill: $("[data-moverall] > div"), mBtn: $('[data-act="multi"]'),
      error: $(".error.single"), comp: $(".composition"), bar: $(".bar"), chips: $(".chips"),
      search: $(".search"), sort: $("select"), selall: $(".tools .selall"), selallBox: $(".tools .selall input"),
      list: $(".list.single"), footer: $("footer.single"), sumMain: $("footer.single .sum strong"), sumSide: $("footer.single .sum span"),
      overall: $("footer.single .overall"), overallFill: $("footer.single .overall > div"),
      dlBtn: $('[data-act="download"]'), exportBtn: $('[data-act="export"]'),
      pauseBtn: $('[data-act="pause"]'), retryBtn: $('[data-act="retry"]'), badge: $(".launcher .badge"),
      mwatch: $(".mwatch"), ftoggle: $('[data-act="filters"]'), filters: $(".filters")
    };

    els.launcher.onclick = () => toggle(true);
    $('[data-act="close"]').onclick = () => toggle(false);
    $('[data-act="settings"]').onclick = () => window.TMD_SETTINGS.openOptions();
    els.scanBtn.onclick = startScan;
    els.syncBtn.onclick = startSync;
    els.cpReset.onclick = resetCheckpoint;
    els.viewBtns.forEach((b) => (b.onclick = () => setView(b.dataset.view)));
    els.mBtn.onclick = startMulti;
    els.mwatch.addEventListener("click", (e) => { if (e.target.closest('[data-act="watch-now"]')) checkWatchedNow(); });
    els.pauseBtn.onclick = togglePause;
    els.retryBtn.onclick = retryFailed;
    els.ftoggle.onclick = () => { state.filtersOpen = !state.filtersOpen; renderFilters(); };
    els.filters.addEventListener("input", (e) => {
      const el = e.target.closest("[data-f]");
      if (!el) return;
      patchFilter(el.dataset.f, el.type === "number" ? Math.max(0, Number(el.value) || 0) : el.value);
    });
    els.filters.addEventListener("click", (e) => {
      const b = e.target.closest(".seg2 button");
      if (b) { window.TMD_SETTINGS.patch("scan.forwarded", b.value); return; }
      if (e.target.closest('[data-act="clear-filters"]')) {
        clearTimeout(filterTimer);
        for (const [p, v] of [["scan.minDurationMin", 0], ["scan.maxDurationMin", 0], ["scan.minSizeMB", 0], ["scan.extensions", ""], ["scan.keywords", ""], ["scan.forwarded", "all"]]) {
          window.TMD_SETTINGS.patch(p, v);
        }
        els.filters.querySelectorAll("[data-f]").forEach((el) => (el.value = ""));
      }
    });
    els.mall.onchange = () => {
      const list = channelsList();
      state.multi.selected = new Set(els.mall.checked ? list.map((c) => c.peerId) : []);
      renderMulti();
    };
    els.mlist.onclick = (e) => {
      const row = e.target.closest(".crow");
      if (row && e.target.closest("[data-watch]")) { toggleWatch(row.dataset.peer); return; }
      if (!row || state.multi.running) return;
      const sel = multiSelected(channelsList());
      const id = row.dataset.peer;
      sel.has(id) ? sel.delete(id) : sel.add(id);
      renderMulti();
    };
    els.dlBtn.onclick = startDownload;
    els.exportBtn.onclick = exportList;
    els.search.oninput = () => { state.query = els.search.value; state.renderLimit = 300; renderList(); renderFooter(); };
    els.sort.onchange = () => { state.sort = els.sort.value; renderList(); };
    els.selallBox.onchange = () => {
      const list = visible();
      list.forEach((it) => (els.selallBox.checked ? state.selected.add(it.key) : state.selected.delete(it.key)));
      renderList();
      renderFooter();
    };
    els.chips.onclick = (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      const t = chip.dataset.type;
      state.active.has(t) ? state.active.delete(t) : state.active.add(t);
      renderComposition();
      renderList();
      renderFooter();
    };
    els.list.onclick = (e) => {
      const cancel = e.target.closest("[data-cancel]");
      if (cancel) {
        const key = cancel.closest(".row")?.dataset.key;
        const item = (state.queue || []).find((it) => it.key === key);
        if (item && state.control) {
          state.control.cancel(item);
          scheduleRender();
        }
        return;
      }
      const prio = e.target.closest("[data-prio]");
      if (prio) {
        const key = prio.closest(".row")?.dataset.key;
        const item = (state.queue || []).find((it) => it.key === key);
        if (item && state.control) {
          state.control.prioritize(item);
          item.prioritized = true;
          scheduleRender();
        }
        return;
      }
      if (e.target.closest("[data-more]")) {
        state.renderLimit += 300;
        renderList();
        return;
      }
      const row = e.target.closest(".row");
      if (!row || state.downloading) return;
      const key = row.dataset.key;
      state.selected.has(key) ? state.selected.delete(key) : state.selected.add(key);
      const on = state.selected.has(key);
      row.setAttribute("aria-checked", on);
      row.querySelector("input").checked = on;
      els.selallBox.checked = visible().every((it) => state.selected.has(it.key));
      renderFooter();
    };
    shadow.addEventListener("keydown", (e) => {
      e.stopPropagation(); // keep Telegram shortcuts from reacting to typing in the panel
      if (e.key === "Escape") toggle(false);
    });

    window.addEventListener("keydown", (e) => {
      if (e.altKey && e.shiftKey && e.code === "KeyD") {
        e.preventDefault();
        toggle();
      }
    });

    window.TMD_SETTINGS.onChange(() => {
      if (!state.open) return applyTheme();
      if (!state.scanning && !state.downloading && state.peer) state.checkpoint = window.TMD_SETTINGS.getCheckpoint(state.peer.id);
      renderAll();
    });
    setInterval(watchTick, 30000);
    setTimeout(watchTick, 5000);
    window.addEventListener("hashchange", () => {
      if (!state.open || state.scanning || state.downloading) return;
      setTimeout(() => {
        const before = state.peer?.id;
        refreshPeer();
        if (before !== state.peer?.id) { state.items = []; state.queue = null; state.selected.clear(); state.notice = ""; state.error = ""; }
        renderAll();
      }, 400);
    });
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    applyTheme();
  };

  window.TMD_PANEL = { mount, toggle, checkWatchedNow };
})();
