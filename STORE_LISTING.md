# TeleVault — Chrome Web Store uchun matnlar

Developer Dashboard'ga nusxalab qo'yish uchun tayyor matnlar.

## Store listing

**Name:** TeleVault

**Summary (132 belgigacha):**
Save media from Telegram Web chats and channels into organized folders. Not affiliated with Telegram.

**Category:** Productivity

**Description:**

TeleVault by Adham Idiboyev (@SuperMix) helps you archive media from Telegram Web into tidy folders on your computer.

• Download button in the media viewer for photos, videos, stories and voice messages
• Channel scanner (Alt+Shift+D): filter by type, date, size, keywords
• Save straight to a folder you pick, with file-name and folder templates
• "Only new" mode, multi-channel updates and resumable downloads
• Offline archive (index.html) with search, plus download statistics

Respects content protection: when a channel or group owner turns on "Restrict saving content", TeleVault does not download that content and does not reveal buttons Telegram hides.

Privacy: no servers, no analytics, no ads. Settings and history stay in your browser; files go only to the folder you choose.

Use TeleVault only for content you own or have permission to save. TeleVault is an independent project and is not affiliated with, endorsed by, or sponsored by Telegram.

## Privacy practices

**Single purpose:**
Save media that the user can access on Telegram Web (web.telegram.org) into folders on the user's own computer, with a channel scanner and offline archive.

**Permission justification:**

- `storage` — Stores the user's settings, the list of already downloaded posts (to skip duplicates) and per-channel checkpoints for "download only new".
- `notifications` — Shows a system notification when a download queue finishes while the user is in another window. Can be turned off in settings.
- Host access (`web.telegram.org`, `webk.telegram.org`, `webz.telegram.org`) — Adds download buttons and the scanner panel to Telegram Web pages. The extension runs on no other sites.

**Remote code:** No, I am not using remote code. All JavaScript is included in the package.

**Data usage — collected data types:** Website content (channel names and post IDs stored locally for download history). Nothing is transmitted to the developer.

**Certifications (tick all three):**
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:**
https://idiboyev.github.io/TeleVault/privacy.html
(Repo → Settings → Pages → "Deploy from a branch", `main` / root. Repo ochiq bo'lishi kerak.)

## Yuklashdan oldin

1. Paketga faqat kengaytma fayllarini qo'shing (`README.md`, `STORE_LISTING.md` va `.git` shart emas).
2. Kamida 1 ta skrinshot (1280×800 yoki 640×400) va 440×280 kichik promo rasm tayyorlang. Skrinshotlarda himoyalanmagan, o'zingizga tegishli kanalni ko'rsating.
3. Developer hisobida aloqa emailini tasdiqlang.
