import { Schema, model, Document } from 'mongoose';
import {
  LocalizedString,
  SocialLinks,
  HeroCMS,
  AboutCMS,
  StatItem,
  CustomProductCtaCMS,
} from '../types/shared';


export interface AiTopicCardCMS {
  _id?: any;
  iconType: string;
  title: LocalizedString;
  description: LocalizedString;
  promptText: LocalizedString;
}

export interface AiConsultantCMS {
  suggestions: {
    ar: string[];
    en: string[];
  };
  topicCards: AiTopicCardCMS[];
}

export interface ISettings extends Document {
  aiConsultant?: AiConsultantCMS;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: LocalizedString;
  currency: string;
  shippingNote: LocalizedString;
  social: SocialLinks;
  hero: HeroCMS;
  about: AboutCMS;
  stats: StatItem[];
  customProductCta: CustomProductCtaCMS;
  showPackagesSection?: boolean;
  showProjectsSection?: boolean;
  logo?: string;
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

const statItemSchema = new Schema(
  {
    label: { type: localizedStringSchema, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const settingsSchema = new Schema<ISettings>(
  {
    logo: { type: String, default: '/images/logo.svg' },
    whatsappNumber: { type: String, default: '201000000000' },
    phone: { type: String, default: '+20 100 000 0000' },
    email: { type: String, default: 'info@wadaqstore.com' },
    address: {
      type: localizedStringSchema,
      default: () => ({
        ar: 'جمهورية مصر العربية - القاهرة',
        en: 'Cairo, Egypt',
      }),
    },
    currency: { type: String, default: 'ج.م' },
    shippingNote: {
      type: localizedStringSchema,
      default: () => ({
        ar: 'يضاف مصاريف الشحن حسب المحافظة وموقع التوصيل',
        en: 'Shipping fees apply depending on governorate and delivery location',
      }),
    },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    hero: {
      image: { type: String, default: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80" },
      title: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'ودق لتنمية المهارات وتجهيز غرف التكامل الحسي',
          en: 'Wadaq for Skill Development & Sensory Integration Rooms',
        }),
      },
      subtitle: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'حلول متكاملة وأدوات حسية معتمدة للأطباء، الأخصائيين، ومراكز التأهيل والعلاج الوظيفي',
          en: 'Integrated solutions & certified sensory tools for therapists, specialists, and rehabilitation centers',
        }),
      },
      ctaPrimary: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'استعرض المنتجات',
          en: 'Browse Products',
        }),
      },
      ctaSecondary: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'باقات تجهيز الغرف',
          en: 'Room Setup Packages',
        }),
      },
    },
    about: {
      image: { type: String, default: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1000&q=80" },
      title: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'عن ودق لتنمية المهارات والتكامل الحسي',
          en: 'About Wadaq for Skill Development & Sensory Integration',
        }),
      },
      content: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'نحن في ودق متخصصون في توفير وتصنيع أرقى أدوات التكامل الحسي والعلاج الوظيفي، وتجهيز الغرف الحسية متعددة الحواس (Snoezelen) وفق أعلى المعايير الطبية والعلاجية المعتمدة لخدمة الأخصائيين والمراكز.',
          en: 'At Wadaq, we specialize in providing and manufacturing premier sensory integration and occupational therapy equipment, equipping multi-sensory rooms according to certified medical standards.',
        }),
      },
      mission: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'تمكين الأخصائيين والمراكز بأحدث الأدوات التي تحدث فارقاً حقيقياً في تطور استجابة الأطفال وتحسين جودة حياتهم اليومية.',
          en: 'Empowering specialists and centers with advanced tools that make a tangible difference in sensory response development.',
        }),
      },
      vision: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'أن نكون الوجهة الأولى والموثوقة في الوطن العربي لتجهيز بيئات حسية متكاملة تخدم ذوي الهمم وأطفال طيف التوحد وفرط الحركة.',
          en: 'To be the leading and trusted destination in the Arab world for equipping integrated sensory environments.',
        }),
      },
    },
    stats: {
      type: [statItemSchema],
      default: () => [
        { label: { ar: 'مركز وعيادة مجهزة', en: 'Equipped Centers & Clinics' }, value: '+120' },
        { label: { ar: 'أداة حسية متخصصة', en: 'Sensory Tools' }, value: '+85' },
        { label: { ar: 'أخصائي وطبيب شريك', en: 'Partner Therapists' }, value: '+350' },
        { label: { ar: 'نسبة رضا العملاء', en: 'Client Satisfaction' }, value: '99%' },
      ],
    },
    
    aiConsultant: {
      suggestions: {
        ar: {
          type: [String],
          default: () => [
            'ما هي أفضل أرجوحة حسية للأطفال الذين يعانون من فرط الحركة وتشتت الانتباه؟',
            'كيف أصمم ركن هدوء حسي (Calming Corner) بمساحة صغيرة؟',
            'ما هي أدوات الضغط العميق الموصى بها لتخفيف التوتر الحسي؟',
            'ما الفرق بين أرجوحة التوازن القماشية والمنصة الدهليزية الصلبة؟',
            'أريد باقة متكاملة لتجهيز عيادة علاج وظيفي خاصة للأطفال.',
          ],
        },
        en: {
          type: [String],
          default: () => [
            'What is the best sensory swing for children with ADHD?',
            'How to design a calming sensory corner in a small room?',
            'What deep pressure tools are recommended for sensory regulation?',
            'Difference between fabric hammock swing and rigid platform swing?',
            'Suggest a complete equipment package for a pediatric OT clinic.',
          ],
        },
      },
      topicCards: {
        type: [
          {
            iconType: { type: String, default: 'vestibular' },
            title: localizedStringSchema,
            description: localizedStringSchema,
            promptText: localizedStringSchema,
          },
        ],
        default: () => [
          {
            iconType: 'vestibular',
            title: { ar: 'الحس الدهليزي والتوازن', en: 'Vestibular & Balance' },
            description: {
              ar: 'ترشيح الأراجيح ومنصات التوازن المناسبة لفرط أو نقص الاستثارة',
              en: 'Recommending swings and balance boards for vestibular regulation',
            },
            promptText: {
              ar: 'ما هي أفضل أدوات وأراجيح التحفيز الدهليزي والتوازن للأطفال ذوي الحساسية الدهليزية؟',
              en: 'What are the best vestibular stimulation and balance swings for children?',
            },
          },
          {
            iconType: 'deep_pressure',
            title: { ar: 'الضغط العميق والتهدئة', en: 'Deep Pressure & Calming' },
            description: {
              ar: 'أسطوانات الضغط، السترات الثقيلة، والمهدئات الحسية لتنظيم الحركة',
              en: 'Compression rollers, weighted vests, and sensory calmers',
            },
            promptText: {
              ar: 'ما هي أدوات الضغط العميق والسترات الثقيلة المناسبة للمساعدة على التهدئة والتنظيم الذاتي؟',
              en: 'What deep pressure tools and weighted vests help with calming and self-regulation?',
            },
          },
          {
            iconType: 'snoezelen',
            title: { ar: 'غرف سنوزلين المتكاملة', en: 'Snoezelen Multi-Sensory Rooms' },
            description: {
              ar: 'تجهيزات الألياف الضوئية، أعمدة الفقاعات، وتوزيع المساحات',
              en: 'Fiber optics, bubble columns, and room spatial planning',
            },
            promptText: {
              ar: 'كيف أجهز غرفة سنوزلين متعددة الحواس بمعدات الإضاءة التفاعلية والألياف الضوئية؟',
              en: 'How to equip a Snoezelen multi-sensory room with interactive lighting and fiber optics?',
            },
          },
        ],
      },
    },

    showPackagesSection: { type: Boolean, default: true },
    showProjectsSection: { type: Boolean, default: true },
    customProductCta: {
      image: { type: String, default: "" },
      title: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'لم تجد الأداة الحسية التي تبحث عنها؟',
          en: "Haven't found the sensory tool you are looking for?",
        }),
      },
      description: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'يمكننا تصنيع أو استيراد أي أداة أو جهاز تكامل حسي بمواصفات ومقاسات خاصة تناسب احتياجات مركزك العلاجي.',
          en: 'We can manufacture or source any custom sensory equipment with tailored specifications to match your clinic requirements.',
        }),
      },
      buttonText: {
        type: localizedStringSchema,
        default: () => ({
          ar: 'اطلب منتجاً خاصاً عبر واتساب',
          en: 'Request Custom Tool via WhatsApp',
        }),
      },
    },
  },
  { timestamps: true }
);

export const Settings = model<ISettings>('Settings', settingsSchema);
