"use client";

import { useEffect, useState } from "react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/admin/audit");
        const data = await res.json();
        setLogs(data || []);
      } catch {
        setLogs([]);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      <div className="max-w-5xl mx-auto px-5 py-12">
        <h1 className="text-2xl font-heading font-bold text-[#0A1628] mb-6">📋 سجل النشاطات</h1>
        {loading ? <p className="text-center text-[#3A4B5F]">جاري التحميل...</p> :
         logs.length === 0 ? <p className="text-center text-[#3A4B5F]">لا توجد نشاطات مسجلة بعد</p> :
         <div className="bg-white rounded-2xl border overflow-hidden"><table className="w-full text-sm"><thead className="bg-[#F5F0E8]"><tr><th className="p-4 text-right">الحدث</th><th className="p-4 text-right">الجدول</th><th className="p-4 text-right">التاريخ</th></tr></thead><tbody className="divide-y">{logs.map((log: any) => (<tr key={log.id}><td className="p-4">{log.action}</td><td className="p-4">{log.table_name || "—"}</td><td className="p-4">{new Date(log.created_at).toLocaleString("ar")}</td></tr>))}</tbody></table></div>}
      </div>
    </main>
  );
}