# TeleVault

**TeleVault** — Telegram Web uchun media arxivlash kengaytmasi (Chrome, Manifest V3).
Muallif va dasturchi: **Adham Idiboyev** ([@SuperMix](https://github.com/idiboyev)).

Kanal yoki guruhni skanerlaydi, media turlari bo'yicha ajratadi va tanlanganlarini kompyuteringizdagi papkaga tartib bilan saqlaydi: fayl nomi shablonlari, papka tuzilmasi, faqat yangilarini yuklash, oflayn arxiv (`index.html`) va statistika.

> TeleVault mustaqil loyiha. Telegram bilan bog'liq emas, Telegram tomonidan tasdiqlanmagan yoki homiylik qilinmagan. "Telegram" — Telegram FZ-LLC'ning savdo belgisi.

---

## Himoyalangan kontent

Kanal yoki guruh egasi **"Restrict saving content"** (kontentni saqlashni cheklash) ni yoqqan bo'lsa, TeleVault:

- bu chatda yuklash tugmalarini qo'shmaydi va Telegram yashirgan tugmalarni ochmaydi;
- skanerda bunday chatni yuklamaydi, alohida himoyalangan postlarni o'tkazib yuboradi.

Kengaytmadan faqat o'zingizga tegishli yoki saqlashga ruxsat berilgan kontent uchun foydalaning. Mualliflik huquqi va Telegram [foydalanish shartlari](https://telegram.org/tos)ga rioya qilish foydalanuvchi zimmasida.

---

## Imkoniyatlar

- **Media ko'ruvchidagi tugma** — rasm, video, hikoya yoki ovozli xabarni ochganda yuklab olish tugmasi.
- **Kanal skaneri** (`Alt+Shift+D`) — oxirgi N ta post, tur bo'yicha filtr, qidiruv, saralash.
- **Papkaga saqlash** — bir marta papka tanlanadi, fayllar diskka bo'laklab yoziladi, uzilgan yuklash davom ettiriladi.
- **Faqat yangilari, ko'p kanal, avtomatik kuzatuv, oflayn arxiv, statistika** — batafsil quyidagi versiyalar tarixida.

## Maxfiylik

TeleVault hech qanday ma'lumotni muallifga yoki uchinchi tomonga yubormaydi: serveri, analitikasi va reklamasi yo'q. Batafsil: [privacy.html](privacy.html).

| Ruxsat | Nima uchun |
|---|---|
| `storage` | Sozlamalar, yuklash tarixi, kanal belgilari |
| `notifications` | Yuklash tugaganda bildirishnoma (o'chirsa bo'ladi) |
| Telegram Web sahifalari | Tugmalar va skaner panelini shu sahifalarga qo'shish |

## O'rnatish (ishlab chiquvchi rejimi)

1. `chrome://extensions` ni oching.
2. **Developer mode** ni yoqing.
3. **Load unpacked** → shu papkani tanlang.

Talab: Chrome 111+.

## Fayllar

```text
manifest.json   Kengaytma manifesti
background.js   Bildirishnomalar, sozlamalar sahifasini ochish
bridge.js       chrome.storage ↔ sahifa ko'prigi
observer.js     Media ko'ruvchiga tugmalar qo'shish
scanner.js      Kanal skaneri va yuklash navbati
panel.js        Skaner paneli (Shadow DOM)
archive.js      Oflayn arxiv (index.html)
downloader.js   Bo'laklab yuklash
options.*       Sozlamalar sahifasi
privacy.html    Maxfiylik siyosati
```

## Muallif va litsenziya

© 2026 Adham Idiboyev (@SuperMix). Batafsil: [LICENSE](LICENSE).

Media ko'ruvchiga tugma qo'shish va bo'laklab yuklash qismi ochiq kodli [Neet-Nestor/Telegram-Media-Downloader](https://github.com/Neet-Nestor/Telegram-Media-Downloader) (GPL-3.0) loyihasiga asoslangan.

---

# Versiyalar tarixi

### 2.0 — Kanal skaneri va sozlamalar

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

### 2.1 — Faqat yangilarini yuklash

Kanaldan yuklab olganingizda oxirgi yuklangan post eslab qolinadi. Keyingi safar panelda **Yangilarini yuklash** tugmasi chiqadi:

- tarix faqat o'sha postgacha o'qiladi (`maxPosts` cheklovi qo'llanmaydi), shuning uchun katta kanallarda ham tez ishlaydi;
- topilgan yangi medialar darhol yuklanadi (sozlamalarda o'chirsa bo'ladi — unda faqat belgilanadi);
- papka eslab qolinadi, har safar qayta tanlash shart emas;
- xato bilan tugagan fayl belgini ushlab turadi, keyingi safar u qayta urinib ko'riladi;
- 2.1 dan oldin Web K'da yuklangan kanallar uchun belgi yuklash tarixidan avtomatik olinadi.

Belgini panelda yoki Sozlamalar → **Yangilari** bo'limida har bir kanal uchun alohida tozalash mumkin.

### 2.2 — Ko'p kanal, davom ettirish, albomlar, papka tuzilmasi

- **Kanallar** (panelda yangi tab, faqat Web K): yuklangan barcha kanallar ro'yxati. Keraklilarini belgilab **Tanlanganlarni yangilash** bosiladi — har bir kanaldan faqat oxirgi yuklashdan keyingi media yuklanadi, chatlarni ochish shart emas.
- **Uzilgan yuklashni davom ettirish** (papka rejimi): tarmoq uzilsa yoki "To'xtatish" bosilsa, yozilgan qism saqlanib qoladi. Keyingi urinishda fayl boshidan emas, to'xtagan joyidan davom etadi (ro'yxatda `davom` belgisi).
- **Albomlar**: bitta postdagi bir nechta media "Albom 2/5" deb belgilanadi. Fayl nomi uchun `{album}` va `{n}` teglari qo'shildi.
- **Papka tuzilmasi**: Sozlamalar → Yuklab olish → *Papka tuzilmasi*. Masalan `{year}-{month}/{type}` yoki `{album}`. Teglar: `{year} {month} {day} {date} {type} {album}`.

### 3.0 — To'liq arxivlash vositasi

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

### 3.1.0 — TeleVault

- Yangi nom: **TeleVault**. Muallif: Adham Idiboyev (@SuperMix).
- Himoyalangan ("Restrict saving content") chatlar va postlar endi yuklanmaydi; Telegram yashirgan tugmalar ochilmaydi.
- Maxfiylik siyosati (`privacy.html`) qo'shildi.
