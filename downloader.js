/**
 * Telegram Media Downloader - Sequential ranged fetching
 *
 * Runs in the page (MAIN) world, so requests to Telegram's
 * /progressive/ and /stream/ URLs are served by Telegram's own service worker.
 */
(() => {
  const chunkSize = () => (window.TMD_SETTINGS?.get("download.chunkMB") || 2) * 1024 * 1024;

  /**
   * Downloads `url` piece by piece using Range requests.
   * - kind: "video" | "audio" | "image" to validate MIME, or null to accept anything
   * - writable: optional FileSystemWritableFileStream — chunks are streamed to disk
   * - offset: resume from this byte (the writable must already hold the first `offset` bytes)
   * Returns { blob (null when writable is used), mime, size }.
   */
  const fetchMedia = async (url, { kind = null, signal, onProgress, writable, offset: startAt = 0, gate } = {}) => {
    const CHUNK = chunkSize();
    const parts = [];
    const put = async (blob) => (writable ? writable.write(blob) : parts.push(blob));
    let offset = startAt;
    let total = null;
    let mime = "";

    while (total === null || offset < total) {
      signal?.throwIfAborted();
      // Paused queue: hold between chunks, the request already in flight finishes
      while (gate?.paused) {
        signal?.throwIfAborted();
        await new Promise((r) => setTimeout(r, 250));
      }
      const res = await fetch(url, {
        headers: { Range: `bytes=${offset}-${offset + CHUNK - 1}` },
        signal
      });

      if (res.status !== 200 && res.status !== 206) throw new Error("HTTP " + res.status);

      const type = (res.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
      if (kind && type && !type.startsWith(kind + "/") && type !== "application/octet-stream") {
        throw new Error(`Expected ${kind}, got ${type}`);
      }
      if (!mime && type && type !== "application/octet-stream") mime = type;

      if (res.status === 200) {
        // Server ignored Range -> the whole file is in this response
        if (offset !== 0) throw Object.assign(new Error("Server stopped supporting partial downloads"), { code: "NO_RANGE" });
        const blob = await res.blob();
        await put(blob);
        offset = total = blob.size;
        onProgress?.(offset, total);
        break;
      }

      const match = (res.headers.get("Content-Range") || "").match(window.TMD_UTILS.contentRangeRegex);
      const blob = await res.blob();
      if (!match) {
        await put(blob);
        offset += blob.size;
        total = offset;
        break;
      }

      const start = Number(match[1]);
      const end = Number(match[2]);
      const size = Number(match[3]);
      if (start !== offset) throw new Error("Gap detected between responses");
      if (!blob.size) throw new Error("Empty response chunk");

      await put(blob);
      offset = end + 1;
      total = size;
      onProgress?.(offset, total);
    }

    return {
      blob: writable ? null : new Blob(parts, { type: mime || "application/octet-stream" }),
      mime,
      size: total
    };
  };

  /** Single-file download triggered by the inline buttons in Telegram's viewer. */
  const runDownload = (url, kind, fallbackExt) => {
    const { logger, buildFileName, saveBlob } = window.TMD_UTILS;
    if (!url) {
      logger.error("Media URL not found (media is still loading?)");
      return;
    }

    const id = Math.random().toString(36).slice(2, 10) + "_" + Date.now();
    let fileName = buildFileName(url, "", fallbackExt);
    logger.info(`URL: ${url}`, fileName);
    const controller = new AbortController();
    window.TMD_UI.createProgressBar(id, fileName, () => controller.abort());

    fetchMedia(url, {
      kind,
      signal: controller.signal,
      onProgress: (done, total) =>
        window.TMD_UI.updateProgress(id, fileName, Math.min(100, Math.floor((done * 100) / total)))
    })
      .then(({ blob, mime }) => {
        fileName = buildFileName(url, mime, fallbackExt);
        saveBlob(blob, fileName);
        window.TMD_UI.updateProgress(id, fileName, 100);
        window.TMD_UI.completeProgress(id);
        logger.info("Download finished", fileName);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return logger.info("Download cancelled", fileName);
        logger.error(err?.message || String(err), fileName);
        window.TMD_UI.abortProgress(id);
      });
  };

  window.TMD_DOWNLOADER = {
    fetchMedia,
    telDownloadVideo: (url) => runDownload(url, "video", "mp4"),
    telDownloadAudio: (url) => runDownload(url, "audio", "ogg"),
    telDownloadImage: (url) => runDownload(url, "image", "jpg")
  };
})();
