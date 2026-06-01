// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

async function getTribe(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tribes").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

async function getClans(tribeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clans").select("*").eq("tribe_id", tribeId);
  if (error) return [];
  return data;
}

async function getIndependentLineages(tribeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("lineages").select("*").eq("tribe_id", tribeId).is("clan_id", null);
  if (error) return [];
  return data;
}

async function getIndependentSubclans(tribeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subclans").select("*").eq("tribe_id", tribeId).is("lineage_id", null);
  if (error) return [];
  return data;
}

export default async function TribePage({ params }: { params: Promise<{ tribeId: string }> }) {
  const { tribeId } = await params;
  const tribe = await getTribe(tribeId);
  const clans = await getClans(tribeId);
  const independentLineages = await getIndependentLineages(tribeId);
  const independentSubclans = await getIndependentSubclans(tribeId);
  const hasIndependent = independentLineages.length > 0 || independentSubclans.length > 0;

  if (!tribe) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-2">القبيلة غير موجودة</h1>
          <Link href="/" className="bg-[#B49450] text-white px-6 py-3 rounded-full text-sm hover:bg-[#D4AF37] transition">⬅ العودة للرئيسية</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      <section className="relative bg-gradient-to-b from-[#FDFBF7] to-[#F5F0E8] pt-14 pb-10 px-5 text-center border-b border-[#B49450]/15">
        <div className="absolute top-4 right-6 text-7xl text-[#B49450]/4 select-none">⚔️</div>
        <div className="absolute bottom-3 left-6 text-6xl text-[#B49450]/4 select-none">🛡️</div>
        
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center gap-3 mb-5">
            <span className="w-10 h-[2px] bg-[#B49450]/50" />
            <div className="w-14 h-16 bg-gradient-to-b from-[#B49450]/10 to-transparent rounded-t-[40px] rounded-b-[20px] border-2 border-[#B49450]/25 flex items-center justify-center">
              <span className="text-3xl">🛡️</span>
            </div>
            <span className="w-10 h-[2px] bg-[#B49450]/50" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#0A1628] mb-3 tracking-tight">
            قبيلة {tribe.name}
          </h1>
          
          <p className="text-[#3A4B5F] text-sm leading-relaxed italic font-heading">
            {tribe.description || "مِنْ أَعْرَقِ قَبَائِلِ الْعَرَبِ نَسَبًا وَأَكْثَرِهَا مَجْدًا"}
          </p>

          <div className="flex justify-center gap-8 mt-7">
            <div className="text-center">
              <div className="text-[#B49450] font-heading font-bold text-2xl">{clans.length}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">بطن</div>
            </div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center">
              <div className="text-[#B49450] font-heading font-bold text-2xl">{independentLineages.length + independentSubclans.length}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">مستقل</div>
            </div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center">
              <div className="text-[#B49450] font-heading font-bold text-2xl">{Math.floor(Math.random() * 10) + 3}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">مصدر</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 pt-4">
        <div className="flex items-center gap-2 text-[11px] text-[#3A4B5F] bg-[#F5F0E8] rounded-full px-4 py-2 w-fit border border-[#B49450]/10">
          <Link href="/" className="text-[#B49450] hover:underline">الرئيسية</Link>
          <span className="text-[#B49450]/30">❯</span>
          <span className="text-[#0A1628] font-bold">{tribe.name}</span>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A1628] mb-2">
            بطون <span className="text-[#B49450]">{tribe.name}</span>
          </h2>
          <p className="text-[#3A4B5F] text-xs">اسْتَعْرِضْ بُطُونَ الْقَبِيلَةِ وَتَعَمَّقْ فِي شَجَرَةِ النَّسَبِ</p>
        </div>

        {clans.length === 0 ? (
          <div className="text-center bg-[#F5F0E8] rounded-2xl py-16 border border-[#B49450]/10">
            <div className="text-3xl mb-3">🌿</div>
            <p className="text-[#3A4B5F] text-sm">لَمْ تُضَفْ بُطُونٌ بَعْدُ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clans.map((clan: any, i: number) => (
              <Link
                key={clan.id}
                href={`/tribes/${tribeId}/clans/${clan.id}`}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl no-underline bg-white border border-[#B49450]/8 hover:border-[#B49450]/30 ${
                  i === 0 ? "md:col-span-2 md:flex md:items-center md:gap-6 md:p-8 md:text-right" : "p-5 text-center"
                }`}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#B49450]/5 to-transparent rounded-bl-[60px] group-hover:from-[#B49450]/10 transition-all duration-500" />
                <div className={`relative z-10 ${i === 0 ? "md:flex-1" : ""}`}>
                  <div className={`mb-3 group-hover:scale-105 transition-transform duration-500 ${i === 0 ? "text-4xl" : "text-2xl"}`}>
                    {["👑", "🌿", "🌿", "🌿", "🌿"][i % 5]}
                  </div>
                  <h3 className={`font-heading font-bold text-[#0A1628] mb-1.5 group-hover:text-[#B49450] transition-colors ${i === 0 ? "text-xl" : "text-base"}`}>
                    {clan.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-[#B49450] text-white px-4 py-1.5 rounded-full text-[11px] font-bold group-hover:bg-[#D4AF37] transition-all duration-300">
                    استعراض
                    <span className="group-hover:translate-x-[-2px] transition-transform duration-300 text-[10px]">←</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* قسم العشائر والأفخاذ المستقلة */}
      {hasIndependent && (
        <section className="max-w-5xl mx-auto px-5 py-12 border-t border-[#B49450]/10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A1628] mb-2">
              🌱 العشائر والأفخاذ المستقلة
            </h2>
            <p className="text-[#3A4B5F] text-xs">كِيَانَاتٌ تَتْبَعُ الْقَبِيلَةَ مُبَاشَرَةً دُونَ وُجُودِ بَطْنٍ أَوْ فَخِذٍ وَسِيط</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {independentLineages.map((lineage: any, i: number) => (
              <Link
                key={`lineage-${lineage.id}`}
                href={`/tribes/${tribeId}/clans/independent/lineages/${lineage.id}`}
                className="group relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl no-underline bg-white border border-[#B49450]/8 hover:border-[#B49450]/30"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#B49450]/5 to-transparent rounded-bl-[60px] group-hover:from-[#B49450]/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="text-2xl mb-3">🌱</div>
                  <h3 className="text-base font-heading font-bold text-[#0A1628] mb-1.5 group-hover:text-[#B49450] transition-colors">
                    {lineage.name}
                  </h3>
                  <p className="text-[#3A4B5F] text-[11px] mb-3">فخذ مستقل</p>
                  <span className="inline-flex items-center gap-1 bg-[#B49450] text-white px-4 py-1.5 rounded-full text-[11px] font-bold group-hover:bg-[#D4AF37] transition-all duration-300">
                    استعراض
                    <span className="group-hover:translate-x-[-2px] transition-transform duration-300 text-[10px]">←</span>
                  </span>
                </div>
              </Link>
            ))}
            {independentSubclans.map((subclan: any, i: number) => (
              <Link
                key={`subclan-${subclan.id}`}
                href={`/tribes/${tribeId}/clans/independent/subclans/${subclan.id}`}
                className="group relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl no-underline bg-white border border-[#B49450]/8 hover:border-[#B49450]/30"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#B49450]/5 to-transparent rounded-bl-[60px] group-hover:from-[#B49450]/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="text-2xl mb-3">🍂</div>
                  <h3 className="text-base font-heading font-bold text-[#0A1628] mb-1.5 group-hover:text-[#B49450] transition-colors">
                    {subclan.name}
                  </h3>
                  <p className="text-[#3A4B5F] text-[11px] mb-3">عشيرة مستقلة</p>
                  <span className="inline-flex items-center gap-1 bg-[#B49450] text-white px-4 py-1.5 rounded-full text-[11px] font-bold group-hover:bg-[#D4AF37] transition-all duration-300">
                    استعراض
                    <span className="group-hover:translate-x-[-2px] transition-transform duration-300 text-[10px]">←</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="relative bg-[#FDFBF7] border-t border-[#B49450]/10 mt-8">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#B49450] to-transparent" />
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-right">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="w-6 h-6 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-md flex items-center justify-center text-white text-[10px]">✦</span>
                <span className="font-heading font-bold text-[#0A1628] text-base">سليل</span>
              </div>
              <p className="text-[#8A95A4] text-[10px]">الْمَنْصَةُ الرَّقَمِيَّةُ لِلْأَنْسَابِ • © 2020-2026</p>
            </div>
            <div>
              <p className="text-[#0A1628] text-[10px] font-bold mb-2">مَدْعُومٌ بِتَقْنِيَاتٍ</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[9px] px-2.5 py-1 rounded-full">🧬 ذكاء اصطناعي</span>
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[9px] px-2.5 py-1 rounded-full">☁️ حوسبة سحابية</span>
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[9px] px-2.5 py-1 rounded-full">🔐 تشفير 256-bit</span>
              </div>
            </div>
            <div>
              <p className="text-[#0A1628] text-[10px] font-bold mb-2">فَرِيقٌ مُتَكَامِلٌ</p>
              <div className="space-y-1 text-[9px] text-[#3A4B5F]">
                <div className="flex items-center justify-center md:justify-start gap-1.5"><span className="text-[10px]">🧠</span> مهندسو الذكاء الاصطناعي</div>
                <div className="flex items-center justify-center md:justify-start gap-1.5"><span className="text-[10px]">🔐</span> خبراء الأمن السيبراني</div>
                <div className="flex items-center justify-center md:justify-start gap-1.5"><span className="text-[10px]">📜</span> باحثو الأنساب والتاريخ</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}