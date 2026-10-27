# Telegram Media Downloader — Browser Extension

A lightweight, high-performance Manifest V3 browser extension for downloading images, GIFs, videos, stories, and voice messages directly from Telegram Web (web.telegram.org).

This extension is specifically engineered to safely download private, restricted, or otherwise non-downloadable media from Telegram channels and groups that have strict download restrictions or the restrict saving content toggle enabled.

Designed to integrate seamlessly with the Telegram Web interface (supporting both Web K and Web Z clients) while maintaining a modern, efficient, and secure architecture based entirely on native browser APIs.

---

# Features

## Bypass Restriction Locks Safely

When private channels enforce the restrict saving content policy, Telegram still must transmit the raw video and image data fragments to your browser so you can view them.

This extension works entirely locally inside your browser cache. It detects the media chunks already sent to your screen, stitches them together sequentially, and lets you save them directly to your hard drive. Because it acts as a normal viewer buffering media on screen, it is 100% invisible to Telegram's anti-bot/anti-scraping detection.

---

## High-Performance Downloader

Downloads large media files sequentially using 2MB HTTP Range requests.

Streams and caches media fragments locally without crashing your browser tab's RAM.

Employs Chromium's high-priority networking (`priority: "high"`) for maximum bandwidth speed.

Bypasses the connection overhead lag that previously capped download speeds.

---

## Native MutationObserver Engine

Unlike traditional userscripts that continuously poll the page using CPU-heavy `setInterval` loops, this extension relies on the browser's native:

- MutationObserver
- Event-driven DOM detection

### Benefits

- Near-zero idle CPU usage.
- Lower memory footprint.
- Instant detection of newly opened media overlays.
- Seamless browser performance.

---

## Manifest V3 Native

Built from the ground up to follow the modern security standards of Manifest V3.

- No bulky userscript managers required.
- No Tampermonkey/Greasyfork runtime dependencies.
- No third-party script injection.

---

## Zero Permissions

The extension is designed with a "Privacy First" mindset and declares:

```json
"permissions": []
```

It does not request access to your browsing history, cookies, tabs, browser storage, or background service workers. Everything executes strictly on top of your current active local Telegram Web session.

---

# Project Structure

```text
telegram-media-downloader/
│
├── manifest.json      # Extension manifest (MV3 compliant)
├── content.js         # Main orchestrator injection script
├── downloader.js      # High-speed sequential range-fetch downloading engine
├── observer.js        # Performance DOM MutationObserver layout listener
├── ui.js              # Floating media download progress HUD dashboard
├── utils.js           # Shared logging, cryptographic hashers, and helpers
└── styles.css         # Modular progress HUD styling
```

---

# Installation

Since this project is distributed as a lightweight, unpackaged extension, installation only takes a minute:


## 2. Open Extensions Page

Open your Chromium-based desktop browser and visit the extensions dashboard URL:

### Google Chrome

```
chrome://extensions
```

### Brave Browser

```
brave://extensions
```

### Microsoft Edge

```
edge://extensions
```

### Opera / Vivaldi

```
opera://extensions
vivaldi://extensions
```

---

## 3. Enable Developer Mode

Locate the Developer Mode toggle switch (usually found in the top-right corner of the workspace dashboard) and turn it ON.

---

## 4. Load the Extension

Click the **Load unpacked** button in the top-left corner, select your local `telegram-media-downloader` folder, and click **Open**. The extension will initialize immediately.

---

# Usage

## Images

Open any image (even restricted private channel ones) inside Telegram Web. A dedicated download icon button is injected into the media viewer header toolbar. Click it to save the image.

---

## Videos

Open a video. A custom download button is injected directly into the video player control dashboard bar. Click it to save the video. For larger videos, the progress HUD will display the real-time download status.

---

## Voice Messages

Open a chat thread containing voice or audio messages. A sleek download button appears natively next to the audio/voice notification bubble, allowing direct extraction.

---

## Stories

Open any Telegram story slide. A clean download button is injected directly into the story's upper/lower utility action rows.

---


---

# How It Works

Large media is fetched sequentially to keep memory usage low and downloads stable. The engine cuts the file into explicit 2MB segments and fetches them piece-by-piece:

```text
Range: bytes=0-2097151
Range: bytes=2097152-4194303
Range: bytes=4194304-6291455
```

Each chunk is temporarily cached in your browser as a blob, and when the final block completes, they are merged natively into a single playable `.mp4` or `.ogg` file. This sequential approach prevents memory spikes, allows faster download speeds, and ensures 100% account safety.

---

# Safety

### No Data Exfiltration

Runs completely locally inside your browser sandbox. It does not contact any external database, server, or tracking endpoint.

### Normal Browser Footprint

Because downloads occur sequentially, your network traffic mirrors standard browser buffer streaming, rendering it safe and invisible to anti-bot system triggers.

### Secure Authentication

No login details, password hashes, or session tokens are ever read or handled.

---

# Browser Support

- Google Chrome
- Brave Browser
- Microsoft Edge
- Opera
- Vivaldi
- Other Chromium-based browsers

---

# Development

Contributions, bug reports, and suggestions are welcome! Feel free to:

- Fork the repository workspace
- Submit Pull Requests to address changing Telegram CSS layout classes
- Log layout edge cases in the Issues panel

---

# Disclaimer

This project is intended strictly for educational, research, and private personal backup use. Users are responsible for ensuring that their use of this extension complies with applicable local copyright laws, intellectual property regulations, and platform usage policies.

## 2.0 — Kanal skaneri va sozlamalar

**Kanal skaneri** — Telegram Web'da kanalni oching va pastki burchakdagi tugmani bosing (yoki `Alt+Shift+D`).

1. **Kanalni skanerlash** — oxirgi N ta post tekshiriladi, media turlari bo'yicha ajratiladi (rasm, video, GIF, dumaloq video, fayl, musiqa, ovozli).
2. Tur chiplari — filtr ham, statistika ham. Qidiruv, saralash va belgilash mavjud.
3. **Yuklab olish** — tanlanganlar navbat bilan yuklanadi. Papka rejimida bir marta papka tanlanadi, fayllar to'g'ridan-to'g'ri diskka bo'laklab yoziladi.
4. **Ro'yxat** — skan natijasini JSON qilib saqlaydi.

| Telegram versiyasi | Skan usuli | Nimalar topiladi |
|---|---|---|
| Web K (`/k/`) | Ichki API orqali tarix o'qiladi, scroll kerak emas | Barcha media turlari, aniq hajm/nom/sana |
| Web A (`/a/`) | Media ko'ruvchi avtomatik varaqlanadi | Rasm va video |

**Sozlamalar** — extension ikonkasini bosing yoki paneldagi ⚙ tugmasi. Panel joylashuvi, mavzu, postlar soni, media turlari, sana oralig'i, minimal hajm, saqlash usuli, fayl nomi shabloni (`{date} {time} {id} {name} {type} {channel} {caption}`), parallel yuklashlar, bo'lak hajmi, qayta urinishlar, avval yuklanganlarni o'tkazib yuborish, post matnini .txt sifatida saqlash, tarixni tozalash, sozlamalar eksporti/importi.

Talab: Chrome 111+.

## 2.1 — Faqat yangilarini yuklash

Kanaldan yuklab olganingizda oxirgi yuklangan post eslab qolinadi. Keyingi safar panelda **Yangilarini yuklash** tugmasi chiqadi:

- tarix faqat o'sha postgacha o'qiladi (`maxPosts` cheklovi qo'llanmaydi), shuning uchun katta kanallarda ham tez ishlaydi;
- topilgan yangi medialar darhol yuklanadi (sozlamalarda o'chirsa bo'ladi — unda faqat belgilanadi);
- papka eslab qolinadi, har safar qayta tanlash shart emas;
- xato bilan tugagan fayl belgini ushlab turadi, keyingi safar u qayta urinib ko'riladi;
- 2.1 dan oldin Web K'da yuklangan kanallar uchun belgi yuklash tarixidan avtomatik olinadi.

Belgini panelda yoki Sozlamalar → **Yangilari** bo'limida har bir kanal uchun alohida tozalash mumkin.

## 2.2 — Ko'p kanal, davom ettirish, albomlar, papka tuzilmasi

- **Kanallar** (panelda yangi tab, faqat Web K): yuklangan barcha kanallar ro'yxati. Keraklilarini belgilab **Tanlanganlarni yangilash** bosiladi — har bir kanaldan faqat oxirgi yuklashdan keyingi media yuklanadi, chatlarni ochish shart emas.
- **Uzilgan yuklashni davom ettirish** (papka rejimi): tarmoq uzilsa yoki "To'xtatish" bosilsa, yozilgan qism saqlanib qoladi. Keyingi urinishda fayl boshidan emas, to'xtagan joyidan davom etadi (ro'yxatda `davom` belgisi).
- **Albomlar**: bitta postdagi bir nechta media "Albom 2/5" deb belgilanadi. Fayl nomi uchun `{album}` va `{n}` teglari qo'shildi.
- **Papka tuzilmasi**: Sozlamalar → Yuklab olish → *Papka tuzilmasi*. Masalan `{year}-{month}/{type}` yoki `{album}`. Teglar: `{year} {month} {day} {date} {type} {album}`.

## 3.0 — To'liq arxivlash vositasi

**Yuklash jarayoni**
- **Tezlik va qolgan vaqt** — footerda `5.7 MB/s · ~3 daq qoldi`, umumiy progress baytlar bo'yicha.
- **Pauza / Davom** — navbat to'xtab turadi, yuklanayotgan fayl bo'lak orasida kutadi.
- **Navbatda birinchi** — navbatdagi fayl yonidagi ↑ tugmasi uni keyingi qilib qo'yadi.
- **Xatolarni qayta yuklash** — tugagandan keyin faqat xato bo'lganlar bir bosishda qayta yuklanadi.
- **Takroriy fayllar** — bir xil fayl (forward, repost, boshqa kanal) ikkinchi marta yuklanmaydi.
- **Bildirishnomalar** — boshqa oynada bo'lsangiz, yuklash tugaganda tizim xabari keladi (bosilsa Telegram tabi ochiladi).

**Skaner**
- **Kichik rasmlar** — ro'yxatda rasm va videolarning ko'rinishi (Web K).
- **Filtrlar** — paneldagi filtr tugmasi: davomiylik, minimal hajm, kengaytmalar (`pdf, zip`), kalit so'zlar/hashtag, forward qilinganlar.

**Kanallar**
- **Avtomatik kuzatuv** — "Kanallar" tabida ko'z belgisi. Telegram Web ochiq turganda kanal har N daqiqada tekshiriladi. Papkaga ruxsat bo'lsa yangilari o'zi yuklanadi, bo'lmasa ikonkada son chiqadi va bildirishnoma keladi. "Hozir tekshirish" darhol tekshiradi.
- **Bulut sinxron** — kanal belgilari Chrome hisobi orqali boshqa kompyuterlarga o'tadi.

**Natija**
- **Oflayn arxiv** — kanal papkasida `index.html`: postlar matni, albomlar, rasm/video/audio pleyer, qidiruv va tur filtrlari. Har yuklashda to'ldiriladi (`archive.json`).
- **Statistika** — Sozlamalar → Statistika: jami fayllar, hajm, kanallar bo'yicha turlar taqsimoti.
