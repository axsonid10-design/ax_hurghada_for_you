---
name: Hurghada For You Marine Luxury
brand: غردقة فور يو (Hurghada For You)
colors:
  primary: '#0a2540'
  primary-container: '#133e66'
  secondary: '#0284c7'
  secondary-container: '#e0f2fe'
  accent: '#f59e0b'
  accent-container: '#fef3c7'
  surface: '#f8fafc'
  surface-card: '#ffffff'
  surface-border: '#e2e8f0'
  text-primary: '#0f172a'
  text-muted: '#64748b'
typography:
  display:
    fontFamily: Cairo
    fontWeight: '900'
  headline:
    fontFamily: Cairo
    fontWeight: '700'
  body:
    fontFamily: Tajawal
    fontWeight: '500'
  numbers:
    fontFamily: JetBrains Mono
    fontWeight: '700'
---

# الدستور البصري - غردقة فور يو (DESIGN.md)

## 1. الهوية والطابع العام
- **الطابع:** فخامة بحرية عصرية مستوحاة من أعماق البحر الأحمر وأمواج الغردقة الفيروزية مع دفء رمال الصحراء ورحلات السفاري.
- **الهدف التشغيلي:** سرعة قصوى لمنظمي الرحلات البحرية (Boat Pax / Island Trips)، مندوبي البيع، وسيارات التحصيل والفنادق.
- **العلامة المائية:** شعار غردقة فور يو مثبت مائياً في الخلفية (`/site-bg-watermark.png`) بنسبة هادئة لتثبيت الهوية.

## 2. لوحة الألوان المعتمدة (Design Tokens)
- **الكحلي البحري العميق (`#0a2540`):** الهيدر، السايدبار، بطاقات الإحصائيات الرئيسية، والعناوين الصريحة.
- **الفيروزي المائي (`#0284c7`):** شارات الرحلات البحرية، الأزرار النشطة، المؤشرات اللحظية، وتأثيرات التحديد.
- **الذهبي الشمسي (`#f59e0b`):** رحلات السفاري، مؤشرات المبالغ النقدية، والشارات الحيوية.
- **الخلفية والأرضيات (`#f8fafc` / `#ffffff`):** راحة للعين أثناء العمل لساعات طويلة على كشوفات النزلاء والغرف.

## 3. معايير الأزرار والتفاعل
- أزرار كبسولية دائماً `rounded-full` مع خط عريض `font-black`.
- مقترنة بأيقونة Lucide واضحة وتأثير ضغط باللمس `active:scale-95`.
- حظر النوافذ الافتراضية واستخدام `AX_ConfirmModal` الكبسولية.
- حظر التقويم الافتراضي واستخدام `AX_CompanyDatePicker`.
