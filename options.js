/* TeleVault — options page
 * Copyright (c) 2026 Adham Idiboyev (@SuperMix) */
(() => {
  const DEFAULTS = globalThis.TMD_DEFAULTS;
  const merge = globalThis.TMD_MERGE;
  let settings = merge(DEFAULTS, {});

  const TYPES = [
    ["photo", "Rasm"], ["video", "Video"], ["gif", "GIF"], ["round", "Dumaloq video"],
    ["document", "Fayl"], ["audio", "Musiqa"], ["voice", "Ovozli xabar"]
  ];
  const TOKENS = [
    ["{date}", "sana"], ["{time}", "vaqt"], ["{id}", "post ID"], ["{name}", "asl nom"],
    ["{type}", "tur"], ["{channel}", "kanal"], ["{caption}", "matn boshi"],
    ["{album}", "albom"], ["{n}", "albomdagi tartib"]
  ];
  const FOLDER_TOKENS = [
    ["{year}", "yil"], ["{month}", "oy"], ["{day}", "kun"], ["{date}", "sana"],
    ["{type}", "tur"], ["{album}", "albom"]
  ];
  const PRESETS = [
    ["", "Bitta papka"], ["{year}-{month}", "Oylar bo'yicha"], ["{type}", "Turlar bo'yicha"],
    ["{year}/{month}/{type}", "Yil / oy / tur"], ["{album}", "Albomlar alohida"]
  ];

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const getPath = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
  const setPath = (o, p, v) => {
    const keys = p.split(".");
    const last = keys.pop();
    keys.reduce((a, k) => (a[k] ||= {}), o)[last] = v;
  };

  /* --------------------------- persistence --------------------------- */
  let toastTimer;
  const toast = (text) => {
    const el = $("#status");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1600);
  };

  let saveTimer;
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      await chrome.storage.sync.set({ settings });
      toast("Saqlandi");
    }, 250);
  };

  const update = (path, value) => {
    setPath(settings, path, value);
    render();
    save();
  };

  /* ----------------------------- render ----------------------------- */
  const render = () => {
    $$("[data-key]").forEach((el) => {
      const path = el.dataset.key;
      const v = getPath(settings, path);
      if (el.classList.contains("seg")) {
        el.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.value) === String(v)));
      } else if (el.type === "checkbox") {
        el.checked = !!v;
      } else if (document.activeElement !== el) {
        el.value = v ?? "";
      }
    });
    $$("output[data-for]").forEach((o) => (o.textContent = Number(getPath(settings, o.dataset.for)).toLocaleString("uz")));
    $$("[data-show]").forEach((el) => {
      const [path, val] = el.dataset.show.split("=");
      el.hidden = String(getPath(settings, path)) !== val;
    });
    $$("#types input").forEach((i) => (i.checked = settings.scan.types[i.value] !== false));
    renderPreview();
  };

  const renderPreview = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const sample = {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}-${pad(d.getMinutes())}`,
      id: "4821", name: "dars_12", type: "video", channel: "Kanal nomi", caption: "Yangi dars"
    };
    Object.assign(sample, { year: String(d.getFullYear()), month: pad(d.getMonth() + 1), day: pad(d.getDate()), album: "album_k3x9f2", n: "3" });
    const name = (settings.download.template || "{date}_{id}_{name}")
      .replace(/\{(\w+)\}/g, (m, k) => sample[k] ?? m)
      .replace(/[<>:"/\\|?*]/g, "_");
    const inFolder = settings.download.saveMode === "folder";
    const sub = inFolder
      ? (settings.download.folderTemplate || "").split(/[\\/]+/)
          .map((seg) => seg.replace(/\{(\w+)\}/g, (m, k) => sample[k] ?? m).replace(/[<>:"|?*]/g, "_").trim())
          .filter(Boolean).map((s) => s + "/").join("")
      : "";
    const folder = inFolder && settings.download.channelSubfolder ? "Kanal nomi/" : "";
    $("#preview").textContent = `${folder}${sub}${name}.mp4`;
    $$("#presets button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.preset === (settings.download.folderTemplate || "")));
  };

  const renderHistory = async () => {
    const { history } = await chrome.storage.local.get("history");
    const n = Object.keys(history || {}).length;
    $("#historyInfo").textContent = n
      ? `${n.toLocaleString("uz")} ta fayl yuklangan deb belgilangan. Tozalasangiz, ular qayta yuklanishi mumkin, kanal belgilari ham o'chadi.`
      : "Hali hech narsa yuklanmagan.";
    $("#clearHistory").disabled = !n;
  };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MON = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];
  const p2 = (n) => String(n).padStart(2, "0");
  const day = (d) => `${d.getDate()}-${MON[d.getMonth()]} ${d.getFullYear()}`;
  const fmt = (ms) => { const d = new Date(ms); return `${day(d)}, ${p2(d.getHours())}:${p2(d.getMinutes())}`; };

  const TYPE_COLORS = { photo: "--photo", video: "--video", gif: "--gif", round: "--round", document: "--document", audio: "--audio", voice: "--voice" };
  const TYPE_LABEL = Object.fromEntries(TYPES);
  const bytes = (n) => {
    if (!n) return "0 B";
    const u = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return `${n >= 100 || i === 0 ? Math.round(n) : n.toFixed(1)} ${u[i]}`;
  };

  const renderStats = async () => {
    const { stats = {} } = await chrome.storage.local.get("stats");
    const rows = Object.entries(stats).map(([id, s]) => ({ id, ...s })).sort((a, b) => b.bytes - a.bytes);
    const files = rows.reduce((a, r) => a + r.files, 0);
    const total = rows.reduce((a, r) => a + r.bytes, 0);
    const byType = {};
    rows.forEach((r) => Object.entries(r.types || {}).forEach(([t, v]) => { byType[t] = (byType[t] || 0) + v.bytes; }));
    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    $("#tiles").innerHTML = [
      ["Fayllar", files.toLocaleString("uz")],
      ["Jami hajm", bytes(total)],
      ["Kanallar", rows.length],
      ["Eng ko'p", topType ? TYPE_LABEL[topType[0]] || topType[0] : "—"]
    ].map(([l, v]) => `<div class="tile"><span>${l}</span><strong>${esc(v)}</strong></div>`).join("");
    $("#statList").innerHTML = rows.length
      ? rows.slice(0, 50).map((r) => {
          const segs = Object.entries(r.types || {}).sort((a, b) => b[1].bytes - a[1].bytes)
            .map(([t, v]) => `<i style="flex-grow:${Math.max(v.bytes, 1)};background:var(${TYPE_COLORS[t] || "--document"})" title="${esc(TYPE_LABEL[t] || t)}: ${v.n} ta, ${bytes(v.bytes)}"></i>`).join("");
          return `<div class="srow"><div class="top"><b>${esc(r.title || r.id)}</b><span>${r.files.toLocaleString("uz")} ta · ${bytes(r.bytes)}${r.last ? " · " + fmt(r.last) : ""}</span></div><div class="sbar">${segs}</div></div>`;
        }).join("")
      : `<div class="statempty">Hali statistika yo'q. Birinchi yuklashdan keyin shu yerda paydo bo'ladi.</div>`;
    $("#legend").innerHTML = rows.length
      ? Object.keys(byType).map((t) => `<span><i style="background:var(${TYPE_COLORS[t] || "--document"})"></i>${esc(TYPE_LABEL[t] || t)}</span>`).join("")
      : "";
    $("#clearStats").disabled = !rows.length;
  };

  const renderCheckpoints = async () => {
    const { checkpoints = {} } = await chrome.storage.local.get("checkpoints");
    const list = Object.entries(checkpoints).filter(([, v]) => v && !v.cleared).sort((a, b) => (b[1].at || 0) - (a[1].at || 0));
    $("#cpInfo").textContent = list.length
      ? "Har bir kanal uchun oxirgi yuklangan post. Tozalasangiz, keyingi skan butun tarixni ko'rib chiqadi."
      : "Hali hech bir kanal uchun belgi yo'q. Kanaldan biror narsa yuklab olganingizda shu yerda paydo bo'ladi.";
    $("#cps").innerHTML = list.map(([id, v]) => {
      const meta = [
        v.at ? `oxirgi yuklash ${fmt(v.at)}` : "",
        v.date ? `${day(new Date(v.date * 1000))} gacha` : "",
        v.count ? `${v.count} ta fayl` : ""
      ].filter(Boolean).join(" · ");
      const watching = (settings.sync.watched || []).includes(id);
      return `<li><div class="ct"><strong>${esc(v.title || id)}</strong><span>${esc(meta)}</span></div>${watching ? '<span class="watch">kuzatilmoqda</span>' : ""}
        <button class="btn danger" data-cp="${esc(id)}">Tozalash</button></li>`;
    }).join("");
  };

  $("#cps").addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-cp]");
    if (!btn) return;
    const { checkpoints = {} } = await chrome.storage.local.get("checkpoints");
    checkpoints[btn.dataset.cp] = { cleared: true, at: Date.now() };
    await chrome.storage.local.set({ checkpoints });
    // Tell other computers too, otherwise the cloud copy would bring it back
    if (settings.sync.cloud) await chrome.storage.sync.set({ ["cp:" + btn.dataset.cp]: { x: 1, a: Date.now() } }).catch(() => {});
    toast("Kanal belgisi tozalandi");
  });

  /* ----------------------------- build ----------------------------- */
  $("#types").innerHTML = TYPES.map(
    ([id, label]) => `<label class="type" style="--c:var(--${id})"><input type="checkbox" value="${id}"><i></i>${label}</label>`
  ).join("");
  $("#tokens").innerHTML = TOKENS.map(([t, l]) => `<button type="button" data-token="${t}" data-into="download.template"><b>${t}</b> ${l}</button>`).join("");
  $("#ftokens").innerHTML = FOLDER_TOKENS.map(([t, l]) => `<button type="button" data-token="${t}" data-into="download.folderTemplate"><b>${t}</b> ${l}</button>`).join("");
  $("#presets").innerHTML = PRESETS.map(([t, l]) => `<button type="button" class="preset" data-preset="${t}">${l}</button>`).join("");
  $("#version").textContent = "versiya " + chrome.runtime.getManifest().version;

  /* ----------------------------- events ----------------------------- */
  document.addEventListener("click", (e) => {
    const segBtn = e.target.closest(".seg button");
    if (segBtn) {
      const seg = segBtn.parentElement;
      update(seg.dataset.key, "num" in seg.dataset ? Number(segBtn.value) : segBtn.value);
      return;
    }
    const preset = e.target.closest("[data-preset]");
    if (preset) {
      update("download.folderTemplate", preset.dataset.preset);
      $('[data-key="download.folderTemplate"]').value = preset.dataset.preset;
      return;
    }
    const token = e.target.closest("[data-token]");
    if (token) {
      const key = token.dataset.into;
      const input = $(`[data-key="${key}"]`);
      const pos = input.selectionStart ?? input.value.length;
      const sep = pos > 0 && !/[_\-\s/]$/.test(input.value.slice(0, pos)) ? (key === "download.folderTemplate" ? "/" : "_") : "";
      input.value = input.value.slice(0, pos) + sep + token.dataset.token + input.value.slice(pos);
      update(key, input.value);
      input.focus();
    }
  });

  $$("input[data-key]").forEach((el) => {
    const handler = () => {
      let v = el.type === "checkbox" ? el.checked : el.value;
      if ("num" in el.dataset) {
        v = Number(v);
        if (Number.isNaN(v)) return;
        if (el.min !== "") v = Math.max(Number(el.min), v);
        if (el.max !== "") v = Math.min(Number(el.max), v);
      }
      update(el.dataset.key, v);
    };
    el.addEventListener(el.type === "range" || el.type === "text" ? "input" : "change", handler);
  });

  $("#types").addEventListener("change", (e) => {
    if (e.target.matches("input")) update(`scan.types.${e.target.value}`, e.target.checked);
  });

  $("#clearHistory").onclick = async () => {
    // Checkpoints derived from history would point at nothing now — clear them too
    await chrome.storage.local.set({ history: {}, checkpoints: {} });
    const all = await chrome.storage.sync.get(null);
    await chrome.storage.sync.remove(Object.keys(all).filter((k) => k.startsWith("cp:")));
    renderHistory();
    toast("Tarix tozalandi");
  };
  $("#reset").onclick = async () => {
    settings = merge(DEFAULTS, {});
    await chrome.storage.sync.set({ settings });
    render();
    toast("Standart sozlamalar tiklandi");
  };
  $("#export").onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "televault-settings.json" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };
  $("#import").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      settings = merge(DEFAULTS, JSON.parse(await file.text()));
      await chrome.storage.sync.set({ settings });
      render();
      toast("Sozlamalar import qilindi");
    } catch (err) {
      toast("Fayl o'qilmadi: JSON formatida emas");
    }
    e.target.value = "";
  };

  // Highlight the section in view
  const links = $$("nav a");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.hash === "#" + en.target.id));
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  $$("main section").forEach((s) => io.observe(s));

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.history) renderHistory();
    if (area === "local" && changes.checkpoints) renderCheckpoints();
    if (area === "local" && changes.stats) renderStats();
    if (area === "sync" && changes.settings) {
      settings = merge(DEFAULTS, changes.settings.newValue || {});
      render();
      renderCheckpoints();
    }
  });

  chrome.storage.sync.get("settings").then(({ settings: s }) => {
    settings = merge(DEFAULTS, s || {});
    render();
  });
  renderHistory();
  renderCheckpoints();
  renderStats();
  $("#clearStats").onclick = async () => {
    await chrome.storage.local.set({ stats: {} });
    toast("Statistika tozalandi");
  };
})();
