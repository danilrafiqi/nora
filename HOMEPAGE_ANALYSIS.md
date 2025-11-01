# Analisis Homepage untuk Nora Studio

## 🎯 Konsep Homepage

Homepage sebagai **landing page public** yang menjadi entry point utama untuk customer dan branding studio.

---

## 📋 Konten yang Perlu Ada

### 1. **Hero Section** (Prioritas Tinggi)
**Fungsi:** First impression & clear CTA

**Konten:**
- Logo/Icon studio (📸 atau logo custom)
- Nama studio: "Nora Studio" (atau nama lengkap)
- Tagline/Subtitle: "Creative Photography Studio" atau tagline yang sesuai
- Primary CTA Button: "Lihat Foto Saya" → Link ke `/photos`
- Visual: Hero image (foto studio/foto portfolio) - optional

**UX:**
- Simple & clean
- CTA yang jelas dan prominent
- Mobile-friendly

---

### 2. **Customer Portal Access** (Prioritas Tinggi)
**Fungsi:** Quick access untuk customer cek foto

**Konten:**
- Section: "Lihat Foto Anda"
- Input field: Nomor HP
- Button: "Cari Foto Saya"
- Info: "Masukkan nomor HP yang Anda gunakan saat transaksi"
- Link langsung ke `/photos`

**UX:**
- Prominent (bisa jadi hero section atau section terpisah)
- Easy to use (copy dari `/photos` index)
- Clear instructions

---

### 3. **About Studio** (Prioritas Sedang)
**Fungsi:** Branding & trust building

**Konten:**
- Nama: Nora Studio
- Deskripsi singkat: "Studio foto kreatif yang menghadirkan momen terbaik dalam setiap frame"
- Services: Self photo, portfolio, dll (sesuai kebutuhan)
- Unique selling point: Mengapa pilih Nora Studio?

**UX:**
- Tidak terlalu panjang (2-3 paragraf max)
- Friendly & personal tone
- Optional: Foto studio/foto hasil kerja

---

### 4. **Social Media Links** (Prioritas Sedang)
**Fungsi:** Connect dengan customer & branding

**Konten:**
- Instagram button/link
- Website link (jika ada)
- YouTube link (jika ada)
- WhatsApp contact (optional)

**UX:**
- Icon-based buttons
- Consistent dengan branding
- Easy to tap/share

---

### 5. **Contact Info** (Prioritas Sedang)
**Fungsi:** Customer bisa reach out

**Konten:**
- WhatsApp contact button
- Alamat studio (optional)
- Jam operasional (optional)
- Email (optional)

**UX:**
- Prominent WhatsApp button (karena paling sering dipakai)
- Format yang mudah dibaca

---

### 6. **Quick Stats** (Prioritas Rendah - Optional)
**Fungsi:** Social proof & trust

**Konten:**
- Total customer (jika ada data)
- Total foto yang sudah di-deliver
- Tahun berdiri
- Rating/review (jika ada)

**UX:**
- Simple cards/numbers
- Tidak terlalu prominent

---

### 7. **Navigation** (Prioritas Tinggi)
**Fungsi:** Easy navigation

**Konten:**
- Header: Logo + Navigation menu
- Menu items:
  - Home (current)
  - Lihat Foto (link ke /photos)
  - Tentang Kami (scroll ke about section atau page terpisah)
  - Kontak (scroll ke contact atau page terpisah)
- Footer (optional):
  - Links
  - Copyright
  - Social media

---

## 🎨 UI/UX Design

### Layout Structure:
```
┌─────────────────────────────────────┐
│ Header (Logo + Nav)                 │
├─────────────────────────────────────┤
│                                     │
│ Hero Section                        │
│ - Logo/Icon                         │
│ - Studio Name                       │
│ - Tagline                           │
│ - [Lihat Foto Saya] (Primary CTA)  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ Customer Portal Section             │
│ - "Lihat Foto Anda"                 │
│ - Input Nomor HP                    │
│ - [Cari Foto Saya] Button           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ About Studio Section                │
│ - Deskripsi singkat                 │
│ - Services                          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ Social Media & Contact              │
│ - Instagram, Website, YouTube        │
│ - WhatsApp Contact                  │
│                                     │
├─────────────────────────────────────┤
│ Footer (optional)                   │
└─────────────────────────────────────┘
```

---

## 🔄 Routing Strategy

### Opsi 1: Homepage di Root `/` (Recommended)
- `/` → Homepage (public)
- `/photos` → Customer portal (public)
- `/login` → Admin login (protected)
- `/(tabs)` → Admin dashboard (protected)

**Keuntungan:**
- Homepage accessible untuk semua orang
- Clear entry point
- SEO-friendly untuk web

### Opsi 2: Homepage di `/home`
- `/home` → Homepage
- `/` → Redirect ke `/photos` atau `/home`

**Keuntungan:**
- Existing routes tidak berubah
- Fleksibel

---

## 📱 Mobile vs Web Considerations

### Web:
- Full layout dengan sections
- Hero image (optional)
- Multiple columns untuk social links
- Footer

### Mobile:
- Vertical scroll
- Compact sections
- Big buttons (easy tap)
- Sticky CTA button (optional)

---

## 🎯 Content Priority

### Must Have (Phase 1):
1. ✅ Hero section dengan CTA "Lihat Foto Saya"
2. ✅ Customer portal access (quick search)
3. ✅ Social media links (Instagram, WhatsApp)

### Nice to Have (Phase 2):
4. About studio section
5. Contact info lengkap
6. Quick stats

### Optional (Phase 3):
7. Portfolio/showcase gallery
8. Package list
9. Testimonials
10. FAQ

---

## 💡 Recommended Minimal Content (MVP)

Untuk MVP, cukup:
1. **Hero:** Logo + Nama Studio + CTA "Lihat Foto Saya"
2. **Quick Access:** Input nomor HP langsung (sama seperti `/photos` sekarang)
3. **Social Links:** Instagram + WhatsApp
4. **Simple Footer:** Copyright

**Alasan:**
- Focus ke core function: customer cek foto
- Simple & fast
- Tidak overwhelming
- Bisa expand nanti

---

## 🔧 Technical Implementation

### Route Structure:
```
app/
  index.tsx          → Homepage (public)
  photos/
    index.tsx       → Customer search (public)
    [phone].tsx     → Customer results (public)
  login.tsx         → Admin login (protected)
  (tabs)/           → Admin dashboard (protected)
```

### Components Needed:
- Hero component
- Search form component (bisa reuse dari photos/index)
- Social links component
- Footer component (optional)

---

## 🎨 Design Recommendations

### Color Scheme:
- Consistent dengan existing app
- Professional tapi friendly
- Good contrast untuk readability

### Typography:
- Clear hierarchy (Heading, Subheading, Body)
- Readable font sizes
- Mobile-responsive

### Spacing:
- Enough whitespace
- Section spacing yang jelas
- Padding yang nyaman

---

## 📊 Success Metrics

Setelah homepage ada, bisa track:
- Bounce rate (berapa yang langsung leave)
- CTA click rate (berapa yang klik "Lihat Foto Saya")
- Time on page
- Photo search usage

---

## 🚀 Next Steps untuk Implementation

1. ✅ Buat route `/` sebagai homepage (atau `/home` jika mau)
2. ✅ Design hero section dengan CTA
3. ✅ Integrate customer search (copy dari `/photos` index)
4. ✅ Add social media links
5. ✅ Test di mobile & web
6. ✅ Deploy & monitor

---

## ❓ Questions to Decide

1. **Homepage route:** `/` atau `/home`?
   - **Recommendation:** `/` untuk simplicity & SEO

2. **Search functionality:** Full form di homepage atau button redirect ke `/photos`?
   - **Recommendation:** Quick search di homepage, full form di `/photos`

3. **About section:** Di homepage atau page terpisah?
   - **Recommendation:** Singkat di homepage, detail di page terpisah (nanti)

4. **Admin access:** Login button di homepage atau hidden?
   - **Recommendation:** Hidden (admin akses via direct URL atau dari app mobile)

---

## ✅ Final Recommendation

**MVP Homepage Content:**
1. Hero: Logo + "Nora Studio" + CTA "Lihat Foto Saya"
2. Quick Search: Input nomor HP + Search button (compact version)
3. Social Links: Instagram, WhatsApp
4. Footer: Simple copyright

**Route:** `/` sebagai homepage

**Tone:** Friendly, professional, simple

**Focus:** Customer portal access (primary goal)

