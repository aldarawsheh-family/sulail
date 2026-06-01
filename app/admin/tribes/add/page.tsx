"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTribePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setMessage("");

    const slug = name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    try {
      const res = await fetch("/api/admin/tribes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug, description }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ تمت إضافة القبيلة بنجاح!");
        setName("");
        setDescription("");
        setTimeout(() => router.push("/"), 1500);
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
        <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-6">🦅 إضافة قبيلة جديدة</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">اسم القبيلة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عنزة"
              className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#B49450]/20 rounded-xl text-right outline-none focus:border-[#B49450] transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0A1628] mb-1">وصف القبيلة (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="نبذة مختصرة عن القبيلة..."
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
            {loading ? "⏳ جاري الإضافة..." : "➕ إضافة القبيلة"}
          </button>
        </form>
      </div>
    </main>
  );
}