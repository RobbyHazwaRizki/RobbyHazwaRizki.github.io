# Web Portofolio Robby Hazwarizki

Web statis (HTML, CSS, JavaScript murni). Tanpa build, langsung jalan di GitHub Pages.

## Jalankan lokal
Data dibaca lewat `fetch`, jadi jangan buka dengan klik dua kali. Pakai ekstensi **Live Server** di VS Code (klik kanan `index.html`, Open with Live Server).

## Yang kamu isi sendiri
| File | Isi |
|---|---|
| `data/site.json` | email, linkedin, cv, tagline, tentang, pencapaian, pengalaman, tech stack, perjalanan |
| `data/projects.json` | daftar project (`"visible": false` untuk menyembunyikan) |
| `data/quiz.json` | soal mini game |

Aturan: field kosong tidak ditampilkan. Section pengalaman, stack, dan perjalanan tersembunyi sampai `"sections"` di `site.json` diubah ke `true` dan array-nya terisi.

## Publish
Push ke `main`. GitHub Pages: Settings, Pages, Source: `main` / root.
Folder `docs/` (PRD, DESIGN, TIMELINE) ada di luar repo ini dan tidak ikut di-push.
