import { Request, Response, NextFunction } from 'express';
import { Project } from '../../models/project.model';
import { ApiError } from '../../utils/api-error';
import { generateSlug } from '../../utils/slugify';
import { memoryCache } from '../../utils/cache';

export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { all } = req.query;
    const filter: Record<string, unknown> = {};

    if (all !== 'true') {
      filter.isActive = true;
      filter.isDeleted = false;
    }

    const projects = await Project.find(filter)
      .populate('relatedPackage', 'name slug tier')
      .sort({ completedAt: -1, createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
}

export async function getProjectBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const decodedSlug = decodeURIComponent(rawSlug || '').trim();

    const project = await Project.findOne({
      $or: [{ 'slug.ar': decodedSlug }, { 'slug.en': decodedSlug }],
    }).populate('relatedPackage', 'name slug tier price');

    if (!project) {
      return next(ApiError.notFound('المشروع المطلوب غير موجود'));
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      title,
      clientName,
      location,
      description,
      images,
      relatedPackage,
      completedAt,
      isActive,
      seo,
    } = req.body;

    if (!title?.ar || !title?.en) {
      return next(ApiError.badRequest('عنوان المشروع بالعربية والإنجليزية مطلوب'));
    }
    if (!description?.ar || !description?.en) {
      return next(ApiError.badRequest('وصف المشروع بالعربية والإنجليزية مطلوب'));
    }

    const slugAr = req.body.slug?.ar ? generateSlug(req.body.slug.ar) : generateSlug(title.ar);
    const slugEn = req.body.slug?.en ? generateSlug(req.body.slug.en) : generateSlug(title.en);

    const project = await Project.create({
      title,
      slug: { ar: slugAr, en: slugEn },
      clientName,
      location,
      description,
      images: images || [],
      relatedPackage: relatedPackage || undefined,
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      isActive: isActive !== undefined ? isActive : true,
      isDeleted: false,
      seo: seo || {},
    });

    memoryCache.invalidatePrefix('projects:');

    res.status(201).json({
      success: true,
      message: 'تم إضافة المشروع بنجاح إلى المعرض',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return next(ApiError.notFound('المشروع غير موجود'));

    if (req.body.title) project.title = req.body.title;
    if (req.body.clientName !== undefined) project.clientName = req.body.clientName;
    if (req.body.location !== undefined) project.location = req.body.location;
    if (req.body.description) project.description = req.body.description;
    if (req.body.images !== undefined) project.images = req.body.images;
    if (req.body.relatedPackage !== undefined) project.relatedPackage = req.body.relatedPackage || undefined;
    if (req.body.completedAt) project.completedAt = new Date(req.body.completedAt);
    if (req.body.isActive !== undefined) project.isActive = req.body.isActive;
    if (req.body.seo !== undefined) project.seo = req.body.seo;

    if (req.body.slug?.ar) project.slug.ar = generateSlug(req.body.slug.ar);
    if (req.body.slug?.en) project.slug.en = generateSlug(req.body.slug.en);

    await project.save();
    memoryCache.invalidatePrefix('projects:');

    res.json({
      success: true,
      message: 'تم تحديث المشروع بنجاح',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return next(ApiError.notFound('المشروع غير موجود'));

    project.isDeleted = true;
    project.deletedAt = new Date();
    await project.save();
    memoryCache.invalidatePrefix('projects:');

    res.json({
      success: true,
      message: 'تم حذف المشروع بنجاح',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}
