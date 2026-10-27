/**
 * Telegram Media Downloader - Settings mirror in the page (MAIN world)
 */
(() => {
  let values = globalThis.TMD_MERGE(globalThis.TMD_DEFAULTS, {});
  let history = new Set();
  let checkpoints = {};
  const listeners = new Set();
  const statQueue = [];
  let statTimer;
  const notify = () =>
    listeners.forEach((fn) => {
      try { fn(values); } catch (err) { console.error(err); }
    });

  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), values);

  window.addEventListener("message", (e) => {
    if (e.source !== window || e.data?.__tmd !== "bridge") return;
    if (e.data.type === "settings") {
      values = globalThis.TMD_MERGE(globalThis.TMD_DEFAULTS, e.data.data || {});
      notify();
    } else if (e.data.type === "history" && Array.isArray(e.data.data)) {
      history = new Set(e.data.data);
    } else if (e.data.type === "checkpoints" && e.data.data && typeof e.data.data === "object") {
      checkpoints = e.data.data;
      notify();
    }
  });

  const post = (type, data) => window.postMessage({ __tmd: "page", type, data }, location.origin);

  /**
   * Highest message id already downloaded in this chat, taken from the download history.
   * Lets channels downloaded before checkpoints existed use "only new" right away (Web K keys: `${peerId}_${mid}`).
   */
  const checkpointFromHistory = (peerId) => {
    const prefix = peerId + "_";
    let mid = 0;
    let count = 0;
    for (const k of history) {
      if (!k.startsWith(prefix)) continue;
      const n = Number(k.slice(prefix.length));
      if (!Number.isFinite(n)) continue;
      count++;
      if (n > mid) mid = n;
    }
    return mid ? { mid, count, fromHistory: true } : null;
  };

  window.TMD_SETTINGS = {
    get,
    all: () => values,
    onChange: (fn) => listeners.add(fn),
    openOptions: () => post("openOptions"),
    isDownloaded: (key) => history.has(key),
    markDownloaded: (keys) => {
      keys.forEach((k) => history.add(k));
      post("markDownloaded", keys);
    },
    /** Changes one setting from the page (persisted through the bridge). */
    patch: (path, value) => post("patchSettings", { path, value }),
    /** System notification — only when the user isn't looking at the tab. */
    notify: (title, message, { force = false } = {}) => {
      if (!get("ui.notify")) return;
      if (!force && !document.hidden && document.hasFocus()) return;
      post("notify", { title, message });
    },
    /** Download statistics, batched so a big queue doesn't hammer storage. */
    recordStat: (peer, item) => {
      if (!peer?.id) return;
      statQueue.push({ peerId: String(peer.id), title: peer.title || "", type: item.type, bytes: item.size || 0 });
      clearTimeout(statTimer);
      statTimer = setTimeout(() => post("addStats", statQueue.splice(0)), 1500);
    },
    getCheckpoint: (peerId) => {
      if (!peerId) return null;
      const cp = checkpoints[peerId];
      if (cp?.cleared) return null; // user reset this channel: don't fall back to history
      return cp || checkpointFromHistory(peerId);
    },
    /**
     * Every chat with a checkpoint (stored, or derived from Web K download history), newest first.
     * Only numeric Web K peer ids — those are the ones that can be read without opening the chat.
     */
    allCheckpoints: () => {
      const out = new Map();
      for (const [peerId, cp] of Object.entries(checkpoints)) {
        if (cp && !cp.cleared && /^-?\d+$/.test(peerId)) out.set(peerId, { peerId, ...cp });
      }
      const seen = new Set();
      for (const k of history) {
        const i = k.lastIndexOf("_");
        const peerId = k.slice(0, i);
        if (i <= 0 || seen.has(peerId) || out.has(peerId) || checkpoints[peerId]?.cleared || !/^-?\d+$/.test(peerId)) continue;
        seen.add(peerId);
        const cp = checkpointFromHistory(peerId);
        if (cp) out.set(peerId, { peerId, ...cp });
      }
      return [...out.values()].sort((a, b) => (b.at || 0) - (a.at || 0));
    },
    /** Only an explicitly stored checkpoint (no history fallback) — the base for moving it forward. */
    getStoredCheckpoint: (peerId) => {
      const cp = peerId ? checkpoints[peerId] : null;
      return cp && !cp.cleared ? cp : null;
    },
    setCheckpoint: (peerId, value) => {
      if (!peerId) return;
      if (value) checkpoints[peerId] = value;
      else delete checkpoints[peerId];
      post("setCheckpoint", { peerId, value: value || null });
      notify();
    }
  };

  post("hello");
})();
