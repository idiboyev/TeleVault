/**
 * TeleVault — Default settings (shared by page, bridge and options page)
 * Copyright (c) 2026 Adham Idiboyev (@SuperMix)
 */
(() => {
  const DEFAULTS = {
    ui: {
      showLauncher: true,
      panelSide: "right",      // "right" | "left"
      theme: "auto",           // "auto" | "dark" | "light"
      inlineButtons: true,     // download buttons inside Telegram's media viewer
      thumbnails: true,        // small previews in the scanner list
      notify: true             // system notification when a download finishes in the background
    },
    scan: {
      maxPosts: 1000,
      types: { photo: true, video: true, gif: true, document: true, audio: true, voice: true, round: true },
      dateFrom: "",            // "YYYY-MM-DD"
      dateTo: "",
      minSizeMB: 0,
      minDurationMin: 0,       // video/audio length filter, minutes (0 = no limit)
      maxDurationMin: 0,
      extensions: "",          // "pdf, zip" — only these file types
      keywords: "",            // "dars, #python" — post text must contain one of them
      forwarded: "all",        // "all" | "only" | "exclude"
      pageDelay: 300           // ms between history pages
    },
    download: {
      saveMode: "folder",      // "folder" (pick a folder once) | "browser" (Chrome downloads)
      channelSubfolder: true,
      template: "{date}_{id}_{name}",
      folderTemplate: "",      // sub-folders, e.g. "{year}-{month}/{type}"; empty = all in one folder
      concurrency: 2,
      chunkMB: 2,
      delayMs: 400,
      retries: 2,
      skipDownloaded: true,
      skipDuplicates: true,    // same file already saved from another post/channel
      saveCaptions: false,
      archive: true            // keep index.html + archive.json in the channel folder
    },
    sync: {
      autoDownload: true,      // "Yangilarini yuklash" topilganini darhol yuklaydi
      rememberFolder: true,    // tanlangan papkani eslab qoladi (har safar so'ramaydi)
      watched: [],             // peer ids checked automatically while Telegram Web is open
      watchMinutes: 15,
      cloud: true              // sync checkpoints between computers (chrome.storage.sync)
    }
  };

  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const merge = (base, over) => {
    const out = Array.isArray(base) ? [...base] : { ...base };
    if (!isObj(over)) return out;
    for (const k of Object.keys(base)) {
      if (!(k in over)) continue;
      if (isObj(base[k])) out[k] = merge(base[k], over[k]);
      else if (Array.isArray(base[k])) out[k] = Array.isArray(over[k]) ? over[k].slice() : base[k].slice();
      else if (typeof over[k] === typeof base[k]) out[k] = over[k];
    }
    return out;
  };

  globalThis.TMD_DEFAULTS = DEFAULTS;
  globalThis.TMD_MERGE = merge;
})();
