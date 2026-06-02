"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddSubclanPage() {
  const router = useRouter();
  const [tribes, setTribes] = useState<any[]>([]);
  const [clans, setClans] = useState<any[]>([]);
  const [lineages, setLineages] = useState<any[]>([]);
  const [tribeId, setTribeId] = useState("");
  const [clanId, setClanId] = useState("");
  const [lineageId, setLineageId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/tribes").then((r) => r.json()).then(setTribes);
  }, []);

  useEffect(() => {
    if (tribeId) {
      fetch(`/api/clans?tribeId=${tribeId}`).then((r) => r.json()).then(setClans);
    } else {
      setClans([]);
      setClanId("");
    }
  }, [tribeId]);

  useEffect(() => {
    if (clanId) {
      fetch(`/api/lineages?clanId=${clanId}`).then((r) => r.json()).then(setLineages);
    } else {
      setLineages([]);
      setLineageId("");
    }
  }, [clanId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !lineageId) return;

    setLoading(true);
    setMessage("");

    const slug = name.trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + Date.now();

    try {
      const res = await fetch("/api/admin/subclans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug, lineage_id: lineageId, description }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ تمت إضافة العشيرة بنجاح!");
        setName("");
        setDescription("");
        setTimeout(() => router.push("/admin"), 1500);
      } else {
        setMessage("❌ " + (data.error || "حدث خطأ"));
      }
    } catch {
      setMessage("❌ فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      <div className="max-w-lg mx-auto px-5 py-12">
        <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-6">🍂 إضافة عشيرة جديدة</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">اختر القبيلة</label>
            <select value={tribeId} onChange={(e) => setTribeId(e.target.value)} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition" required>
              <option value="">-- اختر القبيلة --</option>
              {tribes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">اختر البطن</label>
            <select value={clanId} onChange={(e) => setClanId(e.target.value)} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition" required>
              <option value="">-- اختر البطن --</option>
              {clans.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">اختر الفخذ</label>
            <select value={lineageId} onChange={(e) => setLineageId(e.target.value)} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition" required>
              <option value="">-- اختر الفخذ --</option>
              {lineages.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">اسم العشيرة</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: الدرواشة" className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">وصف (اختياري)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="نبذة مختصرة..." rows={3} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition resize-none" />
          </div>

          {message && <p className="text-sm text-center">{message}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#0A1628] text-white py-3.5 rounded-xl font-bold hover:bg-[#B49450] transition disabled:opacity-50">
            {loading ? "⏳ جاري الإضافة..." : "➕ إضافة العشيرة"}
          </button>
        </form>
      </div>
    </main>
  );
}