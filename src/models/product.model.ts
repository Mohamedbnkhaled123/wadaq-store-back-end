import { Schema, model, Document, Types } from 'mongoose';
import { LocalizedString, ImageItem, SeoData, SpecItem } from '../types/shared';

export interface IProduct extends Document {
  name: LocalizedString;
  slug: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  price: number;
  oldPrice?: number;
  images: ImageItem[];
  category: Types.ObjectId;
  specs: SpecItem[];
  sensorySystem?: LocalizedString;
  ageRange?: LocalizedString;
  inStock: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  seo: SeoData;
  createdAt: Date;
  updatedAt: Date;
}

const localizedStringSchema = new Schema(
  {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const localizedOptionalSchema = new Schema(
  {
    ar: { type: String, default: '', trim: true },
    en: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const imageItemSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: localizedOptionalSchema, default: () => ({ ar: '', en: '' }) },
  },
  { _id: false }
);

const specItemSchema = new Schema(
  {
    label: { type: localizedStringSchema, required: true },
    value: { type: localizedStringSchema, required: true },
  },
  { _id: false }
);

const seoSchema = new Schema(
  {
    title: { type: localizedOptionalSchema },
    description: { type: localizedOptionalSchema },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: localizedStringSchema, required: true },
    slug: {
      ar: { type: String, required: true, unique: true, index: true },
      en: { type: String, required: true, unique: true, index: true },
    },
    shortDescription: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    images: { type: [imageItemSchema], default: [] },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    specs: { type: [specItemSchema], default: [] },
    sensorySystem: { type: localizedOptionalSchema },
    ageRange: { type: localizedOptionalSchema },
    inStock: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

productSchema.index({ 'name.ar': 'text', 'name.en': 'text', 'shortDescription.ar': 'text', 'shortDescription.en': 'text' });
productSchema.index({ category: 1, isActive: 1, isDeleted: 1 });

export const Product = model<IProduct>('Product', productSchema);
