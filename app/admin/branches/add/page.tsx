"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddBranchPage() {
  const router = useRouter();
  const [tribes, setTribes] = useState<any[]>([]);
  const [clans, setClans] = useState<any[]>([]);
  const [lineages, setLineages] = useState<any[]>([]);
  const [subclans, setSubclans] = useState<any[]>([]);
  const [tribeId, setTribeId] = useState("");
  const [clanId, setClanId] = useState("");
  const [lineageId, setLineageId] = useState("");
  const [subclanId, setSubclanId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetch("/api/tribes").then(r => r.json()).then(setTribes); }, []);
  useEffect(() => { if (tribeId) { fetch(`/api/clans?tribeId=${tribeId}`).then(r => r.json()).then(setClans); } else { setClans([]); setClanId(""); } }, [tribeId]);
  useEffect(() => { if (clanId) { fetch(`/api/lineages?clanId=${clanId}`).then(r => r.json()).then(setLineages); } else { setLineages([]); setLineageId(""); } }, [clanId]);
  useEffect(() => { if (lineageId) { fetch(`/api/subclans?lineageId=${lineageId}`).then(r => r.json()).then(setSubclans); } else { setSubclans([]); setSubclanId(""); } }, [lineageId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !subclanId) return;
    setLoading(true); setMessage("");
    const slug = name.trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + Date.now();
    try {
      const res = await fetch("/api/admin/branches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), slug, subclan_id: subclanId, description }) });
      const data = await res.json();
      if (res.ok) { setMessage("✅ تمت إضافة الفرع!"); setName(""); setDescription(""); setTimeout(() => router.push("/admin"), 1500); }
      else { setMessage("❌ " + (data.error || "حدث خطأ")); }
    } catch { setMessage("❌ فشل الاتصال"); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      <div className="max-w-lg mx-auto px-5 py-12">
        <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-6">🍃 إضافة فرع جديد</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select label="اختر القبيلة" value={tribeId} onChange={setTribeId} options={tribes} />
          <Select label="اختر البطن" value={clanId} onChange={setClanId} options={clans} />
          <Select label="اختر الفخذ" value={lineageId} onChange={setLineageId} options={lineages} />
          <Select label="اختر العشيرة" value={subclanId} onChange={setSubclanId} options={subclans} />
          <Input label="اسم الفرع" value={name} onChange={setName} placeholder="مثال: فرع الشيوخ" />
          <Textarea label="وصف (اختياري)" value={description} onChange={setDescription} />
          {message && <p className="text-sm text-center">{message}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#B49450] text-white py-3.5 rounded-xl font-bold hover:bg-[#D4AF37] transition disabled:opacity-50">
            {loading ? "⏳ جاري الإضافة..." : "➕ إضافة الفرع"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#0A1628] mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition" required>
        <option value="">-- {label} --</option>
        {options.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#0A1628] mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition" required />
    </div>
  );
}

function Textarea({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#0A1628] mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder="نبذة مختصرة..." rows={3} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition resize-none" />
    </div>
  );
}