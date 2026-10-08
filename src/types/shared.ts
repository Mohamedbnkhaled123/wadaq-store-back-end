export interface LocalizedString {
  ar: string;
  en: string;
}

export interface ImageItem {
  url: string;
  publicId: string;
  alt: LocalizedString;
}

export interface SeoData {
  title?: LocalizedString;
  description?: LocalizedString;
}

export interface SpecItem {
  label: LocalizedString;
  value: LocalizedString;
}

export interface PackageItemRef {
  product: string; // Product ObjectId or Populated object
  quantity: number;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

export interface HeroCMS {
  image?: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  ctaPrimary: LocalizedString;
  ctaSecondary: LocalizedString;
}

export interface AboutCMS {
  image?: string;
  title: LocalizedString;
  content: LocalizedString;
  mission: LocalizedString;
  vision: LocalizedString;
}

export interface StatItem {
  label: LocalizedString;
  value: string;
}

export interface CustomProductCtaCMS {
  image?: string;
  title: LocalizedString;
  description: LocalizedString;
  buttonText: LocalizedString;
}
