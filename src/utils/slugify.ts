export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .trim()
    .toLowerCase()
    // Remove Arabic diacritics / Tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Replace punctuation and symbols with dash, keeping letters, numbers, Arabic chars
    .replace(/[^\w\s\u0621-\u064A\u0660-\u0669-]/g, '')
    // Replace spaces and underscores with single hyphen
    .replace(/[\s_]+/g, '-')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Trim hyphens from ends
    .replace(/^-+|-+$/g, '');
}
