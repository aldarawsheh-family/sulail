"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddClanPage() {
  const router = useRouter();
  const [tribes, setTribes] = useState<any[]>([]);
  const [tribeId, setTribeId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/tribes")
      .then((r) => r.json())
      .then(setTribes);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !tribeId) return;

    setLoading(true);
    setMessage("");

    const slug = name.trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + Date.now();

    try {
      const res = await fetch("/api/admin/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug, tribe_id: tribeId, description }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ تمت إضافة البطن بنجاح!");
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
        <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-6">🌿 إضافة بطن جديد</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">اختر القبيلة</label>
            <select
              value={tribeId}
              onChange={(e) => setTribeId(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition"
              required
            >
              <option value="">-- اختر القبيلة --</option>
              {tribes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">اسم البطن</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: بشر"
              className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">وصف (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="نبذة مختصرة..."
              rows={3}
              className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition resize-none"
            />
          </div>

          {message && <p className="text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A1628] text-white py-3.5 rounded-xl font-bold hover:bg-[#B49450] transition disabled:opacity-50"
          >
            {loading ? "⏳ جاري الإضافة..." : "➕ إضافة البطن"}
          </button>
        </form>
      </div>
    </main>
  );
}