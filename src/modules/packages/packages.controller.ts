import { Request, Response, NextFunction } from 'express';
import { Package } from '../../models/package.model';
import { ApiError } from '../../utils/api-error';
import { generateSlug } from '../../utils/slugify';
import { memoryCache } from '../../utils/cache';

export async function getPackages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { all } = req.query;
    const filter: Record<string, unknown> = {};

    if (all !== 'true') {
      filter.isActive = true;
      filter.isDeleted = false;
    }

    const packages = await Package.find(filter)
      .populate('items.product', 'name slug price images inStock')
      .sort({ price: 1, createdAt: -1 });

    res.json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
}

export async function getPackageBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const decodedSlug = decodeURIComponent(rawSlug || '').trim();

    const pkg = await Package.findOne({
      $or: [{ 'slug.ar': decodedSlug }, { 'slug.en': decodedSlug }],
    }).populate('items.product', 'name slug price oldPrice images inStock shortDescription');

    if (!pkg) {
      return next(ApiError.notFound('باقة تجهيز الغرفة المطلوبة غير موجودة'));
    }

    res.json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
}

export async function createPackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      tier,
      shortDescription,
      description,
      roomSize,
      items,
      price,
      oldPrice,
      images,
      isFeatured,
      isActive,
      seo,
    } = req.body;

    if (!name?.ar || !name?.en) {
      return next(ApiError.badRequest('اسم الباقة بالعربية والإنجليزية مطلوب'));
    }
    if (price === undefined || price === null || price < 0) {
      return next(ApiError.badRequest('سعر الباقة مطلوب'));
    }

    const slugAr = req.body.slug?.ar ? generateSlug(req.body.slug.ar) : generateSlug(name.ar);
    const slugEn = req.body.slug?.en ? generateSlug(req.body.slug.en) : generateSlug(name.en);

    const pkg = await Package.create({
      name,
      slug: { ar: slugAr, en: slugEn },
      tier: tier || 'standard',
      shortDescription,
      description,
      roomSize,
      items: items || [],
      price,
      oldPrice,
      images: images || [],
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? isActive : true,
      isDeleted: false,
      seo: seo || {},
    });

    memoryCache.invalidatePrefix('packages:');

    res.status(201).json({
      success: true,
      message: 'تم إضافة باقة التجهيز بنجاح',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);
    if (!pkg) return next(ApiError.notFound('الباقة غير موجودة'));

    if (req.body.name) pkg.name = req.body.name;
    if (req.body.tier) pkg.tier = req.body.tier;
    if (req.body.shortDescription) pkg.shortDescription = req.body.shortDescription;
    if (req.body.description) pkg.description = req.body.description;
    if (req.body.roomSize !== undefined) pkg.roomSize = req.body.roomSize;
    if (req.body.items !== undefined) pkg.items = req.body.items;
    if (req.body.price !== undefined) pkg.price = req.body.price;
    if (req.body.oldPrice !== undefined) pkg.oldPrice = req.body.oldPrice;
    if (req.body.images !== undefined) pkg.images = req.body.images;
    if (req.body.isFeatured !== undefined) pkg.isFeatured = req.body.isFeatured;
    if (req.body.isActive !== undefined) pkg.isActive = req.body.isActive;
    if (req.body.seo !== undefined) pkg.seo = req.body.seo;

    if (req.body.slug?.ar) pkg.slug.ar = generateSlug(req.body.slug.ar);
    if (req.body.slug?.en) pkg.slug.en = generateSlug(req.body.slug.en);

    await pkg.save();
    memoryCache.invalidatePrefix('packages:');

    res.json({
      success: true,
      message: 'تم تحديث باقة التجهيز وتعديل السعر بنجاح',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}

export async function togglePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);
    if (!pkg) return next(ApiError.notFound('الباقة غير موجودة'));

    pkg.isActive = !pkg.isActive;
    await pkg.save();
    memoryCache.invalidatePrefix('packages:');

    res.json({
      success: true,
      message: `تم ${pkg.isActive ? 'تنشيط' : 'تعطيل'} الباقة بنجاح`,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePackage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const pkg = await Package.findById(id);
    if (!pkg) return next(ApiError.notFound('الباقة غير موجودة'));

    pkg.isDeleted = true;
    pkg.deletedAt = new Date();
    await pkg.save();
    memoryCache.invalidatePrefix('packages:');

    res.json({
      success: true,
      message: 'تم حذف الباقة بنجاح',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
}
