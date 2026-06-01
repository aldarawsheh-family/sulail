"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tribe {
  id: string;
  name: string;
  slug: string;
  description: string;
  members: number;
  branches: number;
}

export default function Home() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTribes() {
      try {
        const response = await fetch("/api/tribes");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        if (data) {
          setTribes(
            data.map((t: any) => ({
              ...t,
              members: Math.floor(Math.random() * 800) + 500,
              branches: Math.floor(Math.random() * 4) + 2,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching tribes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTribes();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      {/* Banner */}
      <section className="relative bg-gradient-to-b from-[#FDFBF7] via-[#F5F0E8] to-[#FDFBF7] pt-12 pb-10 px-5 text-center border-b border-[#B49450]/15 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] opacity-[0.04]"
          style={{ background: "radial-gradient(ellipse at center, #B49450 0%, transparent 70%)" }} />

        <div className="relative z-10 inline-block mb-3">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-[#B49450]/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-[#B49450]/10" />
          <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-[#B49450]/20 rotate-3">✦</div>
        </div>

        <div className="relative z-10 mb-4">
          <span className="inline-flex items-center gap-2 bg-[#B49450]/8 text-[#B49450] text-[11px] font-bold px-4 py-1.5 rounded-full tracking-widest">سليل</span>
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#0A1628] mb-4 tracking-tight">
            منصة <span className="text-[#B49450]">قبيلتك</span> الرقمية
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4 text-sm">
            <span className="text-[#B49450] font-bold">عِزٌّ</span><span className="text-[#B49450]/30">•</span>
            <span className="text-[#B49450] font-bold">فَخْرٌ</span><span className="text-[#B49450]/30">•</span>
            <span className="text-[#B49450] font-bold">نَسَبٌ</span><span className="text-[#B49450]/30">•</span>
            <span className="text-[#B49450] font-bold">مَجْدٌ</span>
          </div>
          <p className="text-[#3A4B5F] text-sm leading-relaxed mb-6">
            فخامة التوثيق، حداثة التقنية — منصة تجمع أنساب العرب في بيئة رقمية آمنة
          </p>

          <div className="bg-white/80 backdrop-blur-xl border border-[#B49450]/20 rounded-full p-1.5 pr-5 flex items-center max-w-md mx-auto shadow-lg shadow-[#0A1628]/3 mb-8">
            <input type="text" placeholder="ابحث عن جذور العائلة أو الشخصية..." className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-[#0A1628] text-sm" />
            <button className="bg-[#B49450] w-10 h-10 rounded-full text-white text-lg hover:bg-[#D4AF37] transition flex items-center justify-center">🔍</button>
          </div>

          <div className="flex justify-center gap-8">
            <div className="text-center"><div className="text-[#B49450] font-heading font-bold text-2xl">{tribes.length}</div><div className="text-[#3A4B5F] text-[11px] mt-1">قبيلة</div></div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center"><div className="text-[#B49450] font-heading font-bold text-2xl">58</div><div className="text-[#3A4B5F] text-[11px] mt-1">فرع</div></div>
            <div className="w-[1px] bg-[#B49450]/15" />
            <div className="text-center"><div className="text-[#B49450] font-heading font-bold text-2xl">5,240</div><div className="text-[#3A4B5F] text-[11px] mt-1">فرد</div></div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#0A1628] mb-2">القبائل <span className="text-[#B49450]">المسجلة</span></h2>
          <p className="text-[#3A4B5F] text-xs">انضم إلى المنصة ووثق نسب قبيلتك</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 mx-auto border-3 border-[#F5F0E8] border-t-[#B49450] rounded-full animate-spin mb-3" />
            <p className="text-[#3A4B5F] text-sm">جاري تحميل القبائل...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tribes.map((tribe, i) => (
              <Link key={tribe.id} href={`/tribes/${tribe.id}`}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl no-underline bg-white border border-[#B49450]/8 hover:border-[#B49450]/30 ${i === 0 ? "md:col-span-2 md:flex md:items-center md:gap-6 md:p-8 md:text-right" : "p-5 text-center"}`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#B49450]/5 to-transparent rounded-bl-[60px] group-hover:from-[#B49450]/10 transition-all duration-500" />
                <div className={`relative z-10 ${i === 0 ? "md:flex-1" : ""}`}>
                  <div className={`mb-3 group-hover:scale-105 transition-transform duration-500 ${i === 0 ? "text-4xl" : "text-2xl"}`}>🦅</div>
                  <h3 className={`font-heading font-bold text-[#0A1628] mb-1.5 group-hover:text-[#B49450] transition-colors ${i === 0 ? "text-2xl" : "text-lg"}`}>{tribe.name}</h3>
                  <div className={`flex gap-3 text-[#3A4B5F] text-[11px] mb-3 ${i === 0 ? "md:justify-start" : "justify-center"}`}>
                    <span>👥 {tribe.members?.toLocaleString()} فرد</span><span>🌿 {tribe.branches} فروع</span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-[#B49450] text-white px-4 py-1.5 rounded-full text-[11px] font-bold group-hover:bg-[#D4AF37] transition-all duration-300">استعراض ←</span>
                </div>
                {i === 0 && <div className="hidden md:block text-7xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">🦅</div>}
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="relative bg-[#FDFBF7] border-t border-[#B49450]/10 mt-8">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#B49450] to-transparent" />
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-right">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2"><span className="w-6 h-6 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-md flex items-center justify-center text-white text-[10px]">✦</span><span className="font-heading font-bold text-[#0A1628] text-base">سليل</span></div>
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