# TeleVault

Telegram Web uchun Chrome kengaytmasi. Kanal va guruhlardagi rasm, video, ovozli xabar va fayllarni kompyuterdagi papkaga tartib bilan saqlaydi.

Muallif: Adham Idiboyev (@SuperMix)

## O'zbekcha

**Nima qiladi**

- Telegram Web'da media ochilganda yuklab olish tugmasi chiqadi.
- `Alt+Shift+D` bilan kanal skaneri ochiladi: postlarni tur, sana, hajm va kalit so'z bo'yicha saralab, tanlanganlarini bir yo'la yuklaysiz.
- Fayllar siz tanlagan papkaga tushadi. Nom va papka tuzilmasini shablon bilan o'zingiz belgilaysiz.
- Keyingi safar faqat yangi postlar yuklanadi. Uzilib qolgan yuklash to'xtagan joyidan davom etadi.
- Kanal papkasida oflayn arxiv (`index.html`) yaratiladi.

**O'rnatish**

1. `chrome://extensions` ni oching va Developer mode ni yoqing.
2. "Load unpacked" ni bosib, shu papkani tanlang.

Chrome 111 yoki undan yangi versiya kerak.

**Muhim**

- Kanal egasi "Restrict saving content" ni yoqqan bo'lsa, TeleVault u yerdan hech narsa yuklamaydi.
- Kengaytma hech qanday ma'lumotni tashqariga yubormaydi. Batafsil: [privacy.html](privacy.html).
- TeleVault mustaqil loyiha, Telegram bilan aloqasi yo'q.

## English

**What it does**

TeleVault is a Chrome extension for Telegram Web. It adds a download button to the media viewer and a channel scanner (`Alt+Shift+D`) that lets you filter posts by type, date, size or keyword and save them in bulk to a folder of your choice. It remembers what you already downloaded, so next time only new posts are fetched, and it can build an offline `index.html` archive for each channel.

**Install**

1. Open `chrome://extensions` and turn on Developer mode.
2. Click "Load unpacked" and select this folder.

Requires Chrome 111+.

**Notes**

- Content from chats with "Restrict saving content" enabled is never downloaded.
- No data leaves your browser. See [privacy.html](privacy.html).
- TeleVault is an independent project and is not affiliated with Telegram.

## License

© 2026 Adham Idiboyev (@SuperMix). GPL-3.0, see [LICENSE](LICENSE).
The media viewer buttons and ranged download code are based on [Neet-Nestor/Telegram-Media-Downloader](https://github.com/Neet-Nestor/Telegram-Media-Downloader) (GPL-3.0).
