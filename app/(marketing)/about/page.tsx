export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* رأس الصفحة */}
      <section className="text-center py-16 px-5 bg-[#F5F0E8] border-b border-[#B49450]/20">
        <div className="text-5xl mb-4">🏛️</div>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-[#0A1628] mb-3">
          عن <span className="text-[#B49450]">سليل</span>
        </h1>
        <p className="text-[#5A6B7F] max-w-xl mx-auto text-sm md:text-base">
          المنصة الرقمية الأولى لتوثيق أنساب القبائل العربية
        </p>
      </section>

      {/* الرؤية */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <div className="bg-gradient-to-r from-[#0A1628] to-[#1A2A3A] text-white rounded-3xl p-8 md:p-12 text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">🌟 رؤيتنا</h2>
          <p className="text-white/80 leading-relaxed max-w-2xl mx-auto">
            أن تكون كل قبيلة عربية قادرة على توثيق نسبها وحفظه للأجيال القادمة في ديوان رقمي خالد.
            نسعى لبناء أكبر موسوعة رقمية لأنساب العرب، تجمع بين أصالة التاريخ وحداثة التقنية.
          </p>
        </div>

        {/* فريق سليل */}
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A1628] text-center mb-10">
          فريق <span className="text-[#B49450]">سليل</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {team.map((member, i) => (
            <div
              key={i}
              className="bg-white border border-[#B49450]/10 rounded-2xl p-6 text-center hover:border-[#B49450]/30 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <div className="text-4xl mb-3">{member.icon}</div>
              <h3 className="text-lg font-heading font-bold text-[#0A1628] mb-1">{member.title}</h3>
              <p className="text-xs text-[#A8B5C4] mb-2">{member.role}</p>
              <p className="text-sm text-[#5A6B7F] leading-relaxed">{member.desc}</p>
            </div>
          ))}
        </div>

        {/* المميزات */}
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A1628] text-center mb-10">
          لماذا <span className="text-[#B49450]">سليل</span>؟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 items-start bg-[#F5F0E8] rounded-2xl p-5">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h4 className="font-bold text-[#0A1628] mb-1">{f.title}</h4>
                <p className="text-sm text-[#5A6B7F]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* التقنيات */}
        <div className="bg-[#0A1628] text-white/70 rounded-3xl p-8 text-center">
          <p className="text-xs tracking-widest mb-3">مدعوم بتقنيات</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/10 px-4 py-2 rounded-full">🧬 الذكاء الاصطناعي</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">☁️ الحوسبة السحابية</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🔐 التشفير 256-bit</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">⚛️ React Flow</span>
            <span className="bg-white/10 px-4 py-2 rounded-full">🗄️ PostgreSQL</span>
          </div>
        </div>
      </section>

      {/* تذييل */}
      <footer className="bg-[#0A1628] text-white/50 text-center py-6 text-xs">
        © 2020-2026 <span className="text-[#D4AF37]">سليل</span>. جميع الحقوق محفوظة.
      </footer>
    </main>
  );
}

const team = [
  {
    icon: "🧠",
    title: "مهندسو الذكاء الاصطناعي",
    role: "SulailAI",
    desc: "تطوير محرك الأنساب الذكي والمساعد الرقمي العراف.",
  },
  {
    icon: "🔐",
    title: "خبراء الأمن السيبراني",
    role: "Sulail Shield",
    desc: "حماية البيانات بنظام RLS وتشفير من الطراز العسكري.",
  },
  {
    icon: "🎨",
    title: "مصممو التجربة الرقمية",
    role: "UX Engineering",
    desc: "تصميم تجربة مستخدم عربية أصيلة تجمع الفخامة بالبساطة.",
  },
  {
    icon: "📜",
    title: "باحثو الأنساب والتاريخ",
    role: "Root Research",
    desc: "تدقيق المصادر التاريخية والتأكد من صحة سلاسل النسب.",
  },
  {
    icon: "☁️",
    title: "مهندسو الحوسبة السحابية",
    role: "Cloud Infrastructure",
    desc: "بناء بنية تحتية سحابية تتحمل ملايين الأفراد وآلاف القبائل.",
  },
  {
    icon: "⚛️",
    title: "مطورو الواجهات التفاعلية",
    role: "Frontend Core",
    desc: "بناء شجرة الأنساب التفاعلية وتجربة المستخدم الحية.",
  },
];

const features = [
  {
    icon: "🌳",
    title: "شجرة عائلة تفاعلية",
    desc: "تصفح شجرة قبيلتك بسهولة. تنقل بين الفروع والأفخاذ بلمسة واحدة.",
  },
  {
    icon: "🤖",
    title: "العارف والنساب",
    desc: "مساعد ذكي يفهم الأنساب ويجيب عن أسئلتك. حكيم قبيلتك الرقمي.",
  },
  {
    icon: "🛡️",
    title: "خصوصية تامة",
    desc: "بيانات كل قبيلة في حاوية معزولة. لا ترى قبيلة بيانات أخرى.",
  },
  {
    icon: "💬",
    title: "ديوان حي",
    desc: "غرفة دردشة فورية لكل قبيلة. تواصل مع أبناء عمومتك مباشرة.",
  },
  {
    icon: "📜",
    title: "توثيق المصادر",
    desc: "كل فرد موثق بمصدر تاريخي. نظام موافقة الأقران لضمان الصحة.",
  },
  {
    icon: "📱",
    title: "تجربة جوال كاملة",
    desc: "صممنا سليل للجوال أولاً. تصفح أنسابك من أي مكان.",
  },
];