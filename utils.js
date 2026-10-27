/**
 * Telegram Media Downloader - Shared Utilities
 */
(() => {
  const logger = {
    info: (message, fileName = null) => {
      console.log(`[Tel Download] ${fileName ? `${fileName}: ` : ""}${message}`);
    },
    error: (message, fileName = null) => {
      console.error(`[Tel Download] ${fileName ? `${fileName}: ` : ""}${message}`);
    }
  };

  // Unicode values for custom icons used in Web K UI implementations
  const DOWNLOAD_ICON = "";
  const FORWARD_ICON = "";

  const contentRangeRegex = /^bytes (\d+)-(\d+)\/(\d+)$/;

  const hashCode = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return h >>> 0;
  };

  const isWebK = () =>
    location.hostname === "webk.telegram.org" || location.pathname.startsWith("/k/");

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /** Reads a media element's real URL (attribute first, then currentSrc / <source>). */
  const getMediaSource = (media) => {
    if (!media) return "";
    if (media.getAttribute && media.getAttribute("src")) return media.src;
    return media.currentSrc || media.querySelector?.("source")?.src || "";
  };

  const MIME_EXT = {
    "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "video/x-matroska": "mkv",
    "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/webm": "webm",
    "audio/x-flac": "flac", "audio/flac": "flac", "audio/wav": "wav",
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
    "application/pdf": "pdf", "application/zip": "zip", "application/x-rar-compressed": "rar",
    "application/vnd.android.package-archive": "apk"
  };

  const sanitize = (s, max = 120) =>
    String(s || "")
      .replace(/[\x00-\x1f\x7f<>:"/\\|?*]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[. ]+$/, "")
      .slice(0, max);

  const extOf = (name) => {
    const m = /\.([a-z0-9]{1,6})$/i.exec(name || "");
    return m ? m[1].toLowerCase() : "";
  };

  /** Builds a safe file name for single downloads: metadata name from the URL if present, else a hash. */
  const buildFileName = (url, mime, fallbackExt) => {
    let name = "";
    try {
      const meta = JSON.parse(decodeURIComponent(url.split("/").pop().split("?")[0]));
      if (typeof meta?.fileName === "string") name = meta.fileName;
    } catch (e) {}
    name = sanitize(name) || hashCode(url).toString(36);
    const ext = MIME_EXT[mime] || fallbackExt;
    const dot = name.lastIndexOf(".");
    if (dot > 0) {
      const current = name.slice(dot + 1).toLowerCase();
      if (current === ext || !MIME_EXT[mime]) return name;
      return name.slice(0, dot) + "." + ext;
    }
    return name + "." + ext;
  };

  const pad = (n) => String(n).padStart(2, "0");

  /**
   * Applies the user's file name template to a scanned item.
   * Tokens: {date} {time} {id} {name} {type} {channel} {caption}
   */
  const tokensFor = (item, channel) => {
    const d = item.date ? new Date(item.date * 1000) : null;
    const original = item.fileName ? item.fileName.replace(/\.[^.]+$/, "") : "";
    return {
      date: d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "nodate",
      time: d ? `${pad(d.getHours())}-${pad(d.getMinutes())}` : "",
      year: d ? String(d.getFullYear()) : "nodate",
      month: d ? pad(d.getMonth() + 1) : "",
      day: d ? pad(d.getDate()) : "",
      id: String(item.id ?? ""),
      name: sanitize(original, 80) || item.type,
      type: item.type,
      channel: sanitize(channel, 60),
      caption: sanitize((item.caption || "").split("\n")[0], 50),
      album: item.albumId ? `album_${item.albumId}` : "",
      n: item.albumIndex ? String(item.albumIndex) : ""
    };
  };

  /**
   * Sub-folder path inside the download folder, from a template like "{year}-{month}/{type}".
   * Empty segments (e.g. {album} for a single post) are dropped.
   */
  const applyFolderTemplate = (template, item, channel) => {
    if (!template || !template.trim()) return [];
    const tokens = tokensFor(item, channel);
    return template
      .split(/[\\/]+/)
      .map((seg) => sanitize(seg.replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m)), 80)
        .replace(/_{2,}/g, "_").replace(/^[_\- ]+|[_\- ]+$/g, ""))
      .filter((seg) => seg && seg !== "." && seg !== "..")
      .slice(0, 6);
  };

  const applyTemplate = (template, item, channel) => {
    const tokens = tokensFor(item, channel);
    let base = sanitize(
      (template || "{date}_{id}_{name}").replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m)),
      150
    ).replace(/_{2,}/g, "_").replace(/^_|_$/g, "");
    if (!base) base = `${item.type}_${item.id}`;
    const ext = extOf(item.fileName) || MIME_EXT[item.mime] || DEFAULT_EXT[item.type] || "bin";
    return `${base}.${ext}`;
  };
  const DEFAULT_EXT = { photo: "jpg", video: "mp4", gif: "mp4", round: "mp4", voice: "ogg", audio: "mp3", document: "bin" };

  const formatBytes = (n) => {
    if (!n && n !== 0) return "";
    const u = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return `${n >= 100 || i === 0 ? Math.round(n) : n.toFixed(1)} ${u[i]}`;
  };

  const formatDuration = (s) => {
    if (!s) return "";
    s = Math.round(s);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
  };

  const saveBlob = (blob, fileName) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Give the browser time to start the download before releasing memory
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  window.TMD_UTILS = {
    logger,
    DOWNLOAD_ICON,
    FORWARD_ICON,
    contentRangeRegex,
    hashCode,
    isWebK,
    sleep,
    getMediaSource,
    sanitize,
    buildFileName,
    applyTemplate,
    applyFolderTemplate,
    formatBytes,
    formatDuration,
    saveBlob,
    extOf,
    MIME_EXT
  };
})();
