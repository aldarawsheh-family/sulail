// @ts-nocheck
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] font-body">
      <div className="max-w-4xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-heading font-bold text-[#0A1628] mb-2">🛡️ لوحة التحكم</h1>
        <p className="text-[#3A4B5F] text-sm mb-10">إدارة القبائل والبطون والأفخاذ</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <Card href="/admin/smart-manager" icon="🛡️" title="إدارة المنصة" desc="إدارة القبائل والبطون والأفخاذ والعشائر والفروع" />
          <Card href="/admin/branches-manage" icon="🌿" title="إدارة الفروع" desc="تعيين المشايخ وكلمات المرور للفروع" />
          <Card href="/admin/users" icon="👥" title="إدارة المستخدمين" desc="عرض المستخدمين وصلاحياتهم" />
          <Card href="/admin/audit" icon="📋" title="سجل النشاطات" desc="آخر العمليات في المنصة" />
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-center">
          <p className="text-amber-700 text-sm">⚠️ هذه الصفحة مخصصة للسوبر أدمن فقط.</p>
        </div>
      </div>
    </main>
  );
}

function Card({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} className="bg-white border border-[#B49450]/15 rounded-2xl p-6 text-center no-underline hover:border-[#B49450] hover:-translate-y-1 transition-all duration-300 shadow-sm">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-heading font-bold text-[#0A1628] mb-1">{title}</h3>
      <p className="text-[#3A4B5F] text-xs">{desc}</p>
    </Link>
  );
}