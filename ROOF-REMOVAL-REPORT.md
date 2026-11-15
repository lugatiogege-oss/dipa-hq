# LAPORAN PENGHAPUSAN ATAP + PERBAIKAN NAV — DIPA HQ

**Tanggal:** 16 November 2026 (~02:56–03:10 WIB)
**Pemicu 1 (owner, ~02:55 WIB):** "daripada kubus kotak gk bisa masuk kedalamnya, dan helikopter di atasnya ngeganggu mending hilangkan atapnya" — gedung terbaca seperti kotak tertutup yang tidak bisa dilihat dalamnya; helikopter di atas atap mengganggu.
**Pemicu 2 (owner, ~02:56 WIB, screenshot 02:52:26 WIB):** panel navigasi kiri (Overview, Agents, Buildings, Research, Missions, Analytics, Settings) TIDAK BISA di-hide — di HP 390px menutupi sebagian besar layar dan sangat mengganggu saat eksplorasi 3D.
**Ruang lingkup:** Penghapusan atap + helipad + helikopter, dan perbaikan hide/show panel nav. Tidak ada fitur baru lain, tidak ada Fase 4.
**Snapshot pra-perubahan:** `~/workspace/dipa-hq/checkpoints/perffix/` (115 file, salinan utuh `rebuild/` sebelum perubahan — perubahan ini bisa dibatalkan).

---

## 1. Atap + helipad + helikopter dihapus

Gedung sekarang **open-top dollhouse / cutaway terbuka**: interior lantai 2 terlihat dari atas, tidak ada lagi kubus tertutup. Helikopter dihapus total — **bukan dipindah**, tidak ada pengganti.

| File | Perubahan |
|---|---|
| `js/building.js` | Balok tepi atap (violet, y 7,9) + pelat atap (`deep` + `floorAlt`, y 8,05) DIHAPUS. Slab lantai 2 (pemisah lantai 1–2) TETAP. Papan nama "DIPA NEXUS" dipindah dari tepi atap ke tepi atas dinding depan lantai 2 (y 7,95 — dinding kaca depan berakhir di 7,85, jadi papan menempel di tepinya, ditopang kolom). Strip lampu langit-langit lantai 2 (y 7,78) dibiarkan — tipis (0,035), terbaca sebagai lampu gantung, tidak menghalangi pandangan dari atas. |
| `js/exterior.js` | Seluruh blok helipad + helikopter DIHAPUS (pad, ring kuning + huruf H, neon ring, badan, hidung, boom ekor, rotor utama + rotor ekor, skid, stripe kabin). Fountain, taman, entrance, logo D tetap. |
| `js/environment.js` | Referensi `rotorMain` / `rotorTail` / `neonRing` dihapus (destructure, animasi rotor, pulse neon ring, `rotorAngle` di `getState`). Fountain, entrance glow, twinkle kota, layar, globe, pintu tetap. `setPulseEnabled` tetap ada (dipakai adaptive quality). |
| `js/main.js` | `createEnvironment` tidak lagi menerima `rotorMain`/`rotorTail`/`neonRing`. Tambah debug `__DIPA_DEBUG.roofCheck()` — raycast vertikal dari atas melalui tengah gedung (x 0, z 0): dengan atap, sinar mengenai pelat atap di y ~8,1; tanpa atap, mengenai interior lantai 2 (lantai kaca viewing, y ~4,5). |
| `js/camera.js` | Preset `roof` → **`top`**: pos [16, 20, 16], target [0, 4,2, 0] — pandangan dollhouse dari atas yang melihat KE DALAM gedung. |
| `js/config.js` | `LAYOUT.floor2Top` (7,9) dan `LAYOUT.roofY` (8,05) dihapus — tidak lagi dipakai di mana pun. |
| `index.html` | Tombol kamera "Focus: Roof & Helipad" → "Focus: Top View — Open Interior" (`data-view="top"`). |
| `README.md` | Deskripsi exterior / environment / daftar file / kontrol diperbarui (tidak ada lagi helipad/helikopter). |

**Yang TIDAK berubah:** semua dinding, partisi kaca, kolom, tangga, ruangan, furnitur, fountain, taman, entrance + logo D, backdrop kota, identitas generik Agent 1–7, perilaku CEO, activity system, panel, jam WIB, day/night, tap-to-info. Tidak ada coin/stamina/gem. Tidak ada CDN — Three.js r180 tetap lokal.

---

## 2. Panel navigasi kiri sekarang bisa di-hide

Temuan saat membaca kode: tombol **Menu** di bottom bar sebenarnya SUDAH men-toggle nav (`rail-hidden`) sejak awal — tapi tidak ada tombol tutup di panelnya sendiri, tidak ada jalan kembali yang terlihat saat nav tersembunyi, dan di HP nav muncul secara default menutupi layar. Owner tidak salah laporan: dari sisi pengguna, nav memang "tidak bisa di-hide" dengan cara yang jelas.

| File | Perubahan |
|---|---|
| `index.html` | Tombol collapse **‹** di sudut kanan atas panel nav (`#navCollapse`). Tombol melayang **☰** (`#openNav`) di posisi panel nav (kiri atas: desktop top 96px/left 14px; HP top 64px/left 8px) — muncul setiap kali nav tersembunyi, jadi nav tidak pernah hilang tanpa jalan kembali. CSS untuk keduanya + posisi mobile. |
| `js/ui.js` | Satu fungsi bersama `setNavHidden(hidden)` + `navIsHidden()` yang dipakai ketiga jalur (tombol ‹ di panel, tombol Menu di bottom bar, tombol ☰ melayang) — rail dan tombol ☰ tidak bisa lagi tidak sinkron. State disimpan di `localStorage` (`dipa-hq-nav-hidden`), seperti setting kualitas. `initNav` memulihkan state saat halaman dimuat. |

**Yang TIDAK berubah:** collapse Agent Directory ("☰ Agents") dan Operations Center ("☰ Info") — panel terpisah, tidak disentuh; aksi kamera dari item nav (`initNav`); kartu CEO dan jam (kiri atas / kanan atas); semua perbaikan performa.

---

## 3. Hasil: sebelum vs sesudah (harness yang sama)

Baseline = laporan perbaikan performa (draw calls desktop 320 / HP 271).

| | Sebelum (perffix) | Sesudah | Perubahan |
|---|---|---|---|
| **Draw calls desktop** | 320 | **303** | −17 (atap + helipad + heli hilang) |
| **Draw calls HP 390px** | 271 | **258** | −13 |
| **Segitiga desktop** | 40.392 | **38.000** | −6% |
| **Segitiga HP** | 36.654 | **35.038** | −4% |
| **Geometri desktop / HP** | 184 / 153 | **170 / 140** | −14 / −13 |
| **FPS rata-rata (llvmpipe)** | 2,38 / 12,09 | **2,3 / 10,3** | dalam noise software rendering |
| **Error console / page / request gagal** | 0 | **0** | tetap bersih |

Draw call TURUN sesuai harapan (mesh yang dihapus memang hilang dari render). FPS llvmpipe tidak naik — wajar: penghapusan ~17 draw call tidak mengubah fill-rate software rendering yang mendominasi angka itu. Yang penting: tidak ada regresi performa.

---

## 4. Verifikasi regresi (`verification/verify-roof-removal.js`, exit 0)

Browser asli (Xvfb + headful Firefox), desktop 1440×900 + mobile 390×844, hasil `verification-roof-removal.json`, screenshot `screenshots/rr-*`:

- **Atap benar-benar hilang:** `roofCheck` = **y 4,53** (lantai kaca viewing lantai 2) di desktop DAN mobile — bukan 8,1 (pelat atap). `env()` tidak lagi punya kunci `rotorAngle` (`noRotor: true`). Preset `top` tiba di pos [15,99, 20, 16] target [0, 4,2, 0]. Screenshot `rr-15-top-t0.png` membuktikan: interior lantai 2 terlihat dari atas (papan Executive Lounge / Management Deck / Board Room, lantai kaca viewing), tidak ada atap, tidak ada helikopter.
- **0 console error, 0 page error, 0 failed request, 0 external request** (kedua viewport).
- **Fountain tetap bergerak** — `changed: true` (jet 0,861 → 0,911 → 1,035). Regresi adaptive-monitor yang pernah membekukan fountain TIDAK muncul lagi.
- **CEO:** POINT/COFFEE/GREET semua tiba (8,1 / 12,1 / 8,1 dtk), SLEEP benar (routine "Sleeping", posisi di meja eksekutif).
- **Agent:** agent-3 berjalan **2,23 unit** (IDLE → WALKING → INTERACTING); perubahan aktivitas `changed: true`; identitas tetap generik Agent 1–7, role "Unassigned · Research Lab / Collaboration Room", `platformLabelsPresent: false`.
- **Panel:** kiri/kanan tutup-buka independen, tutup kiri tidak menutup kanan. Tap-to-info: "Agent 1 · Research Lab · THINKING · SIMULATION · UNKNOWN · Belum terhubung ke platform". Jam berdetak (03:04:53 → 03:04:55 WIB).
- **Nav (desktop):** awal terlihat → tombol ‹ menyembunyikan + tombol ☰ muncul → ☰ membuka lagi → Menu menyembunyikan → Menu membuka lagi. Semua 6 langkah benar.
- **Nav (mobile 390px):** awal terlihat → tombol ‹ menyembunyikan + tombol ☰ muncul → screenshot `rr-23-mobile-nav-hidden.png` membuktikan tampilan 3D tidak terhalang dan tombol ☰ terlihat di kiri atas → ☰ membuka lagi (`rr-24-mobile-nav-open.png`) → Menu sembunyikan → Menu tampilkan lagi. `localStorage` tersimpan (`dipa-hq-nav-hidden: "0"` setelah dibuka lagi).
- **Satu insiden saat verifikasi (sudah diperbaiki):** run pertama gagal di `roofCheck` — `Sprite.raycast` butuh `raycaster.camera` (name tag karakter adalah Sprite). Perbaikan: `roofCheck` sekarang mengeset `rc.camera` dan memfilter Sprite dari hasil raycast. Run ulang penuh exit 0.

---

## 5. Yang diperhatikan (jujur)

1. **Interior NIGHT dari atas masih gelap tapi terbaca.** Dari preset `top`, ruangan lantai 2 terlihat lewat papan nama yang menyala + siluet furnitur; ini karakter mode NIGHT, bukan akibat penghapusan atap — atap sebelumnya justru menghalangi cahaya langit. Tidak ada perubahan intensitas lampu (tidak ada masalah nyata di screenshot).
2. **Strip lampu langit-langit lantai 2 (y 7,78) kini "menggantung" tanpa langit-langit.** Sengaja dibiarkan: tipis, menyala lembut, terbaca sebagai lampu gantung. Kalau owner merasa aneh, hapus di revisi berikutnya — satu baris.
3. **Draw call masih 303 / 258.** Masih banyak untuk HP low-end; langkah berikut kalau masih berat: gabungkan lebih jauh atau sembunyikan interior lantai 2 saat kamera jauh (sudah dicatat di laporan performa).
4. **Satu-satunya perubahan perilaku kamera:** preset lama `roof` tidak ada lagi — diganti `top`. Siapa pun yang memakai `data-view="roof"` akan gagal diam-diam (`focus` mengembalikan false); semua referensi di kode dan README sudah diperbarui.

**Fase 4 BELUM dimulai. Tidak ada ZIP. Referensi karakter di `~/workspace/dipa-hq/references/` tidak disentuh (keputusan owner terpisah, masih menunggu).**

---

## 6. Verifikasi URL live setelah deploy

Deploy: commit `4f857ee` di `https://github.com/lugatiogege-oss/dipa-hq` (main), Pages status **built**, `curl` live URL **HTTP 200**, dan `js/main.js` live mengandung `roofCheck`. Cek ulang URL live di browser asli (Xvfb + headful Firefox, `live-check-roof.js`, ~03:08 WIB):

- **Desktop:** `__DIPA_READY=true`, 0 console error, 0 page error, 0 failed request, 0 external request; jam berdetak (03:08:28 → 03:08:31 WIB); 7 worker; `roofCheck` = **y 4,53** (atap hilang di live); `env()` tanpa `rotorAngle`; fountainJet 0,944 (bergerak); draw calls **303**, segitiga 38.120, FPS rata-rata 2,1 (llvmpipe); kualitas PERFORMANCE otomatis (render scale 0,85 — wajar di bawah llvmpipe); preset `top` tiba di pos [16,01, 20, 16,01] target [0, 4,2, 0]; nav: ‹ sembunyikan + ☰ muncul + ☰ buka lagi — semua benar.
- **HP 390px:** `__DIPA_READY=true`, 0 console/page error, 0 failed request; `roofCheck` = **y 4,53**; draw calls **258**, segitiga 35.014, FPS rata-rata 11,4 (llvmpipe); nav: ‹ sembunyikan + ☰ terlihat + ☰ buka lagi — semua benar.
- Screenshot live: `rebuild/screenshots/live-roof-desktop.png`, `live-roof-desktop-top.png` (interior lantai 2 terlihat dari atas, tanpa atap/helikopter), `live-roof-mobile.png`, `live-roof-mobile-nav-hidden.png`.

**Catatan deploy:** saat sinkronisasi, `rsync --delete` sempat menghapus `.git` di `pages/` (folder staging bukan repo git yang dilindungi dari rsync). Dipulihkan tanpa kehilangan riwayat: `git init` + `git fetch origin` + `git reset origin/main` (working tree tidak disentuh), lalu commit di atas `3bb6696` dan push fast-forward normal — tidak ada force-push, tidak ada commit yang hilang. Pelajaran: rsync ke `pages/` harus selalu `--exclude .git`.
