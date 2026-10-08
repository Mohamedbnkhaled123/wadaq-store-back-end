import { Schema, model, Document, Types } from 'mongoose';
import { LocalizedString, ImageItem, SeoData } from '../types/shared';

export interface IProject extends Document {
  title: LocalizedString;
  slug: LocalizedString;
  clientName?: LocalizedString;
  location?: LocalizedString;
  description: LocalizedString;
  images: ImageItem[];
  relatedPackage?: Types.ObjectId;
  completedAt?: Date;
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

const projectSchema = new Schema<IProject>(
  {
    title: { type: localizedStringSchema, required: true },
    slug: {
      ar: { type: String, required: true, unique: true, index: true },
      en: { type: String, required: true, unique: true, index: true },
    },
    clientName: { type: localizedOptionalSchema },
    location: { type: localizedOptionalSchema },
    description: { type: localizedStringSchema, required: true },
    images: { type: [imageItemSchema], default: [] },
    relatedPackage: { type: Schema.Types.ObjectId, ref: 'Package' },
    completedAt: { type: Date },
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

export const Project = model<IProject>('Project', projectSchema);
