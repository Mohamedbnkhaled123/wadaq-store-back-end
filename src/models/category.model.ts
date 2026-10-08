import { Schema, model, Document } from 'mongoose';
import { LocalizedString, ImageItem } from '../types/shared';

export interface ICategory extends Document {
  name: LocalizedString;
  slug: LocalizedString;
  description?: LocalizedString;
  image?: ImageItem;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
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

const imageItemSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: localizedStringSchema, default: () => ({ ar: '', en: '' }) },
  },
  { _id: false }
);

const categorySchema = new Schema<ICategory>(
  {
    name: { type: localizedStringSchema, required: true },
    slug: {
      ar: { type: String, required: true, unique: true, index: true },
      en: { type: String, required: true, unique: true, index: true },
    },
    description: { type: localizedStringSchema },
    image: { type: imageItemSchema },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Category = model<ICategory>('Category', categorySchema);
