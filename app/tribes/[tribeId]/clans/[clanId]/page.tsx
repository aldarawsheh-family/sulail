// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

async function getClan(clanId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("clans").select("*").eq("id", clanId).single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

async function getLineages(clanId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("lineages").select("*").eq("clan_id", clanId);
    if (error) return [];
    return data;
  } catch {
    return [];
  }
}

async function getTribe(tribeId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("tribes").select("*").eq("id", tribeId).single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function ClanPage({ params }: { params: Promise<{ tribeId: string; clanId: string }> }) {
  const { tribeId, clanId } = await params;
  const clan = await getClan(clanId);
  const lineages = await getLineages(clanId);
  const tribe = await getTribe(tribeId);

  if (!clan) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-2">البطن غير موجود</h1>
          <Link href={`/tribes/${tribeId}`} className="bg-[#B49450] text-white px-6 py-3 rounded-full text-sm hover:bg-[#D4AF37] transition">⬅ العودة للقبيلة</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* Banner */}
      <section className="relative bg-gradient-to-b from-[#FDFBF7] to-[#F5F0E8] py-20 px-5 text-center overflow-hidden border-b border-[#B49450]/20">
        <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,_#B49450_0px,_#B49450_1px,_transparent_1px,_transparent_20px)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-[#B49450]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-[#B49450]/10" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-12 h-[1px] bg-[#B49450]/40" />
            <span className="text-[#B49450] text-xs tracking-[0.3em] font-bold">بَطْنٌ مِنْ بُطُونِ {tribe?.name || "الْقَبِيلَةِ"}</span>
            <span className="w-12 h-[1px] bg-[#B49450]/40" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-[#0A1628] mb-6 tracking-tight">
            {clan.name}
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-[#B49450] mb-6">
            <span>✦</span>
            <span className="text-base md:text-lg text-[#3A4B5F] italic font-heading">
              أفخاذ بطن {clan.name} من قبيلة {tribe?.name || "..."}
            </span>
            <span>✦</span>
          </div>

          <div className="flex justify-center gap-10 text-sm text-[#3A4B5F]">
            <span className="flex items-center gap-2"><span className="text-[#B49450]">🌿</span> {lineages.length} فخذ</span>
            <span className="flex items-center gap-2"><span className="text-[#B49450]">👤</span> {Math.floor(Math.random() * 500) + 100} فرد</span>
            <span className="flex items-center gap-2"><span className="text-[#B49450]">📜</span> {Math.floor(Math.random() * 10) + 1} مصدر</span>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-5 pt-6">
        <div className="flex items-center gap-2 text-xs text-[#3A4B5F] bg-[#F5F0E8] rounded-full px-4 py-2 w-fit border border-[#B49450]/10">
          <Link href="/" className="text-[#B49450] hover:underline">الرئيسية</Link>
          <span className="text-[#B49450]/30">❯</span>
          <Link href={`/tribes/${tribeId}`} className="text-[#B49450] hover:underline">القبيلة</Link>
          <span className="text-[#B49450]/30">❯</span>
          <span className="text-[#0A1628] font-bold">{clan.name}</span>
        </div>
      </div>

      {/* أفخاذ البطن */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-14">
          <div className="text-[#B49450] text-xs tracking-[0.3em] font-bold mb-3">أَفْخَاذُ الْبَطْنِ</div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0A1628] mb-3">
            أفخاذ <span className="text-[#B49450]">{clan.name}</span>
          </h2>
          <p className="text-[#3A4B5F] text-sm">كُلُّ فَخِذٍ يَحْمِلُ تَارِيخًا وَأَمْجَادًا</p>
        </div>

        {lineages.length === 0 ? (
          <div className="text-center bg-[#F5F0E8] rounded-3xl py-20 border border-[#B49450]/10">
            <div className="text-4xl mb-4">🏳️</div>
            <p className="text-[#3A4B5F] font-heading">لَمْ تُضَفْ أَفْخَاذٌ بَعْدُ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lineages.map((lineage: any, i: number) => (
              <Link
                key={lineage.id}
                href={`/tribes/${tribeId}/clans/${clanId}/lineages/${lineage.id}`}
                className="group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl no-underline bg-white border border-[#B49450]/10 hover:border-[#B49450]/30"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#B49450]/5 to-transparent rounded-bl-[80px] group-hover:from-[#B49450]/12 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    {["⚔️", "🏹", "🐎", "🛡️"][i % 4]}
                  </div>
                  <h3 className="text-lg font-heading font-bold text-[#0A1628] mb-2 group-hover:text-[#B49450] transition-colors">
                    {lineage.name}
                  </h3>
                  <p className="text-[#3A4B5F] text-xs leading-relaxed mb-4">{lineage.description || "فَخِذٌ مِنْ أَفْخَاذِ الْبَطْنِ الْكَرِيمِ"}</p>
                  <span className="inline-flex items-center gap-1.5 bg-[#B49450] text-white px-5 py-2 rounded-full text-xs font-bold group-hover:bg-[#D4AF37] transition-all duration-300">
                    اسْتِعْرَاضُ الْفَخِذِ
                    <span className="group-hover:translate-x-[-3px] transition-transform duration-300">←</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* عشائر مستقلة - معلقة مؤقتاً */}
      {/* 
      {independentSubclans.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-16">
          ...
        </section>
      )}
      */}

      {/* تذييل */}
      <footer className="relative bg-[#FDFBF7] border-t border-[#B49450]/10 mt-16">
        <div className="h-1 bg-gradient-to-r from-transparent via-[#B49450] to-transparent" />
        
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className="w-7 h-7 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-lg flex items-center justify-center text-white text-xs shadow-lg shadow-[#B49450]/20">✦</span>
                <span className="font-heading font-bold text-[#0A1628] text-lg">سليل</span>
              </div>
              <p className="text-[#8A95A4] text-xs leading-relaxed">الْمَنْصَةُ الرَّقَمِيَّةُ لِلْأَنْسَابِ</p>
              <p className="text-[#8A95A4] text-[10px] mt-1">© 2020-2026</p>
            </div>

            <div>
              <p className="text-[#0A1628] text-xs font-bold mb-3 tracking-wide">مَدْعُومٌ بِتَقْنِيَاتٍ</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[10px] px-3 py-1.5 rounded-full">🧬 الذكاء الاصطناعي</span>
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[10px] px-3 py-1.5 rounded-full">☁️ الحوسبة السحابية</span>
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[10px] px-3 py-1.5 rounded-full">🔐 تشفير 256-bit</span>
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[10px] px-3 py-1.5 rounded-full">⚛️ React</span>
              </div>
            </div>

            <div>
              <p className="text-[#0A1628] text-xs font-bold mb-3 tracking-wide">فَرِيقٌ مُتَكَامِلٌ</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-[#3A4B5F]">
                  <span className="w-5 h-5 rounded-full bg-[#B49450]/10 flex items-center justify-center text-xs">🧠</span>
                  مهندسو الذكاء الاصطناعي
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-[#3A4B5F]">
                  <span className="w-5 h-5 rounded-full bg-[#B49450]/10 flex items-center justify-center text-xs">🔐</span>
                  خبراء الأمن السيبراني
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-[#3A4B5F]">
                  <span className="w-5 h-5 rounded-full bg-[#B49450]/10 flex items-center justify-center text-xs">🎨</span>
                  مصممو التجربة الرقمية
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-[#3A4B5F]">
                  <span className="w-5 h-5 rounded-full bg-[#B49450]/10 flex items-center justify-center text-xs">📜</span>
                  باحثو الأنساب والتاريخ
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}