import { Request, Response, NextFunction } from 'express';
import { Category } from '../../models/category.model';
import { ApiError } from '../../utils/api-error';
import { generateSlug } from '../../utils/slugify';
import { memoryCache } from '../../utils/cache';

const CACHE_KEY = 'categories:public';

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeAll = req.query.all === 'true';

    if (!includeAll) {
      const cached = memoryCache.get(CACHE_KEY);
      if (cached) {
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json({ success: true, data: cached });
        return;
      }
    }

    const filter: Record<string, unknown> = {};
    if (!includeAll) {
      filter.isActive = true;
      filter.isDeleted = false;
    }

    const categories = await Category.find(filter).sort({ order: 1, createdAt: -1 });

    if (!includeAll) {
      memoryCache.set(CACHE_KEY, categories, 120);
      res.setHeader('Cache-Control', 'public, max-age=60');
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, image, order, isActive } = req.body;

    if (!name?.ar || !name?.en) {
      return next(ApiError.badRequest('اسم التصنيف بالعربية والإنجليزية مطلوب'));
    }

    const slugAr = req.body.slug?.ar ? generateSlug(req.body.slug.ar) : generateSlug(name.ar);
    const slugEn = req.body.slug?.en ? generateSlug(req.body.slug.en) : generateSlug(name.en);

    const existing = await Category.findOne({
      $or: [{ 'slug.ar': slugAr }, { 'slug.en': slugEn }],
    });
    if (existing) {
      return next(ApiError.conflict('يوجد تصنيف آخر بنفس الرابط'));
    }

    const category = await Category.create({
      name,
      slug: { ar: slugAr, en: slugEn },
      description,
      image,
      order: order ?? 0,
      isActive: isActive ?? true,
      isDeleted: false,
    });

    memoryCache.invalidatePrefix('categories:');

    res.status(201).json({
      success: true,
      message: 'تم إضافة التصنيف بنجاح',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return next(ApiError.notFound('التصنيف غير موجود'));
    }

    if (req.body.name) category.name = req.body.name;
    if (req.body.description !== undefined) category.description = req.body.description;
    if (req.body.image !== undefined) category.image = req.body.image;
    if (req.body.order !== undefined) category.order = req.body.order;
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

    if (req.body.slug?.ar) category.slug.ar = generateSlug(req.body.slug.ar);
    if (req.body.slug?.en) category.slug.en = generateSlug(req.body.slug.en);

    await category.save();
    memoryCache.invalidatePrefix('categories:');

    res.json({
      success: true,
      message: 'تم تحديث التصنيف بنجاح',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return next(ApiError.notFound('التصنيف غير موجود'));

    category.isActive = !category.isActive;
    await category.save();
    memoryCache.invalidatePrefix('categories:');

    res.json({
      success: true,
      message: `تم ${category.isActive ? 'تنشيط' : 'إلغاء تنشيط'} التصنيف بنجاح`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return next(ApiError.notFound('التصنيف غير موجود'));

    // Soft delete
    category.isDeleted = true;
    category.isActive = false;
    await category.save();
    memoryCache.invalidatePrefix('categories:');

    res.json({
      success: true,
      message: 'تم حذف التصنيف بنجاح (حذف مؤقت)',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return next(ApiError.notFound('التصنيف غير موجود'));

    category.isDeleted = false;
    category.isActive = true;
    await category.save();
    memoryCache.invalidatePrefix('categories:');

    res.json({
      success: true,
      message: 'تم استعادة التصنيف بنجاح',
      data: category,
    });
  } catch (error) {
    next(error);
  }
}
