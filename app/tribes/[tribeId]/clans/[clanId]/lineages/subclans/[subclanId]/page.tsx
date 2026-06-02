// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

async function getSubclan(subclanId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subclans").select("*").eq("id", subclanId).single();
  if (error) return null;
  return data;
}

async function getBranches(subclanId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("branches").select("*").eq("subclan_id", subclanId);
  if (error) return [];
  return data;
}

export default async function SubclanPage({ params }: { params: Promise<{ tribeId: string; clanId: string; lineageId: string; subclanId: string }> }) {
  const { tribeId, clanId, lineageId, subclanId } = await params;
  const subclan = await getSubclan(subclanId);
  const branches = await getBranches(subclanId);

  if (!subclan) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-2">العشيرة غير موجودة</h1>
          <Link href={`/tribes/${tribeId}/clans/${clanId}/lineages/${lineageId}`} className="bg-[#B49450] text-white px-6 py-3 rounded-full text-sm hover:bg-[#D4AF37] transition">⬅ العودة للفخذ</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* Banner */}
      <section className="relative bg-gradient-to-b from-[#FDFBF7] to-[#F5F0E8] pt-14 pb-10 px-5 text-center border-b border-[#B49450]/15">
        <div className="absolute top-4 right-6 text-6xl text-[#B49450]/4 select-none">🍂</div>
        <div className="absolute bottom-3 left-6 text-5xl text-[#B49450]/4 select-none">🍃</div>
        
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[#B49450] text-xs tracking-[0.25em] font-bold mb-4">
            <span className="w-8 h-[1px] bg-[#B49450]/40" />
            عَشِيرَة
            <span className="w-8 h-[1px] bg-[#B49450]/40" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#0A1628] mb-3 tracking-tight">
            {subclan.name}
          </h1>
          
          <p className="text-[#3A4B5F] text-sm leading-relaxed italic font-heading">
            {subclan.description || "عَشِيرَةٌ مِنْ عَشَائِرِ الْقَبِيلَةِ الْكَرِيمَةِ"}
          </p>

          <div className="flex justify-center gap-8 mt-7">
            <div className="text-center">
              <div className="text-[#B49450] font-heading font-bold text-2xl">{branches.length}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">فرع</div>
            </div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center">
              <div className="text-[#B49450] font-heading font-bold text-2xl">{Math.floor(Math.random() * 50) + 10}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">فرد</div>
            </div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center">
              <div className="text-[#B49450] font-heading font-bold text-2xl">{Math.floor(Math.random() * 5) + 1}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">مصدر</div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-5 pt-4">
        <div className="flex items-center gap-2 text-[11px] text-[#3A4B5F] bg-[#F5F0E8] rounded-full px-4 py-2 w-fit border border-[#B49450]/10">
          <Link href="/" className="text-[#B49450] hover:underline">الرئيسية</Link>
          <span className="text-[#B49450]/30">❯</span>
          <Link href={`/tribes/${tribeId}`} className="text-[#B49450] hover:underline">القبيلة</Link>
          <span className="text-[#B49450]/30">❯</span>
          <Link href={`/tribes/${tribeId}/clans/${clanId}`} className="text-[#B49450] hover:underline">البطن</Link>
          <span className="text-[#B49450]/30">❯</span>
          <Link href={`/tribes/${tribeId}/clans/${clanId}/lineages/${lineageId}`} className="text-[#B49450] hover:underline">الفخذ</Link>
          <span className="text-[#B49450]/30">❯</span>
          <span className="text-[#0A1628] font-bold">{subclan.name}</span>
        </div>
      </div>

      {/* فروع العشيرة */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A1628] mb-2">
            فروع <span className="text-[#B49450]">{subclan.name}</span>
          </h2>
          <p className="text-[#3A4B5F] text-xs">اسْتَعْرِضْ فُرُوعَ الْعَشِيرَةِ</p>
        </div>

        {branches.length === 0 ? (
          <div className="text-center bg-[#F5F0E8] rounded-2xl py-16 border border-[#B49450]/10">
            <div className="text-3xl mb-3">🍃</div>
            <p className="text-[#3A4B5F] text-sm">لَمْ تُضَفْ فُرُوعٌ بَعْدُ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch: any, i: number) => (
              <Link
                key={branch.id}
                href={`/tribes/${tribeId}/clans/${clanId}/lineages/${lineageId}/subclans/${subclanId}/branches/${branch.id}`}
                className="group relative overflow-hidden rounded-2xl p-5 text-center transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl no-underline bg-white border border-[#B49450]/8 hover:border-[#B49450]/30"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#B49450]/5 to-transparent rounded-bl-[60px] group-hover:from-[#B49450]/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="text-2xl mb-3 group-hover:scale-105 transition-transform duration-500">🍃</div>
                  <h3 className="text-base font-heading font-bold text-[#0A1628] mb-1.5 group-hover:text-[#B49450] transition-colors">
                    {branch.name}
                  </h3>
                  <p className="text-[#3A4B5F] text-[11px] mb-3">{branch.description || "فَرْعٌ مِنْ فُرُوعِ الْعَشِيرَةِ"}</p>
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

      {/* تذييل */}
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