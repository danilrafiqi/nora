# Analisis Styling Inconsistency - Homepage

## 🔍 Findings

### 1. **Section Padding/Spacing** ❌ INCONSISTENT
- **Services:** `py-12 px-6`
- **Gallery:** `py-12 px-6`
- **Videos:** `py-12 px-6`
- **Footer:** `py-10 px-6` ⚠️ **BERBEDA!** (harusnya `py-12`)

### 2. **Text Color System** ❌ INCONSISTENT
- **Navbar Menu:** `text-typography-700` ✅ (pakai design system)
- **Section Titles:** `text-[#333]` ⚠️ (hardcoded, harusnya pakai design system)
- **Descriptions:** `text-[#666]` ⚠️ (hardcoded)
- **Subtexts:** `text-[#999]` ⚠️ (hardcoded)
- **Footer Text:** `text-[#CCC]`, `text-white`, `text-[#999]` ⚠️ (hardcoded)

**Masalah:** Mix antara design system (`typography-700`) dengan hardcoded colors (`#333`, `#666`, dll)

### 3. **Gap Spacing** ❌ INCONSISTENT
- **Services Grid:** `gap-5` (20px)
- **Gallery Grid:** `gap-2` (8px) ⚠️ **SANGAT KECIL!**
- **Videos Grid:** `gap-4` (16px)
- **Footer:** `gap-10` (40px)

**Masalah:** Tidak ada konsistensi spacing system

### 4. **Border Radius** ❌ INCONSISTENT
- **Services Cards:** `rounded-2xl` (16px)
- **Gallery Images:** `rounded-xl` (12px)
- **Video Cards:** `rounded-xl` (12px)
- **App Buttons:** `rounded-lg` (8px)

**Masalah:** Bedanya terlalu banyak, harus konsisten

### 5. **Card Shadow** ❌ INCONSISTENT
- **Services Cards:** `shadow-lg` ✅
- **Gallery Images:** NO SHADOW ⚠️
- **Video Cards:** NO SHADOW ⚠️

**Masalah:** Services ada shadow, yang lain tidak

### 6. **Title Alignment** ⚠️ MINOR
- **Services:** `text-center` di Text component
- **Gallery:** `text-center` di VStack parent (via `items-center`)
- **Videos:** `text-center` di Text component

**Masalah:** Pattern berbeda meski hasilnya sama

### 7. **Primary Color** ❌ INCONSISTENT
- **Logo/Navbar:** `text-[#FF6B9D]` ✅
- **Hero Title:** `text-[#FF6B9D]` ✅
- **Buttons:** `bg-[#FF6B9D]`, `border-[#FF6B9D]` ✅
- **Play Button:** `bg-[rgba(255,107,157,0.9)]` ✅

**Note:** Primary color konsisten ✅

### 8. **Section Background Colors** ✅ MOSTLY CONSISTENT
- **Hero:** `bg-[#FFE5F0]` (pink pastel) ✅
- **Services/Gallery/Videos:** `bg-white` ✅
- **Footer:** `bg-[#333]` (dark) ✅

**Note:** Background colors konsisten untuk sections putih

### 9. **Image Sizing** ⚠️ INCONSISTENT
- **Services Images:** `h-[180px]` fixed
- **Gallery Images:** `h-[300px]` atau `h-[250px]` (conditional, masonry)
- **Video Images:** `h-[280px]` fixed

**Note:** Masonry gallery memang perlu berbeda, tapi bisa lebih konsisten

### 10. **Typography Hierarchy** ❌ INCONSISTENT
- **Section Titles:** Semua `text-3xl` ✅
- **Service Names:** `text-xl` ✅
- **Service Descriptions:** `text-sm` ✅
- **Gallery Subtitle:** `text-base` ⚠️ (seharusnya `text-sm` atau `text-lg` untuk konsistensi)

---

## 📊 Summary

### ✅ **Consistent:**
- Section titles size (`text-3xl`)
- Primary color usage (`#FF6B9D`)
- Section backgrounds
- Button component usage

### ❌ **Inconsistent:**
1. **Section padding:** Footer pakai `py-10` bukan `py-12`
2. **Text colors:** Mix design system vs hardcoded
3. **Gap spacing:** `gap-2`, `gap-4`, `gap-5` - tidak konsisten
4. **Border radius:** `rounded-lg`, `rounded-xl`, `rounded-2xl` - beda semua
5. **Shadows:** Services ada, gallery & videos tidak
6. **Typography hierarchy:** Sedikit berbeda

---

## 🔧 Recommendations

### 1. **Standardize Section Padding**
```tsx
// All sections
className="py-12 px-6"
// Except Footer (bisa beda jika design memerlukan)
className="py-10 px-6" // atau ubah jadi py-12
```

### 2. **Use Design System Colors**
```tsx
// Instead of:
text-[#333]
text-[#666]
text-[#999]

// Use:
text-typography-900  // for headings
text-typography-600  // for body
text-typography-500  // for muted
```

### 3. **Standardize Gap Spacing**
```tsx
// Grid items: gap-4 (16px) untuk semua
gap-4  // Consistent medium spacing
```

### 4. **Standardize Border Radius**
```tsx
// Cards: rounded-xl (12px) untuk semua
rounded-xl  // Medium radius
// atau rounded-2xl (16px) untuk semua jika mau lebih rounded
```

### 5. **Add Consistent Shadows**
```tsx
// All cards should have shadow
shadow-md  // Medium shadow untuk semua cards
// atau shadow-lg untuk emphasis
```

### 6. **Standardize Typography**
```tsx
// Section titles: text-3xl font-bold text-center
// Subtitles: text-base atau text-lg (konsisten)
// Body: text-sm
```

---

## 🎯 Priority Fixes

1. **HIGH:** Fix section padding (Footer `py-10` → `py-12`)
2. **HIGH:** Standardize gap spacing (gunakan `gap-4` untuk semua grids)
3. **MEDIUM:** Use design system colors instead of hardcoded
4. **MEDIUM:** Standardize border radius
5. **LOW:** Add shadows to gallery & video cards
6. **LOW:** Standardize typography hierarchy

---

## 💡 Suggested Standard Values

```tsx
// Spacing
py-12 px-6    // Section padding
gap-4         // Grid gap

// Border Radius
rounded-xl    // Cards (12px)

// Shadows
shadow-md     // Cards

// Typography
text-3xl      // Section titles
text-lg       // Subtitles
text-sm       // Body/descriptions

// Colors (Design System)
text-typography-900  // Headings
text-typography-600  // Body
text-typography-500  // Muted
text-[#FF6B9D]       // Primary accent
```

