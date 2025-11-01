import { db } from '@/services/firebase';
import { normalizePhone } from '@/utils/phoneNormalizer';
import { collection, getDocs, query, where } from 'firebase/firestore';

export type PhotoTransaction = {
  id: string;
  name: string;
  phone: string;
  package: string;
  link: string;
  total_spending?: number;
  created_at: string;
};

/**
 * Get all photo transactions for a customer by phone number
 */
export async function getCustomerPhotos(phone: string): Promise<PhotoTransaction[]> {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    throw new Error('Nomor HP tidak valid');
  }

  const q = query(
    collection(db, 'transaction'),
    where('phone', '==', normalized)
  );

  const snapshot = await getDocs(q);
  const transactions = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as PhotoTransaction[];

  // Sort by created_at descending
  return transactions.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });
}

/**
 * Check if photo link is expired (more than 7 days)
 */
export function isLinkExpired(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 7;
}

/**
 * Get days remaining until link expires
 */
export function getDaysRemaining(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - diffDays);
}

