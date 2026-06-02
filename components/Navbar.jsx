"use client";

import { useState, useRef } from "react";
import { useUser } from "@/components/UserProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useUser();
  const menuRef = useRef(null);

  const isSuperAdmin = typeof window !== "undefined" && localStorage.getItem("sulail_user_role") === "5";

  const handleLogout = () => {
    localStorage.removeItem("sulail_user_name");
    localStorage.removeItem("sulail_user_role");
    document.cookie = "sulail_user_name=; Path=/; Max-Age=0; Secure; SameSite=Lax";
    document.cookie = "sulail_user_role=; Path=/; Max-Age=0; Secure; SameSite=Lax";
    setMenuOpen(false);
    window.dispatchEvent(new Event("userUpdated"));
    window.location.href = "/";
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-5 md:px-8 py-2.5 z-50 bg-gradient-to-r from-[#1B3A5C] via-[#2B5A8C] to-[#1B3A5C] backdrop-blur-2xl border-b-2 border-[#B49450]/30 shadow-lg shadow-[#0A1628]/20">
        <a href="/" className="flex items-center gap-2 no-underline group relative z-10">
          <span className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-[#D4AF37]/20 group-hover:shadow-xl transition-all duration-300">✦</span>
          <span className="text-xl md:text-2xl font-heading font-bold text-white tracking-tight">س<span className="text-[#D4AF37]">ل</span>يل</span>
        </a>
        <div className="flex items-center gap-3">
          {user && <span className="text-white/80 text-xs md:text-sm hidden sm:block">{user.full_name || user.email?.split("@")[0]}</span>}
          <button onClick={() => setMenuOpen(!menuOpen)} className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10 text-[#D4AF37]" aria-label="القائمة">
            <span className={`text-xl transition-all duration-500 ${menuOpen ? "rotate-90 scale-110" : "rotate-0"}`}>{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>
      <div className="h-14" />

      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-[#0A1628]/20 backdrop-blur-sm z-[60]" onClick={() => setMenuOpen(false)} />
          <div ref={menuRef} className="fixed top-14 left-4 md:left-8 w-72 bg-gradient-to-b from-[#1B3A5C] to-[#2B5A8C] border-2 border-[#B49450]/30 rounded-2xl shadow-2xl shadow-[#0A1628]/20 p-2 flex flex-col z-[70] animate-fadeIn">
            <div className="px-4 py-3 text-center border-b border-[#B49450]/20 mb-1">
              <span className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B49450] rounded-lg flex items-center justify-center text-white text-xs mx-auto mb-2 shadow-lg shadow-[#D4AF37]/20">✦</span>
              <span className="font-heading font-bold text-white text-lg">س<span className="text-[#D4AF37]">ل</span>يل</span>
              {user && <p className="text-white/50 text-[10px] mt-1">{user.full_name || user.email?.split("@")[0]}</p>}
            </div>
            <MenuItem icon="🏠" label="الرئيسية" href="/" onClick={() => setMenuOpen(false)} /><Divider />
            <MenuItem icon="🤖" label="العراف" href="/nisab" onClick={() => setMenuOpen(false)} />
            <MenuItem icon="💬" label="الديوان" href="/diwan" onClick={() => setMenuOpen(false)} />
            <MenuItem icon="🎭" label="منتدى الشعراء" href="/forum" onClick={() => setMenuOpen(false)} />
            <MenuItem icon="📜" label="ديوان العرب" href="/stories" onClick={() => setMenuOpen(false)} /><Divider />
            {!user ? (
              <MenuItem icon="🛡️" label="تسجيل الدخول" highlight href="/auth/login" onClick={() => setMenuOpen(false)} />
            ) : (
              <>
                {isSuperAdmin && (
                  <MenuItem icon="⚡" label="لوحة التحكم" href="/admin" onClick={() => setMenuOpen(false)} />
                )}
                <MenuItem icon="🚪" label="تسجيل الخروج" onClick={handleLogout} />
              </>
            )}
            <Divider />
            <MenuItem icon="📋" label="عن المنصة" href="/about" onClick={() => setMenuOpen(false)} />
            <MenuItem icon="🔒" label="الخصوصية" href="/privacy" onClick={() => setMenuOpen(false)} />
            <MenuItem icon="📄" label="شروط الاستخدام" href="/terms" onClick={() => setMenuOpen(false)} />
            <MenuItem icon="⚠️" label="إخلاء المسؤولية" href="/disclaimer" onClick={() => setMenuOpen(false)} /><Divider />
            <MenuItem icon="📞" label="تواصل معنا" onClick={() => { setMenuOpen(false); alert("📧 tribes@al-nisb.com"); }} />
            <div className="px-4 py-2 text-center border-t border-[#B49450]/20 mt-1"><p className="text-[10px] text-[#B49450]/50">© 2020-2026 سليل</p></div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease; }
      `}</style>
    </>
  );
}

function MenuItem({ icon, label, href, onClick, highlight }) {
  const Component = href ? "a" : "button";
  return (
    <Component href={href || undefined} onClick={onClick} className={`flex items-center gap-3 px-4 py-3 text-right rounded-xl transition-all duration-200 no-underline w-full ${highlight ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/15" : "hover:bg-white/10"}`}>
      <span className="text-lg">{icon}</span><span className={`text-sm font-medium ${highlight ? "text-[#D4AF37]" : "text-white/80 hover:text-white"}`}>{label}</span>
    </Component>
  );
}

function Divider() { return <hr className="border-[#B49450]/15 my-0.5" />; }