export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* رأس الصفحة */}
      <section className="text-center py-16 px-5 bg-[#F5F0E8] border-b border-[#B49450]/20">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-[#0A1628] mb-3">
          شروط <span className="text-[#B49450]">الاستخدام</span>
        </h1>
        <p className="text-[#3A4B5F] text-sm">آخر تحديث: 20 يناير 2020</p>
      </section>

      {/* المحتوى */}
      <section className="max-w-3xl mx-auto px-5 py-12 space-y-6">
        {/* صندوق تحذير */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-[#0A1628] font-bold">
            باستخدامك لمنصة سليل، فإنك توافق على الالتزام بهذه الشروط.
          </p>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="bg-white border border-[#B49450]/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-heading font-bold text-[#0A1628] mb-3 flex items-center gap-2">
              <span className="text-[#B49450]">{s.icon}</span> {s.title}
            </h2>
            {s.content && <p className="text-[#3A4B5F] text-sm leading-loose mb-3">{s.content}</p>}
            {s.list && (
              <ul className="list-disc list-inside space-y-1 text-sm text-[#3A4B5F] pr-2">
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
        © 2020-2026 <span className="text-[#D4AF37]">سليل</span>. جميع الحقوق محفوظة.
      </footer>
    </main>
  );
}

const sections = [
  {
    icon: "🛠️",
    title: "١. وصف الخدمة",
    content: "سليل هي منصة سحابية لتوثيق أنساب القبائل العربية. نقدم أدوات رقمية لبناء شجرة العائلة، وإدارة النسب، والتفاعل مع مساعد ذكي (العارف).",
  },
  {
    icon: "✅",
    title: "٢. مسؤوليات المستخدم",
    content: "أنت توافق على:",
    list: [
      "تقديم معلومات دقيقة وصحيحة عن قبيلتك وأفرادها.",
      "عدم إضافة أسماء وهمية أو مزيفة.",
      "عدم انتحال شخصية قبيلة أخرى أو فرد آخر.",
      "عدم التشهير أو الإساءة لأي قبيلة أو فرد.",
      "عدم استخدام المنصة لأي غرض غير قانوني.",
      "عدم مناقشة السياسة أو نقد الدول أو الحكام.",
    ],
  },
  {
    icon: "©️",
    title: "٣. المحتوى والملكية",
    content: "أنت تحتفظ بجميع حقوق البيانات التي ترفعها. أنت تمنح المنصة ترخيصاً غير حصري لعرض هذه البيانات داخل مساحة قبيلتك فقط. نحن لا نملك بياناتك.",
  },
  {
    icon: "🚫",
    title: "٤. المحظورات",
    content: "يمنع منعاً باتاً:",
    list: [
      "إضافة محتوى يمس السياسة أو الدول أو الحكام.",
      "إضافة محتوى يمس الطوائف أو الأديان.",
      "استخدام ألفاظ نابية أو مسيئة.",
      "انتحال شخصية الغير.",
      "محاولة اختراق المنصة أو الوصول لبيانات قبيلة أخرى.",
    ],
  },
  {
    icon: "⚖️",
    title: "٥. تسوية النزاعات",
    content: "المنصة توفر أداة تقنية لإدارة الأنساب فقط. في حالة النزاع: يُعلق المحتوى المتنازع عليه فوراً، يُمنح الطرفان 30 يوماً لتقديم الأدلة، وإن لم يتوصلا لحل يُحال النزاع إلى محكم قبلي. المنصة غير مسؤولة عن صحة الأنساب.",
  },
  {
    icon: "🚪",
    title: "٦. الإنهاء وحذف القبيلة",
    content: "يحق لشيخ القبيلة طلب حذف قبيلته كاملة في أي وقت. يتم التنفيذ خلال 48 ساعة. البيانات المحذوفة تبقى في سلة مهملات 30 يوماً قبل الحذف النهائي.",
  },
];