# DIPA HQ — PHASE 3 REPORT: CHARACTER ANIMATION & BEHAVIOR SYSTEM

**Proyek:** DIPA HQ / DIPA NEXUS — AI OPERATIONS CENTER
**Fase:** 3 — Character Animation & Behavior System
**Tanggal:** 2026-11-16 (00:37 – 01:30 WIB)
**Status:** SELESAI — diverifikasi di browser nyata, dengan catatan (lihat §9)
**Checkpoint Fase 2:** `~/workspace/dipa-hq/checkpoints/phase2/` (37 file, terverifikasi identik via `diff -rq`)
**Tidak ada ZIP dibuat. Fase 4 TIDAK dimulai.**

---

## 1. Konfirmasi pra-coding (Master Prompt §L) — 6 poin

| # | Pertanyaan | Jawaban |
|---|-----------|---------|
| 1 | Identitas sudah generik Agent 1–7? | **Ya.** Diverifikasi di browser: directory menampilkan Agent 1–7, role "Unassigned · \<ruangan\>", tidak ada nama lama di body text (`oldNamesPresent: false`). |
| 2 | CEO sudah dipisahkan dari daftar agent? | **Ya.** CEO DFNX PRIME terpisah di `config.js` dan `ceo.js`, di luar Agent 1–7; kartu Executive terpisah di Operations Center. |
| 3 | Nama dan posisi agent tidak dikunci? | **Ya.** Semua identitas/penempatan hanya ada di `js/config.js` (single source of truth); tidak ada nama/role/posisi yang di-hard-code di builder. |
| 4 | Owner Mode nantinya dapat mengatur nama, role, posisi? | **Ya.** Arsitektur config-driven + API debug membuktikan: `setAgentName('agent-1', 'Test Name')` langsung mengubah label di directory, lalu dikembalikan ke "Agent 1". |
| 5 | Struktur Fase 2 tetap dipertahankan? | **Ya.** Gedung, ruangan, eksterior, UI, Three.js r180 lokal, struktur modular — sama. Tidak ada rebuild dari nol. |
| 6 | Rencana mencakup animasi karakter + lingkungan? | **Ya.** Animasi agent, CEO, dan lingkungan semuanya dibangun dan diverifikasi (lihat §4–§5). |

---

## 2. Perubahan identitas (old → new)

Aturan identitas **dibalik** oleh owner (Addendum 2, menggantikan koreksi Fase 2):

| Sebelum (Fase 2) | Sesudah (Fase 3) |
|---|---|
| `DIRECTORY`: Dipa.Ai ×4 kategori di MUSE.AI + Difa.ai / Evelyn.ai / Rafo.ai di CUE.AI | `AGENTS`: **Agent 1–7** (placeholder generik), role **"Unassigned"** |
| Pembagian divisi MUSE.AI / CUE.AI pada identitas agent | **Dihapus dari identitas agent.** Tidak ada pembagian platform/departemen sampai owner menetapkan. |
| Warna suit sebagai kode divisi | Siklus warna netral (bukan kode divisi) |
| `WORKER_SPOTS` per nama | `WORKER_SPOTS` per agent id (posisi sama, key berubah) |
| CEO: DFNX PRIME (sudah terpisah) | **Tetap terpisah**, di luar Agent 1–7; nama/title tetap editable hanya dari config pusat |

Total tetap **8 karakter (7 agent + CEO)**.

**Keputusan yang dicatat:** nama ruangan (mis. "MUSE.AI · R&D LAB" pada sign 3D dan baris ruangan di Operations Center) **dipertahankan** sebagai label lokasi gedung dari desain Fase 2 yang sudah disetujui — bukan pembagian agent. Jika owner juga ingin nama ruangan dinetralkan, itu keputusan terpisah.

**Owner Mode:** arsitektur sudah mendukung (config terpusat + helper `setAgentName` / `setCEOName` + API debug `window.__DIPA_DEBUG`). **UI pengaturan Owner Mode TIDAK diimplementasikan** — sesuai brief, hanya arsitekturnya.

---

## 3. Arsitektur sistem animasi

Empat modul baru, pemisahan tanggung jawab yang bersih (tanpa duplikasi kode):

| File baru | Tanggung jawab |
|---|---|
| `js/rig.js` | Rig sendi bersama untuk agent + CEO: pivot body/torso/head/armL/armR/legL/legR/shinL/shinR + anchor tangan untuk prop (phone/cup/report). |
| `js/animation.js` | Pose target (`POSES`: sitType/sitThink/sitIdle/sitInteract/sitRead/sitSleep/stand/standPoint/standPhone/standCoffee/standRead/standGreet/standIdle/standInteract), `createAnimator` (joint damping berbasis delta-time + layer prosedural: osilasi mengetik, siklus jalan, napas, head scan, lambaian greet, tegukan kopi), `stepMove` (helper gerakan bersama). |
| `js/activity.js` | State machine agent: IDLE / WORKING / THINKING / WALKING / INTERACTING / RESTING / OFFLINE. RNG seeded, start bertahap (frame pertama sudah campuran). Siklus: WORKING → THINKING → WORKING → IDLE → WALKING (kursi → titik target, standInteract di sana, jalan kembali) → WORKING. RESTING/OFFLINE adalah held state via `setActivity`. Safety: snap-home jika timer WALKING kedaluwarsa. |
| `js/environment.js` | Animasi lingkungan (lihat §5). |

**File yang ditulis ulang:** `js/config.js` (identitas + `WALK_TARGETS` per agent + `CEO_SPOTS`), `js/characters.js` (figur berbasis rig, tag generik), `js/ceo.js` (behaviour controller), `js/status.js` (directory flat, "07 AGENTS", tag aktivitas live + label SIMULATION), `js/main.js` (wiring + FPS meter `window.__DIPA_FPS` / `__DIPA_PERF` + API debug `window.__DIPA_DEBUG`).

**File yang diedit untuk referensi animasi:** `js/exterior.js` (rotor/fountain/neon/entranceGlow), `js/floor1.js` + `js/floor2.js` (material layar per-screen via `screenClone`, doors, globe), `js/scene.js` (material kota per-tower), `js/materials.js` (`screenClone`), `js/camera.js` (view baru `ceo`), `index.html` (baris Divisions → "Belum diatur", baris Activity "SIMULATION", menu kamera "Focus: CEO Office"), `README.md`.

**Semua animasi berbasis delta-time** — kecepatan animasi konsisten di perangkat apa pun. **Zero CDN** (Three.js r180 tetap di-vendor lokal). **Tanpa coin/stamina/gem HUD** (tidak ditambahkan kembali).

---

## 4. Animasi agent (7 agent, visibly real)

Pose yang diimplementasikan dan terlihat di browser:

- **Mengetik di workstation** — osilasi lengan (sitType), agent duduk di meja dengan monitor. Terlihat di close-up Research view (`p3-02-typing-t0.png` / `p3-03-typing-t4.png`).
- **Interaksi monitor** — sitInteract, lengan terangkat ke arah layar.
- **Berpikir** — sitThink, tangan ke dagu, head scan pelan (`p3-04-thinking.png`).
- **Idle** — sitIdle/standIdle + napas (body naik-turun halus).
- **Berjalan di dalam ruangan** — siklus kaki + ayunan lengan, agent berpindah dari kursi ke titik target di ruangannya lalu kembali. **Terbukti terukur:** agent-3 bergerak **1,81 unit dalam 5 detik** (dari (-1, 1,15) ke (-2,22, -0,19), status IDLE → WALKING; `p3-05-walk-t0.png` / `p3-06-walk-t4.png`).
- **Duduk di workstation** — pose duduk dengan body turun 0,25 (rig `body.position.y`).
- **Transisi tugas yang halus** — joint damping (bukan lompatan pose); perubahan aktivitas terlihat di tag directory antar sampel (lihat §6).
- **Interaksi dengan objek/lingkungan** — standInteract di titik target saat berjalan; tag INTERACTING muncul di directory (agent-1 dan agent-6 pada `p3-14-rotor-t0.png`).

Status yang teramati di semua run: WORKING, THINKING, IDLE, WALKING, INTERACTING. RESTING dan OFFLINE adalah held state (hanya via `setActivity`, tidak muncul di siklus otomatis) — sesuai desain.

---

## 5. Animasi CEO (DFNX PRIME, terpisah dari Agent 1–7)

Behaviour controller (`js/ceo.js`) dengan 6 behaviour siang + tidur malam:

| Behaviour | Routine label | Spot | Status verifikasi |
|---|---|---|---|
| READ | Membaca laporan | Meja eksekutif | ✅ setOk + readback READ + label benar |
| POINT | Memeriksa papan info | Board Room | ✅ setOk + readback POINT + label benar |
| PHONE | Telepon | Meja (phone prop) | ✅ setOk + readback PHONE + label benar |
| COFFEE | Istirahat kopi | Executive Lounge (cup prop) | ✅ setOk + readback COFFEE + label benar |
| GREET | Menyapa agent | Glass Viewing Area (lambaian) | ✅ setOk + readback GREET + label benar; screenshot lemah (CEO masih dalam perjalanan, lihat §9) |
| INSPECT | Inspeksi | Waypoints (jalan antar titik) | ✅ setOk + readback INSPECT + label benar |
| SLEEP (00:00–07:00 WIB) | Sleeping | Meja eksekutif, pose menunduk + "Zzz" | ✅ readback SLEEP + label "Sleeping" setelah hour mock di-clear; **CEO tidak pernah menghilang** |

Siklus siang otomatis: READ → SUPERVISE → INSPECT (waypoints) → POINT → PHONE → COFFEE → GREET. Prop: report (READ), phone (PHONE), cup (COFFEE). Debug override: `setCEOBehaviour`, `setCEOHour` / `clearCEOHour`, `clearForced`.

Bukti visual: `p3-21-ceo-read.png`, `p3-22-ceo-point.png` (CEO di Board Room, routine "Memeriksa papan info"), `p3-23-ceo-phone.png`, `p3-24-ceo-coffee.png` (CEO jelas terlihat di lounge dengan band mahkota cyan), `p3-25-ceo-greet.png`, `p3-26-ceo-inspect.png`, `p3-27-ceo-sleep2.png` (CEO duduk menunduk di meja, routine "Sleeping").

---

## 6. Animasi lingkungan

| Elemen | Implementasi | Bukti |
|---|---|---|
| Rotor helikopter | Main + tail rotor berputar (grup putar terpisah) | Sudut rotor **233,82 → 237,89** dalam 2,5 dtk; 295,96 di akhir run (`p3-14/15-rotor`) |
| Air mancur | Jet berdenyut (scale 0,86–1,14) + shimmer air | Nilai fountainJet berubah di setiap sampel (`p3-16/17-fountain`) |
| Lampu gedung | Neon ring + entrance glow berdenyut | Terlihat di semua screenshot malam |
| Lampu kota malam | Twinkle per-tower (material ter-clone) | Latar kota berkedip antar frame |
| Monitor workstation | Flicker per-screen (material ter-clone) | Layar berubah intensitas antar screenshot |
| Globe misi | Berputar | `missionGlobe` di `floor1.js` |
| Pintu resepsionis | Geser membuka ~tiap 29 dtk animasi (tertutup 22 dtk → membuka → terbuka 5 dtk → menutup) | **Terbukti:** sampling 150 dtk, `doorMaxOpen = 1`, fase terlihat: closed → opening → open → closing (`verification-diagnose.json`). Dua jendela sampling 35 dtk sebelumnya hanya menangkap fase tertutup — bukan bug, hanya peluang. |

---

## 7. Sistem aktivitas / status (kejujuran)

- Tag aktivitas live di directory, berwarna per state, diperbarui oleh state machine.
- Label **SIMULATION** tampil di directory dan Operations Center — animasi visual-only, bukan status live.
- Status integrasi tetap jujur: **UNKNOWN / NOT CONNECTED**, "Belum terhubung ke platform", "Belum tersedia".
- Toast tap karakter menampilkan nama · ruangan · aktivitas · SIMULATION · UNKNOWN (contoh terverifikasi: `Agent 1 · R&D Lab · WORKING · SIMULATION · UNKNOWN · Belum terhubung ke platform`).
- Tidak ada status CONNECTED / ONLINE / WORKING palsu di mana pun.

---

## 8. Performa (diukur, bukan diklaim)

Metode: Xvfb + headful Firefox + Mesa llvmpipe (software rendering), `window.__DIPA_FPS` (rAF counter) + `renderer.info`.

| Pengukuran | Hasil |
|---|---|
| Desktop 1440×900, BALANCED | **0,5 fps rata-rata (min 0,2; 30 sampel)**; 1.434 draw calls; 78.086 triangles; 719 geometries |
| Mobile 390×844, PERFORMANCE (default mobile) | **1,7 fps rata-rata (min 1,0; 12 sampel; current 1,9)**; 1.011 draw calls; 50.976 triangles; 496 geometries |
| Baseline Fase 2 (checkpoint, rAF probe) | **0,5 fps** |
| Fase 3, kualitas PERFORMANCE (desktop) | **0,8 fps** |

**Kesimpulan jujur:** 0,5 fps adalah baseline software-rendering di VM ini (1,5 shared CPU, tanpa GPU) — **bukan representasi hardware GPU nyata**. Fase 3 **tidak menambah biaya terukur** (0,5 fps sama dengan Fase 2; PERFORMANCE 0,8 fps). Situs ini **tidak diklaim ringan** sebelum ada pengukuran di hardware nyata. Mobile lebih cepat karena PERFORMANCE mematikan shadow (draw call turun 1.434 → 1.011).

**Catatan llvmpipe:** pada ~0,5 fps, satu frame ≈ 2 detik wall-clock. Animasi memakai cap `dtAnim = 0,5 dtk`, sehingga di lingkungan verifikasi ini animasi berjalan ~¼ kecepatan nyata (CEO butuh ~30 dtk wall untuk menempuh 8 unit; di perangkat 60 fps jarak yang sama ≈ 8 dtk). Ini artefak lingkungan verifikasi, bukan bug produk.

---

## 9. Verifikasi — hasil per item acceptance (§J)

Tiga run verifikasi, semuanya bounded dengan timeout (tidak ada run yang hang):

1. **Full suite** `verification/verify-phase3.js` — selesai, exit 0, ~522 dtk. Hasil: `verification-phase3.json`.
2. **CEO re-check** `verification/verify-ceo.js` — selesai, exit 0, ~391 dtk (setelah perbaikan bug case + view). Hasil: `verification-ceo.json`.
3. **Diagnostik tap + pintu** `verification/diagnose-tap-door.js` — selesai, exit 0, ~210 dtk. Hasil: `verification-diagnose.json`.

| # | Item acceptance (§J) | Hasil | Bukti |
|---|---|---|---|
| 1 | 7 karakter agent terlihat | ✅ PASS | Labels Agent 1–7 di directory (desktop + mobile); `p3-01`, `p3-02` |
| 2 | CEO terlihat terpisah | ✅ PASS | CEO di Executive Office, kartu Executive terpisah; `p3-21`–`p3-27` |
| 3 | Agent punya animasi yang benar-benar terlihat | ✅ PASS | Walk 1,81 unit/5 dtk; pose typing/thinking/walk di screenshot berpasangan t0/t4; tag aktivitas berubah antar sampel |
| 4 | CEO punya animasi tersendiri | ✅ PASS | 6 behaviour + sleep, semua readback cocok + routine label benar |
| 5 | Animasi halus | ✅ PASS (dengan catatan) | Joint damping + delta-time; di llvmpipe gerak terlihat patah karena 0,5 fps — itu frame rate render, bukan animasi |
| 6 | Perpindahan aktivitas berfungsi | ✅ PASS | Sampel A vs B berbeda; final activities: WORKING/WORKING/WORKING/WALKING/THINKING/WALKING/WORKING; INTERACTING teramati |
| 7 | Rotor helikopter bergerak | ✅ PASS | Sudut 233,82 → 237,89 (dan 295,96 di akhir run) |
| 8 | Fountain beranimasi | ✅ PASS | fountainJet 0,86–1,14 berubah tiap sampel |
| 9 | Tidak ada error JavaScript | ✅ PASS | **0 console errors, 0 page errors** di ketiga run, desktop + mobile |
| 10 | Tidak ada request CDN yang tidak diperlukan | ✅ PASS | **0 failed requests, 0 external requests** di ketiga run; Three.js lokal |
| 11 | Fungsi Fase 2 tetap berjalan | ✅ PASS | Panel kiri/kanan tutup-buka independen (leftCloseKeepsRightOpen true); jam WIB berdetak 01:04:42 → 01:04:44; quality switch toast "Kualitas grafis: PERFORMANCE"; Upgrade/Report placeholder jujur Fase 5; settings menu terlihat; tap karakter → toast (lihat baris 13) |
| 12 | Desktop berfungsi | ✅ PASS | 1440×900, semua di atas |
| 13 | Android dapat digunakan | ✅ PASS (dengan catatan) | Mobile 390×844: 0 error, identitas + tag aktivitas benar, panel tutup-buka bekerja, 1,7 fps. Layout tetap sempit (gap Fase 2, scope Fase 5) |
| — | Screen recording | ⚠️ SEBAGIAN | `screenshots/p3-recording.webm` — 50,0 dtk, 1,1 MB. Halaman ter-render + jam berdetak, TAPI tur kamera tidak berjalan (browser tertutup saat fokus floor2 di bawah beban llvmpipe+ffmpeg). Screenshot berpasangan (t0/t4) tetap menjadi bukti gerak utama. |

**Tap-to-info (regresi Fase 2):** dua run pertama mencatat `characterTap: null` pada titik-titik tetap — setelah didiagnosis, **bukan bug produk**: (a) titik-titik itu diasumsikan untuk posisi kamera default [17, 13,5, 20], padahal default sebenarnya di `camera.js` adalah **[22, 17, 26]** (nilai Fase 2); (b) tap dengan posisi hasil proyeksi nyata **berhasil**: agent-1 dan agent-3 menampilkan toast lengkap dengan aktivitas + SIMULATION + UNKNOWN; `pickCount = 138` mesh. Tap CEO meleset karena tinggi kepala yang diproyeksikan adalah tinggi berdiri, sementara CEO sedang menunduk dalam pose tidur — artefak harness, bukan bug picking.

---

## 10. Bug yang ditemukan dan diperbaiki

**Bug produk (6):**

1. **`dirSelect` ReferenceError** — dideklarasi di dalam blok `try` di `main.js`, dipakai `setAgentName` di luar blok. Perbaikan: pindah ke module scope.
2. **Cap dt 0,05 → animasi 1/40 kecepatan** — di bawah llvmpipe (~0,5 fps), clamp 0,05 dtk membuat semua animasi berjalan ~1/40 kecepatan nyata (agent-3 hanya bergerak 0,23 unit dalam 5 dtk). Perbaikan: `dtAnim = Math.min(rawDt, 0,5)` untuk update activity/CEO/environment; di perangkat 60 fps dt ≈ 0,016 sehingga cap tidak pernah terpicu; lompatan jalan maks 0,6 unit/frame.
3. **Cache tag aktivitas teracuni** — `updateActivities` dipanggil sebelum `renderDirectory`, mengisi cache saat DOM masih kosong, sehingga tag tetap "—" sampai transisi pertama tiap agent. Perbaikan: reset cache di dalam `renderDirectory` + hapus pemanggilan pre-render.
4. **`focusShot('research')` gagal diam-diam** — view research hanya ada di nav rail, bukan di menu Camera. Perbaikan: helper `focusNav` memakai `[data-nav="research"]`.
5. **View kamera `ceo` terhalang kolom** — posisi pertama [-13, 7,6, 11] menaruh kolom di tengah frame dan CEO jadi siluet kecil gelap. Perbaikan: pos `[-14, 8, 14]`, target `[-6, 5,8, -3,5]`.
6. **`setBehaviour` case mismatch** — script verifikasi mengirim lowercase (`'point'`, `'coffee'`), key `BEHAVIOURS` UPPERCASE, sehingga `setBehaviour` mengembalikan false dan CEO tetap READ. Perbaikan: normalisasi case di `ceo.js` (`String(name).toUpperCase()`).

**Bug harness verifikasi (bukan produk, 2):**

7. `verify-ceo.js`: objek `results` vs `rec` tertukar — JSON tersimpan kosong `{}` pada run pertama; lalu `rec` di-scope di dalam `main()` sementara `save()` di module scope (ReferenceError). Diperbaiki, re-run hijau.
8. `diagnose-tap-door.js`: ekspektasi posisi kamera default salah ([17, 13,5, 20] vs [22, 17, 26] yang sebenarnya) — menjelaskan tap `null` di dua run sebelumnya.

---

## 11. Keterbatasan yang diketahui (jujur)

- **FPS 0,5 (desktop) adalah baseline llvmpipe**, bukan hardware nyata. Jangan klaim ringan sebelum diukur di GPU.
- **Animasi ~¼ kecepatan nyata di bawah llvmpipe** (cap dtAnim 0,5 dtk vs frame ~2 dtk). Di perangkat 60 fps, kecepatan penuh.
- **Pose agent kecil/halus di wide shot** — paling jelas di close-up (Research view). Mengetik adalah osilasi lengan, bukan animasi jari.
- **Screenshot GREET lemah** — CEO masih dalam perjalanan ke Glass Viewing Area saat screenshot diambil (jalan lambat di llvmpipe); behaviour terbukti via readback + routine label, bukan pose lambaian di foto.
- **CEO berjalan antar spot jauh butuh ~30 dtk+ wall di llvmpipe** (artefak lingkungan; ~8 dtk di hardware nyata).
- **Mobile 390px tetap sempit** — nav rail menumpuk kartu DFNX PRIME, panel terbuka menutupi layar (gap Fase 2, scope Fase 5).
- **Atap sangat gelap dari atas; detail interior samar dari view default** (gap Fase 2, tidak berubah).
- **Hanya jendela NIGHT teramati live** (jam nyata 00:57–01:26 WIB). Sunrise/Day/Sunset belum diobservasi live.
- **Recording hanya sebagian** — tur kamera tidak terekam; bukti gerak utama adalah screenshot berpasangan + angka JSON.
- **Pintu hanya terbuka ~5 dtk per ~29 dtk animasi** — perlu sampling panjang untuk menangkapnya (terbukti dengan sampling 150 dtk).
- **Nama ruangan masih memakai label MUSE.AI / CUE.AI / HQ / CORE** sebagai label lokasi gedung (keputusan §2).

---

## 12. Yang BELUM dikerjakan

- **UI pengaturan Owner Mode** — hanya arsitektur (config + helper + API debug). Implementasi UI adalah pekerjaan terpisah, setelah owner menetapkan nama/role final.
- **Fase 4 (Environment) TIDAK dimulai.** Animasi lingkungan di Fase 3 adalah bagian dari brief §I; fase Environment tersendiri tetap menunggu.
- **Tidak ada ZIP** — sesuai brief.
- **Tidak ada optimasi draw call besar** — pengukuran menunjukkan Fase 3 tidak menambah biaya; optimasi lanjutan adalah scope Fase 6 (Performance).

---

## 13. File yang diubah dan file baru

**Baru (4 modul produk):** `js/rig.js`, `js/animation.js`, `js/activity.js`, `js/environment.js`
**Ditulis ulang (5):** `js/config.js`, `js/characters.js`, `js/ceo.js`, `js/status.js`, `js/main.js`
**Diedit (8):** `js/exterior.js`, `js/floor1.js`, `js/floor2.js`, `js/scene.js`, `js/materials.js`, `js/camera.js`, `index.html`, `README.md`
**Harness verifikasi (baru, 8):** `verification/verify-phase3.js`, `verification/smoke3.js`, `verification/fps-probe.js`, `verification/fps-raf.js`, `verification/record3.js`, `verification/record3.sh`, `verification/verify-ceo.js`, `verification/diagnose-tap-door.js`
**Output verifikasi:** `verification-phase3.json`, `verification-ceo.json`, `verification-diagnose.json`, `screenshots/p3-01.png` – `p3-29.png` + `p3-recording.webm` + `p3-smoke.png` (screenshot Fase 2 `01`–`14` tidak disentuh)
**Debug API baru (bantuan verifikasi):** `window.__DIPA_DEBUG` — `project()`, `pickCount()`, `cameraPos()` (selain yang sudah ada: activities/positions/setActivity/resumeActivity/ceoBehaviour/setCEOBehaviour/setCEOHour/clearCEOHour/env/setAgentName/setCEOName).

**Menjalankan ulang verifikasi:**
```bash
cd ~/workspace/dipa-hq/verification
timeout 900 xvfb-run -a -s "-screen 0 1440x900x24" node verify-phase3.js
timeout 600 xvfb-run -a -s "-screen 0 1440x900x24" node verify-ceo.js
timeout 600 xvfb-run -a -s "-screen 0 1440x900x24" node diagnose-tap-door.js
# server lokal di :8125 harus berjalan; checkpoint Fase 2 di ../checkpoints/phase2/
```

---

*Fase 3 selesai. Menunggu keputusan owner: setujui animasi → Fase 4 (Environment), atau minta perubahan.*
