import { Router, Request, Response, NextFunction } from 'express';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Package } from '../models/package.model';
import { Project } from '../models/project.model';
import { requireAdmin } from '../middlewares/auth';

const router = Router();

// Admin stats
router.get('/stats', requireAdmin, async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      deletedProducts,
      totalCategories,
      totalPackages,
      totalProjects,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true, isDeleted: false }),
      Product.countDocuments({ isActive: false, isDeleted: false }),
      Product.countDocuments({ isDeleted: true }),
      Category.countDocuments({ isDeleted: false }),
      Package.countDocuments({ isDeleted: false }),
      Project.countDocuments({ isDeleted: false }),
    ]);

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
          deleted: deletedProducts,
        },
        categories: totalCategories,
        packages: totalPackages,
        projects: totalProjects,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Sitemap data (public)
router.get('/sitemap-data', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [products, categories, packages, projects] = await Promise.all([
      Product.find({ isDeleted: false }).select('slug updatedAt'),
      Category.find({ isDeleted: false }).select('slug updatedAt'),
      Package.find({ isDeleted: false }).select('slug updatedAt'),
      Project.find({ isDeleted: false }).select('slug updatedAt'),
    ]);

    res.json({
      success: true,
      data: {
        products,
        categories,
        packages,
        projects,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
