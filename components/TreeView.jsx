"use client";

import { useState, useRef, useEffect } from "react";

export default function TreeView({ persons, isAdmin, onEdit, onDelete, onAdd }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [scale, setScale] = useState(1);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [lineageGlow, setLineageGlow] = useState([]);
  const [lineageGlowing, setLineageGlowing] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  const currentYear = new Date().getFullYear();

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      const step = 40;
      if (e.key === "ArrowRight") setPan(p => ({ ...p, x: p.x - step }));
      if (e.key === "ArrowLeft") setPan(p => ({ ...p, x: p.x + step }));
      if (e.key === "ArrowUp") setPan(p => ({ ...p, y: p.y + step }));
      if (e.key === "ArrowDown") setPan(p => ({ ...p, y: p.y - step }));
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function buildTree() {
    if (!persons || persons.length === 0) return null;
    const ids = new Set(persons.map(p => p.id));
    const root = persons.find(p => !p.father_id || !ids.has(p.father_id));
    if (!root) return persons[0];

    function getChildren(fid) { return persons.filter(p => p.father_id === fid); }

    function getSubtreeWidth(person) {
      const children = getChildren(person.id);
      if (children.length === 0) return 1;
      const childrenWidth = children.reduce((sum, c) => sum + getSubtreeWidth(c), 0);
      return children.length === 1 ? Math.max(2, childrenWidth) : childrenWidth;
    }

    function buildNode(person, x, y, availableWidth) {
      const children = getChildren(person.id);
      const node = { person, x, y, children: [] };

      if (children.length > 0) {
        const totalWeight = children.reduce((sum, c) => sum + getSubtreeWidth(c), 0);
        const minGap = 140;
        const unitWidth = Math.max(minGap, availableWidth / totalWeight);
        
        let currentX = x - (totalWeight * unitWidth) / 2;

        children.forEach((c) => {
          const childWeight = getSubtreeWidth(c);
          const childWidth = childWeight * unitWidth;
          const childCenterX = currentX + childWidth / 2;
          node.children.push(buildNode(c, childCenterX, y + 180, childWidth));
          currentX += childWidth;
        });
      }
      return node;
    }

    const totalWidth_weight = getSubtreeWidth(root);
    const totalWidth = Math.max(1200, totalWidth_weight * 160);
    return { root: buildNode(root, totalWidth / 2, 200, totalWidth), totalWidth, totalLeaves: totalWidth_weight };
  }

  const treeData = buildTree();
  const treeRoot = treeData?.root;
  const treeWidth = treeData?.totalWidth || 1200;

  function getTreeHeight(node) {
    if (!node) return 0;
    let maxChildHeight = 0;
    if (node.children) {
      node.children.forEach(c => {
        const h = getTreeHeight(c);
        if (h > maxChildHeight) maxChildHeight = h;
      });
    }
    return 180 + maxChildHeight;
  }

  const treeHeight = treeRoot ? Math.max(800, getTreeHeight(treeRoot) + 250) : 800;

  function getStatusIcon(p) {
    if (!p.status) return "🍁";
    if (p.status.includes("شهيد")) return "⚔️";
    if (p.status.includes("حي")) return "🌿";
    return "🕊️";
  }

  function getStatusColor(p) {
    if (!p.status) return "#B49450";
    if (p.status.includes("شهيد")) return "#E53935";
    if (p.status.includes("حي")) return "#4CAF50";
    return "#C9A96B";
  }

  function getLineageArray(p) {
    const lineage = [{ id: p.id, pid: null }];
    let current = p;
    let max = 20;
    while (current.father_id && max-- > 0) {
      const father = persons.find(x => x.id === current.father_id);
      if (!father) break;
      lineage.push({ id: father.id, pid: current.id });
      current = father;
    }
    return lineage;
  }

  function getAge(birthYear) {
    if (!birthYear) return null;
    const year = parseInt(birthYear, 10);
    if (isNaN(year)) return null;
    return currentYear - year;
  }

  function handleSearch(val) {
    setSearch(val);
    if (val.length < 2) { setSearchResults([]); return; }
    const q = val.toLowerCase();
    
    const results = persons.filter(p => {
      const name = (p.display_name || "").toLowerCase();
      const full = (p.full_name || "").toLowerCase();
      return name.includes(q) || full.includes(q);
    });

    results.sort((a, b) => {
      const aName = (a.display_name || "").toLowerCase();
      const bName = (b.display_name || "").toLowerCase();
      const aStarts = aName.startsWith(q) ? -1 : 1;
      const bStarts = bName.startsWith(q) ? -1 : 1;
      return aStarts - bStarts;
    });

    setSearchResults(results.slice(0, 7));
  }

  function findNode(node, id) {
    if (!node) return null;
    if (node.person.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  function panToPerson(person) {
    const node = findNode(treeRoot, person.id);
    if (!node) return;

    const allCircles = containerRef.current?.querySelectorAll("circle");
    if (!allCircles) return;

    let targetCircle = null;
    allCircles.forEach(circle => {
      const cx = parseFloat(circle.getAttribute("cx"));
      const cy = parseFloat(circle.getAttribute("cy"));
      if (Math.abs(cx - node.x) < 1 && Math.abs(cy - node.y) < 1) {
        targetCircle = circle;
      }
    });

    if (!targetCircle) return;

    const rect = targetCircle.getBoundingClientRect();
    const circleCenterX = rect.left + rect.width / 2;
    const circleCenterY = rect.top + rect.height / 2;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height * 0.55;

    const deltaX = centerX - circleCenterX;
    const deltaY = centerY - circleCenterY;

    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }

  function resetToDarweesh() {
    setScale(1);
    const darweesh = persons.find(p => p.display_name === "درويش");
    if (darweesh) {
      setLineageGlow([]);
      setLineageGlowing(false);
      panToPerson(darweesh);
    } else {
      setPan({ x: 0, y: 0 });
    }
  }

  function goToPerson(person) {
    setSearch("");
    setSearchResults([]);
    setSelectedPerson(null);
    if (lineageGlowing) return;
    setLineageGlowing(true);

    panToPerson(person);

    const lineage = getLineageArray(person);
    setLineageGlow([]);

    lineage.forEach((item, i) => {
      setTimeout(() => {
        setLineageGlow(prev => [...prev, item]);
      }, i * 600);
    });

    setTimeout(() => {
      setLineageGlow([]);
      setLineageGlowing(false);
    }, 6000);
  }

  function isGlow(personId) {
    return lineageGlow.some(item => item.id === personId);
  }

  function isLineGlow(personId, childId) {
    return lineageGlow.some(item => item.id === personId && item.pid === childId);
  }

  function handleMouseDown(e) {
    if (e.target.closest("button") || e.target.closest("circle") || selectedPerson) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }

  function handleMouseMove(e) {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }

  function handleMouseUp() { setDragging(false); }

  function handleTouchStart(e) {
    if (e.touches.length === 1 && !e.target.closest("button") && !e.target.closest("circle") && !selectedPerson) {
      setDragging(true);
      dragStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  }

  function handleTouchMove(e) {
    if (!dragging) return;
    setPan({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
  }

  function handleTouchEnd() { setDragging(false); }

  function handleCardClose(e) {
    e.stopPropagation();
    setSelectedPerson(null);
  }

  function renderTree(node) {
    if (!node) return null;
    const color = getStatusColor(node.person);
    const glow = isGlow(node.person.id);
    const name = node.person.display_name || node.person.full_name || "";
    const radius = Math.max(32, name.length * 5 + 14);
    const gradId = `grad-${node.person.id}`;
    const shadowId = `shadow-${node.person.id}`;

    return (
      <g key={node.person.id}>
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={glow ? "#FFD700" : "white"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={glow ? "#FFD700" : "white"} stopOpacity="1" />
          </radialGradient>
          <filter id={shadowId}>
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#8B6914" floodOpacity="0.25" />
          </filter>
        </defs>

        {node.children.map(child => {
          const lineGlow = isLineGlow(child.person.id, node.person.id);
          const midX = (node.x + child.x) / 2;
          const midY = (node.y + radius + child.y - radius) / 2;
          
          return (
            <path
              key={`l-${child.person.id}`}
              d={`M ${node.x} ${node.y + radius} Q ${midX} ${midY + 20} ${child.x} ${child.y - radius}`}
              fill="none"
              stroke={lineGlow ? "#FFD700" : "#8B6914"}
              strokeWidth={lineGlow ? 3.5 : 2.5}
              opacity={lineGlow ? 1 : 0.5}
              strokeLinecap="round"
              filter={lineGlow ? "url(#glow)" : ""}
              style={{ transition: "all 0.5s ease" }}
            />
          );
        })}

        <circle cx={node.x} cy={node.y} r={radius}
          fill={`url(#${gradId})`}
          stroke={glow ? "#FFD700" : color}
          strokeWidth={glow ? 3.5 : 2.5}
          opacity={glow ? 1 : 0.95}
          filter={`url(#${shadowId})`}
          onClick={() => setSelectedPerson(node.person)}
          style={{ cursor: "pointer", transition: "all 0.4s ease" }}
        />

        {/* الأيقونة - رجعت مكانها */}
        <text x={node.x} y={node.y - 2} textAnchor="middle"
          fill={glow ? "#0A1628" : color}
          fontSize={18}
          fontWeight="800"
          style={{ transition: "all 0.4s ease" }}>
          {getStatusIcon(node.person)}
        </text>

        <text x={node.x} y={node.y + radius * 0.5 + 6} textAnchor="middle"
          fill={glow ? "#0A1628" : "#5D4037"}
          fontSize={glow ? 13 : 11}
          fontWeight="700"
          style={{ transition: "all 0.4s ease" }}>
          {name}
        </text>

        {node.children.map(c => renderTree(c))}
      </g>
    );
  }

  function getThreeName(p) {
    const name = p.display_name || p.full_name || "";
    const father = persons.find(x => x.id === p.father_id);
    const fatherName = father ? (father.display_name || father.full_name) : "";
    const grandpa = father ? persons.find(x => x.id === father.father_id) : null;
    const grandpaName = grandpa ? (grandpa.display_name || grandpa.full_name) : "";
    
    if (fatherName && grandpaName) {
      return `${name} بن ${fatherName} بن ${grandpaName}`;
    } else if (fatherName) {
      return `${name} بن ${fatherName}`;
    }
    return name;
  }

  function getLineage(p) {
    const l = [p.display_name || p.full_name];
    let c = p; let i = 20;
    while (c.father_id && i-- > 0) {
      const f = persons.find(x => x.id === c.father_id);
      if (!f) break;
      l.push(f.display_name || f.full_name);
      c = f;
    }
    return l.join(" بن ");
  }

  function getRelatives(p, fid) {
    return persons.filter(x => x.father_id === fid && x.id !== p?.id).map(x => x.display_name || x.full_name).join("، ") || "لا يوجد";
  }

  function getFather(p) {
    const f = persons.find(x => x.id === p.father_id);
    return f ? (f.display_name || f.full_name) : "غير معروف";
  }

  return (
    <div ref={containerRef} className="relative shadow-2xl"
      style={{
        minHeight: "100vh",
        height: "100vh",
        background: "linear-gradient(180deg, #FDFBF7 0%, #F5F0E8 50%, #FDFBF7 100%)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: "auto",
      }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      
      {/* رسالة التأكيد المنبثقة */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#4CAF50] text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-slideDown">
          ✅ {toast}
        </div>
      )}

      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-[#B49450]/10"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }} />
        ))}
      </div>

      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-80">
        <div className="relative">
          <input type="text" placeholder="🔍 ابحث عن فرد..." value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-6 py-3.5 bg-white/90 backdrop-blur-xl border-2 border-[#B49450]/30 rounded-2xl text-right text-sm outline-none focus:border-[#B49450] text-[#0A1628] placeholder:text-[#8A95A4] shadow-xl transition-all duration-300" />
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-3 left-0 right-0 bg-white/98 backdrop-blur-xl border border-[#B49450]/30 rounded-2xl shadow-2xl overflow-hidden z-30">
              {searchResults.map(p => (
                <button key={p.id} onClick={() => goToPerson(p)}
                  className="w-full text-right px-5 py-3.5 text-sm hover:bg-[#B49450]/10 transition border-b border-[#B49450]/10 last:border-0 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B49450] to-[#8B6914] flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {getStatusIcon(p)}
                  </div>
                  <div>
                    <div className="text-[#0A1628] font-bold">{getThreeName(p)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-10">
        {[
          {
            label: "+",
            action: () => {
              const container = containerRef.current;
              if (!container) return;
              const cx = container.clientWidth / 2;
              const cy = container.clientHeight / 2;
              const newScale = Math.min(3, scale * 1.15);
              setPan(prev => ({
                x: cx - (cx - prev.x) * (newScale / scale),
                y: cy - (cy - prev.y) * (newScale / scale),
              }));
              setScale(newScale);
            },
          },
          {
            label: "−",
            action: () => {
              const container = containerRef.current;
              if (!container) return;
              const cx = container.clientWidth / 2;
              const cy = container.clientHeight / 2;
              const newScale = Math.max(0.2, scale / 1.15);
              setPan(prev => ({
                x: cx - (cx - prev.x) * (newScale / scale),
                y: cy - (cy - prev.y) * (newScale / scale),
              }));
              setScale(newScale);
            },
          },
          {
            label: "↺",
            action: resetToDarweesh,
          },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action}
            className="w-11 h-11 bg-white/90 backdrop-blur-xl rounded-full shadow-xl flex items-center justify-center text-[#B49450] text-lg hover:bg-[#B49450] hover:text-white transition border border-[#B49450]/30">
            {btn.label}
          </button>
        ))}
      </div>

      <div className="w-full h-full" style={{ cursor: dragging ? "grabbing" : "grab", overflow: "auto" }}>
        <svg viewBox={`0 0 ${treeWidth} ${treeHeight}`}
          style={{
            width: treeWidth,
            height: treeHeight,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "top left",
            transition: dragging ? "none" : "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1.2)",
            display: "block",
          }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {treeRoot && (
            <>
              <rect x={treeRoot.x - 10} y={treeRoot.y - 70} width="20" height="90" fill="#8B6914" rx="10" opacity="0.4" />
              <rect x={treeRoot.x - 6} y={treeRoot.y - 60} width="12" height="70" fill="#5D4037" rx="6" opacity="0.6" />
            </>
          )}
          {treeRoot && renderTree(treeRoot)}
        </svg>
      </div>

      {/* بطاقة هوية - وسط الشاشة */}
      {selectedPerson && (
        <div 
          className="fixed inset-0 z-30 flex items-center justify-center p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedPerson(null); }}
          onTouchStart={(e) => { if (e.target === e.currentTarget) setSelectedPerson(null); }}
        >
          <div className="absolute inset-0 bg-[#0A1628]/40 backdrop-blur-sm" onClick={handleCardClose} />
          
          <div 
            ref={cardRef}
            className="relative bg-white border-2 border-[#B49450]/40 rounded-3xl shadow-2xl w-full max-w-md max-h-[75vh] overflow-y-auto animate-slideUp"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <button
                onClick={handleCardClose}
                className="absolute top-4 right-4 w-9 h-9 bg-[#F5F0E8] hover:bg-[#B49450]/10 rounded-full flex items-center justify-center text-[#5D4037] text-lg transition z-10"
              >
                ✕
              </button>

              <div className="w-10 h-1.5 bg-[#B49450]/30 rounded-full mx-auto mb-5" />
              
              <div className="text-center">
                <div className="w-auto min-w-[70px] h-[70px] mx-auto mb-3 px-5 rounded-full bg-gradient-to-br from-[#B49450] to-[#8B6914] flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-[#B49450]/20 whitespace-nowrap">
                  {selectedPerson.display_name || selectedPerson.full_name}
                </div>
                <p className="text-[#B49450] text-[10px] font-bold tracking-[0.3em] mb-1">
                  ⭐ {selectedPerson.public_id || "BR-000"} ⭐
                </p>
                <p className="text-[#5A6B7F] text-xs mt-1">
                  {selectedPerson.status || "حي أطال الله بعمره"}
                  {selectedPerson.birth_year && (
                    <span className="mx-2">•</span>
                  )}
                  {selectedPerson.birth_year && (
                    <span>~ {getAge(selectedPerson.birth_year)} سنة</span>
                  )}
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-2 mt-5 justify-center flex-wrap">
                  {[
                    { label: "➕ ابن", type: "son", color: "bg-[#4CAF50]" },
                    { label: "👬 أخ", type: "brother", color: "bg-[#FF9800]" },
                    { label: "👆 أب", type: "father", color: "bg-[#9C27B0]" },
                    { label: "✏️ تعديل", type: "edit", color: "bg-[#2196F3]" },
                    { label: "🗑️ حذف", type: "delete", color: "bg-[#E53935]" },
                  ].map(btn => (
                    <button key={btn.type}
                      onClick={() => {
                        setSelectedPerson(null);
                        if (btn.type === "edit") onEdit(selectedPerson);
                        else if (btn.type === "delete") onDelete(selectedPerson.id);
                        else onAdd(btn.type, selectedPerson);
                      }}
                      className={`${btn.color} text-white px-4 py-2 rounded-full text-[11px] font-bold hover:brightness-110 transition shadow-lg`}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-2.5 text-xs">
                <Row label="الميلاد" value={selectedPerson.birth_year || "غير مسجل"} />
                <Row label="العمر" value={getAge(selectedPerson.birth_year) ? `~ ${getAge(selectedPerson.birth_year)} سنة` : "غير مسجل"} />
                <Row label="الأب" value={getFather(selectedPerson)} />
                <Row label="الأبناء" value={getRelatives(null, selectedPerson.id)} />
                <Row label="الإخوة" value={getRelatives(selectedPerson, selectedPerson.father_id)} />
              </div>
              <div className="mt-5 p-4 bg-[#F5F0E8] rounded-2xl text-center border border-[#B49450]/10">
                <p className="text-[10px] text-[#5A6B7F] leading-relaxed font-heading">
                  📜 {getLineage(selectedPerson)}
                </p>
              </div>
              <div className="flex justify-center mt-4">
                <div className="w-16 h-16 rounded-full border-2 border-[#1565C0]/50 bg-[#1565C0]/5 flex items-center justify-center text-[7px] text-[#1565C0] font-bold leading-tight rotate-[-5deg] shadow-md">
                  فخذ<br />الدراوشة<br />عشيرة العليان
                </div>
              </div>
              <p className="text-center text-[8px] text-[#8A95A4] mt-3">⚠️ هذه الهوية خاصة بأفراد الفخذ وليست هوية رسمية</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0) translateX(0); opacity: 0; } 50% { opacity: 0.6; } }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[#B49450]/10 pb-2.5">
      <span className="text-[#8A95A4]">{label}</span>
      <span className="text-[#0A1628] font-bold text-left max-w-[65%]">{value}</span>
    </div>
  );
}