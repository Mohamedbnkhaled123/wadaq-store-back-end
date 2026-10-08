# Wadaq Store Backend API

خادم واجهة برمجة التطبيقات (REST API) لمتجر ودق للأدوات الحسية وتجهيز الغرف مبني بـ Express 5 و Mongoose 9 و TypeScript.

## الأوامر المتاحة (Scripts)
- `npm run dev`: تشغيل خادم التطوير مع المراقبة التلقائية على المنفذ 4000.
- `npm run build`: بناء ملفات المشروع المترجمة في مجلد `dist/`.
- `npm run start`: تشغيل النسخة المبنية في بيئة الإنتاج.
- `npm run seed`: زرع حساب الأدمن والبيانات النموذجية الأولية.
- `npm run seed:admin`: زرع حساب الأدمن فقط.
- `npm run seed:initial`: زرع التصنيفات والمنتجات والباقات والإعدادات.

## بيانات الأدمن الافتراضية
- Email: `admin@wadaq.com`
- Password: `AdminWadaq@2026`
