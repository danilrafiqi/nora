/**
 * Normalize phone number to consistent format (62...)
 * Format yang benar: 6281271373982 (tanpa 0 di depan)
 * Examples:
 * - "0812-3456-7890" → "6281234567890"
 * - "+62 812 3456 7890" → "6281234567890"
 * - "6281234567890" → "6281234567890"
 * - "(0812) 3456-7890" → "6281234567890"
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // Convert 0... to 62... (local format to international)
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.substring(1);
  }
  // If already starts with 62, keep it as is
  // If starts with +62, it's already removed by replace(/\D/g, '')

  return normalized;
}

/**
 * Validate if phone number is valid Indonesian format
 * Format: 62xxxxxxxxxxx (11-14 digits starting with 62)
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // Indonesian phone: 62xxxxxxxxxxx (11-14 digits starting with 62)
  return /^62\d{9,12}$/.test(normalized);
}

