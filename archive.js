/**
 * TeleVault — Offline channel archive
 * Copyright (c) 2026 Adham Idiboyev (@SuperMix)
 *
 * Keeps archive.json (every post ever downloaded into this folder) and regenerates a
 * self-contained index.html next to it: a searchable feed that plays the local files.
 */
(() => {
  const U = () => window.TMD_UTILS;

  const readJson = async (dir, name) => {
    try {
      return JSON.parse(await (await (await dir.getFileHandle(name)).getFile()).text());
    } catch (e) {
      return null;
    }
  };

  const writeText = async (dir, name, text, type) => {
    const w = await (await dir.getFileHandle(name, { create: true })).createWritable();
    await w.write(new Blob([text], { type }));
    await w.close();
  };

  const entryOf = (it) => ({
    id: it.id, mid: it.mid || 0, d: it.date || 0, t: it.type,
    c: it.caption || "", p: it.savedPath, s: it.size || 0, n: it.fileName || "",
    a: it.albumId || "", du: it.duration || 0
  });

  const update = async (dir, channel, items) => {
    const saved = items.filter((it) => it.savedPath && (it.state === "done" || (it.state === "skipped" && !it.duplicate)));
    if (!saved.length) return;
    const db = (await readJson(dir, "archive.json")) || { version: 1, entries: {} };
    db.channel = channel;
    db.updated = Date.now();
    for (const it of saved) db.entries[it.key] = entryOf(it);
    await writeText(dir, "archive.json", JSON.stringify(db), "application/json");
    await writeText(dir, "index.html", buildHtml(db), "text/html");
  };

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const buildHtml = (db) => {
    const data = JSON.stringify({ channel: db.channel, updated: db.updated, entries: Object.values(db.entries) })
      .replace(/</g, "\\u003c");
    return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="TeleVault by Adham Idiboyev (@SuperMix)">
<title>${esc(db.channel)} — arxiv</title>
<style>
:root{--bg:#F4F6F8;--card:#FFF;--line:#E3E8ED;--text:#15202B;--muted:#66788A;--accent:#1F8FE0;--soft:#E6F2FC;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0E151C;--card:#16202A;--line:#22303D;--text:#E8EEF4;--muted:#8B9AAA;--accent:#4FB3F6;--soft:#15324A;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.bar{max-width:760px;margin:0 auto;padding:16px 16px 12px;display:grid;gap:10px}
h1{margin:0;font-size:20px;letter-spacing:-.01em}.sub{color:var(--muted);font-size:13px}
.tools{display:flex;gap:8px;flex-wrap:wrap}
input[type=search]{flex:1;min-width:180px;height:38px;border-radius:11px;border:1px solid var(--line);background:var(--card);color:var(--text);padding:0 12px;font:inherit}
.chip{height:32px;padding:0 12px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--muted);font:inherit;font-size:13px;cursor:pointer}
.chip[aria-pressed=true]{color:var(--accent);border-color:var(--accent);background:var(--soft)}
main{max-width:760px;margin:0 auto;padding:16px;display:grid;gap:14px}
.post{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.meta{display:flex;justify-content:space-between;gap:10px;padding:10px 14px;color:var(--muted);font-size:12.5px}
.grid{display:grid;gap:2px;grid-template-columns:repeat(var(--cols),1fr)}
.grid img,.grid video{width:100%;height:100%;max-height:520px;object-fit:cover;display:block;background:#0003;cursor:zoom-in}
.grid[style*="--cols:1"] img,.grid[style*="--cols:1"] video{object-fit:contain;max-height:640px;background:#000}
.grid video{cursor:auto}.grid .sq{aspect-ratio:1}
.round{width:240px;height:240px;border-radius:50%;object-fit:cover;margin:12px 14px;display:block}
.file{display:flex;gap:12px;align-items:center;padding:10px 14px;color:inherit;text-decoration:none}
.file:hover{background:var(--soft)}.file .ic{width:40px;height:40px;border-radius:10px;background:var(--soft);color:var(--accent);display:grid;place-items:center;font-weight:700;font-size:11px;text-transform:uppercase;flex:none}
.file .nm{font-weight:550;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file .sz{color:var(--muted);font-size:12.5px}
audio{width:calc(100% - 28px);margin:10px 14px}
.cap{padding:10px 14px 14px;white-space:pre-wrap;word-wrap:break-word}.cap a{color:var(--accent)}.cap .tag{color:var(--accent)}
.empty{text-align:center;color:var(--muted);padding:60px 0}
#more{height:1px}
.lb{position:fixed;inset:0;background:#000d;display:none;place-items:center;z-index:10;cursor:zoom-out}.lb.on{display:grid}.lb img{max-width:96vw;max-height:94vh}
</style>
</head>
<body>
<header><div class="bar">
  <div><h1 id="title"></h1><div class="sub" id="sub"></div></div>
  <div class="tools"><input type="search" id="q" placeholder="Matn yoki fayl nomi bo'yicha qidirish" aria-label="Qidirish"></div>
  <div class="tools" id="chips"></div>
</div></header>
<main id="feed"></main><div id="more"></div>
<div class="lb" id="lb"><img alt=""></div>
<script>
const DATA = ${data};
const LABEL = {photo:"Rasm",video:"Video",gif:"GIF",round:"Dumaloq video",document:"Fayl",audio:"Musiqa",voice:"Ovozli"};
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const href = p => p.split("/").map(encodeURIComponent).join("/");
const bytes = n => { if (!n) return ""; const u=["B","KB","MB","GB","TB"]; let i=0; while(n>=1024&&i<4){n/=1024;i++} return (n>=100||!i?Math.round(n):n.toFixed(1))+" "+u[i]; };
const dur = s => { if(!s) return ""; s=Math.round(s); const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60; return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(x).padStart(2,"0"); };
const fmt = d => d ? new Date(d*1000).toLocaleString(undefined,{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "";
const linkify = t => esc(t).replace(/(https?:\\/\\/[^\\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>').replace(/(^|\\s)(#[\\w\\u0400-\\u04FF]+)/g,'$1<span class="tag">$2</span>');

// Group album parts into one post, newest first
const posts = [];
const byAlbum = new Map();
for (const e of DATA.entries.slice().sort((a,b)=>(b.d-a.d)||(b.mid-a.mid))) {
  if (e.a && byAlbum.has(e.a)) { byAlbum.get(e.a).items.push(e); continue; }
  const p = { items:[e], d:e.d };
  if (e.a) byAlbum.set(e.a, p);
  posts.push(p);
}
posts.forEach(p => { p.items.sort((a,b)=>a.mid-b.mid); p.caption = p.items.map(i=>i.c).find(Boolean) || ""; p.types = new Set(p.items.map(i=>i.t)); p.text = (p.caption+" "+p.items.map(i=>i.n).join(" ")).toLowerCase(); });

const total = DATA.entries.reduce((a,e)=>a+(e.s||0),0);
document.getElementById("title").textContent = DATA.channel;
document.getElementById("sub").textContent = posts.length+" ta post · "+DATA.entries.length+" ta fayl · "+bytes(total)+" · yangilandi "+new Date(DATA.updated).toLocaleString();
document.title = DATA.channel+" — arxiv";

const types = [...new Set(DATA.entries.map(e=>e.t))];
const active = new Set(types);
document.getElementById("chips").innerHTML = types.map(t=>'<button class="chip" data-t="'+t+'" aria-pressed="true">'+(LABEL[t]||t)+" "+DATA.entries.filter(e=>e.t===t).length+"</button>").join("");

const media = p => {
  const visual = p.items.filter(i=>["photo","video","gif"].includes(i.t));
  const other = p.items.filter(i=>!["photo","video","gif"].includes(i.t));
  let h = "";
  if (visual.length) {
    const cols = visual.length===1?1:visual.length===2||visual.length===4?2:3;
    h += '<div class="grid" style="--cols:'+cols+'">'+visual.map(i=>{
      const sq = cols>1?' class="sq"':"";
      if (i.t==="photo") return '<img'+sq+' loading="lazy" src="'+href(i.p)+'" alt="">';
      if (i.t==="gif") return '<video'+sq+' src="'+href(i.p)+'" autoplay loop muted playsinline></video>';
      return '<video'+sq+' src="'+href(i.p)+'" controls preload="metadata"></video>';
    }).join("")+"</div>";
  }
  for (const i of other) {
    if (i.t==="round") h += '<video class="round" src="'+href(i.p)+'" controls preload="metadata"></video>';
    else if (i.t==="voice"||(i.t==="audio")) h += '<a class="file" href="'+href(i.p)+'" download><div class="ic">'+(i.t==="voice"?"🎙":"♪")+'</div><div style="min-width:0"><div class="nm">'+esc(i.n||LABEL[i.t])+'</div><div class="sz">'+[dur(i.du),bytes(i.s)].filter(Boolean).join(" · ")+'</div></div></a><audio src="'+href(i.p)+'" controls preload="none"></audio>';
    else { const ext=(i.n.match(/\\.([a-z0-9]{1,5})$/i)||[,"fayl"])[1]; h += '<a class="file" href="'+href(i.p)+'" download><div class="ic">'+esc(ext)+'</div><div style="min-width:0"><div class="nm">'+esc(i.n||"Fayl")+'</div><div class="sz">'+bytes(i.s)+'</div></div></a>'; }
  }
  return h;
};

const feed = document.getElementById("feed");
let list = [], shown = 0;
const page = () => {
  const chunk = list.slice(shown, shown+30); shown += chunk.length;
  feed.insertAdjacentHTML("beforeend", chunk.map(p=>'<article class="post"><div class="meta"><span>'+fmt(p.d)+'</span><span>'+(p.items.length>1?p.items.length+" ta media":"")+'</span></div>'+media(p)+(p.caption?'<div class="cap">'+linkify(p.caption)+"</div>":"")+"</article>").join(""));
};
const apply = () => {
  const q = document.getElementById("q").value.trim().toLowerCase();
  list = posts.filter(p=>[...p.types].some(t=>active.has(t)) && (!q || p.text.includes(q)));
  feed.innerHTML = list.length ? "" : '<div class="empty">Hech narsa topilmadi</div>';
  shown = 0; page();
};
new IntersectionObserver(e=>{ if(e[0].isIntersecting && shown<list.length) page(); },{rootMargin:"800px"}).observe(document.getElementById("more"));
document.getElementById("q").addEventListener("input", apply);
document.getElementById("chips").addEventListener("click", e=>{ const b=e.target.closest(".chip"); if(!b) return; const t=b.dataset.t; active.has(t)?active.delete(t):active.add(t); b.setAttribute("aria-pressed",active.has(t)); apply(); });
const lb = document.getElementById("lb");
feed.addEventListener("click", e=>{ if(e.target.tagName==="IMG"){ lb.firstElementChild.src=e.target.src; lb.classList.add("on"); } });
lb.addEventListener("click", ()=>lb.classList.remove("on"));
document.addEventListener("keydown", e=>{ if(e.key==="Escape") lb.classList.remove("on"); });
apply();
</script>
</body>
</html>`;
  };

  window.TMD_ARCHIVE = { update, buildHtml };
})();
