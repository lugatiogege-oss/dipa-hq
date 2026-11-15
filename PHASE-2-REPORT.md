# DIPA HQ — PHASE 2: VISUAL REBUILD — LAPORAN

**Tanggal:** 16 November 2026, ~00:30 WIB (pekerjaan 15 Nov 22:11 – 16 Nov 00:30 WIB)
**Status: SELESAI — visual building terbangun dan terverifikasi di browser sungguhan.**
**Lokasi:** `~/workspace/dipa-hq/rebuild/` (direktori baru; file asli di `~/workspace/user/files/` dan salinan inspeksi TIDAK diubah)
**Tidak dibuat:** ZIP (deliverable akhir, bukan Phase 2). **Phase 3 TIDAK dimulai.**

---

## 1. Ringkasan

Gedung markas dua lantai penuh sudah dibangun ulang dari nol sebagai proyek terpisah (bukan edit v1/v2.2/v3), mengikuti gambar konsep "DIPA NEXUS AI OPERATIONS CENTER": gedung kaca cutaway 2 lantai, 14 ruangan bernama dan berlabel, helipad + helikopter di atap, air mancur, taman, entrance dengan logo D, latar kota futuristik malam, 8 karakter (7 worker + CEO DFNX PRIME), sistem siang/malam WIB, dan UI glassmorphism (Agent Directory + Operations Center, kartu DFNX PRIME, jam WIB, tombol Camera/Upgrade/Report/Menu).

Tiga.js di-vendor lokal — halaman bekerja penuh tanpa CDN. Verifikasi dilakukan di browser sungguhan (Firefox headful + Xvfb + Mesa llvmpipe, metode yang sama dengan Phase 1): **0 console error, 0 page error, 0 failed request, 0 request eksternal**, jam WIB asli, kedua lantai terlihat dari default view, semua preset kamera bekerja setelah perbaikan, panel buka/tutup independen, tap karakter menampilkan toast jujur (UNKNOWN / NOT CONNECTED).

Selama verifikasi ditemukan **6 bug nyata dan semuanya diperbaiki + diverifikasi ulang** (lihat §6) — termasuk satu bug fatal (halaman tidak bisa load sama sekali karena `three.core.js` hilang) dan satu bug visual di default view (plang "DIPA NEXUS" terbaca terbalik).

---

## 2. Base & logika yang dipakai ulang

| Sumber | Yang dipakai | Yang TIDAK dipakai |
|---|---|---|
| **v3** (base utama) | Struktur gedung cutaway 2 lantai + tangga, ruangan bernama, panel collapsible, daftar ruangan | Monolit satu file (dipecah jadi 15 modul), CDN Three.js |
| **v1** | Logika CEO (patroli + tidur 00:00–07:00 WIB, adaptasi di `js/ceo.js`) dan transisi day/night yang halus (`js/lighting.js`, window sesuai assignment §6) | Monolit, karakter bernama asli di luar koreksi identitas |
| **v2.2** | TIDAK dipakai sebagai fondasi (cabang divergen; Agent Directory kosong, tap pakai `alert()`) | — |

## 3. Pemetaan identitas (koreksi owner — menggantikan assignment §1)

- **MUSE.AI = Dipa.Ai — SATU agent dengan 4 kategori pekerjaan.** Bukan 4 agent berbeda.
- **CUE.AI = Difa.ai, Evelyn.ai, Rafo.ai — tiga agent terpisah.**
- Agent Directory menampilkan **7 baris**: 4 kategori Dipa.Ai (Research, Mission Control, Operations, Development — masing-masing dilabeli sebagai kategori dari agent yang sama) + 3 agent CUE.AI. Panel menulis eksplisit: "01 AGENT · 04 CATEGORIES — 4 kategori pekerjaan dari satu agent Dipa.Ai" dan "03 AGENTS" untuk CUE.AI.
- Agent tambahan hanya via Owner Mode — **belum diimplementasikan**, dilabeli jujur `NOT IMPLEMENTED` (lihat §4.7).
- ⚠️ **Mohon owner koreksi jika pemetaan ini salah** — terutama apakah 4 kategori Dipa.Ai sudah benar (Research / Mission Control / Operations / Development) dan apakah penempatan tiap kategori di ruangan sudah tepat.

## 4. Yang dibangun

### 4.1 Gedung — dua lantai PENUH (bukan mezanin)
- Footprint 21,3 × 13,3 unit; Lantai 1 permukaan y=0,55, plafon 4,2; pelat Lantai 2 y=4,5, permukaan 4,65; atap y=8,05. Kedua lantai terbentang penuh selebar gedung, terpisah jelas oleh pelat + balok, terlihat dari default view (`01-default.png`).
- Dinding kaca transparan di keempat sisi, partisi kaca antar ruangan, kolom + balok struktural, railing kaca di lantai 2, tangga 15 anak tangga dengan strip cyan menyala di sisi kanan (x≈9) dari Lantai 1 (z=5) ke Lantai 2 (z=−1).
- Palet: midnight navy / silver / putih / cyan / violet, sesuai konsep.

### 4.2 Lantai 1 — 9 ruangan, semua berlabel 3D + terdaftar di panel
MUSE.AI R&D Lab, Mission Control Center, Main Operations Floor, CUE.AI Collaboration Area, Development Lab, Server Room, Security Monitoring Area, Lounge and Pantry, Main Entrance and Reception. Tiap ruangan punya plang nama 3D (`sign()` di `floor1.js`, 9 plang) dan baris di Operations Center.

### 4.3 Lantai 2 — 5 ruangan, semua berlabel 3D + terdaftar di panel
Executive Office — DFNX PRIME, Board Room, Executive Lounge, Management Deck/Balcony, Glass Viewing Area (menghadap ke Lantai 1, plang "GLASS VIEWING · OPERATIONS BELOW"). 5 plang 3D di `floor2.js`.

### 4.4 Eksterior (tidak ada yang dihilangkan)
- **Helipad + helikopter** di atap sisi kanan (5.5, 9.0, −2.5): pad dengan marking "H" kuning + cincin neon violet, helikopter berbadan baja-biru dengan stripe cyan, rotor, tail rotor, skid, lampu navigasi.
- **Air mancur** di depan tengah (z≈11,5): kolam + jet pusat + 2 jet samping, cahaya cyan.
- **Latar kota futuristik malam**: ~gedung-gedung dengan jendela menyala mengelilingi HQ + langit malam + bulan.
- **Taman**: semak/pohon di sekeliling + planter di depan entrance; **entrance** dengan kanopi, kolom, anak tangga, dan logo "D" menyala di fascia kanopi.
- **Plang "DIPA NEXUS"** di tepi depan atap — terbaca benar dari arah default (sempat terbalik, diperbaiki — §6.2).

### 4.5 Interior
Workstation + monitor menyala (cyan/violet), server rack dengan strip menyala, meja rapat Board Room, sofa Executive Lounge, meja pantry, lantai glossy (reflektif), strip lampu langit-langit cyan (L1) + violet (L2), pencahayaan arsitektural cyan + violet. Lampu interior menyala penuh di malam hari.

### 4.6 Karakter — posisi benar, pose masih placeholder (Phase 3)
8 figur: Dipa.Ai di area MUSE.AI (R&D, Mission Control, Operations, Development), Difa.ai / Evelyn.ai / Rafo.ai di CUE.AI Collaboration Area, CEO DFNX PRIME di Executive Office (Lantai 2). Masing-masing di workstation sendiri + name tag mengambang. **Pose saat ini statis/placeholder** — sistem animasi bermakna (mengetik, berjalan, duduk, berpikir, interaksi) adalah Fase 3 dan TIDAK diklaim selesai. Tap/klik karakter menampilkan toast non-blocking (bukan `alert()` seperti v2.2), mis. "Dipa.Ai · Mission Control · Mission Control Center · UNKNOWN · Belum terhubung ke platform".

### 4.7 UI & status jujur
- Kiri: nav rail (Overview, Agents, Buildings, Research, Missions, Analytics, Settings) + panel **Agent Directory**; kanan: panel **Operations Center** (Mode: VISUAL PREVIEW, Building: Two floors, daftar 14 ruangan, Executive: DFNX PRIME + Routine, Camera: Reset/Zoom+/Zoom−, Owner Mode: NOT IMPLEMENTED).
- Panel kiri/kanan **collapsible independen** (tutup satu tidak menutup yang lain — terverifikasi).
- Atas kiri: kartu **DFNX PRIME · SUPREME DIRECTOR · Lv. 1 · 0/1000** (avatar SVG); atas kanan: **jam WIB asli + tanggal + fase** (NIGHT · WIB); bawah kiri: branding DIPA NEXUS; bawah kanan: **Camera / Upgrade / Report / Menu**.
- **Tidak ada coin/stamina/gem di mana pun** (perubahan owner). Satu-satunya hit substring "gem" adalah nama ruangan "Management Deck" + satu komentar kode — bukan HUD (cek kata utuh: 0 hit).
- **Status jujur:** semua agent `UNKNOWN`; klik agent → toast "NOT CONNECTED · LIVE STATUS NOT AVAILABLE"; Owner Mode `NOT IMPLEMENTED` dengan teks "Preview ini belum terhubung ke backend, autentikasi, Muse.ai, atau Cue.ai. Owner Mode membutuhkan backend — bukan password di browser." Tidak ada aktivitas agent yang difabrikasi.
- **Upgrade/Report adalah placeholder jujur:** toast "Fitur Upgrade belum tersedia — direncanakan Fase 5" / "Fitur Report belum tersedia — direncanakan Fase 5". Menu & Settings membuka menu; ganti kualitas grafis bekerja (toast "Kualitas grafis: PERFORMANCE").

### 4.8 Sistem siang/malam (dari v1)
Jam WIB asli via `Intl.DateTimeFormat` zona Asia/Jakarta; fase: Sunrise 05:00–06:59, Day 07:00–15:59, Sunset 16:00–17:59, Night 18:00–04:59; transisi langit halus (smoothstep v1: siang naik 05→08, turun 16→19); matahari/bulan, lampu interior menyala di malam hari. **Rutinitas CEO mengikuti v1:** terverifikasi berubah "Wind down" (22:xx) → "Sleeping" (00:xx–07:00) saat jam melewati tengah malam.
⚠️ Baru window NIGHT yang teramati langsung (22:16–00:24 WIB). Window Sunrise/Day/Sunset memakai logika v1 yang sama tapi belum diobservasi — dicatat di §7, dicek tuntas di Fase 7 (mis. dengan mock jam).

### 4.9 Teknis (binding)
- **Three.js 0.180.0 di-vendor lokal, SATU versi, tanpa CDN:** `vendor/three.module.js` (603.113 B, sha256 `c8211c69…`), `vendor/three.core.js` (1.403.455 B, sha256 `eb077d24…` — WAJIB, lihat §6.1), `vendor/addons/controls/OrbitControls.js` (38.703 B, sha256 `b97879c7…`). Import map menunjuk ke file lokal. Verifikasi: **0 external request** selama run penuh.
- **Komponen terpisah (§11), 15 modul JS (~1.720 baris total dgn index.html):** `main` (bootstrap + render loop + error handling), `config` (identitas/palet/layout/window), `materials` (material + helper sign/nameTag), `scene` (renderer/kamera/kontrol + kota malam), `building` (shell, kolom, atap, tangga, plang), `floor1`, `floor2`, `exterior` (helipad, helikopter, air mancur, taman, entrance), `characters`, `ceo`, `lighting` (day/night + jam), `camera` (preset + tween + zoom), `ui` (panel/nav/bottom bar/settings/toast), `status` (directory), `performance` (3 level kualitas + localStorage).
- **Tidak pernah layar hitam diam-diam:** loader "MEMUAT DIPA HQ…" + panel error dengan pesan + tombol "Muat ulang" jika modul gagal dalam 12 detik; `window.__DIPA_READY` hanya true setelah frame pertama berhasil render. (Panel error ini TERBUKTI muncul saat bug §6.1 — lalu hilang setelah diperbaiki.)

## 5. Verifikasi (bukti, bukan klaim)

**Metode (sama dengan Phase 1):** Xvfb + headful Firefox + Mesa llvmpipe (headless Firefox tidak bisa WebGL di VM ini; Chrome diblokir kebijakan Hatch). Playwright Firefox 1572. HTTP server lokal port 8125. Viewport desktop 1440×900, mobile 390×844. Harness verifikasi (persisten, bukan /tmp): `~/workspace/dipa-hq/verification/` (`verify3.js`, `verify-nav.js`).

**Hasil mentah:** `~/workspace/dipa-hq/rebuild/verification-results.json` (desktop + mobile), `~/workspace/dipa-hq/rebuild/nav-results.json` (preset nav). **Screenshot:** `~/workspace/dipa-hq/rebuild/screenshots/` (14 file).

| # | Check | Hasil |
|---|---|---|
| 1 | Halaman load, `__DIPA_READY=true`, loader hilang, error panel tersembunyi | ✅ PASS (desktop + mobile) |
| 2 | 0 console error | ✅ PASS (0 di semua run) |
| 3 | 0 page error / exception | ✅ PASS |
| 4 | 0 failed request (HTTP ≥400) | ✅ PASS (setelah favicon inline; sebelumnya 1× 404 favicon) |
| 5 | 0 request eksternal / CDN | ✅ PASS (semua request ke 127.0.0.1:8125 atau data:) |
| 6 | WebGL2 aktif, canvas 1440×900 (desktop) / 390×844 (mobile) | ✅ PASS |
| 7 | Jam WIB asli + fase NIGHT, tanggal benar (16 Nov 2026, Senin) | ✅ PASS (00:16:43 → 00:21:31 WIB teramati berdetak) |
| 8 | Kedua lantai terlihat dari default view | ✅ PASS (`01-default.png`) |
| 9 | 14 ruangan hadir + berlabel (9 plang L1 + 5 plang L2 di 3D; 21 baris di panel kanan incl. header) | ✅ PASS |
| 10 | Helipad + helikopter + air mancur + taman + entrance + kota malam terlihat | ✅ PASS (`01`, `06`, `07`) |
| 11 | 7 baris Agent Directory, label benar (Dipa.Ai ×4 kategori + Difa.ai/Evelyn.ai/Rafo.ai) | ✅ PASS |
| 12 | Tidak ada coin/stamina/gem (kata utuh) | ✅ PASS (hanya false positive substring "Management Deck") |
| 13 | Panel kiri/kanan tutup + buka independen; tutup kiri tidak menutup kanan | ✅ PASS (desktop + mobile) |
| 14 | Kamera: drag rotate ±45°/180°, preset Floor 1 / Floor 2 / Entrance / Roof, Reset kembali ke default | ✅ PASS setelah perbaikan §6.3–6.4 (`02`–`08`) |
| 15 | Nav rail: Research / Missions / Analytics fokus ke ruangan yang benar + state aktif | ✅ PASS setelah perbaikan §6.4 (`12`–`14`) |
| 16 | Tap karakter → toast (raycast picking) | ✅ PASS desktop: tap (820,500) → "Dipa.Ai · Mission Control · … · UNKNOWN · Belum terhubung ke platform". Mobile: tap (195,300) tidak mengenai karakter (tidak ada toast) — picking-nya sendiri terbukti di desktop |
| 17 | Settings menu terbuka; ganti kualitas → toast "Kualitas grafis: PERFORMANCE" | ✅ PASS |
| 18 | Upgrade / Report → toast placeholder jujur (Fase 5) | ✅ PASS |
| 19 | CEO routine berubah Wind down → Sleeping melewati 00:00 WIB | ✅ PASS (logika v1 bekerja) |
| 20 | Mobile 390×844: load + render + panel buka/tutup | ✅ PASS fungsional — TAPI layout bermasalah, lihat §7.2 |

**Catatan pengukuran:** cek "pixel diversity" canvas mengembalikan 1 warna (hitam) — itu artefak pengukuran, bukan layar hitam: dengan `preserveDrawingBuffer:false` (default Three.js), `drawImage(canvas)` setelah frame selesai menghasilkan kanvas kosong. Bukti render yang benar adalah 14 screenshot. Cek ini tidak dipakai sebagai bukti.

## 6. Bug yang ditemukan saat verifikasi & perbaikan

Semua ditemukan lewat run verifikasi (bukan dari membaca kode saja), semua diperbaiki dan diverifikasi ulang:

1. **FATAL — `three.core.js` hilang, halaman tidak bisa load sama sekali.** Three.js r180 `three.module.js` ternyata hanya wrapper tipis yang `import … from './three.core.js'`. Saya awalnya hanya mengunduh `three.module.js`, sehingga browser 404 pada `three.core.js` → modul gagal → loader jalan terus → panel error 12 detik. Bukti: `diag.js` (requestfailed `NS_ERROR_CORRUPTED_CONTENT`, MIME text/html). **Perbaikan:** unduh `three.core.js` 0.180.0 ke `vendor/` + catat di README bahwa file ini wajib. Diverifikasi: `READY=true`, 0 failed request.
2. **Plang "DIPA NEXUS" terbaca TERBALIK dari default view.** `sign(..., faceFront=true)` melakukan `rotation.y = Math.PI` sehingga plang menghadap ke dalam gedung; dari depan yang terlihat adalah sisi belakang tekstur (mirror). **Perbaikan:** hapus flip di `js/materials.js` (plang menghadap +z secara default) + komentar peringatan agar tidak diulang. Diverifikasi: `01-default.png` kini terbaca "DIPA NEXUS" benar.
3. **Tween kamera berbasis frame — preset tidak pernah sampai di renderer lambat.** `cam.update(dt)` memakai `dt` yang di-clamp 0,05 dtk, sehingga tiap frame hanya maju ~15% sisa jarak; pada ~3 fps (llvmpipe) preset masih di tengah jalan setelah 1,8 detik — screenshot 04–09 run pertama semuanya mid-tween (atap mendominasi frame, preset Roof malah menampilkan sisi gedung). **Perbaikan:** `main.js` kini mengoper waktu riil (`Math.min(rawDt, 0.5)`) ke `cam.update`, sementara `dt` ter-clamp tetap dipakai CEO. Tween konvergen dalam ~1,5 detik wall-clock di semua frame rate.
4. **Preset Camera (Floor 1 / Floor 2 / Entrance / Roof) salah sudut** — kamera terlalu tinggi/dekat sehingga pelat atap (opaque, gelap) mendominasi frame dan lantai yang dituju tidak terlihat. **Perbaikan:** semua preset dipindah ke ketinggian lantai yang dituju, dari depan kaca (mis. Floor 1: `[16, 3.0, 22] → [0, 2.0, 0]`; Roof: `[17, 18, 15] → [0, 8.2, 0]`). Diverifikasi: `04`–`07` kini membingkai lantai/area yang benar.
5. **Preset nav (Research / Missions / Analytics) menembus pelat lantai.** Kamera dari ketinggian Lantai 2 (atau dari atas atap untuk Board Room) membidik ruangan Lantai 1 — garis pandang terhalang pelat Lantai 2 yang solid; hasil run pertama: frame gelap berisi geometri. **Perbaikan:** keempat preset (research, mission, boardroom, security) dipindah ke ketinggian lantai target, dari depan kaca. Diverifikasi: `12`–`14` menampilkan R&D Lab, Mission Control, dan Security Area dengan benar.
6. **Helikopter hampir tak terlihat (siluet hitam).** Badan memakai material `M.deep` (nyaris hitam) sehingga di langit malam hanya tampak bayangan + stripe cyan. **Perbaikan:** badan + tail boom diganti material baja-biru terang (`0x93a9c4`, metalness 0,55). Diverifikasi: helikopter kini terbaca jelas di `01` dan `07`.
7. **Favicon 404.** Ditambah `<link rel="icon">` SVG inline (huruf D). Bukan bug fungsional, tapi menghilangkan satu-satunya failed request.

**Insiden selama verifikasi (dicatat jujur):** run verifikasi pertama (`verify2.js`) di-SIGTERM setelah ~104 menit tanpa menyelesaikan bagian settings/mobile — penyebab pastinya tidak teridentifikasi (diduga browser/compositor macet di bawah llvmpipe). Run pengganti (`verify3.js`, diperkeras: penulisan JSON inkremental per seksi, timeout pada `browser.close()`, `process.exit` eksplisit, guard `timeout 900` di shell) selesai dalam ~5 menit dengan hasil lengkap. Selain itu `/tmp/pwtest` terhapus otomatis di tengah tugas (direktori /tmp memang ephemeral) — harness verifikasi dipindah ke lokasi persisten `~/workspace/dipa-hq/verification/` (termasuk `playwright-core` yang diinstal ulang di sana).

## 7. Keterbatasan yang diketahui (bukan bug — batas scope Phase 2)

1. **Karakter statis.** Pose placeholder; tidak ada animasi mengetik/berjalan/duduk/berpikir. Rotor helikopter diam. → **Fase 3.**
2. **Mobile layout butuh polish (Fase 5):** di 390×844 halaman load + panel berfungsi, TAPI: nav rail menimpa kartu DFNX PRIME; header "MUSE.AI" bertumpuk dengan "01 AGENT · 04 CATEGORIES"; judul "Operations Center" terpotong jadi 2 baris dan tombol "Tutup ×" terbelah; kedua panel terbuka default sehingga menutupi sebagian besar layar; branding bawah "AI OPERATIONS CEN…" terpotong. Diperlukan: panel default tertutup/collapsible di mobile, lebar panel responsif, perbaikan overlap. → **Fase 5.**
3. **Atap sangat gelap.** Pelat atap (hitam pekat) mendominasi dari sudut atas; helipad + helikopter tetap terbaca, tapi atap sendiri nyaris tanpa detail. Kandidat perbaikan: material atap sedikit lebih terang / garis tepi menyala. → Fase 4/5.
4. **Window day/night lain belum diobservasi langsung.** Hanya NIGHT yang terlihat live. Sunrise/Day/Sunset memakai logika v1 yang sama, tapi perlu dicek (mock jam) di Fase 7.
5. **Performa belum diukur.** 3 level kualitas ada dan bisa diganti, tapi tidak ada pengukuran FPS / waktu frame di perangkat nyata; default kualitas belum diputuskan dari data. → **Fase 6.**
6. **Interior gelap dari jauh.** Dari default view, detail ruangan (perabot) terlihat tapi samar; label ruangan 3D kecil dan sebagian tertutup panel UI. Pembacaan ruangan paling baik lewat preset kamera (04/05/12/13).
7. **Tidak ada integrasi nyata.** Semua status UNKNOWN/NOT CONNECTED by design; tidak ada backend, autentikasi, atau koneksi ke Muse.ai/Cue.ai. Owner Mode NOT IMPLEMENTED.

## 8. Yang BELUM dikerjakan (Fase 3–7 — jangan dikerjakan tanpa approval)

- **Fase 3 — Sistem animasi karakter:** mengetik, berjalan, duduk, berpikir, berinteraksi antar karakter; CEO DFNX PRIME (patroli, mengawasi, menunjuk, membaca, telepon, duduk, kopi, istirahat, menyapa) + rotor helikopter berputar; tidur worker hanya saat job/task owner di-pause (bukan jam).
- **Fase 4 — Environment:** efek lingkungan penuh (partikel, cuaca, pencahayaan lanjutan, detail kota malam).
- **Fase 5 — Responsive UI polish:** perbaikan layout mobile §7.2, Upgrade/Report menjadi fitur nyata (atau tetap placeholder jujur bila diputuskan), polish panel.
- **Fase 6 — Performance:** pengukuran FPS, tuning default kualitas per perangkat, optimasi.
- **Fase 7 — Validasi:** pengujian menyeluruh di browser sungguhan (termasuk semua window day/night dengan mock jam, semua preset, mobile), laporan testing.

## 9. Cara menjalankan

```bash
cd ~/workspace/dipa-hq/rebuild
python3 -m http.server 8125        # atau server statis lain
# buka http://localhost:8125/index.html
# HARUS lewat HTTP (ES module + import map tidak jalan via file://)
# Tidak perlu internet / CDN — semua file lokal.
```

## 10. Daftar file

```
~/workspace/dipa-hq/rebuild/
  index.html            entry + UI shell (sha256 1d5bacf3…)
  README.md             install/launch + struktur file
  PHASE-2-REPORT.md     laporan ini
  verification-results.json   hasil run desktop+mobile (verify3.js)
  nav-results.json            hasil run preset nav (verify-nav.js)
  vendor/
    three.module.js     Three.js 0.180.0 (603.113 B, sha256 c8211c69…)
    three.core.js       Three.js 0.180.0 core — WAJIB (1.403.455 B, sha256 eb077d24…)
    addons/controls/OrbitControls.js  (38.703 B, sha256 b97879c7…)
  js/                   15 modul (main, config, materials, scene, building,
                        floor1, floor2, exterior, characters, ceo, lighting,
                        camera, ui, status, performance)
  screenshots/          14 screenshot (01-default, 02-rot45, 03-rot180,
                        04-floor2, 05-floor1, 06-entrance, 07-roof, 08-reset,
                        09-nav-research, 10-mobile, 11-mobile-after,
                        12-nav-research, 13-nav-missions, 14-nav-analytics)
~/workspace/dipa-hq/verification/   harness verifikasi (verify3.js, verify-nav.js,
                        package.json, node_modules/playwright-core)
```

**15 acceptance criteria assignment (§13) — penilaian sendiri Phase 2:** visual gedung + eksterior + interior + karakter (posisi) + day/night (night) + UI dasar + kamera + status jujur + Three.js lokal + komponen terpisah + tanpa coin/stamina/gem = **terpenuhi untuk scope visual**. Yang tersisa untuk kriteria penuh: animasi bermakna (Fase 3), environment penuh (Fase 4), responsive polish (Fase 5), performance terukur (Fase 6), validasi menyeluruh (Fase 7).
