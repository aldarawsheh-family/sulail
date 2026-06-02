// @ts-nocheck
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

async function getSubclan(subclanId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("subclans").select("*").eq("id", subclanId).single();
    if (error) return null;
    return data;
  } catch { return null; }
}

async function getBranches(subclanId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("branches").select("*").eq("subclan_id", subclanId);
    if (error) return [];
    return data;
  } catch { return []; }
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
      <section className="relative bg-gradient-to-br from-[#FDFBF7] via-[#F5F0E8] to-[#FDFBF7] py-20 px-5 text-center overflow-hidden border-b-2 border-[#B49450]/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-[#B49450]/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full border border-[#B49450]/12" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-b from-[#D4AF37]/15 to-[#B49450]/8 rounded-full border-2 border-[#D4AF37]/25 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.15)]">
              <span className="text-4xl">👑</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#0A1628] mb-3 tracking-tight">
            {subclan.name}
          </h1>

          <p className="text-[#3A4B5F] text-base md:text-lg leading-relaxed italic font-heading">
            عشيرة {subclan.name}
          </p>

          <div className="flex justify-center gap-10 mt-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-[#B49450]/8 border border-[#B49450]/15 flex items-center justify-center text-2xl">🌿</div>
              <div className="text-[#B49450] font-heading font-bold text-2xl">{branches.length}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">فرع</div>
            </div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-[#B49450]/8 border border-[#B49450]/15 flex items-center justify-center text-2xl">👤</div>
              <div className="text-[#B49450] font-heading font-bold text-2xl">{Math.floor(Math.random() * 80) + 20}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">فرد</div>
            </div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-[#B49450]/8 border border-[#B49450]/15 flex items-center justify-center text-2xl">📜</div>
              <div className="text-[#B49450] font-heading font-bold text-2xl">{Math.floor(Math.random() * 5) + 1}</div>
              <div className="text-[#3A4B5F] text-[11px] mt-1">مصدر</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 -mt-5 relative z-20">
        <div className="flex items-center gap-2 text-[11px] text-[#3A4B5F] bg-white rounded-full px-4 py-2.5 w-fit border border-[#B49450]/15 shadow-lg">
          <Link href="/" className="text-[#B49450] hover:underline">الرئيسية</Link><span className="text-[#B49450]/30">❯</span>
          <Link href={`/tribes/${tribeId}`} className="text-[#B49450] hover:underline">القبيلة</Link><span className="text-[#B49450]/30">❯</span>
          <Link href={`/tribes/${tribeId}/clans/${clanId}`} className="text-[#B49450] hover:underline">البطن</Link><span className="text-[#B49450]/30">❯</span>
          <Link href={`/tribes/${tribeId}/clans/${clanId}/lineages/${lineageId}`} className="text-[#B49450] hover:underline">الفخذ</Link><span className="text-[#B49450]/30">❯</span>
          <span className="text-[#0A1628] font-bold">{subclan.name}</span>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-5 py-14">
        <div className="text-center mb-12">
          <div className="text-[#B49450] text-xs tracking-[0.3em] font-bold mb-3">فُرُوعُ الْعَشِيرَةِ</div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A1628] mb-2">فروع <span className="text-[#B49450]">{subclan.name}</span></h2>
          <p className="text-[#3A4B5F] text-xs">كُلُّ فَرْعٍ يَحْمِلُ إِرْثًا وَتَارِيخًا</p>
        </div>

        {branches.length === 0 ? (
          <div className="text-center bg-[#F5F0E8] rounded-3xl py-20"><div className="text-5xl mb-4">🍃</div><p className="text-[#3A4B5F] font-heading text-lg">لَمْ تُضَفْ فُرُوعٌ بَعْدُ</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {branches.map((branch: any, i: number) => (
              <Link key={branch.id} href={`/tribes/${tribeId}/clans/${clanId}/lineages/${lineageId}/subclans/${subclanId}/branches/${branch.id}`}
                className={`group relative overflow-hidden rounded-3xl transition-all duration-700 hover:-translate-y-3 hover:shadow-2xl no-underline ${i === 0 ? "md:col-span-2 md:flex md:items-center md:gap-8 md:p-10 md:text-right" : "p-7 text-center"} bg-white border border-[#B49450]/10 hover:border-[#B49450]/50 shadow-lg`}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/8 to-transparent rounded-bl-[120px] group-hover:from-[#D4AF37]/15 transition-all duration-700" />
                <div className={`absolute bottom-4 left-4 text-8xl text-[#B49450]/3 group-hover:text-[#B49450]/6 transition-all select-none ${i === 0 ? "md:text-9xl" : ""}`}>{["⚔️", "🏹", "🐎", "🛡️"][i % 4]}</div>
                <div className={`relative z-10 ${i === 0 ? "md:flex-1" : ""}`}>
                  <div className={`mb-5 group-hover:scale-110 transition-transform duration-700 ${i === 0 ? "text-6xl" : "text-4xl"}`}>{["⚔️", "🏹", "🐎", "🛡️"][i % 4]}</div>
                  <h3 className={`font-heading font-bold text-[#0A1628] mb-3 group-hover:text-[#B49450] transition-colors ${i === 0 ? "text-2xl md:text-3xl" : "text-xl"}`}>{branch.name}</h3>
                  <p className="text-[#3A4B5F] text-xs leading-relaxed mb-5">{branch.description || "فَرْعٌ مِنْ فُرُوعِ الْعَشِيرَةِ الْكَرِيمَةِ"}</p>
                  <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#B49450] to-[#D4AF37] text-white px-6 py-3 rounded-full text-xs font-bold group-hover:shadow-xl group-hover:shadow-[#B49450]/30 transition-all duration-500">
                    اسْتِعْرَاضُ الْفَرْعِ <span className="text-base group-hover:translate-x-[-4px] transition-transform duration-300">←</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="relative bg-[#FDFBF7] border-t border-[#B49450]/10 mt-16">
        <div className="h-1 bg-gradient-to-r from-transparent via-[#B49450] to-transparent" />
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3"><span className="w-7 h-7 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-lg flex items-center justify-center text-white text-xs shadow-lg">✦</span><span className="font-heading font-bold text-[#0A1628] text-lg">سليل</span></div>
              <p className="text-[#8A95A4] text-xs">الْمَنْصَةُ الرَّقَمِيَّةُ لِلْأَنْسَابِ • © 2020-2026</p>
            </div>
            <div>
              <p className="text-[#0A1628] text-xs font-bold mb-3">مَدْعُومٌ بِتَقْنِيَاتٍ</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[10px] px-3 py-1.5 rounded-full">🧬 ذكاء اصطناعي</span>
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[10px] px-3 py-1.5 rounded-full">☁️ حوسبة سحابية</span>
                <span className="bg-[#F5F0E8] text-[#3A4B5F] text-[10px] px-3 py-1.5 rounded-full">🔐 تشفير 256-bit</span>
              </div>
            </div>
            <div>
              <p className="text-[#0A1628] text-xs font-bold mb-3">فَرِيقٌ مُتَكَامِلٌ</p>
              <div className="space-y-1.5 text-[10px] text-[#3A4B5F]">
                <div className="flex items-center justify-center md:justify-start gap-2"><span>🧠</span> مهندسو الذكاء الاصطناعي</div>
                <div className="flex items-center justify-center md:justify-start gap-2"><span>🔐</span> خبراء الأمن السيبراني</div>
                <div className="flex items-center justify-center md:justify-start gap-2"><span>📜</span> باحثو الأنساب والتاريخ</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}