/**
 * Telegram Media Downloader - Entry point
 */
(() => {
  window.TMD_UTILS.logger.info("Extension starting");
  window.TMD_UI.setupProgressBarContainer();
  window.TMD_OBSERVER.startDOMMonitoring();
  window.TMD_PANEL.mount();
  window.TMD_UTILS.logger.info("Ready. Alt+Shift+D opens the channel scanner.");
})();
