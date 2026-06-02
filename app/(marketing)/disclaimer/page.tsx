export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* رأس الصفحة */}
      <section className="text-center py-16 px-5 bg-[#F5F0E8] border-b border-[#B49450]/20">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-[#0A1628] mb-3">
          إخلاء <span className="text-[#B49450]">المسؤولية</span>
        </h1>
      </section>

      {/* المحتوى */}
      <section className="max-w-3xl mx-auto px-5 py-12 space-y-6">
        <div className="bg-white border border-[#B49450]/10 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-heading font-bold text-[#0A1628] mb-3 flex items-center gap-2">
            <span className="text-[#B49450]">📜</span> إخلاء المسؤولية
          </h2>
          <p className="text-[#3A4B5F] text-sm leading-loose mb-3">
            منصة سليل هي أداة تقنية رقمية تهدف إلى مساعدة القبائل العربية في توثيق أنسابها وحفظها
            للأجيال القادمة. نحن نوفر البيئة التقنية الآمنة والأدوات الرقمية اللازمة لذلك.
          </p>
          <p className="text-[#3A4B5F] text-sm leading-loose mb-3">
            المنصة غير مسؤولة عن صحة أو دقة المعلومات التي يقوم المستخدمون بإدخالها. تقع مسؤولية
            التحقق من صحة الأنساب والبيانات المدخلة على عاتق شيوخ القبائل والأفراد المخولين منهم.
          </p>
          <p className="text-[#3A4B5F] text-sm leading-loose mb-3">
            نبذل قصارى جهدنا لضمان أمان البيانات واستمرارية الخدمة، ولكننا لا نضمن خلو المنصة
            من الأخطاء التقنية بشكل مطلق. لا نتحمل مسؤولية أي خسائر ناتجة عن استخدام المنصة
            أو انقطاع الخدمة لأي سبب كان.
          </p>
          <p className="text-[#3A4B5F] text-sm leading-loose">
            باستخدامك لمنصة سليل، فإنك تقر بأنك قرأت وفهمت ووافقت على إخلاء المسؤولية هذا.
          </p>
        </div>
      </section>

      {/* تذييل */}
      <footer className="bg-[#0A1628] text-white/50 text-center py-6 text-xs">
        © 2020-2026 <span className="text-[#D4AF37]">سليل</span>. جميع الحقوق محفوظة.
      </footer>
    </main>
  );
}
