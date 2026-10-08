import { Settings } from '../../models/settings.model';
import Groq from 'groq-sdk';
import { env } from '../../config/env';
import { Product } from '../../models/product.model';
import { Package } from '../../models/package.model';
import { buildSensorySystemPrompt, CatalogItemSummary } from './ai.prompt';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AiService {
  private groqClient: Groq | null = null;
  private cachedProductsSummary: CatalogItemSummary[] = [];
  private cachedPackagesSummary: any[] = [];
  private lastCacheTime = 0;
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.initClient();
  }

  public initClient(): void {
    const apiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.groqClient = new Groq({ apiKey: apiKey.trim() });
    } else {
      this.groqClient = null;
    }
  }

  public isConfigured(): boolean {
    const apiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
    return !!(apiKey && apiKey.trim().length > 0);
  }

  public getModelName(): string {
    return env.GROQ_MODEL || process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
  }

  private async refreshCatalogCache(): Promise<void> {
    const now = Date.now();
    if (this.cachedProductsSummary.length > 0 && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return;
    }

    try {
      const [products, packages] = await Promise.all([
        Product.find({ isActive: true, isDeleted: false })
          .populate('category', 'name slug')
          .select('name slug price sensorySystem shortDescription category images inStock')
          .limit(80)
          .lean(),
        Package.find({ isActive: true, isDeleted: false })
          .select('name slug price tier roomSize images')
          .lean(),
      ]);

      this.cachedProductsSummary = products.map((p: any) => ({
        name: p.name?.ar || p.name?.en || 'أداة حسية',
        category: p.category?.name?.ar || p.category?.name?.en || 'أدوات عامة',
        sensorySystem: p.sensorySystem?.ar || p.sensorySystem?.en || '',
        price: p.price || 0,
        slug: p.slug?.ar || p.slug?.en || '',
        shortDescription: p.shortDescription?.ar || p.shortDescription?.en || '',
      }));

      this.cachedPackagesSummary = packages.map((pkg: any) => ({
        name: pkg.name?.ar || pkg.name?.en || 'باقة تجهيز',
        tier: pkg.tier || 'standard',
        price: pkg.price || 0,
        slug: pkg.slug?.ar || pkg.slug?.en || '',
        roomSize: pkg.roomSize?.ar || pkg.roomSize?.en || '',
      }));

      this.lastCacheTime = now;
    } catch (err) {
      console.error('Error caching catalog for AI:', err);
    }
  }

  /**
   * Extracts recommended product slugs from the AI response and fetches full product objects from DB.
   */
  public async extractRecommendedProducts(rawResponseText: string): Promise<{
    cleanText: string;
    products: any[];
  }> {
    const slugsSet = new Set<string>();

    // 1. Check for explicit [RECOMMENDED_SLUGS: s1, s2] pattern
    const tagRegex = /\[?\s*RECOMMENDED_SLUGS?:?\s*([^\]\n]+)\]?/gi;
    let match;
    while ((match = tagRegex.exec(rawResponseText)) !== null) {
      const list = match[1].split(',').map((s) => s.trim().replace(/['"]/g, ''));
      for (const s of list) {
        if (s) slugsSet.add(s);
      }
    }

    // Clean tag from displayed text so user sees neat text
    const cleanText = rawResponseText
      .replace(/\[?\s*RECOMMENDED_SLUGS?.*$/gis, '')
      .replace(/\[?\s*RECOMMEND[A-Z_]*.*$/gis, '')
      .replace(/\[?\s*RECOMMENDED_SLUGS?:?[^\]\n]*\]?/gi, '')
      .replace(/RECOMMENDED_SLUGS?:?[^\n]*/gi, '')
      .replace(/\[?\s*RECOMMENDED_SLUG[^\n\]]*\]?/gi, '')
      .trim();

    // 2. Also match any mentioned product names or slugs from cached catalog as heuristic fallback
    for (const item of this.cachedProductsSummary) {
      if (item.slug && (cleanText.includes(item.slug) || cleanText.includes(item.name))) {
        slugsSet.add(item.slug);
      }
    }

    const slugsArray = Array.from(slugsSet).slice(0, 6); // Max 6 cards per message

    if (slugsArray.length === 0) {
      return { cleanText, products: [] };
    }

    try {
      const products = await Product.find({
        $or: [{ 'slug.ar': { $in: slugsArray } }, { 'slug.en': { $in: slugsArray } }],
        isActive: true,
        isDeleted: false,
      })
        .populate('category', 'name slug')
        .lean();

      return { cleanText, products };
    } catch (err) {
      console.error('Error fetching recommended products by slug:', err);
      return { cleanText, products: [] };
    }
  }

  public async generateChat(
    userMessages: ChatMessage[],
    lang: 'ar' | 'en' = 'ar'
  ): Promise<{ response: string; model: string; recommendedProducts?: any[] }> {
    if (!this.groqClient) {
      this.initClient();
    }

    if (!this.groqClient) {
      return {
        response:
          lang === 'ar'
            ? 'مرحباً بك! خدمة المستشار الذكي قيد الضبط حالياً. يرجى إضافة مفتاح GROQ_API_KEY في ملف إعدادات الخادم لتفعيل الردود الذكية.'
            : 'Welcome! The AI advisor is currently being configured. Please set GROQ_API_KEY in the server environment.',
        model: 'none',
        recommendedProducts: [],
      };
    }

    await this.refreshCatalogCache();
    const systemPrompt = buildSensorySystemPrompt(
      this.cachedProductsSummary,
      this.cachedPackagesSummary,
      lang
    );

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...userMessages.slice(-8),
    ];

    const model = this.getModelName();

    try {
      const completion = await this.groqClient.chat.completions.create({
        model,
        messages: fullMessages,
        temperature: 0.6,
        max_tokens: 1024,
        top_p: 0.9,
      });

      const rawResponse = completion.choices[0]?.message?.content || '';
      const { cleanText, products } = await this.extractRecommendedProducts(rawResponse);

      return {
        response: cleanText,
        model,
        recommendedProducts: products,
      };
    } catch (error: any) {
      console.error('Groq AI API error:', error);
      if (error?.status === 404 || error?.code === 'model_not_found') {
        const fallbackModel = 'qwen/qwen3.8-27b';
        const completion = await this.groqClient.chat.completions.create({
          model: fallbackModel,
          messages: fullMessages,
          temperature: 0.6,
          max_tokens: 1024,
        });
        const rawResponse = completion.choices[0]?.message?.content || '';
        const { cleanText, products } = await this.extractRecommendedProducts(rawResponse);
        return {
          response: cleanText,
          model: fallbackModel,
          recommendedProducts: products,
        };
      }
      throw error;
    }
  }

  public async streamChat(
    userMessages: ChatMessage[],
    lang: 'ar' | 'en' = 'ar',
    onChunk: (token: string) => void
  ): Promise<{ model: string; recommendedProducts: any[] }> {
    if (!this.groqClient) {
      this.initClient();
    }

    if (!this.groqClient) {
      throw new Error('Groq client is not configured with an API key');
    }

    await this.refreshCatalogCache();
    const systemPrompt = buildSensorySystemPrompt(
      this.cachedProductsSummary,
      this.cachedPackagesSummary,
      lang
    );

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...userMessages.slice(-8),
    ];

    const model = this.getModelName();
    const stream = await this.groqClient.chat.completions.create({
      model,
      messages: fullMessages,
      temperature: 0.6,
      max_tokens: 1024,
      stream: true,
    });

    let fullTextAccumulator = '';
    let insideSlugsBlock = false;
    let streamBuffer = '';

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullTextAccumulator += token;

        if (insideSlugsBlock) {
          continue;
        }

        streamBuffer += token;

        if (
          streamBuffer.toUpperCase().includes('RECOMMEND') ||
          fullTextAccumulator.toUpperCase().includes('RECOMMEND')
        ) {
          insideSlugsBlock = true;
          const cutIdx = streamBuffer.search(/\[?\s*RECOMMEND/i);
          if (cutIdx > 0) {
            onChunk(streamBuffer.substring(0, cutIdx).trimEnd());
          }
          streamBuffer = '';
          continue;
        }

        const safetyThreshold = 25;
        if (streamBuffer.length > safetyThreshold) {
          const tail = streamBuffer.slice(-safetyThreshold);
          const possibleTagPrefix = tail.match(/\[?\s*R?[ECOMMENDED_SLUGS]*$/i);
          const flushLength = streamBuffer.length - (possibleTagPrefix ? possibleTagPrefix[0].length : 0);

          if (flushLength > 0) {
            const toSend = streamBuffer.substring(0, flushLength);
            onChunk(toSend);
            streamBuffer = streamBuffer.substring(flushLength);
          }
        }
      }
    }

    if (!insideSlugsBlock && streamBuffer.length > 0) {
      const cleaned = streamBuffer
        .replace(/\[?\s*RECOMMENDED_SLUGS?.*$/gis, '')
        .replace(/\[?\s*RECOMMEND.*$/gis, '');
      if (cleaned) onChunk(cleaned);
    }

    const { products } = await this.extractRecommendedProducts(fullTextAccumulator);
    return { model, recommendedProducts: products };
  }

  public async getSuggestions(lang: 'ar' | 'en' = 'ar'): Promise<string[]> {
    try {
      const settings: any = await Settings.findOne().lean();
      if (settings?.aiConsultant?.suggestions?.[lang] && settings.aiConsultant.suggestions[lang].length > 0) {
        return settings.aiConsultant.suggestions[lang];
      }
    } catch (err) {
      console.warn('Could not read suggestions from Settings, using defaults');
    }
    if (lang === 'ar') {
      return [
        'ما هي أفضل أرجوحة حسية للأطفال الذين يعانون من فرط الحركة وتشتت الانتباه؟',
        'كيف أصمم ركن هدوء حسي (Calming Corner) بمساحة صغيرة؟',
        'ما هي أدوات الضغط العميق الموصى بها لتخفيف التوتر الحسي؟',
        'ما الفرق بين أرجوحة التوازن القماشية والمنصة الدهليزية الصلبة؟',
        'أريد باقة متكاملة لتجهيز عيادة علاج وظيفي خاصة للأطفال.',
      ];
    }
    return [
      'What is the best sensory swing for children with ADHD?',
      'How to design a calming sensory corner in a small room?',
      'What deep pressure tools are recommended for sensory regulation?',
      'Difference between fabric hammock swing and rigid platform swing?',
      'Suggest a complete equipment package for a pediatric OT clinic.',
    ];
  }
}

export const aiService = new AiService();
