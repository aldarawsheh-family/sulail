export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* رأس الصفحة */}
      <section className="text-center py-16 px-5 bg-[#F5F0E8] border-b border-[#B49450]/20">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-[#0A1628] mb-3">
          سياسة <span className="text-[#B49450]">الخصوصية</span>
        </h1>
        <p className="text-[#5A6B7F] text-sm">آخر تحديث: 20 يناير 2020</p>
      </section>

      {/* المحتوى */}
      <section className="max-w-3xl mx-auto px-5 py-12 space-y-6">
        {/* صندوق الأمان */}
        <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">🛡️</div>
          <p className="text-[#0A1628] font-bold">بياناتكم في حاويات معزولة. لا نشاركها ولا نبيعها.</p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-white border border-[#B49450]/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-heading font-bold text-[#0A1628] mb-3 flex items-center gap-2">
              <span className="text-[#B49450]">{s.icon}</span> {s.title}
            </h2>
            <p className="text-[#5A6B7F] text-sm leading-loose mb-3">{s.content}</p>
            {s.list && (
              <ul className="list-disc list-inside space-y-1 text-sm text-[#5A6B7F] pr-2">
                {s.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* تذييل */}
      <footer className="bg-[#0A1628] text-white/50 text-center py-6 text-xs">
        © 2020-2026 <span className="text-[#D4AF37]">سليل</span>. خصوصيتكم أمانة في أعناقنا.
      </footer>
    </main>
  );
}

const sections = [
  {
    icon: "📊",
    title: "١. البيانات التي نجمعها",
    content: "لتوثيق أنساب القبائل، نقوم بجمع البيانات التالية:",
    list: [
      "بيانات الحساب: اسم المستخدم، البريد الإلكتروني، رقم الهاتف (اختياري).",
      "بيانات النسب: أسماء الأجداد، تواريخ الميلاد والوفاة، صور شخصية (اختياري)، سير ذاتية.",
      "بيانات الدفع: لا نخزن أرقام البطاقات البنكية. تتم معالجة المدفوعات عبر شركات خارجية آمنة.",
    ],
  },
  {
    icon: "⚙️",
    title: "٢. كيف نستخدم بياناتكم",
    content: "نستخدم بياناتكم حصراً من أجل:",
    list: [
      "تشغيل المنصة وعرض شجرة قبيلتكم.",
      "تحسين الخدمة وتطويرها باستمرار.",
      "التواصل معكم بخصوص تحديثات هامة.",
      "حساب إحصائيات عامة (عدد الأفراد، الفروع) دون كشف الأسماء.",
    ],
  },
  {
    icon: "🔐",
    title: "٣. مع من نشارك بياناتكم؟",
    content: "نحن لا نبيع بياناتكم لأي جهة. بيانات قبيلتكم معزولة تماماً ولا تراها أي قبيلة أخرى. لا نشاركها مع معلنين أو جهات خارجية. لا نشاركها إلا بموجب أمر قضائي رسمي.",
  },
  {
    icon: "☁️",
    title: "٤. كيف نحمي بياناتكم؟",
    content: "نستخدم أحدث تقنيات الحماية:",
    list: [
      "تشفير SSL/TLS لجميع البيانات.",
      "نظام RLS (عزل تام بين القبائل).",
      "نسخ احتياطية يومية لضمان عدم فقدان البيانات.",
      "خوادم مستضافة في مراكز بيانات آمنة.",
    ],
  },
  {
    icon: "✅",
    title: "٥. حقوقكم",
    content: "لكم كامل الحقوق في بياناتكم:",
    list: [
      "حق الوصول: يمكنكم الاطلاع على جميع بياناتكم.",
      "حق التصحيح: يمكنكم تعديل أي خطأ.",
      "حق الحذف: يمكنكم طلب حذف جميع بياناتكم بالكامل.",
      "حق التصدير: يمكنكم طلب نسخة من بياناتكم بصيغة JSON أو PDF.",
    ],
  },
  {
    icon: "🍪",
    title: "٦. ملفات تعريف الارتباط",
    content: "نستخدم ملفات تعريف ارتباط بسيطة لتحسين تجربة التصفح (مثل حفظ جلسة الدخول وتفضيلات الثيم). لا نستخدمها للتجسس أو التتبع. يمكنك تعطيلها من إعدادات المتصفح.",
  },
  {
    icon: "🌍",
    title: "٧. الامتثال للقوانين",
    content: "نلتزم بالقوانين التالية:",
    list: [
      "GDPR (الاتحاد الأوروبي): الحق في النسيان، تصدير البيانات، عدم التتبع.",
      "PDPL (المملكة العربية السعودية): حماية البيانات الشخصية.",
      "القوانين المحلية في دول الخليج والدول العربية.",
    ],
  },
];