import { db } from '@/services/firebase';
import { collection, getDocs, query, where, orderBy, limit as fbLimit } from 'firebase/firestore';

export type GalleryItem = {
  id: string;
  image_url: string; // Firebase Storage URL atau external URL
  thumbnail_url?: string; // Optional: optimized thumbnail
  category: 'self_foto' | 'fotobox' | 'photografer' | 'photobooth' | 'videobooth360' | 'all';
  title?: string; // Optional: judul foto
  description?: string; // Optional: deskripsi
  featured: boolean; // Tampilkan di homepage
  order: number; // Sorting order
  created_at: string;
  updated_at?: string;
};

/**
 * Get gallery items with optional filters
 */
export async function getGallery(filters?: {
  category?: 'self_foto' | 'fotobox' | 'photografer' | 'photobooth' | 'videobooth360' | 'all';
  featured?: boolean;
  limit?: number;
}): Promise<GalleryItem[]> {
  const { category, featured, limit = 20 } = filters || {};

  // Build query
  let q = query(collection(db, 'gallery'));

  // Apply filters
  if (featured !== undefined) {
    q = query(q, where('featured', '==', featured));
  }

  if (category && category !== 'all') {
    q = query(q, where('category', '==', category));
  }

  // Order by order field (ascending), then by created_at (descending)
  // Note: Firestore requires index for multiple orderBy - using single orderBy for MVP
  q = query(q, orderBy('order', 'asc'));

  // Apply limit
  if (limit) {
    q = query(q, fbLimit(limit));
  }

  const snapshot = await getDocs(q);
  const gallery = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as GalleryItem[];

  return gallery;
}

/**
 * Get featured gallery items for homepage
 */
export async function getFeaturedGallery(limit: number = 20): Promise<GalleryItem[]> {
  return getGallery({ featured: true, limit });
}

