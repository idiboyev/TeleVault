/**
 * Telegram Media Downloader - Channel scanner & bulk download queue
 *
 * Two adapters:
 *  - webkApi: Web K exposes its managers on window, so we read channel history
 *             directly (no scrolling) and get exact sizes, names and dates.
 *  - viewer:  Web A (and Web K fallback) — opens the media viewer and walks to
 *             older media one by one, collecting each item's URL.
 * Item shape: { key, id, type, date, size, duration, fileName, mime, caption, ... }
 */
(() => {
  const U = () => window.TMD_UTILS;
  const S = (p) => window.TMD_SETTINGS.get(p);
  const abortErr = () => new DOMException("Aborted", "AbortError");

  const headerTitle = () => {
    const el =
      document.querySelector(".chat-info .peer-title") ||
      document.querySelector(".MiddleHeader .fullName") ||
      document.querySelector(".MiddleHeader h3") ||
      document.querySelector(".chat-info-wrapper .title");
    return (el?.textContent || document.title || "Telegram").trim();
  };

  /* ===================== Web K — internal API adapter ===================== */

  const docType = (doc) => {
    const t = doc.type;
    if (t === "video") return "video";
    if (t === "gif") return "gif";
    if (t === "round") return "round";
    if (t === "voice") return "voice";
    if (t === "audio") return "audio";
    if (t === "sticker") return null;
    if (t === "photo") return "photo";
    const mime = doc.mime_type || "";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    return "document";
  };

  const biggestPhotoSize = (photo) => {
    const sizes = (photo.sizes || []).filter((s) => "w" in s && "h" in s);
    if (!sizes.length) return null;
    return sizes.reduce((a, b) => (b.w * b.h > a.w * a.h ? b : a));
  };

  const webkApi = {
    name: "api",
    label: "To'liq skan",
    available() {
      return (
        U().isWebK() &&
        !!window.rootScope?.managers?.appMessagesManager &&
        !!window.appImManager?.chat?.peerId
      );
    },
    peer() {
      return { id: String(window.appImManager.chat.peerId), title: headerTitle() };
    },
    toItem(msg, peerId) {
      const media = msg?.media;
      if (!media) return null;
      const base = {
        key: `${peerId}_${msg.mid}`,
        id: msg.id ?? msg.mid,
        mid: msg.mid,
        date: msg.date,
        caption: msg.message || "",
        groupId: msg.grouped_id ? String(msg.grouped_id) : "",
        fwd: !!msg.fwd_from
      };
      if (media._ === "messageMediaPhoto" && media.photo?._ === "photo") {
        const size = biggestPhotoSize(media.photo);
        if (!size) return null;
        return {
          ...base, type: "photo", mime: "image/jpeg", fileId: "p" + media.photo.id,
          size: size.size || Math.max(0, ...(size.sizes || [])),
          width: size.w, height: size.h,
          _photo: media.photo, _thumb: size
        };
      }
      if (media._ === "messageMediaDocument" && media.document?._ === "document") {
        const doc = media.document;
        const type = docType(doc);
        if (!type) return null;
        const attr = (doc.attributes || []).find((a) => a.duration);
        return {
          ...base, type, fileId: "d" + doc.id,
          mime: doc.mime_type || "",
          size: Number(doc.size) || 0,
          duration: doc.duration || attr?.duration || 0,
          fileName: doc.file_name || "",
          _doc: doc
        };
      }
      return null;
    },
    async scan({ limit, signal, onProgress, filter, since, peerId: forPeer }) {
      // forPeer lets "update all channels" read a chat that isn't open
      const peerId = forPeer != null ? Number(forPeer) : window.appImManager.chat.peerId;
      const sinceMid = Number(since?.mid) || 0; // "only new": stop at the last downloaded post
      const m = window.rootScope.managers.appMessagesManager;
      const from = filter.dateFrom ? Date.parse(filter.dateFrom) / 1000 : 0;
      const to = filter.dateTo ? Date.parse(filter.dateTo) / 1000 + 86400 : Infinity;
      const seen = new Set();
      const items = [];
      let offsetId = 0;
      let scanned = 0;

      while (scanned < limit) {
        if (signal.aborted) throw abortErr();
        const res = await m.getHistory({ peerId, offsetId, limit: 100, addOffset: 0 });
        const mids = (res?.history || []).filter((mid) => !seen.has(mid));
        if (!mids.length) break;

        let messages = Array.isArray(res.messages) && res.messages.length ? res.messages : null;
        if (!messages) messages = await Promise.all(mids.map((mid) => m.getMessageByPeer(peerId, mid)));

        let reachedFrom = false;
        for (const msg of messages) {
          if (!msg || seen.has(msg.mid)) continue;
          seen.add(msg.mid);
          if (sinceMid && msg.mid <= sinceMid) { reachedFrom = true; continue; }
          scanned++;
          if (msg.date < from) { reachedFrom = true; continue; }
          if (msg.date > to) continue;
          const item = this.toItem(msg, peerId);
          if (item) items.push(item);
          if (scanned >= limit) break;
        }
        mids.forEach((mid) => seen.add(mid));
        offsetId = Math.min(...mids);
        onProgress({ scanned, found: items.length, items });
        if (reachedFrom) break;
        await U().sleep(filter.pageDelay);
      }
      return annotateAlbums(items);
    },
    /** Chat title for a peer that isn't open (used by "update all channels"). */
    async peerTitle(peerId) {
      try {
        const id = Number(peerId);
        const m = window.rootScope.managers;
        if (id < 0) {
          const chat = await m.appChatsManager.getChat(-id);
          if (chat?.title) return chat.title;
        } else {
          const user = await m.appUsersManager.getUser(id);
          const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
          if (name) return name;
        }
      } catch (e) {}
      return "";
    },
    canResume: (item) => !!item._doc,
    /** Small preview as a blob URL (null if the media has none). */
    async thumb(item) {
      const sizes = ((item._photo ? item._photo.sizes : item._doc?.thumbs) || []).filter((s) => "w" in s && s.w);
      if (!sizes.length) return null;
      const small = sizes.slice().sort((a, b) => a.w - b.w).find((s) => s.w >= 90) || sizes[sizes.length - 1];
      const blob = await window.appDownloadManager.downloadMedia({ media: item._photo || item._doc, thumb: small });
      return blob?.size ? URL.createObjectURL(blob) : null;
    },
    streamUrl(doc) {
      const options = {
        dcId: doc.dc_id,
        location: {
          _: "inputDocumentFileLocation",
          id: doc.id,
          access_hash: doc.access_hash,
          file_reference: doc.file_reference
        },
        size: doc.size,
        mimeType: doc.mime_type || "application/octet-stream",
        fileName: doc.file_name
      };
      return new URL("stream/" + encodeURIComponent(JSON.stringify(options)), location.href).href;
    },
    async download(item, { writable, signal, onProgress, offset = 0, gate }) {
      const adm = window.appDownloadManager;
      if (item._photo) {
        const blob = await adm.downloadMedia({ media: item._photo, thumb: item._thumb });
        if (signal.aborted) throw abortErr();
        onProgress(blob.size, blob.size);
        if (writable) await writable.write(blob);
        return blob;
      }
      try {
        const r = await window.TMD_DOWNLOADER.fetchMedia(this.streamUrl(item._doc), { writable, signal, onProgress, offset, gate });
        return r.blob;
      } catch (err) {
        if (err?.name === "AbortError" || writable) throw err;
        U().logger.error("Stream failed, using Telegram downloader: " + (err?.message || err));
        // Fallback: let Telegram's own download manager fetch the whole file
        const blob = await adm.downloadMedia({ media: item._doc });
        onProgress(blob.size, blob.size);
        return blob;
      }
    }
  };

  /* ===================== Media viewer walking adapter ===================== */

  const parseUrlMeta = (url) => {
    const meta = {};
    try {
      const u = new URL(url, location.href);
      const prog = /progressive\/document(\d+)/.exec(u.pathname);
      if (prog) {
        meta.docId = prog[1];
        if (u.searchParams.get("fileSize")) meta.size = Number(u.searchParams.get("fileSize"));
        if (u.searchParams.get("mimeType")) meta.mime = u.searchParams.get("mimeType");
      }
      const stream = /\/stream\/(.+)$/.exec(u.pathname);
      if (stream) {
        const info = JSON.parse(decodeURIComponent(stream[1]));
        meta.docId = String(info.location?.id ?? "");
        meta.size = Number(info.size) || undefined;
        meta.mime = info.mimeType;
        meta.fileName = info.fileName;
      }
    } catch (e) {}
    return meta;
  };

  const viewerDom = () => {
    if (U().isWebK()) {
      const root = document.querySelector(".media-viewer-whole");
      if (!root) return null;
      const movers = root.querySelectorAll(".media-viewer-movers .media-viewer-aspecter");
      const media = movers[movers.length - 1];
      return {
        root,
        video: media?.querySelector("video"),
        img: media?.querySelector("img.thumbnail, img.media-photo, img"),
        date: root.querySelector(".media-viewer-date")?.textContent || "",
        caption: root.querySelector(".media-viewer-caption")?.textContent || "",
        prev: root.querySelector(".media-viewer-switcher-prev:not(.hide)")
      };
    }
    const root = document.getElementById("MediaViewer");
    const slide = root?.querySelector(".MediaViewerSlide--active");
    if (!slide) return null;
    const imgs = slide.querySelectorAll(".MediaViewerContent img");
    return {
      root,
      video: slide.querySelector("video"),
      img: imgs[imgs.length - 1],
      date: root.querySelector(".SenderInfo .date")?.textContent || "",
      caption: root.querySelector(".media-viewer-footer-content")?.textContent || "",
      prev: root.querySelector(".navigation.prev")
    };
  };

  const openLatestMedia = () => {
    const sel = U().isWebK()
      ? ".bubbles-inner .bubble .media-container, .bubbles .bubble .media-container"
      : ".MessageList .media-inner.interactive";
    const all = document.querySelectorAll(sel);
    const target = all[all.length - 1];
    if (!target) return false;
    target.click();
    return true;
  };

  const waitFor = async (fn, timeout, signal, step = 150) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (signal?.aborted) throw abortErr();
      const v = fn();
      if (v) return v;
      await U().sleep(step);
    }
    return null;
  };

  const viewer = {
    name: "viewer",
    label: "Ko'ruvchi orqali",
    available: () => true,
    peer() {
      return { id: location.hash || location.pathname, title: headerTitle() };
    },
    readCurrent() {
      const v = viewerDom();
      if (!v) return null;
      const videoUrl = U().getMediaSource(v.video);
      const imgUrl = v.img && v.img.complete && v.img.naturalWidth ? U().getMediaSource(v.img) : "";
      const url = videoUrl || imgUrl;
      if (!url) return { pending: true, v };
      const meta = parseUrlMeta(url);
      const isGif = !!v.video && v.video.loop && !v.video.controls && !v.root.querySelector(".VideoPlayerControls, .ckin__controls");
      const type = v.video ? (isGif ? "gif" : "video") : "photo";
      const sig = meta.docId || `${type}|${v.date}|${v.caption.slice(0, 80)}|${v.img?.naturalWidth || 0}`;
      return {
        v,
        sig,
        item: {
          key: "v_" + U().hashCode(sig + "|" + this.peer().id).toString(36),
          fileId: meta.docId ? "d" + meta.docId : "",
          id: meta.docId || U().hashCode(sig).toString(36),
          type,
          url,
          dateText: v.date.trim(),
          date: parseViewerDate(v.date),
          caption: v.caption.trim(),
          size: meta.size || 0,
          mime: meta.mime || (type === "photo" ? "image/jpeg" : "video/mp4"),
          fileName: meta.fileName || "",
          width: v.img?.naturalWidth
        }
      };
    },
    async scan({ limit, signal, onProgress, filter, since }) {
      const sinceDate = Number(since?.date) || 0;
      let knownInRow = 0;
      if (!viewerDom()) {
        if (!openLatestMedia()) throw new Error("Chatda media topilmadi. Biror rasm yoki videoni oching va qayta urinib ko'ring.");
        await waitFor(() => viewerDom(), 6000, signal);
      }
      const items = [];
      const seen = new Set();
      let scanned = 0;
      let lastSig = null;

      while (scanned < limit) {
        // Wait for the current slide's media to resolve
        const cur = await waitFor(() => {
          const c = this.readCurrent();
          return c && !c.pending && c.sig !== lastSig ? c : null;
        }, 12000, signal);
        if (!cur) break;
        await U().sleep(250); // let the full-size photo replace the preview
        const settled = this.readCurrent();
        const c = settled && !settled.pending && settled.sig === cur.sig ? settled : cur;

        lastSig = c.sig;
        scanned++;
        if (!seen.has(c.item.key)) {
          seen.add(c.item.key);
          const d = c.item.date;
          const from = filter.dateFrom ? Date.parse(filter.dateFrom) / 1000 : 0;
          if (d && from && d < from) break;
          if (since) {
            // Viewer dates are minute-precise, so allow one minute of overlap
            if (d && sinceDate && d < sinceDate - 60) break;
            if (window.TMD_SETTINGS.isDownloaded(c.item.key)) {
              if (++knownInRow >= 3) break; // reached the part that is already on disk
            } else knownInRow = 0;
          }
          items.push(c.item);
        }
        onProgress({ scanned, found: items.length, items });

        const prev = viewerDom()?.prev;
        if (!prev) break;
        prev.click();
        await U().sleep(filter.pageDelay);
      }
      return items;
    },
    canResume: (item) => !!item.url,
    thumb: async (item) => (item.type === "photo" ? item.url : null),
    async download(item, { writable, signal, onProgress, offset = 0, gate }) {
      const r = await window.TMD_DOWNLOADER.fetchMedia(item.url, { writable, signal, onProgress, offset, gate });
      return r.blob;
    }
  };

  /**
   * Marks posts of the same album. albumId comes from Telegram's grouped_id, so an album split
   * by a checkpoint still lands in the same {album} folder on the next run.
   * albumIndex / albumSize count only the album parts found in this scan.
   */
  const annotateAlbums = (items) => {
    const groups = new Map();
    for (const it of items) {
      if (!it.groupId) continue;
      if (!groups.has(it.groupId)) groups.set(it.groupId, []);
      groups.get(it.groupId).push(it);
    }
    for (const [groupId, list] of groups) {
      list.sort((a, b) => a.mid - b.mid);
      const albumId = U().hashCode(groupId).toString(36);
      const albumCaption = list.find((it) => it.caption)?.caption || "";
      list.forEach((it) => { if (!it.caption) it.albumCaption = albumCaption; });
      list.forEach((it, i) => {
        it.albumId = albumId;
        it.albumIndex = i + 1;
        it.albumSize = list.length;
      });
    }
    return items;
  };

  // "12 October 2026 at 14:05", "Oct 12, 2026, 2:05 PM", "Today at 10:00" ...
  const parseViewerDate = (text) => {
    if (!text) return 0;
    const t = text.replace(/\s+at\s+/i, " ").replace(/,/g, " ").trim();
    const now = new Date();
    const tm = /(\d{1,2}):(\d{2})/.exec(t);
    if (/^today/i.test(t) || /^yesterday/i.test(t)) {
      const d = new Date(now);
      if (/^yesterday/i.test(t)) d.setDate(d.getDate() - 1);
      if (tm) d.setHours(+tm[1], +tm[2], 0, 0);
      return Math.floor(d / 1000);
    }
    const parsed = Date.parse(t);
    if (!isNaN(parsed)) return Math.floor(parsed / 1000);
    const parsedYear = Date.parse(t + " " + now.getFullYear());
    return isNaN(parsedYear) ? 0 : Math.floor(parsedYear / 1000);
  };

  const pickAdapter = () => (webkApi.available() ? webkApi : viewer);

  /* ============================== Queue ============================== */

  /* ---------- Remembered download folder (IndexedDB keeps FileSystemDirectoryHandle) ---------- */

  const folderStore = (() => {
    const open = () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("tmd-folders", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("handles");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    const tx = async (mode, fn) => {
      const db = await open();
      return new Promise((resolve, reject) => {
        const t = db.transaction("handles", mode);
        const r = fn(t.objectStore("handles"));
        t.oncomplete = () => { db.close(); resolve(r?.result); };
        t.onerror = () => { db.close(); reject(t.error); };
      });
    };
    return {
      get: () => tx("readonly", (st) => st.get("root")).catch(() => null),
      set: (h) => tx("readwrite", (st) => st.put(h, "root")).catch(() => {}),
      clear: () => tx("readwrite", (st) => st.delete("root")).catch(() => {})
    };
  })();

  const rememberedFolder = async () => {
    const h = await folderStore.get();
    if (!h?.queryPermission) return null;
    let perm = await h.queryPermission({ mode: "readwrite" });
    // Still inside the click's user activation window, so the permission prompt is allowed
    if (perm === "prompt") perm = await h.requestPermission({ mode: "readwrite" });
    return perm === "granted" ? h : null;
  };

  const savedFolderName = async () => (await folderStore.get())?.name || "";

  /** Remembered folder only if it's usable without asking (for background "watch" runs). */
  const silentRoot = async () => {
    const h = await folderStore.get();
    if (!h?.queryPermission) return null;
    try {
      return (await h.queryPermission({ mode: "readwrite" })) === "granted" ? h : null;
    } catch (e) {
      return null;
    }
  };

  /**
   * Must be called synchronously from a click handler (folder picker needs a user gesture).
   * reuse: try the remembered folder first, show the picker only if it's unavailable.
   */
  const prepareTarget = (channel, { reuse = false } = {}) => {
    const mode = S("download.saveMode");
    if (mode !== "folder" || typeof window.showDirectoryPicker !== "function") {
      return Promise.resolve({ mode: "browser" });
    }
    return prepareRoot({ reuse }).then((root) => targetFor(root, channel));
  };

  /** Picks (or reuses) the root download folder. Call from a click handler. */
  const prepareRoot = ({ reuse = false } = {}) => {
    if (S("download.saveMode") !== "folder" || typeof window.showDirectoryPicker !== "function") {
      return Promise.resolve(null);
    }
    const pick = () => window.showDirectoryPicker({ id: "tmd-downloads", mode: "readwrite" });
    const rootPromise = reuse && S("sync.rememberFolder")
      ? rememberedFolder().catch(() => null).then((h) => h || pick())
      : pick();
    return rootPromise.then((root) => {
      if (S("sync.rememberFolder")) folderStore.set(root);
      return root;
    });
  };

  /** Download target for one channel inside the root (null root = browser downloads). */
  const targetFor = async (root, channel) => {
    if (!root) return { mode: "browser" };
    const dir = S("download.channelSubfolder")
      ? await root.getDirectoryHandle(U().sanitize(channel, 60) || "Telegram", { create: true })
      : root;
    return { mode: "folder", dir, rootName: root.name };
  };

  /* ---------- Checkpoints: "last downloaded post" per chat ---------- */

  const FINISHED_OK = new Set(["done", "skipped"]);

  /**
   * After a queue run, returns the checkpoint to store, or null if it doesn't move forward.
   * Never jumps over a failed / cancelled item, so it is picked up again next time.
   */
  const nextCheckpoint = (queue, prev, adapterName, title) => {
    const ok = queue.filter((it) => FINISHED_OK.has(it.state));
    if (!ok.length) return null;
    const bad = queue.filter((it) => !FINISHED_OK.has(it.state));
    const field = adapterName === "api" ? "mid" : "date";
    const vals = (list) => list.map((it) => Number(it[field])).filter((n) => Number.isFinite(n) && n > 0);
    let top = Math.max(0, ...vals(ok));
    const badVals = vals(bad);
    if (badVals.length) top = Math.min(top, Math.min(...badVals) - 1);
    const prevTop = Number(prev?.[field]) || 0;
    if (!top || top <= prevTop) return null;
    const newest = ok.filter((it) => Number(it[field]) <= top).sort((a, b) => b[field] - a[field])[0];
    // Count each downloaded file once, even if the same queue is saved again after a retry
    const fresh = ok.filter((it) => it.state === "done" && !it._counted);
    fresh.forEach((it) => (it._counted = true));
    return {
      [field]: top,
      date: field === "date" ? top : newest?.date || 0,
      title: title || prev?.title || "",
      at: Date.now(),
      count: (prev?.count || 0) + fresh.length
    };
  };

  /** Size of an existing file, or -1 if it doesn't exist. */
  const fileSize = async (dir, name) => {
    try {
      return (await (await dir.getFileHandle(name)).getFile()).size;
    } catch (e) {
      return -1;
    }
  };

  /**
   * Queue control shared with the UI: pause/resume, "download this next", byte counter for speed.
   */
  const createControl = () => ({
    paused: false,
    bytes: 0,
    prio: [],
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    prioritize(item) { if (item.state === "queued") this.prio.push(item); },
    // Cancel one file right away: a queued one never starts, a running one aborts its request
    cancel(item) {
      item._cancel = true;
      if (item.state === "queued") item.state = "cancelled";
      item._abort?.();
    }
  });

  const runQueue = async ({ items, adapter, channel, target, signal, onUpdate, control = createControl(), peer = null }) => {
    const concurrency = Math.max(1, Math.min(4, S("download.concurrency")));
    const retries = Math.max(0, S("download.retries"));
    const delay = S("download.delayMs");
    const skip = S("download.skipDownloaded");
    const dupes = S("download.skipDuplicates");
    const captions = S("download.saveCaptions");
    const template = S("download.template");
    const folderTemplate = S("download.folderTemplate");
    const dirCache = new Map();
    const seenFiles = new Set();
    let index = 0;

    // Sub-folders from the folder template, created once and cached
    const dirFor = async (segs) => {
      let dir = target.dir;
      let path = "";
      for (const seg of segs) {
        path += "/" + seg;
        if (!dirCache.has(path)) dirCache.set(path, dir.getDirectoryHandle(seg, { create: true }));
        dir = await dirCache.get(path);
      }
      return dir;
    };

    const finish = (item, state, extra = {}) => {
      Object.assign(item, { state }, extra);
      onUpdate(item);
    };

    const one = async (item) => {
      const name = U().applyTemplate(template, item, channel);
      const segs = target.mode === "folder" ? U().applyFolderTemplate(folderTemplate, item, channel) : [];
      const dir = target.mode === "folder" ? await dirFor(segs) : null;
      item.savedAs = name;
      item.savedPath = [...segs, name].join("/");
      item.resumed = false;
      item.duplicate = false;
      const resumable = !!(dir && item.size && adapter.canResume?.(item));
      // How much of the file is already on disk (only counts when the full size is known)
      const partial = async () => {
        if (!resumable) return 0;
        const size = await fileSize(dir, name);
        return size > 0 && size < item.size ? size : 0;
      };
      const marks = () => [item.key, ...(item.fileId ? ["f:" + item.fileId] : [])];

      if (skip && window.TMD_SETTINGS.isDownloaded(item.key)) return finish(item, "skipped");
      if (dir) {
        const size = await fileSize(dir, name);
        if (skip && size > 0 && (!item.size || size >= item.size)) {
          window.TMD_SETTINGS.markDownloaded(marks());
          return finish(item, "skipped");
        }
      }
      // Same file (forward / repost) already saved elsewhere, or earlier in this queue
      if (dupes && item.fileId && (seenFiles.has(item.fileId) || window.TMD_SETTINGS.isDownloaded("f:" + item.fileId))) {
        return finish(item, "skipped", { duplicate: true, error: "Takroriy fayl: avval boshqa postdan yuklangan" });
      }
      if (item.fileId) seenFiles.add(item.fileId);

      let noRange = false;
      for (let attempt = 0; attempt <= retries; attempt++) {
        if (signal.aborted) throw abortErr();
        if (item._cancel) return finish(item, "cancelled");
        const offset = noRange ? 0 : await partial();
        Object.assign(item, { state: "downloading", done: offset, resumed: offset > 0, error: "" });
        onUpdate(item);
        // Per-file controller: aborts with the whole queue, or alone via control.cancel(item)
        const own = new AbortController();
        const stop = () => own.abort();
        signal.addEventListener("abort", stop, { once: true });
        item._abort = stop;
        let writable = null;
        try {
          if (dir) {
            const fh = await dir.getFileHandle(name, { create: true });
            writable = await fh.createWritable({ keepExistingData: offset > 0 });
            if (offset > 0) await writable.seek(offset);
            else await writable.truncate(0);
          }
          const blob = await adapter.download(item, {
            writable,
            signal: own.signal,
            offset,
            gate: control,
            onProgress: (done, total) => {
              if (done > item.done) control.bytes += done - item.done;
              item.done = done;
              if (total) item.size = total;
              try { onUpdate(item, true); } catch (e) {}
            }
          });
          if (writable) await writable.close();
          else U().saveBlob(blob, name);

          const text = item.caption || item.albumCaption;
          if (captions && text && (item.caption || item.albumIndex === 1)) {
            const txt = name.replace(/\.[^.]+$/, "") + ".txt";
            const cblob = new Blob([text], { type: "text/plain" });
            if (dir) {
              const w = await (await dir.getFileHandle(txt, { create: true })).createWritable();
              await w.write(cblob);
              await w.close();
            } else U().saveBlob(cblob, txt);
          }
          window.TMD_SETTINGS.markDownloaded(marks());
          window.TMD_SETTINGS.recordStat(peer, item);
          return finish(item, "done");
        } catch (err) {
          if (writable) {
            // Keep what was written so the next attempt (or next run) continues from there
            if (resumable && item.done > offset) await writable.close().catch(() => writable.abort().catch(() => {}));
            else await writable.abort().catch(() => {});
          }
          if (err?.code === "NO_RANGE") noRange = true;
          if (err?.name === "AbortError" || own.signal.aborted) {
            finish(item, "cancelled");
            // Whole queue stopped -> stop the worker; only this file -> move on to the next one
            if (signal.aborted) throw abortErr();
            return;
          }
          item.error = err?.message || String(err);
          U().logger.error(item.error, name);
          if (attempt === retries) return finish(item, "failed");
          await U().sleep(1500 * (attempt + 1));
        } finally {
          signal.removeEventListener("abort", stop);
          item._abort = null;
        }
      }
    };

    // Prioritized items first, then the list in order
    const next = () => {
      while (control.prio.length) {
        const it = control.prio.pop();
        if (it.state === "queued") return it;
      }
      while (index < items.length) {
        const it = items[index++];
        if (it.state === "queued") return it;
      }
      return null;
    };

    const worker = async () => {
      for (;;) {
        while (control.paused && !signal.aborted) await U().sleep(250);
        if (signal.aborted) return;
        const item = next();
        if (!item) return;
        item.state = "starting";
        try {
          await one(item);
        } catch (err) {
          if (err?.name === "AbortError") return;
          finish(item, "failed", { error: err?.message || String(err) });
        }
        if (item.state === "done") await U().sleep(delay);
      }
    };

    items.forEach((it) => { it.state = "queued"; it.done = 0; it._cancel = false; });
    onUpdate(null);
    await Promise.allSettled(Array.from({ length: concurrency }, worker));
    items.forEach((it) => { if (it.state === "queued" || it.state === "starting") it.state = "cancelled"; });

    if (target.mode === "folder" && S("download.archive")) {
      await window.TMD_ARCHIVE?.update(target.dir, channel, items).catch((e) => U().logger.error("Archive: " + (e?.message || e)));
    }
  };

  window.TMD_SCANNER = {
    pickAdapter, prepareTarget, prepareRoot, targetFor, runQueue, createControl, nextCheckpoint, savedFolderName, silentRoot,
    forgetFolder: folderStore.clear,
    adapters: { webkApi, viewer }
  };
})();
