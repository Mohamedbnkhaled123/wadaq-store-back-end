import { connectDB } from '../config/db';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { Package } from '../models/package.model';
import { Project } from '../models/project.model';
import { Settings } from '../models/settings.model';
import { generateSlug } from '../utils/slugify';

async function seedInitial() {
  await connectDB();
  console.log('[Seed] Seeding initial data for Wadaq Sensory Store...');

  // 1. Ensure Settings document exists
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
    console.log('[Seed] Default settings created.');
  }

  // 2. Seed Categories
  const categoriesData = [
    {
      name: { ar: 'أراجيح وأنظمة التعليق الحسي', en: 'Therapy Swings & Suspension' },
      description: {
        ar: 'أراجيح علاجية معلقة لتدريب الجهاز الدهليزي، التوازن، وتفريغ أو تهدئة النشاط الحركي.',
        en: 'Therapeutic suspension swings for vestibular training, balance, and motor regulation.',
      },
      order: 1,
    },
    {
      name: { ar: 'أدوات الضغط العميق والتهدئة', en: 'Deep Pressure & Calming Tools' },
      description: {
        ar: 'بطانيات وسترات ثقيلة وأسطوانات ضغط لتعزيز الإحساس الداخلي العميق والمساعدة على الاسترخاء.',
        en: 'Weighted blankets, vests, and squeeze rollers for proprioceptive input and calm.',
      },
      order: 2,
    },
    {
      name: { ar: 'ألواح التوازن والتكامل الحركي', en: 'Balance & Motor Integration' },
      description: {
        ar: 'ألواح تمايل خشبية، مسارات توازن حسية، وأدوات تطوير التوافق العضلي العصبي.',
        en: 'Wooden balance boards, sensory balance paths, and neuromotor coordination equipment.',
      },
      order: 3,
    },
    {
      name: { ar: 'أجهزة التحفيز البصري والضوئي', en: 'Visual & Sensory Lighting' },
      description: {
        ar: 'أنابيب الفقاعات التفاعلية، ألياف ضوئية، وألواح إضاءة حسية لغرف سنوزلين.',
        en: 'Interactive bubble tubes, fiber optic strands, and sensory light panels for Snoezelen rooms.',
      },
      order: 4,
    },
    {
      name: { ar: 'أدوات التحفيز اللمسي والاستكشاف', en: 'Tactile Stimulation & Exploration' },
      description: {
        ar: 'بلاطات حسية لمسية للأقدام والأيدي، كرات محببة، ومواد علاجية لتحسين معالجة اللمس.',
        en: 'Tactile floor and hand tiles, textured balls, and therapeutic tactile surfaces.',
      },
      order: 5,
    },
  ];

  const categoryDocs: any[] = [];
  for (const cat of categoriesData) {
    const slugAr = generateSlug(cat.name.ar);
    const slugEn = generateSlug(cat.name.en);
    let existing = await Category.findOne({ 'slug.ar': slugAr });
    if (!existing) {
      existing = await Category.create({
        ...cat,
        slug: { ar: slugAr, en: slugEn },
        image: {
          url: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: cat.name,
        },
      });
      console.log(`[Seed] Created category: ${cat.name.ar}`);
    }
    categoryDocs.push(existing);
  }

  // 3. Seed Sample Initial Products
  const productsData = [
    {
      name: { ar: 'أرجوحة حسية معلقة مرنة 360 درجة', en: '360° Elastic Sensory Therapy Swing' },
      shortDescription: {
        ar: 'أرجوحة قماشية مرنة توفر ضغطاً عميقاً وحركة دهليزية ممتازة للأطفال لتهدئة الجهاز العصبي.',
        en: 'Elastic fabric hammock swing providing deep pressure and vestibular motion for calming.',
      },
      description: {
        ar: 'صممت هذه الأرجوحة خصيصاً لجلسات العلاج الوظيفي والتكامل الحسي. النسيج المزدوج المتين يوفر عناقاً حسياً محكماً يعزز إفراز الدوبامين والسيروتونين ويساعد الأطفال الذين يعانون من فرط الحركة أو اضطراب المعالجة الحسية على الهدوء والتركيز.',
        en: 'Designed specifically for occupational therapy sessions. The double-layer elastic fabric provides deep hug-like pressure to assist children with sensory processing challenges.',
      },
      price: 2850,
      oldPrice: 3200,
      category: categoryDocs[0]._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'أرجوحة حسية علاجية للأطفال', en: 'Sensory Therapy Swing' },
        },
      ],
      specs: [
        { label: { ar: 'الخامة', en: 'Material' }, value: { ar: 'ليكرا قطني مزدوج عالي المرونة', en: 'Heavy-duty double-layer cotton lycra' } },
        { label: { ar: 'التحمل الأقصى', en: 'Weight Capacity' }, value: { ar: 'حتى 120 كجم', en: 'Up to 120 kg' } },
        { label: { ar: 'ملحقات التعليق', en: 'Hardware' }, value: { ar: 'خطاف دوران ستانلس ستيل + حزام تعليق مقوى', en: '360 swivel hook + heavy-duty strap' } },
        { label: { ar: 'الجهاز الحسي المستهدف', en: 'Target Sensory System' }, value: { ar: 'الدهليزي والحس العميق', en: 'Vestibular & Proprioceptive' } },
      ],
      sensorySystem: { ar: 'الدهليزي والحس العميق', en: 'Vestibular & Proprioceptive' },
      ageRange: { ar: 'من 3 إلى 14 سنة', en: '3 - 14 Years' },
      isFeatured: true,
      inStock: true,
    },
    {
      name: { ar: 'بطانية حسية ثقيلة للتهدئة والتركيز (5 كجم)', en: 'Weighted Calming Blanket (5 kg)' },
      shortDescription: {
        ar: 'بطانية طبية ثقيلة موزعة بكرات زجاجية ناعمة لتوفير ضغط عميق آمن يقلل التوتر والقلق.',
        en: 'Therapeutic weighted blanket with micro glass beads providing deep touch pressure to alleviate anxiety.',
      },
      description: {
        ar: 'تعتمد هذه البطانية على تقنية التحفيز بالضغط العميق (Deep Touch Pressure - DTP). تساعد الأطفال والكبار أثناء الجلسات العلاجية أو قبل النوم على استرخاء العضلات وخفض معدل ضربات القلب المتسارع.',
        en: 'Utilizes Deep Touch Pressure (DTP) technology to calm the central nervous system, helping children and adults relax during therapy or sleep.',
      },
      price: 2400,
      oldPrice: 2800,
      category: categoryDocs[1]._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'بطانية حسية ثقيلة 5 كجم', en: 'Weighted Sensory Blanket' },
        },
      ],
      specs: [
        { label: { ar: 'الوزن', en: 'Weight' }, value: { ar: '5 كجم', en: '5 kg' } },
        { label: { ar: 'المقاس', en: 'Dimensions' }, value: { ar: '150 × 100 سم', en: '150 x 100 cm' } },
        { label: { ar: 'الحشوة', en: 'Filling' }, value: { ar: 'حبيبات زجاجية دقيقة خالية من الرصاص مغلفة بطبقات بوليستر ناعمة', en: 'Non-toxic micro glass beads with soft polyester padding' } },
      ],
      sensorySystem: { ar: 'الحس العميق اللمسي', en: 'Proprioceptive & Tactile' },
      ageRange: { ar: 'من 5 سنوات فما فوق', en: '5+ Years' },
      isFeatured: true,
      inStock: true,
    },
    {
      name: { ar: 'لوح تمايل خشبي منحني (Curved Balance Board)', en: 'Curved Wooden Waldorf Balance Board' },
      shortDescription: {
        ar: 'لوح توازن مصنوع من خشب الزان الطبيعي متعدد الطبقات لتطوير التوازن والوعي الجسدي.',
        en: 'Multi-layer natural beech balance board to promote equilibrium and body awareness.',
      },
      description: {
        ar: 'أداة كلاسيكية متعددة الاستخدامات في برامج التكامل الحسي. يمكن استخدامها كأرجوحة توازن، جسر للزحف، أو مقعد هزاز، وتعمل بفاعلية على تحفيز المخيخ وتقوية عضلات الجذع.',
        en: 'A versatile sensory tool used in occupational therapy to stimulate the cerebellum, enhance vestibular processing, and strengthen core muscles.',
      },
      price: 1650,
      oldPrice: 1900,
      category: categoryDocs[2]._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'لوح توازن خشبي', en: 'Wooden Balance Board' },
        },
      ],
      specs: [
        { label: { ar: 'الخامة', en: 'Material' }, value: { ar: 'خشب زان طبيعي 10 طبقات مع طبقة لباد سفلية', en: '10-layer beech wood with felt bottom' } },
        { label: { ar: 'أقصى وزن للمستخدم', en: 'Weight Limit' }, value: { ar: 'حتى 150 كجم', en: 'Up to 150 kg' } },
      ],
      sensorySystem: { ar: 'الدهليزي والحركي', en: 'Vestibular & Motor' },
      isFeatured: true,
      inStock: true,
    },
    {
      name: { ar: 'أنبوب فقاعات ضوئي تفاعلي مع ريموت تحكم (Bubble Tube)', en: 'Interactive Sensory Bubble Tube with Remote' },
      shortDescription: {
        ar: 'عمود فقاعات مائي بإضاءة LED متغيرة وألوان تفاعلية لتهدئة الأطفال والتحفيز البصري.',
        en: 'LED sensory water bubble column with color changing modes for calming and visual tracking.',
      },
      description: {
        ar: 'العمود الفقري لأي غرفة حسية متعددة الحواس (Snoezelen). يوفر صعود الفقاعات مع تغير ألوان الإضاءة الهادئة واهتزاز خفيف للمس تأثيراً ساحراً يهدئ نوبات الغضب ويشجع على التواصل البصري.',
        en: 'The cornerstone of any Snoezelen multi-sensory room. Combines gentle bubbling sound, mesmerizing color transitions, and soothing micro-vibrations.',
      },
      price: 7900,
      oldPrice: 8500,
      category: categoryDocs[3]._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'أنبوب فقاعات ضوئي لغرف التكامل الحسي', en: 'Sensory Bubble Tube' },
        },
      ],
      specs: [
        { label: { ar: 'الارتفاع', en: 'Height' }, value: { ar: '120 سم، قطر 15 سم', en: '120 cm, 15 cm diameter' } },
        { label: { ar: 'الإضاءة', en: 'Lighting' }, value: { ar: '16 لون LED مع 4 أنماط تدرج وريموت', en: '16-color RGB LED with 4 transition modes and remote' } },
        { label: { ar: 'قاعدة التثبيت', en: 'Base' }, value: { ar: 'قاعدة متينة مانعة للاهتزاز مع إمكانية تثبيت جداري', en: 'Heavy-duty stable base with optional wall bracket' } },
      ],
      sensorySystem: { ar: 'بصري ولمسي وسمعي', en: 'Visual, Tactile & Auditory' },
      isFeatured: true,
      inStock: true,
    },
    {
      name: { ar: 'مجموعة بلاطات حسية سائلة للأرضية (4 قطع)', en: 'Sensory Liquid Floor Tiles (Set of 4)' },
      shortDescription: {
        ar: 'بلاطات تفاعلية تحتوي على سوائل ملونة تتدفق مع كل خطوة أو ضغطة قدم.',
        en: 'Interactive sensory tiles with colored liquid flowing with every step or foot pressure.',
      },
      description: {
        ar: 'تثير هذه البلاطات فضول الطفل وتشجعه على المشي والقفز واستكشاف السبب والنتيجة من خلال تفاعل السائل الملون مع الضغط، مع طبقة سفلية مانعة للانزلاق تماماً.',
        en: 'Encourages dynamic movement and visual tracking. The fluid reacts organically to pressure, motivating movement and balance.',
      },
      price: 3200,
      oldPrice: 3600,
      category: categoryDocs[4]._id,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'بلاطات حسية سائلة ملونة للأرضيات', en: 'Liquid Floor Tiles' },
        },
      ],
      specs: [
        { label: { ar: 'المقاس', en: 'Tile Dimensions' }, value: { ar: '50 × 50 سم لكل بلاطة', en: '50 x 50 cm each' } },
        { label: { ar: 'المادة', en: 'Safety' }, value: { ar: 'بولي كربونات فائق المتانة وسائل عضوي غير سام', en: 'Ultra-durable polycarbonate with non-toxic cosmetic liquid' } },
      ],
      sensorySystem: { ar: 'بصري ولمسي وحركي', en: 'Visual, Tactile & Kinesthetic' },
      isFeatured: true,
      inStock: true,
    },
  ];

  const productDocs: any[] = [];
  for (const prod of productsData) {
    const slugAr = generateSlug(prod.name.ar);
    const slugEn = generateSlug(prod.name.en);
    let existing = await Product.findOne({ 'slug.ar': slugAr });
    if (!existing) {
      existing = await Product.create({
        ...prod,
        slug: { ar: slugAr, en: slugEn },
        isActive: true,
        isDeleted: false,
      });
      console.log(`[Seed] Created product: ${prod.name.ar}`);
    }
    productDocs.push(existing);
  }

  // 4. Seed Sensory Room Packages
  const packagesData = [
    {
      name: { ar: 'باقة عيادة العلاج الوظيفي المصغرة', en: 'Mini Occupational Therapy Clinic Package' },
      slug: { ar: 'باقة-عيادة-العلاج-الوظيفي-المصغرة', en: 'mini-occupational-therapy-package' },
      tier: 'basic' as const,
      shortDescription: {
        ar: 'باقة تجهيز أساسية ومدمجة مناسبة للعيادات الخاصة والمساحات الصغيرة حتى 15 متر مربع.',
        en: 'Essential compact setup designed for private clinics and spaces up to 15 m².',
      },
      description: {
        ar: 'تحتوي الباقة على أهم الأساسيات التي يحتاجها أخصائي التكامل الحسي في التقييم والتدريب اليومي: أرجوحة حسية مرنة مع نقاط تعليق آمنة، لوح تمايل خشبي، وبطانية ثقيلة للجلسات الفردية، مع إشراف وتوجيه مهني للتركيب.',
        en: 'Covers core therapist essentials: suspension swing with safe ceiling bracket, curved wooden balance board, and a 5kg calming weighted blanket.',
      },
      roomSize: { ar: '12 - 18 متر مربع', en: '12 - 18 m²' },
      price: 12500,
      oldPrice: 14000,
      items: [
        { product: productDocs[0]._id, quantity: 1 },
        { product: productDocs[1]._id, quantity: 1 },
        { product: productDocs[2]._id, quantity: 1 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'تجهيز عيادة تكامل حسي مصغرة', en: 'Mini OT Clinic' },
        },
      ],
      isFeatured: true,
      isActive: true,
      isDeleted: false,
    },
    {
      name: { ar: 'باقة الغرفة الحسية المتكاملة (سنوزلين)', en: 'Comprehensive Snoezelen Multi-Sensory Room' },
      slug: { ar: 'باقة-الغرفة-الحسية-المتكاملة-سنوزلين', en: 'comprehensive-snoezelen-package' },
      tier: 'premium' as const,
      shortDescription: {
        ar: 'تجهيز احترافي كامل للمراكز التأهيلية ومستشفيات الأطفال يشمل أنظمة الإضاءة والتحفيز المتعدد.',
        en: 'Complete professional equipping for therapy centers including lighting, suspension, and tactile systems.',
      },
      description: {
        ar: 'أعلى مستوى من التجهيز يجمع بين التحفيز البصري التفاعلي من خلال أنابيب الفقاعات والألياف الضوئية، مع نظام تعليق حسي متكامل، وأدوات الضغط العميق وأرضيات الأمان المبطنة، لتقديم بيئة حسية علاجية متطورة تلائم كافة حالات طيف التوحد والشلل الدماغي وفرط الحركة.',
        en: 'Premier multi-sensory setup featuring interactive bubble columns, suspension swings, deep pressure items, and padded safety walls.',
      },
      roomSize: { ar: '25 - 40 متر مربع', en: '25 - 40 m²' },
      price: 48000,
      oldPrice: 55000,
      items: [
        { product: productDocs[0]._id, quantity: 2 },
        { product: productDocs[1]._id, quantity: 2 },
        { product: productDocs[2]._id, quantity: 2 },
        { product: productDocs[3]._id, quantity: 1 },
        { product: productDocs[4]._id, quantity: 2 },
      ],
      images: [
        {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'غرفة سنوزلين حسية متكاملة', en: 'Comprehensive Snoezelen Room' },
        },
      ],
      isFeatured: true,
      isActive: true,
      isDeleted: false,
    },
  ];

  for (const pkg of packagesData) {
    const existing = await Package.findOne({ 'slug.ar': pkg.slug.ar });
    if (!existing) {
      await Package.create(pkg);
      console.log(`[Seed] Created package: ${pkg.name.ar}`);
    }
  }

  // 5. Seed Sample Completed Projects
  const projectsData = [
    {
      title: { ar: 'تجهيز وحدة التكامل الحسي - مركز الأمل للتأهيل', en: 'Sensory Unit Setup - Al-Amal Rehabilitation' },
      slug: { ar: 'تجهيز-وحدة-التكامل-الحسي-مركز-الأمل', en: 'sensory-unit-al-amal-rehab' },
      clientName: { ar: 'مركز الأمل للتأهيل والعلاج الطبيعي', en: 'Al-Amal Rehab & Physical Therapy Center' },
      location: { ar: 'القاهرة الجديدة، مصر', en: 'New Cairo, Egypt' },
      description: {
        ar: 'قمنا بتصميم وتنفيذ غرفة حسية متعددة الحواس بمساحة 30 متر مربع، مع تبطين كامل للجدران والأرضيات، وتركيب نظام تعليق سقف آمن لثلاث أراجيح علاجية متزامنة، مع ركن استرخاء بفقاعات ضوئية.',
        en: 'Designed and installed a 30m² multi-sensory room with full padded walls, safe 3-point ceiling suspension, and an interactive bubble corner.',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'غرفة حسية في مركز الأمل', en: 'Sensory Room at Al-Amal Center' },
        },
        {
          url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'أراجيح التكامل الحسي المعلقة', en: 'Suspended Sensory Swings' },
        },
      ],
      completedAt: new Date('2026-05-15'),
      isActive: true,
      isDeleted: false,
    },
    {
      title: { ar: 'تجهيز غرفة التهدئة - مدرسة النور الدولية', en: 'Calming Room - Al-Noor International School' },
      slug: { ar: 'تجهيز-غرفة-التهدئة-مدرسة-النور', en: 'calming-room-al-noor-school' },
      clientName: { ar: 'قسم الدعم النفسي والدمج - مدرسة النور', en: 'Inclusion & Special Needs Dept - Al-Noor' },
      location: { ar: 'مدينة السادس من أكتوبر، مصر', en: '6th of October City, Egypt' },
      description: {
        ar: 'تجهيز غرفة تهدئة واسترجاع حسي للطلاب ذوي الحساسيات المفرطة ولأطفال طيف التوحد للمساعدة على ضبط الاستثارة والانخراط بفاعلية في الفصول الدراسية.',
        en: 'Equipped a calming de-escalation room to support students with sensory overload and autism in regaining focus.',
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?auto=format&fit=crop&w=800&q=80',
          publicId: '',
          alt: { ar: 'غرفة تهدئة مدرسية', en: 'School Calming Room' },
        },
      ],
      completedAt: new Date('2026-08-20'),
      isActive: true,
      isDeleted: false,
    },
  ];

  for (const proj of projectsData) {
    const existing = await Project.findOne({ 'slug.ar': proj.slug.ar });
    if (!existing) {
      await Project.create(proj);
      console.log(`[Seed] Created project: ${proj.title.ar}`);
    }
  }

  console.log('[Seed] Initial database seeding completed successfully!');
  process.exit(0);
}

seedInitial().catch((err) => {
  console.error('[Seed] Error seeding initial data:', err);
  process.exit(1);
});
