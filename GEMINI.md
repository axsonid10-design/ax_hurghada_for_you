# GEMINI.md - HURGHADA FOR YOU CONSTITUTION (AXONID V6.0 / RULES 2610)

## 1. Project Overview & Identity
- **Project Name:** HURGHADA FOR YOU
- **Arabic Name:** غردقة فور يو
- **Application Title:** غردقة فور يو - منظومة الرحلات والتشغيل السياحي
- **Architecture:** Hybrid Standalone PWA (React 18 + Vite 6 + Tailwind CSS + IndexedDB + Supabase)
- **Primary Brand Colors:** Deep Marine Navy (`#0a2540`), Red Sea Turquoise (`#0284c7`), Sun Amber (`#f59e0b`), Surface Canvas (`#f8fafc`).
- **Typography:** Cairo & Tajawal, JetBrains Mono.
- **Watermark:** `site-bg-watermark.png` applied fixed in background.

## 2. Core Business Engine (Tourism Trips & Daily Situation)
1. **Daily Situation Operations (الوضع التشغيلي اليومي):**
   - إدارة مجموعات الرحلات (GROUP A: Sea Trips 🛥️, Safari 🏎️, Cash Pickups 💰).
   - متابعة سعة المراكب (Boat Pax: Adult + Child + Infant vs Maximum Capacity).
   - رصد حركات التجميع والمجموعات والـ SNK / PS.
2. **Bookings & Pax Management (حجوزات النزلاء):**
   - رقم الحجز (SR), اسم النزيل (Name), الفندق (Hotel), رقم الغرفة (Room).
   - تصنيف الأفراد (Adult, Child, Infant).
   - مندوب البيع (Seller: Meghane, Laure, Laly, etc.) وقناة الحجز (Channel: Mobile App, Sales Team).
3. **Multi-Currency Cash Drawer (التحصيل وتعدد العملات):**
   - رصد المبالغ المتبقية والمحصلة بـ 4 عملات: اليورو (€), الجنيه المصري (L.E), الدولار ($), والجنيه الإسترليني (£).
   - تقفيل الخزائن وحركات الـ Cash Pickup اليومية.

## 3. UI/UX Master Directives (Rules 2610 & ui-ux-pro-max)
1. **Zero Side Gutters (100% Full Canvas):**
   - حظر تام لـ `max-w-7xl mx-auto` أو أي هوامش فارغة على الشاشات الكبيرة.
   - امتداد الحاوية بعرض الشاشة بالكامل `w-full px-3 sm:px-6 lg:px-8`.
2. **Standard Navigation Architecture:**
   - **الديسكتوب واللابتوب:** سايدبار ملاصق لليمين `AX_Sidebar` بعرض `w-64` (مفتوح) و `w-[72px]` (مطوي) مع `sticky top-20 h-[calc(100vh-100px)]`.
   - **الموبايل:** شريط ملاحة كبسولي عائم في أسفل الشاشة `AX_MobileNavbar` بخلفية بلورية `backdrop-blur-xl` (`lg:hidden`).
3. **Lean Responsive Header (Zero Fluff):**
   - حظر تام للجمل الوصفية `<p>` تحت العناوين وفي الهيدر.
   - الشعار وحده في أقصى اليمين ومؤشر الاتصال الرشيق في أقصى اليسار.
   - شريط تثبيت PWA منفصل أسفل الهيدر `AX_InstallPwaBanner`.
4. **Custom Branded Calendar & Dropdowns:**
   - حظر `<input type="date">`؛ فرض `AX_CompanyDatePicker` بهوية المشروع ورأسه المزدوج وشبكة الشهور.
   - حظر `<select>` الرمادية؛ فرض Select كبسولي ناعم.
5. **UI/UX Invariants:**
   - أزرار كبسولية دائماً `rounded-full` و `font-black`.
   - سكيلتون نابض 1:1 (`AX_SkeletonLoader`)، حظر الـ Spinners.
   - كروت Bento تفاعلية بالموبايل بديلة للجداول (`lg:hidden`).
   - نافذة كبسولية `AX_ConfirmModal` بديلة لـ `window.confirm`.

## 4. Quad-Lock PWA & Offline Engine
- PWA أصيل مع عزل `version.json` في كاش المتصفح (`NetworkOnly`).
- إشعار التحديث الفوري `AppUpdateNotifier`.
- إشعارات ويب 24/7 مع نافذة التفعيل الإلزامي `AX_MandatoryPushModal`.
- محرك أوفلاين كامل بـ `IndexedDB` وطابور عمليات تلقائي.
