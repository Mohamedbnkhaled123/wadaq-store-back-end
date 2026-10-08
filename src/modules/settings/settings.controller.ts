import { Request, Response, NextFunction } from 'express';
import { Settings } from '../../models/settings.model';
import { memoryCache } from '../../utils/cache';

const CACHE_KEY = 'settings:public';

export async function getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cached = memoryCache.get(CACHE_KEY);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.json({ success: true, data: cached });
      return;
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    memoryCache.set(CACHE_KEY, settings, 120);
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const {
      whatsappNumber,
      phone,
      email,
      address,
      currency,
      shippingNote,
      social,
      hero,
      about,
      stats,
      customProductCta,
      logo,
      aiConsultant,
      showPackagesSection,
      showProjectsSection,
    } = req.body;

    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (phone !== undefined) settings.phone = phone;
    if (email !== undefined) settings.email = email;
    if (address !== undefined) settings.address = address;
    if (currency !== undefined) settings.currency = currency;
    if (shippingNote !== undefined) settings.shippingNote = shippingNote;
    if (social !== undefined) settings.social = social;
    if (hero !== undefined) settings.hero = hero;
    if (about !== undefined) settings.about = about;
    if (stats !== undefined) settings.stats = stats;
    if (customProductCta !== undefined) settings.customProductCta = customProductCta;
    if (logo !== undefined) settings.logo = logo;
    if (aiConsultant !== undefined) settings.aiConsultant = aiConsultant;
    if (showPackagesSection !== undefined) (settings as any).showPackagesSection = showPackagesSection;
    if (showProjectsSection !== undefined) (settings as any).showProjectsSection = showProjectsSection;

    await settings.save();
    memoryCache.delete(CACHE_KEY);

    res.json({
      success: true,
      message: 'تم تحديث إعدادات المتجر ومحتوى CMS بنجاح',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}
