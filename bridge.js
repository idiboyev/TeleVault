/**
 * TeleVault — Storage bridge (ISOLATED world)
 * Copyright (c) 2026 Adham Idiboyev (@SuperMix)
 * The page (MAIN world) scripts cannot use chrome.* APIs, so this script relays
 * settings, download history, checkpoints and stats between chrome.storage and the page.
 */
(() => {
  const HISTORY_LIMIT = 60000;
  const CLOUD = "cp:"; // chrome.storage.sync keys holding checkpoints, one per chat
  const send = (type, data, id) =>
    window.postMessage({ __tmd: "bridge", type, data, id }, location.origin);

  const getRawSettings = async () => (await chrome.storage.sync.get("settings")).settings || {};
  const getSettings = async () => globalThis.TMD_MERGE(globalThis.TMD_DEFAULTS, await getRawSettings());
  const getHistory = async () => (await chrome.storage.local.get("history")).history || {};
  const getCheckpoints = async () => (await chrome.storage.local.get("checkpoints")).checkpoints || {};
  const getStats = async () => (await chrome.storage.local.get("stats")).stats || {};

  const pushSettings = async () => send("settings", await getSettings());
  const pushCheckpoints = async () => send("checkpoints", await getCheckpoints());
  const pushHistory = async () => send("history", Object.keys(await getHistory()));

  /* -------- Checkpoints in the cloud (compact, so hundreds of chats fit in sync quota) -------- */
  const compact = (cp) =>
    cp.cleared
      ? { x: 1, a: cp.at || Date.now() }
      : { m: cp.mid || 0, d: cp.date || 0, t: String(cp.title || "").slice(0, 48), a: cp.at || 0, c: cp.count || 0 };
  const expand = (v) =>
    v.x ? { cleared: true, at: v.a } : { ...(v.m ? { mid: v.m } : {}), date: v.d, title: v.t, at: v.a, count: v.c };

  const cloudOn = async () => (await getSettings()).sync.cloud;

  const pushToCloud = async (peerId, value) => {
    if (!(await cloudOn())) return;
    try {
      await chrome.storage.sync.set({ [CLOUD + peerId]: compact(value || { cleared: true }) });
    } catch (e) {
      console.warn("[TeleVault] cloud checkpoint:", e?.message || e);
    }
  };

  /** Newer checkpoint wins (by its "at" time). */
  const mergeFromCloud = async (entries) => {
    if (!(await cloudOn())) return;
    const local = await getCheckpoints();
    let changed = false;
    for (const [key, v] of Object.entries(entries)) {
      if (!key.startsWith(CLOUD) || !v || typeof v !== "object") continue;
      const peerId = key.slice(CLOUD.length);
      const remote = expand(v);
      if (!local[peerId] || (remote.at || 0) > (local[peerId].at || 0)) {
        local[peerId] = remote;
        changed = true;
      }
    }
    if (changed) await chrome.storage.local.set({ checkpoints: local });
  };

  const setPath = (o, path, v) => {
    const keys = path.split(".");
    const last = keys.pop();
    keys.reduce((a, k) => (a[k] && typeof a[k] === "object" ? a[k] : (a[k] = {})), o)[last] = v;
  };

  // Storage updates are read-modify-write: run them one at a time so none get lost
  let chain = Promise.resolve();
  const serial = (fn) => (chain = chain.then(fn, fn));

  window.addEventListener("message", (e) => {
    if (e.source !== window || e.data?.__tmd !== "page") return;
    serial(() => handle(e.data));
  });

  const handle = async ({ type, data }) => {
    try {
      if (type === "hello") {
        await pushSettings();
        await pushHistory();
        await pushCheckpoints();
      } else if (type === "openOptions") {
        chrome.runtime.sendMessage({ type: "openOptions" });
      } else if (type === "notify" && data?.title) {
        chrome.runtime.sendMessage({ type: "notify", title: data.title, message: data.message || "" });
      } else if (type === "patchSettings" && data && typeof data.path === "string" && /^(ui|scan|download|sync)\.[\w.]+$/.test(data.path)) {
        const raw = await getRawSettings();
        setPath(raw, data.path, data.value);
        await chrome.storage.sync.set({ settings: globalThis.TMD_MERGE(globalThis.TMD_DEFAULTS, raw) });
      } else if (type === "markDownloaded" && Array.isArray(data)) {
        const history = await getHistory();
        const now = Date.now();
        data.slice(0, 2000).forEach((k) => typeof k === "string" && (history[k] = now));
        let keys = Object.keys(history);
        if (keys.length > HISTORY_LIMIT) {
          keys.sort((a, b) => history[a] - history[b]);
          keys.slice(0, keys.length - HISTORY_LIMIT).forEach((k) => delete history[k]);
        }
        await chrome.storage.local.set({ history });
      } else if (type === "setCheckpoint" && data && typeof data.peerId === "string") {
        const checkpoints = await getCheckpoints();
        if (data.value) checkpoints[data.peerId] = data.value;
        else delete checkpoints[data.peerId];
        await chrome.storage.local.set({ checkpoints });
        pushToCloud(data.peerId, data.value);
      } else if (type === "addStats" && Array.isArray(data)) {
        const stats = await getStats();
        for (const r of data.slice(0, 2000)) {
          if (!r || typeof r.peerId !== "string") continue;
          const s = (stats[r.peerId] ||= { title: "", files: 0, bytes: 0, types: {}, first: Date.now(), last: 0 });
          if (r.title) s.title = String(r.title).slice(0, 80);
          s.files++;
          s.bytes += Number(r.bytes) || 0;
          const t = (s.types[r.type] ||= { n: 0, bytes: 0 });
          t.n++;
          t.bytes += Number(r.bytes) || 0;
          s.last = Date.now();
        }
        await chrome.storage.local.set({ stats });
      }
    } catch (err) {
      console.error("[TeleVault] bridge:", err);
    }
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.settings) pushSettings();
    if (area === "sync") {
      const cloud = {};
      for (const [k, c] of Object.entries(changes)) if (k.startsWith(CLOUD) && c.newValue) cloud[k] = c.newValue;
      if (Object.keys(cloud).length) serial(() => mergeFromCloud(cloud));
    }
    if (area === "local" && changes.history) pushHistory();
    if (area === "local" && changes.checkpoints) pushCheckpoints();
  });

  pushSettings();
  pushHistory();
  pushCheckpoints();
  // Pull other computers' checkpoints, and upload local ones the cloud doesn't have yet
  chrome.storage.sync.get(null).then((all) => serial(async () => {
    await mergeFromCloud(all);
    if (!(await cloudOn())) return;
    const missing = {};
    for (const [id, cp] of Object.entries(await getCheckpoints())) if (!all[CLOUD + id]) missing[CLOUD + id] = compact(cp);
    if (Object.keys(missing).length) await chrome.storage.sync.set(missing);
  })).catch(() => {});
})();
