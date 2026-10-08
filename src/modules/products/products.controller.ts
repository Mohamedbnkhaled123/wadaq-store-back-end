import { Request, Response, NextFunction } from 'express';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ApiError } from '../../utils/api-error';
import { generateSlug } from '../../utils/slugify';
import { memoryCache } from '../../utils/cache';
import { cloudinary } from '../../config/cloudinary';

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      category,
      featured,
      q,
      sort = 'newest',
      page = '1',
      limit = '24',
      all,
      status,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 24));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};

    if (all === 'true') {
      if (status === 'deleted') {
        filter.isDeleted = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
        filter.isDeleted = false;
      } else if (status === 'active') {
        filter.isActive = true;
        filter.isDeleted = false;
      }
    } else {
      filter.isDeleted = false;
      filter.isActive = true;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (category) {
      const catStr = String(category).trim();
      let decodedCat = catStr;
      try {
        decodedCat = decodeURIComponent(catStr);
      } catch {}
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(catStr);
      const catQuery = isObjectId
        ? { _id: catStr }
        : {
            $or: [
              { 'slug.ar': catStr },
              { 'slug.en': catStr },
              { 'slug.ar': decodedCat },
              { 'slug.en': decodedCat },
            ],
          };
      const categoryDoc = await Category.findOne(catQuery);
      if (categoryDoc) {
        filter.category = (categoryDoc as any)._id;
      } else {
        filter.category = '000000000000000000000000';
      }
    }

    if (q && typeof q === 'string' && q.trim()) {
      const searchTerm = q.trim();
      let matchingCatIds: any[] = [];
      try {
        const matchingCats = await Category.find({
          $or: [
            { 'name.ar': { $regex: searchTerm, $options: 'i' } },
            { 'name.en': { $regex: searchTerm, $options: 'i' } },
            { 'slug.ar': { $regex: searchTerm, $options: 'i' } },
            { 'slug.en': { $regex: searchTerm, $options: 'i' } },
          ],
        }).select('_id');
        matchingCatIds = matchingCats.map((c) => c._id);
      } catch {}

      const searchConditions: any[] = [
        { 'name.ar': { $regex: searchTerm, $options: 'i' } },
        { 'name.en': { $regex: searchTerm, $options: 'i' } },
        { 'shortDescription.ar': { $regex: searchTerm, $options: 'i' } },
        { 'shortDescription.en': { $regex: searchTerm, $options: 'i' } },
        { 'description.ar': { $regex: searchTerm, $options: 'i' } },
        { 'description.en': { $regex: searchTerm, $options: 'i' } },
        { 'sensorySystem.ar': { $regex: searchTerm, $options: 'i' } },
        { 'sensorySystem.en': { $regex: searchTerm, $options: 'i' } },
        { 'specs.value.ar': { $regex: searchTerm, $options: 'i' } },
        { 'specs.value.en': { $regex: searchTerm, $options: 'i' } },
      ];

      if (matchingCatIds.length > 0) {
        searchConditions.push({ category: { $in: matchingCatIds } });
      }

      filter.$or = searchConditions;
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const decodedSlug = decodeURIComponent(rawSlug || '').trim();

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(decodedSlug);
    const query = isObjectId
      ? { $or: [{ _id: decodedSlug }, { 'slug.ar': decodedSlug }, { 'slug.en': decodedSlug }] }
      : { $or: [{ 'slug.ar': decodedSlug }, { 'slug.en': decodedSlug }] };

    const product = await Product.findOne(query).populate('category', 'name slug');

    if (!product) {
      return next(ApiError.notFound('المنتج المطلوب غير موجود'));
    }

    const isAvailable = !product.isDeleted && product.isActive && product.inStock;

    let statusReason: 'deleted' | 'inactive' | 'out_of_stock' | null = null;
    let statusMessage = null;

    if (product.isDeleted) {
      statusReason = 'deleted';
      statusMessage = {
        ar: 'هذا المنتج تم حذفه وغير متاح حالياً',
        en: 'This product has been removed and is currently unavailable',
      };
    } else if (!product.isActive) {
      statusReason = 'inactive';
      statusMessage = {
        ar: 'هذا المنتج غير نشط حالياً',
        en: 'This product is currently inactive',
      };
    } else if (!product.inStock) {
      statusReason = 'out_of_stock';
      statusMessage = {
        ar: 'هذا المنتج غير متوفر في المخزون حالياً',
        en: 'This product is currently out of stock',
      };
    }

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        isAvailable,
        statusReason,
        statusMessage,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRelatedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const decodedSlug = decodeURIComponent(rawSlug || '').trim();

    const currentProduct = await Product.findOne({
      $or: [{ 'slug.ar': decodedSlug }, { 'slug.en': decodedSlug }],
    });

    if (!currentProduct) {
      return next(ApiError.notFound('المنتج غير موجود'));
    }

    const related = await Product.find({
      category: currentProduct.category,
      _id: { $ne: currentProduct._id },
      isActive: true,
      isDeleted: false,
    })
      .limit(4)
      .populate('category', 'name slug');

    res.json({ success: true, data: related });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      shortDescription,
      description,
      price,
      oldPrice,
      images,
      category,
      specs,
      sensorySystem,
      ageRange,
      inStock,
      isFeatured,
      isActive,
      seo,
    } = req.body;

    if (!name?.ar || !name?.en) {
      return next(ApiError.badRequest('اسم المنتج بالعربية والإنجليزية مطلوب'));
    }
    if (!category) {
      return next(ApiError.badRequest('تصنيف المنتج مطلوب'));
    }
    if (price === undefined || price === null || price < 0) {
      return next(ApiError.badRequest('سعر المنتج مطلوب'));
    }

    const slugAr = req.body.slug?.ar ? generateSlug(req.body.slug.ar) : generateSlug(name.ar);
    const slugEn = req.body.slug?.en ? generateSlug(req.body.slug.en) : generateSlug(name.en);

    const product = await Product.create({
      name,
      slug: { ar: slugAr, en: slugEn },
      shortDescription,
      description,
      price,
      oldPrice,
      images: images || [],
      category,
      specs: specs || [],
      sensorySystem,
      ageRange,
      inStock: inStock !== undefined ? inStock : true,
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? isActive : true,
      isDeleted: false,
      seo: seo || {},
    });

    memoryCache.invalidatePrefix('products:');

    res.status(201).json({
      success: true,
      message: 'تم إضافة المنتج بنجاح',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(ApiError.notFound('المنتج غير موجود'));

    if (req.body.name) product.name = req.body.name;
    if (req.body.shortDescription) product.shortDescription = req.body.shortDescription;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.oldPrice !== undefined) product.oldPrice = req.body.oldPrice;
    if (req.body.images !== undefined) product.images = req.body.images;
    if (req.body.category) product.category = req.body.category;
    if (req.body.specs !== undefined) product.specs = req.body.specs;
    if (req.body.sensorySystem !== undefined) product.sensorySystem = req.body.sensorySystem;
    if (req.body.ageRange !== undefined) product.ageRange = req.body.ageRange;
    if (req.body.inStock !== undefined) product.inStock = req.body.inStock;
    if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured;
    if (req.body.isActive !== undefined) product.isActive = req.body.isActive;
    if (req.body.seo !== undefined) product.seo = req.body.seo;

    if (req.body.slug?.ar) product.slug.ar = generateSlug(req.body.slug.ar);
    if (req.body.slug?.en) product.slug.en = generateSlug(req.body.slug.en);

    await product.save();
    memoryCache.invalidatePrefix('products:');

    res.json({
      success: true,
      message: 'تم تحديث المنتج بنجاح',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(ApiError.notFound('المنتج غير موجود'));

    product.isActive = !product.isActive;
    await product.save();
    memoryCache.invalidatePrefix('products:');

    res.json({
      success: true,
      message: `تم ${product.isActive ? 'تنشيط' : 'تعطيل'} المنتج بنجاح`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(ApiError.notFound('المنتج غير موجود'));

    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();
    memoryCache.invalidatePrefix('products:');

    res.json({
      success: true,
      message: 'تم حذف المنتج بنجاح (حذف مؤقت - يظل معروضاً برابطه كغير متاح)',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function restoreProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(ApiError.notFound('المنتج غير موجود'));

    product.isDeleted = false;
    product.deletedAt = undefined;
    await product.save();
    memoryCache.invalidatePrefix('products:');

    res.json({
      success: true,
      message: 'تم استعادة المنتج بنجاح وإعادته للمتجر',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function permanentDeleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(ApiError.notFound('المنتج غير موجود'));

    for (const img of product.images) {
      if (img.publicId) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (err) {
          console.warn(`Failed to destroy Cloudinary image ${img.publicId}:`, err);
        }
      }
    }

    await Product.findByIdAndDelete(id);
    memoryCache.invalidatePrefix('products:');

    res.json({
      success: true,
      message: 'تم حذف المنتج نهائياً من قاعدة البيانات',
    });
  } catch (error) {
    next(error);
  }
}
