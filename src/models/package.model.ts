import { Schema, model, Document, Types } from 'mongoose';
import { LocalizedString, ImageItem, SeoData } from '../types/shared';

export interface IPackageItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface IPackage extends Document {
  name: LocalizedString;
  slug: LocalizedString;
  tier: 'basic' | 'standard' | 'premium';
  shortDescription: LocalizedString;
  description: LocalizedString;
  roomSize?: LocalizedString;
  items: IPackageItem[];
  price: number;
  oldPrice?: number;
  images: ImageItem[];
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

const packageItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const packageSchema = new Schema<IPackage>(
  {
    name: { type: localizedStringSchema, required: true },
    slug: {
      ar: { type: String, required: true, unique: true, index: true },
      en: { type: String, required: true, unique: true, index: true },
    },
    tier: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'standard',
    },
    shortDescription: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true },
    roomSize: { type: localizedOptionalSchema },
    items: { type: [packageItemSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    images: { type: [imageItemSchema], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    seo: {
      title: { type: localizedOptionalSchema },
      description: { type: localizedOptionalSchema },
    },
  },
  { timestamps: true }
);

export const Package = model<IPackage>('Package', packageSchema);
