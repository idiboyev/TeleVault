(() => {
/**
 * TeleVault — Progress Bar UI Engine & Components builder
 * Copyright (c) 2026 Adham Idiboyev (@SuperMix)
 */

const setupProgressBarContainer = () => {
  if (document.getElementById("tel-downloader-progress-bar-container")) return;
  const body = document.querySelector("body");
  if (!body) return;

  const container = document.createElement("div");
  container.id = "tel-downloader-progress-bar-container";
  
  if (location.pathname.startsWith("/k/")) {
    container.style.zIndex = "4";
  } else {
    container.style.zIndex = "1600";
  }
  body.appendChild(container);
};

const createProgressBar = (videoId, fileName, onCancel) => {
  setupProgressBarContainer();
  const container = document.getElementById("tel-downloader-progress-bar-container");
  if (!container) return;

  const isDarkMode = document.querySelector("html").classList.contains("night") ||
                     document.querySelector("html").classList.contains("theme-dark");

  const innerContainer = document.createElement("div");
  innerContainer.id = "tel-downloader-progress-" + videoId;
  innerContainer.className = "tel-progress-item";
  innerContainer.style.backgroundColor = isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.6)";

  const flexContainer = document.createElement("div");
  flexContainer.className = "tel-progress-flex";

  const title = document.createElement("p");
  title.className = "filename";
  title.innerText = fileName;

  const closeButton = document.createElement("div");
  closeButton.className = "tel-progress-close";
  closeButton.style.color = isDarkMode ? "#8a8a8a" : "white";
  closeButton.innerHTML = "&times;";
  closeButton.title = "Bekor qilish";
  // Stops the download itself, not just the progress bar
  closeButton.onclick = () => {
    onCancel?.();
    innerContainer.remove();
  };

  const progressBar = document.createElement("div");
  progressBar.className = "progress tel-progress-bar-wrapper";

  const counter = document.createElement("p");
  counter.className = "tel-progress-counter";
  counter.innerText = "0%";
  
  const progress = document.createElement("div");
  progress.className = "tel-progress-fill";

  progressBar.appendChild(counter);
  progressBar.appendChild(progress);
  flexContainer.appendChild(title);
  flexContainer.appendChild(closeButton);
  innerContainer.appendChild(flexContainer);
  innerContainer.appendChild(progressBar);
  container.appendChild(innerContainer);
};

const updateProgress = (videoId, fileName, progressPercentage) => {
  const innerContainer = document.getElementById("tel-downloader-progress-" + videoId);
  if (!innerContainer) return;
  
  const filenameEl = innerContainer.querySelector("p.filename");
  if (filenameEl) filenameEl.innerText = fileName;

  const progressBar = innerContainer.querySelector("div.progress");
  if (progressBar) {
    const pEl = progressBar.querySelector("p");
    const divEl = progressBar.querySelector("div");
    if (pEl) pEl.innerText = progressPercentage + "%";
    if (divEl) divEl.style.width = progressPercentage + "%";
  }
};

const completeProgress = (videoId) => {
  const innerContainer = document.getElementById("tel-downloader-progress-" + videoId);
  if (!innerContainer) return;
  const progressBar = innerContainer.querySelector("div.progress");
  if (progressBar) {
    const pEl = progressBar.querySelector("p");
    const divEl = progressBar.querySelector("div");
    if (pEl) pEl.innerText = "Completed";
    if (divEl) {
      divEl.style.backgroundColor = "#B6C649";
      divEl.style.width = "100%";
    }
  }
};

const abortProgress = (videoId) => {
  const innerContainer = document.getElementById("tel-downloader-progress-" + videoId);
  if (!innerContainer) return;
  const progressBar = innerContainer.querySelector("div.progress");
  if (progressBar) {
    const pEl = progressBar.querySelector("p");
    const divEl = progressBar.querySelector("div");
    if (pEl) pEl.innerText = "Aborted";
    if (divEl) {
      divEl.style.backgroundColor = "#D16666";
      divEl.style.width = "100%";
    }
  }
};

window.TMD_UI = {
  setupProgressBarContainer,
  createProgressBar,
  updateProgress,
  completeProgress,
  abortProgress
};
})();
