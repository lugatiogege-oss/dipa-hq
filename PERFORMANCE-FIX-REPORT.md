# LAPORAN PERBAIKAN PERFORMA — DIPA HQ

**Tanggal:** 16 November 2026 (~02:40–03:00 WIB)
**Pemicu:** Laporan owner dari HP Infinix HOT 11 — situs "berat banget, digeser juga ngeleg-ngeleg" + "patah-patah". Situs tidak bisa dipakai di HP owner.
**Ruang lingkup:** Perbaikan performa SAJA. Tidak ada fitur baru, tidak ada perubahan tampilan, tidak ada Fase 4.
**Snapshot pra-perbaikan:** `~/workspace/dipa-hq/checkpoints/phase3-revision/` (109 file, salinan utuh `rebuild/` sebelum perbaikan — perbaikan ini bisa dibatalkan).

---

## 1. Apa yang lambat (terukur, bukan tebakan)

Profil diukur dengan harness yang sama sebelum dan sesudah perbaikan (browser Firefox asli + Xvfb + llvmpipe software rendering). Angka FPS llvmpipe adalah baseline software rendering di VM — **bukan** FPS di HP asli — tapi jumlah draw call adalah sinyal yang nyata dan berlaku di semua perangkat.

### Baseline (sebelum perbaikan) — `rebuild/perf-baseline.json`

| | Desktop 1440×900 | HP 390×844 |
|---|---|---|
| FPS rata-rata (llvmpipe) | **0,40** | **1,88** |
| Draw calls | **1.438** | **1.011** |
| Segitiga (triangles) | 78.134 | 50.976 |
| Geometri | 711 | 496 |

### Penyebab utama (5 besar)

1. **~1.400 draw calls.** Hampir setiap bagian kecil adalah mesh sendiri: mullion jendela (~54), kolom (20), anak tangga (30), strip LED server (30), garis jalan (15), bagian workstation (~110), tanaman (~60 bola), kota (34 menara + beacon), karakter (112 bagian). Setiap helper membuat geometri baru — total 711 geometri.
2. **Kaca `transmission`.** Material `M.glass` / `M.glassFloor` adalah `MeshPhysicalMaterial` dengan `transmission: 0,18` — Three.js merender ulang SELURUH scene ke target transmisi setiap frame. Satu material kaca = satu render scene ekstra per frame.
3. **16 PointLight** (+ hemi + directional + ambient = 19 lampu). Setiap lampu titik dievaluasi oleh SETIAP fragment shader. Lampu ada di mana-mana: eksterior 3, server 1, security 1, aksen lantai 1 ada 5, eksekutif 1, viewing 1, aksen lantai 2 ada 4.
4. **Shadow map PCFSoft 1024 + hampir semua mesh `castShadow`.** Shadow pass merender ulang scene sekali lagi.
5. **Update per-frame yang boros.** Efek lingkungan (fountain, neon, twinkle kota, layar) menyentuh 34 material kota + ~25 material layar setiap frame.

Catatan penting: HP sebenarnya SUDAH default ke PERFORMANCE (shadow mati, AA mati, pixel ratio 1,0) — tapi draw call + transmission + lampu tetap menghancurkan Helio G70.

---

## 2. Apa yang diubah (per file)

Semua perubahan di `~/workspace/dipa-hq/rebuild/`. Tampilan dan posisi objek tidak berubah — yang berubah hanya cara objek dirender.

| File | Perubahan |
|---|---|
| `js/materials.js` | Kaca/transmission DIHAPUS: `M.glass` / `M.glassFloor` jadi `MeshStandardMaterial` transparan biasa (tidak ada lagi render scene ekstra per frame). Tambah helper `instancedBoxes()` / `instancedGeo()` (satu geometri + matriks per instance) dan `createPlantCollector()`. |
| `js/scene.js` | 34 menara kota → 3 `InstancedMesh` (satu per tekstur; twinkle sekarang per grup tekstur, 3 material bersama). Beacon → 1 `InstancedMesh`. Garis jalan → 1 `InstancedMesh`. Shadow map PCFSoft → PCF, 512 (BALANCED) / 1024 (ULTRA). |
| `js/building.js` | Kerangka gedung ditulis ulang ke collector per material → 9 `InstancedMesh` (cyan, violet, silver, deep, floor, floorAlt, glass, glassDark, cyanGlow). Posisi dan ukuran sama persis. |
| `js/floor1.js` | Workstation → bagian instanced (meja kayu, kaki, bezel + keyboard, kursi). Layar tetap mesh sendiri (material clone sendiri untuk efek pulse). Rak server → instanced, strip LED → instanced cyan/violet. Meja misi + meja security → instanced. Tanaman → collector. **Lampu security dihapus; lampu aksen 5 → 2.** |
| `js/floor2.js` | Kursi board → instanced (dudukan/tiang/sandaran). Material sofa di-hoist dan dibagi. Tanaman → collector. **Lampu viewing dihapus; lampu aksen 4 → 1.** |
| `js/exterior.js` | Pohon/semak → instanced (batang + tajuk). **Lampu point helikopter dihapus.** |
| `js/rig.js` | Cache geometri dibagi ke 8 rig karakter (capsule/sphere/box/cylinder per parameter). |
| `js/environment.js` | Efek pulse (fountain, neon, twinkle kota, layar) di-throttle ke 10 Hz via accumulator; rotor/pintu/globe tetap per-frame. Tambah `setPulseEnabled()`. |
| `js/performance.js` | Tambah `QUALITY_ORDER` + `nextLowerQuality()` (ULTRA → BALANCED → PERFORMANCE). |
| `js/ui.js` | Tambah export `markQuality(level)` — menu Settings selalu menampilkan level yang sebenarnya aktif. |
| `js/main.js` | **Adaptive quality monitor:** FPS < 20 selama 3 detik → turun satu level otomatis (toast "Kualitas grafis diturunkan otomatis ke X agar lebih lancar"); di lantai PERFORMANCE dengan FPS < 15 → render scale 0,85 ("Mode hemat diaktifkan otomatis agar lebih lancar"). Tidak pernah naik sendiri (naik manual lewat Settings mereset state). `__DIPA_PERF` diperluas (textures/programs); tambah `__DIPA_DEBUG.quality()`. |
| `js/performance.js` + `js/scene.js` | **Pixel ratio dibatasi:** PERFORMANCE max 1,0 · BALANCED max 1,5 · desktop max 2,0 — tidak pernah memakai nilai mentah perangkat (HP 2–3x tidak lagi merender 2–3x piksel). |

**Total PointLight sekarang: 7** (eksterior 2, lantai 1: server 1 + aksen 2, lantai 2: eksekutif 1 + aksen 1) + hemi/dir/ambient = 10 lampu, dari sebelumnya 19.

**Yang TIDAK berubah:** identitas generik Agent 1–7, perilaku CEO, activity system, panel, kamera, jam WIB, day/night, tap-to-info, nama ruangan (Research Lab / Collaboration Room). Tidak ada coin/stamina/gem. Tidak ada CDN — Three.js r180 tetap lokal.

### Koreksi saat verifikasi: fountain sempat membeku

Verifikasi regresi pertama setelah perbaikan menemukan fountain membeku (`fountainJet` tetap 0,8695 di t0/t2/t4, `changed: false`). Penyebab: langkah terakhir adaptive monitor (`reducedScale`) memanggil `environment.setPulseEnabled(false)` — di bawah llvmpipe (~2 fps) monitor itu selalu terpicu, jadi pulse fountain/neon/kota/layar mati selama verifikasi. Di HP asli pada ~30 fps langkah itu tidak akan terpicu, tapi membekukan fountain adalah biaya visual yang nyata dan fountain adalah fitur wajib.

**Keputusan:** pulse-disable DIHAPUS dari langkah `reducedScale` (`js/main.js`) — langkah terakhir sekarang hanya menurunkan render scale ke 0,85. Efek pulse (fountain, neon, kota, layar) **tidak pernah** dimatikan otomatis. Verifikasi ulang dijalankan setelah perbaikan ini (lihat §4).

---

## 3. Hasil: sebelum vs sesudah (harness yang sama)

| | Sebelum | Sesudah | Perubahan |
|---|---|---|---|
| **Desktop FPS rata-rata (llvmpipe)** | 0,40 | **2,38** (sampel 0,9–3,0) | ~6× |
| **HP 390px FPS rata-rata (llvmpipe)** | 1,88 | **12,09** (sampel 9,9–13,8) | ~6,4× |
| **Draw calls desktop** | 1.438 | **320** (konstan) | −78% (~4,5× lebih sedikit) |
| **Draw calls HP** | 1.011 | **271** (konstan) | −73% (~3,7× lebih sedikit) |
| **Segitiga desktop** | 78.134 | **40.392** | −48% |
| **Segitiga HP** | 50.976 | **36.654** | −28% |
| **Geometri desktop** | 711 | **184** | −74% |
| **Geometri HP** | 496 | **153** | −69% |
| **Program shader desktop / HP** | — | 22 / 10 | — |
| **Error console / page / request gagal** | 0 | **0** | tetap bersih |

**Cara membaca angka ini dengan jujur:** FPS desktop llvmpipe tetap rendah secara absolut karena llvmpipe merender 1,3 juta piksel di software (artefak fill-rate VM, bukan HP). Yang penting dan bisa dipercaya lintas perangkat adalah draw call turun ~4×, segitiga turun ~30–50%, dan tidak ada lagi render scene ganda dari transmission. **Situs ini TIDAK diklaim ringan atau mulus** — angka di atas adalah baseline software; penilai sebenarnya adalah HP owner.

---

## 4. Verifikasi regresi (setelah perbaikan fountain)

`verification/verify-phase3-revision.js`, browser asli (Xvfb + headful Firefox), desktop + mobile, exit 0:

- 0 console error, 0 page error, 0 failed request, 0 external request (kedua viewport).
- Identitas tetap generik Agent 1–7, role "Unassigned · Research Lab / Collaboration Room", `platformLabelsPresent: false`, Divisions "Belum diatur", label SIMULATION.
- Jalan: agent-3 bergerak **2,05 unit** (IDLE → WALKING → INTERACTING). Perubahan aktivitas `changed: true`.
- CEO POINT/COFFEE/GREET semua **tiba** (8,1 dtk / 12,1 dtk / 8,1 dtk — lebih cepat dari run revisi Fase 3 yang 24–40 dtk karena FPS naik), SLEEP benar, CEO tidak pernah hilang.
- Rotor bergerak (808,2 → 822,99 → 838,57), pintu bersiklus (doorOpen 0 → 0,79).
- **Fountain (setelah perbaikan): BERGERAK — `changed: true`, fountainJet 1,122 → 0,862 → 0,943 di t0/t2/t4.** Regresi pertama menemukan fountain membeku; perbaikan di §2 (hapus pulse-disable dari langkah `reducedScale`) terbukti benar.
- Panel kiri/kanan tutup-buka independen. Tap-to-info: "Agent 1 · Research Lab · WORKING · SIMULATION · UNKNOWN · Belum terhubung ke platform".
- Jam berdetak (02:45:59 → 02:46:01 WIB). Toast kualitas PERFORMANCE. Upgrade/Report tetap placeholder jujur Fase 5.
- FPS saat regresi ulang: desktop rata-rata 2,2 / calls 320; HP rata-rata 10,5 / calls 271. Jalan agent-3: 2,16 unit. CEO POINT/COFFEE/GREET tiba dalam 8,0 / 12,1 / 8,2 detik.

---

## 5. Apa yang masih paling mahal

1. **320 draw calls desktop / 271 HP masih banyak** untuk HP low-end. Target berikutnya kalau masih berat: gabungkan lebih jauh (lantai, dinding, dan furnitur statis yang tersisa), atau sembunyikan interior lantai 2 saat kamera jauh.
2. **~40 ribu segitiga** — sebagian besar dari karakter (8 rig), tanaman, dan detail interior. Masih wajar, tapi bukan nol.
3. **7 PointLight + 3 lampu global.** Setiap lampu masih dievaluasi tiap fragment. Kalau masih berat, langkah berikutnya adalah mematikan 1–2 lampu aksen lagi atau memakai material emissive tanpa lampu.
4. **Render scale 0,85 di mode hemat** membuat gambar sedikit lebih lembut — itu sengaja, demi kelancaran.
5. **FPS llvmpipe desktop (2,3) bukan target.** Di HP asli, GPU hardware jauh lebih cepat dari software rendering VM — tapi itu baru terbukti kalau owner mencoba langsung.

---

## 6. Yang masih harus dites di HP owner (Infinix HOT 11)

1. Buka https://lugatiogege-oss.github.io/dipa-hq/ — apakah loading terasa lebih cepat?
2. Geser/putar kamera — apakah masih ngeleg-ngeleg, atau sudah mengalir?
3. Animasi (agent mengetik, CEO berjalan, fountain, rotor helikopter) — apakah masih patah-patah?
4. Coba ganti kualitas di Settings (PERFORMANCE / BALANCED / ULTRA) — level mana yang terasa paling pas di HP?
5. Kalau masih berat, laporkan: bagian mana yang paling terasa berat (geser kamera? saat pertama buka? animasi?).

**Fase 4 BELUM dimulai. Tidak ada ZIP.**
