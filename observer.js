(() => {
/**
 * TeleVault — DOM discovery & button placement
 * Copyright (c) 2026 Adham Idiboyev (@SuperMix)
 * Media URLs are always resolved at click time, so buttons never hold stale links.
 */

const U = () => window.TMD_UTILS;
const D = () => window.TMD_DOWNLOADER;

/** Removes our buttons from a container (used when the content turns out to be protected). */
const dropButtons = (root) => root?.querySelectorAll(".tel-download").forEach((b) => b.remove());

const makeButton = (className, html, onClick) => {
  const btn = document.createElement("button");
  btn.className = className + " tel-download";
  btn.type = "button";
  btn.title = "Download";
  btn.setAttribute("aria-label", "Download");
  btn.setAttribute("data-tel-own", "1");
  btn.innerHTML = html;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return btn;
};

/* ----------------------------- Web A (/a/) ----------------------------- */

const WEBA_ICON = '<i class="icon icon-download" aria-hidden="true"></i>';

/** Telegram's own (visible) download buttons — if present, we don't add ours. */
const nativeWebAButtons = (root) =>
  Array.from(root.querySelectorAll("button")).filter(
    (b) =>
      !b.hasAttribute("data-tel-own") &&
      (b.querySelector(".icon-download") ||
        b.title === "Download" ||
        b.getAttribute("aria-label") === "Download")
  );

const downloadCurrentWebA = () => {
  const slide = document.querySelector("#MediaViewer .MediaViewerSlide--active");
  if (!slide) return;
  if (U().isProtected(slide)) return U().logger.error(U().PROTECTED_MSG);
  const videoUrl = U().getMediaSource(slide.querySelector(".VideoPlayer video, video"));
  const imageUrl = U().getMediaSource(slide.querySelector(".MediaViewerContent img"));
  if (videoUrl) D().telDownloadVideo(videoUrl);
  else if (imageUrl) D().telDownloadImage(imageUrl);
};

const downloadCurrentWebAStory = () => {
  const story = document.getElementById("StoryViewer");
  if (!story) return;
  if (U().isProtected(story)) return U().logger.error(U().PROTECTED_MSG);
  const videoUrl = U().getMediaSource(story.querySelector("video"));
  if (videoUrl) return D().telDownloadVideo(videoUrl);
  const images = story.querySelectorAll("img.PVZ8TOWS, img");
  const imageUrl = U().getMediaSource(images[images.length - 1]);
  if (imageUrl) D().telDownloadImage(imageUrl);
};

const processWebA = () => {
  // Stories
  const story = document.getElementById("StoryViewer");
  if (story && U().isProtected(story)) {
    dropButtons(story);
  } else if (story) {
    const header =
      story.querySelector(".GrsJNw3y") || story.querySelector(".DropdownMenu")?.parentNode;
    if (header && !header.querySelector(".tel-download") && !nativeWebAButtons(header).length) {
      header.prepend(
        makeButton("Button tiny translucent-white round", WEBA_ICON, downloadCurrentWebAStory)
      );
    }
  }

  // Media viewer
  const slide = document.querySelector("#MediaViewer .MediaViewerSlide--active");
  const actions = document.querySelector("#MediaViewer .MediaViewerActions");
  if (!slide || !actions) return;
  if (U().isProtected(slide)) {
    dropButtons(actions);
    dropButtons(slide);
    return;
  }

  const video = slide.querySelector(".VideoPlayer video, video");
  const image = slide.querySelector(".MediaViewerContent img");
  if (!U().getMediaSource(video) && !U().getMediaSource(image)) return;

  // Top bar
  if (nativeWebAButtons(actions).length) {
    actions.querySelectorAll(".tel-download").forEach((b) => b.remove());
  } else if (!actions.querySelector(".tel-download")) {
    actions.prepend(
      makeButton("Button smaller translucent-white round", WEBA_ICON, downloadCurrentWebA)
    );
  }

  // Video player controls
  const controls = slide.querySelector(".VideoPlayerControls .buttons");
  if (video && controls && !controls.querySelector(".tel-download")) {
    const btn = makeButton("Button smaller translucent-white round", WEBA_ICON, downloadCurrentWebA);
    const spacer = controls.querySelector(".spacer");
    spacer ? spacer.after(btn) : controls.appendChild(btn);
  }
};

/* ----------------------------- Web K (/k/) ----------------------------- */

const webKIcon = () => `<span class="tgico button-icon">${U().DOWNLOAD_ICON}</span>`;

const downloadCurrentWebK = () => {
  const viewer = document.querySelector(".media-viewer-whole");
  if (!viewer) return;
  if (U().chatProtected() || U().isProtected(viewer)) return U().logger.error(U().PROTECTED_MSG);
  const aspecter = viewer.querySelector(".media-viewer-movers .media-viewer-aspecter");
  const videoUrl = U().getMediaSource(aspecter?.querySelector("video"));
  const imageUrl = U().getMediaSource(aspecter?.querySelector("img.thumbnail, img.media-photo"));
  if (videoUrl) D().telDownloadVideo(videoUrl);
  else if (imageUrl) D().telDownloadImage(imageUrl);
};

const getPinnedMedia = () => {
  const pinned = document.querySelector(".pinned-audio");
  const mid = pinned?.getAttribute("data-mid");
  if (!mid) return null;
  const candidates = Array.from(document.querySelectorAll("audio-element")).filter(
    (el) => el.closest(".bubble") && el.getAttribute("data-mid") === mid
  );
  // `.audio` is a JS property of Telegram's custom element — only visible in the MAIN world
  const el =
    candidates.length === 1
      ? candidates[0]
      : candidates.find((c) => c.audio && !c.audio.paused) || candidates[0];
  const url = U().getMediaSource(el?.audio);
  if (!url) return null;
  return { url, isAudio: el.audio.tagName === "AUDIO" };
};

const processWebK = () => {
  // 1. Pinned audio / voice
  const pinnedUtils = document.querySelector(".pinned-audio .pinned-container-wrapper-utils");
  if (pinnedUtils && U().chatProtected()) {
    dropButtons(pinnedUtils);
  } else if (pinnedUtils && !pinnedUtils.querySelector(".tel-download")) {
    pinnedUtils.appendChild(
      makeButton("btn-icon tgico-download _tel_download_button_pinned_container", webKIcon(), () => {
        if (U().chatProtected()) return U().logger.error(U().PROTECTED_MSG);
        const media = getPinnedMedia();
        if (!media) return U().logger.error("Pinned media URL not found");
        media.isAudio ? D().telDownloadAudio(media.url) : D().telDownloadVideo(media.url);
      })
    );
  }

  // 2. Stories
  const stories = document.getElementById("stories-viewer");
  if (stories && U().isProtected(stories)) {
    dropButtons(stories);
  } else if (stories) {
    const onStory = () => {
      if (U().isProtected(stories)) return U().logger.error(U().PROTECTED_MSG);
      const videoUrl = U().getMediaSource(stories.querySelector("video.media-video, video"));
      if (videoUrl) return D().telDownloadVideo(videoUrl);
      const imageUrl = U().getMediaSource(stories.querySelector("img.media-photo"));
      if (imageUrl) D().telDownloadImage(imageUrl);
    };
    ["[class^='_ViewerStoryHeaderRight']", "[class^='_ViewerStoryFooterRight']"].forEach((sel) => {
      const zone = stories.querySelector(sel);
      if (zone && !zone.querySelector(".tel-download")) {
        zone.prepend(
          makeButton("btn-icon rp", `<span class="tgico">${U().DOWNLOAD_ICON}</span>`, onStory)
        );
      }
    });
  }

  // 3. Media viewer
  const viewer = document.querySelector(".media-viewer-whole");
  if (!viewer) return;
  const aspecter = viewer.querySelector(".media-viewer-movers .media-viewer-aspecter");
  const buttons = viewer.querySelector(".media-viewer-topbar .media-viewer-buttons");
  if (!aspecter || !buttons) return;

  // Protected chats ("Restrict saving content"): Telegram hides its own download button,
  // and TeleVault respects that — no buttons of ours either
  if (U().chatProtected() || U().isProtected(viewer)) {
    dropButtons(viewer);
    return;
  }

  const hasMedia =
    U().getMediaSource(aspecter.querySelector("video")) ||
    U().getMediaSource(aspecter.querySelector("img.thumbnail, img.media-photo"));
  if (!hasMedia) return;

  // Top bar
  if (!buttons.querySelector(".tel-download")) {
    buttons.prepend(makeButton("btn-icon tgico-download", webKIcon(), downloadCurrentWebK));
  }

  // Video player bottom controls
  const right = aspecter.querySelector(".ckin__controls .bottom-controls .right-controls");
  if (right && !right.querySelector(".tel-download")) {
    right.prepend(
      makeButton(
        "btn-icon default__button tgico-download",
        `<span class="tgico">${U().DOWNLOAD_ICON}</span>`,
        downloadCurrentWebK
      )
    );
  }
};

/* ----------------------------- Scheduler ----------------------------- */

const startDOMMonitoring = () => {
  const run = () => {
    if (window.TMD_SETTINGS && window.TMD_SETTINGS.get("ui.inlineButtons") === false) return;
    try {
      U().isWebK() ? processWebK() : processWebA();
    } catch (e) {
      U().logger.error("Refresh failed: " + (e?.message || e));
    }
  };

  // Debounced: Telegram mutates the DOM constantly
  let pending = null;
  const schedule = () => {
    if (pending) return;
    pending = setTimeout(() => {
      pending = null;
      run();
    }, 150);
  };

  new MutationObserver((records) => {
    for (const r of records) {
      const t = r.target instanceof Element ? r.target : r.target.parentElement;
      if (t && t.closest("#tel-downloader-progress-bar-container, .tel-download")) continue;
      schedule();
      return;
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "src"]
  });

  // Fallback: video src properties can change without DOM mutations
  setInterval(() => {
    if (!document.hidden) run();
  }, 1500);

  run();
  U().logger.info("DOM monitoring started (" + (U().isWebK() ? "Web K" : "Web A") + ")");
};

window.TMD_OBSERVER = {
  startDOMMonitoring
};

})();
