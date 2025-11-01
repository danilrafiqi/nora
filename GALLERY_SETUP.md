# Gallery Setup Guide

## 📋 Overview

Homepage sudah siap dengan services showcase dan gallery section. Gallery menggunakan collection terpisah di Firestore dan Firebase Storage untuk hosting images.

---

## 🗂️ Firestore Collection Structure

### Collection: `gallery`

Setiap document di collection `gallery` harus memiliki structure berikut:

```typescript
{
  image_url: string;           // Firebase Storage URL atau external URL (required)
  thumbnail_url?: string;      // Optional: optimized thumbnail URL
  category: string;             // 'self_foto' | 'fotobox' | 'photografer' | 'photobooth' | 'videobooth360' | 'all'
  title?: string;               // Optional: judul foto
  description?: string;         // Optional: deskripsi
  featured: boolean;            // true = tampilkan di homepage (required)
  order: number;                // Sorting order (0 = first, higher = later) (required)
  created_at: timestamp;         // Timestamp (required)
  updated_at?: timestamp;       // Optional: timestamp
}
```

### Example Document:

```json
{
  "image_url": "https://firebasestorage.googleapis.com/v0/b/.../path/to/image.jpg",
  "thumbnail_url": "https://firebasestorage.googleapis.com/v0/b/.../path/to/thumb.jpg",
  "category": "self_foto",
  "title": "Portrait Session",
  "description": "Beautiful portrait session with natural lighting",
  "featured": true,
  "order": 0,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

## 🔧 Setup Steps

### 1. Setup Firebase Storage (Sudah Done ✅)

Firebase Storage sudah di-setup di `services/firebase.ts`.

### 2. Upload Images ke Firebase Storage

#### Via Firebase Console:
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project: `norastudio-80ccd`
3. Navigate ke **Storage**
4. Upload images ke folder `gallery/` atau `gallery/thumbnails/`
5. Copy download URL untuk setiap image

#### Via Code (Future - Admin Interface):
```typescript
import { storage } from '@/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload image
const imageRef = ref(storage, `gallery/${imageName}`);
await uploadBytes(imageRef, imageBlob);
const downloadURL = await getDownloadURL(imageRef);
```

### 3. Create Documents di Firestore

#### Via Firebase Console:
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Navigate ke **Firestore Database**
3. Klik **Create Collection** → Nama: `gallery`
4. Click **Add Document**
5. Fill fields sesuai structure di atas:
   - `image_url`: Paste download URL dari Firebase Storage
   - `category`: Pilih salah satu: `self_foto`, `fotobox`, `photografer`, `photobooth`, `videobooth360`, atau `all`
   - `featured`: `true` (untuk tampil di homepage)
   - `order`: Number (0 untuk first, 1 untuk second, dst)
   - `created_at`: Timestamp (gunakan current timestamp)
   - Optional fields: `thumbnail_url`, `title`, `description`, `updated_at`

#### Example Document (via Console):
```
Collection: gallery
Document ID: (auto-generated atau custom)
Fields:
  image_url: "https://firebasestorage.googleapis.com/v0/b/norastudio-80ccd.firebasestorage.app/o/gallery%2Fphoto1.jpg?alt=media&token=..."
  category: "self_foto"
  featured: true
  order: 0
  created_at: 2024-01-15T10:00:00Z (Timestamp)
```

### 4. Firestore Index (Jika Perlu)

Jika query gallery dengan multiple filters (category + featured), Firestore mungkin memerlukan composite index. Firebase akan otomatis prompt untuk create index jika diperlukan.

Current query hanya menggunakan:
- Single `where` filter (`featured == true`)
- Single `orderBy` (`order` ascending)
- `limit` (20 items)

Ini tidak memerlukan composite index.

---

## 🎨 Best Practices

### Image Sizing:
- **Full images**: Max width 1920px, optimized for web
- **Thumbnails**: Max width 400px, square aspect ratio (1:1)
- **Format**: JPEG atau PNG dengan optimization

### Categories:
- Gunakan category yang sesuai dengan service:
  - `self_foto`: Self Foto
  - `fotobox`: FotoBox
  - `photografer`: Foto Pakai Photografer
  - `photobooth`: Photobooth Event
  - `videobooth360`: VideoBooth360
  - `all`: Semua kategori (default)

### Featured Photos:
- Pilih **12-20 foto terbaik** untuk homepage
- Set `featured: true` untuk foto yang ingin ditampilkan di homepage
- Set `featured: false` untuk foto yang tidak ditampilkan di homepage

### Order:
- `order: 0` = Foto pertama (paling atas)
- `order: 1` = Foto kedua
- `order: 2` = Foto ketiga
- dst...
- Foto akan ditampilkan berdasarkan `order` ascending

---

## 🔍 Testing

### Test Query:
1. Buka homepage di `/` atau `/index`
2. Gallery section akan otomatis load featured photos
3. Jika tidak ada data, akan tampil "Gallery akan segera hadir"
4. Jika ada data, akan tampil grid gallery dengan 3 columns

### Expected Behavior:
- Loading state saat fetch gallery
- Empty state jika tidak ada featured photos
- Grid layout dengan 3 columns (responsive)
- Click image untuk open full URL (via Linking)

---

## 📱 Display Logic

### Homepage (`app/index.tsx`):
- Query: `getFeaturedGallery(20)` → `featured: true`, limit 20
- Display: Grid layout 3 columns (31% width each)
- Click action: Open image URL via `Linking.openURL()`

### Future Enhancements:
- Gallery page dengan filter by category
- Lightbox untuk full view
- Image optimization (lazy loading, thumbnails)
- Admin interface untuk upload/manage gallery

---

## ⚠️ Troubleshooting

### Gallery tidak muncul:
1. Check Firestore collection `gallery` ada dan ada documents
2. Check documents memiliki `featured: true`
3. Check `image_url` valid dan accessible
4. Check browser console untuk errors

### Images tidak load:
1. Check Firebase Storage rules (harus allow read)
2. Check `image_url` format valid
3. Check CORS settings untuk external URLs

### Query errors:
1. Check Firestore security rules (harus allow read untuk collection `gallery`)
2. Check composite index jika menggunakan multiple filters

---

## 🔐 Security Rules

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read untuk gallery
    match /gallery/{document} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Auth required untuk write
    }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gallery/{allPaths=**} {
      allow read: if true;  // Public read
      allow write: if request.auth != null;  // Auth required untuk write
    }
  }
}
```

---

## 📝 Next Steps

1. **Upload Images**: Upload 12-20 featured photos ke Firebase Storage
2. **Create Documents**: Create documents di Firestore collection `gallery`
3. **Test**: Test homepage dan verify gallery tampil dengan benar
4. **Optimize**: Optimize images untuk web performance
5. **Admin Interface**: (Future) Buat admin interface untuk upload/manage gallery

---

## ✅ Checklist

- [x] Firebase Storage setup
- [x] Gallery service (`services/galleryService.ts`)
- [x] Homepage dengan gallery section (`app/index.tsx`)
- [x] Route configuration (`app/_layout.tsx`)
- [ ] Upload images ke Firebase Storage
- [ ] Create documents di Firestore collection `gallery`
- [ ] Test homepage dan verify gallery display
- [ ] Setup security rules (jika belum)
- [ ] Optimize images untuk web

---

## 💡 Tips

- Gunakan Firebase Storage untuk hosting images (better performance)
- Optimize images sebelum upload (compress, resize)
- Gunakan thumbnail untuk better loading performance
- Set `order` yang logical untuk display order
- Pilih foto terbaik untuk `featured: true` (12-20 photos ideal)
- Keep images under 1MB untuk better performance
- Use JPEG untuk photos, PNG untuk graphics dengan transparency

---

## 📚 References

- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)
- [React Native Image](https://reactnative.dev/docs/image)

