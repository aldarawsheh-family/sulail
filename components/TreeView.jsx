"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ========== دوال الشجرة ==========
function buildTree(persons) {
  if (!persons?.length) return null;
  const ids = new Set(persons.map(p => p.id));
  return persons.find(p => !p.father_id || !ids.has(p.father_id)) || persons[0];
}

function getChildren(persons, fid) { return persons.filter(p => p.father_id === fid); }
function getWeight(persons, person) {
  const kids = getChildren(persons, person.id);
  if (!kids.length) return 1;
  return kids.reduce((s, c) => s + getWeight(persons, c), 0);
}

function countDescendants(persons, person) {
  const kids = getChildren(persons, person.id);
  if (!kids.length) return 0;
  return kids.length + kids.reduce((s, c) => s + countDescendants(persons, c), 0);
}

function countStatus(persons, person, keyword) {
  const kids = getChildren(persons, person.id);
  const self = (person.status && person.status.includes(keyword)) ? 1 : 0;
  if (!kids.length) return self;
  return kids.reduce((s, c) => s + countStatus(persons, c, keyword), 0) + self;
}

const GEN = [
  { w: 170, h: 110, gapX: 50, gapY: 180 },
  { w: 140, h: 92,  gapX: 36, gapY: 150 },
  { w: 110, h: 74,  gapX: 26, gapY: 126 },
  { w: 88,  h: 60,  gapX: 18, gapY: 104 },
  { w: 70,  h: 48,  gapX: 12, gapY: 86 },
];
function cfg(g) { return GEN[Math.min(g, GEN.length - 1)]; }

function getFullThreeNames(persons, p) {
  const name = p.display_name || p.full_name || '';
  const father = persons.find(x => x.id === p.father_id);
  const fatherName = father ? (father.display_name || father.full_name || '') : '';
  const grandpa = father ? persons.find(x => x.id === father.father_id) : null;
  const grandpaName = grandpa ? (grandpa.display_name || grandpa.full_name || '') : '';
  if (fatherName && grandpaName) return `${name} بن ${fatherName} بن ${grandpaName}`;
  if (fatherName) return `${name} بن ${fatherName}`;
  return name;
}

function getAncestors(persons, p) {
  const chain = [p.id];
  let c = p; let i = 20;
  while (c.father_id && i-- > 0) { const f = persons.find(x => x.id === c.father_id); if (!f) break; chain.push(f.id); c = f; }
  return chain;
}

function getLineage(persons, p) {
  const l = [p.display_name || p.full_name || ''];
  let c = p; let i = 20;
  while (c.father_id && i-- > 0) { const f = persons.find(x => x.id === c.father_id); if (!f) break; l.push(f.display_name || f.full_name || ''); c = f; }
  return l.join(' بن ');
}

function getRelatives(persons, p, fid) {
  return persons.filter(x => x.father_id === fid && x.id !== p?.id).map(x => x.display_name || x.full_name).join('، ') || 'لا يوجد';
}

function getFather(persons, p) { const f = persons.find(x => x.id === p.father_id); return f ? (f.display_name || f.full_name) : 'غير معروف'; }
function getUncles(persons, p) {
  const f = persons.find(x => x.id === p.father_id);
  if (!f || !f.father_id) return 'لا يوجد';
  return persons.filter(x => x.father_id === f.father_id && x.id !== f.id).map(x => x.display_name || x.full_name).join('، ') || 'لا يوجد';
}

const genColors = [
  { bg: ['#1A2A4A', '#12243A'], stroke: '#D4AF37', text: '#FFFFFF', icon: '#D4AF37' },
  { bg: ['#1F3050', '#152840'], stroke: '#C9A84C', text: '#F0F0F0', icon: '#C9A84C' },
  { bg: ['#243656', '#1A2C46'], stroke: '#B89450', text: '#E8E8E8', icon: '#B89450' },
  { bg: ['#293C5C', '#1F3050'], stroke: '#A08040', text: '#E0E0E0', icon: '#A08040' },
  { bg: ['#2E4262', '#243656'], stroke: '#907030', text: '#D8D8D8', icon: '#907030' },
];
function getGenColors(gen) { return genColors[Math.min(gen, genColors.length - 1)]; }

// ========== مكون الجوال: 4 أختام ==========
function GlowingSeal({ person, title, isActive, onClick, hasRelatives, onRelativesClick }) {
  if (!person) {
    return (
      <div className="flex flex-col items-center relative my-3 font-cairo select-none opacity-30">
        <span className="text-[10px] text-slate-500/60 mb-1 tracking-widest bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-800/50">{title}</span>
        <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700/50 bg-slate-900/50 flex items-center justify-center text-slate-600 text-2xl">—</div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center relative my-3 font-cairo select-none">
      {isActive && <div className="absolute w-28 h-28 bg-amber-500/15 rounded-full blur-2xl animate-pulse"></div>}
      <span className="text-[10px] text-amber-500/60 mb-1 tracking-widest bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 z-10">{title}</span>
      <div onClick={() => onClick(person)}
        className={`w-[85px] h-[85px] rounded-full border-2 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all active:scale-95 shadow-2xl z-10 ${
          isActive ? 'border-amber-500 bg-gradient-to-b from-amber-950/40 to-slate-900 shadow-[0_0_25px_rgba(217,119,6,0.5)] text-amber-300' : 'border-slate-600 bg-slate-900/80 text-slate-200 hover:border-amber-500/50'
        }`}>
        <span className="text-sm mb-0.5">{person.status?.includes('شهيد') ? '⚔️' : person.status?.includes('انتقل') ? '🕊️' : '🍁'}</span>
        <span className="text-[13px] font-bold leading-tight truncate w-full px-1">{person.display_name || person.first_name || ''}</span>
      </div>
      {hasRelatives && (
        <button onClick={(e) => { e.stopPropagation(); onRelativesClick(person); }}
          className="absolute -bottom-1 w-5 h-5 bg-amber-500 rounded-full animate-ping flex items-center justify-center text-[8px] text-slate-900 font-bold z-20">•••</button>
      )}
    </div>
  );
}

function RelativesPopup({ person, allPersons, onClose, onNodeClick }) {
  if (!person) return null;
  const siblings = allPersons.filter(p => p.father_id === person.father_id && p.id !== person.id);
  const father = allPersons.find(p => p.id === person.father_id);
  const uncles = father?.father_id ? allPersons.filter(p => p.father_id === father.father_id && p.id !== father.id) : [];
  const children = allPersons.filter(p => p.father_id === person.id);
  const unclesIds = uncles.map(p => p.id);
  const cousins = allPersons.filter(p => unclesIds.includes(p.father_id || ''));
  const allRelatives = [
    ...siblings.map(p => ({ ...p, relation: 'أخ' })),
    ...uncles.map(p => ({ ...p, relation: 'عم' })),
    ...children.map(p => ({ ...p, relation: 'ابن' })),
    ...cousins.map(p => ({ ...p, relation: 'ابن عم' })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl w-full max-w-sm max-h-[70vh] overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 px-5 py-3 text-center sticky top-0 z-10">
          <button onClick={onClose} className="absolute top-3 right-4 w-7 h-7 bg-black/30 rounded-full flex items-center justify-center text-white text-sm">✕</button>
          <h3 className="text-white font-bold text-base">أقارب {person.display_name || person.first_name}</h3>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto max-h-[55vh]">
          {allRelatives.length === 0 && <p className="text-slate-400 text-sm text-center py-8">لا يوجد أقارب مسجلون</p>}
          {allRelatives.map((p, i) => (
            <button key={p.id + i} onClick={() => { onClose(); onNodeClick(p); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/60 hover:bg-amber-500/10 border border-slate-700/50 rounded-xl text-right transition active:scale-[0.98]">
              <span className="text-lg">{p.status?.includes('شهيد') ? '⚔️' : p.status?.includes('انتقل') ? '🕊️' : '🍁'}</span>
              <div><span className="text-white text-sm font-bold block">{p.display_name || p.first_name}</span><span className="text-amber-500/60 text-[10px]">{p.relation}</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== المكون الرئيسي ==========
export default function TreeView({ persons, isAdmin, onEdit, onDelete, onAdd, branch, onUpdateBranch }) {
  const [sel, setSel] = useState(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const ds = useRef({ x: 0, y: 0 });
  const cr = useRef(null);
  const cv = useRef(null);
  const [lay, setLay] = useState(null);
  const [tw, setTw] = useState(700);
  const [th, setTh] = useState(800);
  const yr = new Date().getFullYear();
  const [glow, setGlow] = useState([]);
  const [glowActive, setGlowActive] = useState(false);
  const animRef = useRef(null);
  const [collapsed, setCollapsed] = useState({});
  const [showStats, setShowStats] = useState(false);
  const [branchStory, setBranchStory] = useState(branch?.branch_story || '');
  const [storySaved, setStorySaved] = useState(false);
  const [subRoots, setSubRoots] = useState([]);
  const [showAddRoot, setShowAddRoot] = useState(false);
  const [rootSearchQ, setRootSearchQ] = useState('');
  const [rootSearchResults, setRootSearchResults] = useState([]);
  const [editingRootId, setEditingRootId] = useState(null);
  const [editingRootStory, setEditingRootStory] = useState('');
  const [editingRootLabel, setEditingRootLabel] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showRelatives, setShowRelatives] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!branch?.id) return;
    fetch(`/api/branch-roots?branchId=${branch.id}`).then(r => r.json()).then(d => setSubRoots(d || []));
  }, [branch?.id]);

  useEffect(() => {
    if (!persons?.length) return;
    const root = buildTree(persons);
    if (!root) return;
    function layout(person, gen, x, y, aw, isHidden) {
      const c = cfg(gen);
      const kids = getChildren(persons, person.id);
      const effKids = isHidden ? [] : kids;
      const twg = effKids.length ? effKids.reduce((s, k) => s + getWeight(persons, k), 0) : 1;
      const uw = aw / Math.max(twg, 1);
      const node = { ...person, gen, w: c.w, h: c.h, x, y, children: [], _hidden: isHidden };
      if (effKids.length && !isHidden) {
        let cx = x - (twg * uw) / 2;
        const cy = y + c.gapY;
        for (const k of effKids) {
          const kw = getWeight(persons, k) * uw;
          node.children.push(layout(k, gen + 1, cx + kw / 2, cy, kw, collapsed[k.id] || false));
          cx += kw;
        }
      }
      return node;
    }
    function height(node) {
      if (node._hidden) return 0;
      const c = cfg(node.gen);
      let m = c.h + 70;
      if (node.children?.length) for (const k of node.children) m = Math.max(m, c.gapY + height(k));
      return m;
    }
    const totalW = getWeight(persons, root);
    const w = Math.max(700, totalW * 150);
    const l = layout(root, 0, w / 2, 80, w, false);
    setLay(l); setTw(w); setTh(Math.max(400, height(l) + 80));
  }, [persons, collapsed]);

  useEffect(() => {
    if (!lay || !cv.current) return;
    const c = cv.current;
    const ctx = c.getContext('2d');
    c.width = tw; c.height = th;
    ctx.clearRect(0, 0, tw, th);
    drawLines(ctx, lay);
    drawCards(ctx, lay);
  }, [lay, tw, th, glow]);

  function isGlow(id) { return glow.includes(id); }

  function drawLines(ctx, node) {
    if (node._hidden) return;
    if (!node.children?.length) return;
    const sx = node.x, sy = node.y + node.h / 2;
    for (const ch of node.children) {
      if (ch._hidden) continue;
      const ex = ch.x, ey = ch.y - ch.h / 2;
      const my = sy + (ey - sy) * 0.4;
      const d = Math.abs(ex - sx) < 3;
      const lg = isGlow(ch.id) && isGlow(node.id);
      const gc = getGenColors(node.gen);
      ctx.beginPath(); ctx.moveTo(sx, sy);
      if (d) ctx.lineTo(ex, ey); else ctx.bezierCurveTo(sx, my, ex, my, ex, ey);
      ctx.strokeStyle = lg ? '#FFD700' : gc.stroke + '40'; ctx.lineWidth = lg ? 8 : 5;
      ctx.shadowColor = lg ? '#FFD700' : 'transparent'; ctx.shadowBlur = lg ? 25 : 0;
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(sx, sy);
      if (d) ctx.lineTo(ex, ey); else ctx.bezierCurveTo(sx, my, ex, my, ex, ey);
      ctx.strokeStyle = lg ? '#FFD700' : gc.stroke; ctx.lineWidth = lg ? 3 : 2;
      ctx.stroke();
    }
    for (const ch of node.children) drawLines(ctx, ch);
  }

  function drawCards(ctx, node) {
    if (node._hidden) return;
    const c = cfg(node.gen);
    const x = node.x - c.w / 2, y = node.y - c.h / 2, r = 14;
    const g = isGlow(node.id);
    const gc = getGenColors(node.gen);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + c.w - r, y);
    ctx.quadraticCurveTo(x + c.w, y, x + c.w, y + r);
    ctx.lineTo(x + c.w, y + c.h - r);
    ctx.quadraticCurveTo(x + c.w, y + c.h, x + c.w - r, y + c.h);
    ctx.lineTo(x + r, y + c.h);
    ctx.quadraticCurveTo(x, y + c.h, x, y + c.h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    const grad = ctx.createLinearGradient(x, y, x, y + c.h);
    if (g) { grad.addColorStop(0, '#FFFEF0'); grad.addColorStop(1, '#FFE082'); }
    else { grad.addColorStop(0, gc.bg[0]); grad.addColorStop(1, gc.bg[1]); }
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = g ? '#FFD700' : gc.stroke; ctx.lineWidth = g ? 3 : 2;
    ctx.shadowColor = g ? '#FFD700' : 'transparent'; ctx.shadowBlur = g ? 25 : 0;
    ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = gc.icon;
    const iconSize = node.gen === 0 ? 26 : node.gen === 1 ? 22 : node.gen === 2 ? 18 : 14;
    ctx.font = `${iconSize}px 'Segoe UI', sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(icon(node), node.x, node.y - iconSize * 0.5);
    ctx.fillStyle = g ? '#1A0A00' : gc.text;
    ctx.font = 'bold 18px "Cairo", sans-serif';
    ctx.fillText(node.display_name || node.full_name || '', node.x, node.y + 9);
    ctx.textAlign = 'start';
    const desc = countDescendants(persons, node);
    if (desc >= 55) {
      const bx = node.x + c.w / 2 - 16, by = node.y + c.h / 2 - 16;
      ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2);
      ctx.fillStyle = gc.bg[0]; ctx.fill(); ctx.strokeStyle = gc.stroke; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = gc.stroke; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(collapsed[node.id] ? '+' : '−', bx, by + 5);
      ctx.textAlign = 'start'; node._collapseBtn = { x: bx, y: by, r: 13 };
    } else { node._collapseBtn = null; }
    for (const ch of node.children || []) drawCards(ctx, ch);
  }

  const icon = p => p?.status?.includes('شهيد') ? '⚔️' : p?.status?.includes('حي') ? '🍁' : '🕊️';
  const age = b => b ? yr - parseInt(b) : null;

  const [q, setQ] = useState(''); const [qr, setQr] = useState([]);
  function search(v) { setQ(v); if (v.length < 1) { setQr([]); return; } const s = v.toLowerCase().trim(); let results = persons.filter(p => getFullThreeNames(persons, p).toLowerCase().includes(s)); results.sort((a, b) => getFullThreeNames(persons, a).length - getFullThreeNames(persons, b).length); setQr(results.slice(0, 10)); }
  function findLayoutNode(node, id) { if (!node) return null; if (node.id === id) return node; if (node.children) for (const ch of node.children) { const f = findLayoutNode(ch, id); if (f) return f; } return null; }
  function findNodeAt(node, cx, cy) {
    if (node._hidden) return null;
    const c = cfg(node.gen);
    if (cx >= node.x - c.w/2 && cx <= node.x + c.w/2 && cy >= node.y - c.h/2 && cy <= node.y + c.h/2) {
      if (node._collapseBtn) { const btn = node._collapseBtn; if (Math.sqrt((cx-btn.x)**2+(cy-btn.y)**2) <= btn.r) return { type:'collapse', node }; }
      return node;
    }
    if (node.children) for (const ch of node.children) { const f = findNodeAt(ch, cx, cy); if (f) return f; }
    return null;
  }
  function animateToScale(targetScale) {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const ss = scale, st = performance.now(), dur = 400;
    function step(t) { const p = Math.min((t-st)/dur, 1), e = 1-Math.pow(1-p,3); setScale(ss+(targetScale-ss)*e); if (p<1) animRef.current = requestAnimationFrame(step); }
    animRef.current = requestAnimationFrame(step);
  }
  function go(p) {
    setQ(''); setQr([]); if (!lay) { setSel(p); return; } if (glowActive) return; setGlowActive(true); setGlow([]);
    const anc = getAncestors(persons, p), tn = findLayoutNode(lay, p.id);
    if (tn && cr.current) {
      const ct = cr.current, ts = 1.2;
      const nx = tn.x * scale + pan.x, ny = tn.y * scale + pan.y;
      const mx = ct.clientWidth/2, my = ct.clientHeight*0.4;
      setPan(prev => ({ x: prev.x + mx - nx, y: prev.y + my - ny }));
      animateToScale(ts);
    }
    anc.forEach((id, i) => setTimeout(() => setGlow(prev => [...prev, id]), i * 500));
    setTimeout(() => { setGlow([]); setGlowActive(false); setSel(p); }, anc.length * 500 + 1500);
  }

  const handleCanvasClick = useCallback((e) => {
    if (!lay || !cv.current || !cr.current) return;
    const rect = cv.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left - pan.x) / scale;
    const my = (e.clientY - rect.top - pan.y) / scale;
    const found = findNodeAt(lay, mx, my);
    if (!found) return;
    if (found.type === 'collapse') { setCollapsed(prev => ({ ...prev, [found.node.id]: !prev[found.node.id] })); return; }
    if (glowActive) return;
    setSel(found);
  }, [lay, pan.x, pan.y, scale, glowActive]);

  const handleMouseDown = useCallback((e) => { if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return; setDragging(true); ds.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }, [pan.x, pan.y]);
  const handleMouseMove = useCallback((e) => { if (!dragging) return; setPan({ x: e.clientX - ds.current.x, y: e.clientY - ds.current.y }); }, [dragging]);
  const handleMouseUp = useCallback(() => { setDragging(false); }, []);
  const handleTouchStart = useCallback((e) => { if (e.touches.length === 1 && !e.target.closest('button')) { setDragging(true); ds.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y }; } }, [pan.x, pan.y]);
  const handleTouchMove = useCallback((e) => { if (!dragging) return; setPan({ x: e.touches[0].clientX - ds.current.x, y: e.touches[0].clientY - ds.current.y }); }, [dragging]);
  const handleTouchEnd = useCallback(() => { setDragging(false); }, []);
  function handleWheel(e) { e.preventDefault(); setScale(s => Math.max(0.3, Math.min(2.5, s + (e.deltaY < 0 ? 0.1 : -0.1)))); }

  const rootPerson = buildTree(persons);

  async function saveStory() {
    if (!branch?.id || !onUpdateBranch) return;
    await fetch(`/api/branches/${branch.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branch_story: branchStory }) });
    setStorySaved(true); setTimeout(() => setStorySaved(false), 2000);
  }
  async function addSubRoot(personId) {
    if (!branch?.id) return;
    const res = await fetch('/api/branch-roots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ branch_id: branch.id, person_id: personId, story: '' }) });
    const data = await res.json();
    if (res.ok && data) { setSubRoots(prev => [...prev, data]); setShowAddRoot(false); setRootSearchQ(''); }
  }
  async function saveSubRootStory(rootId, story, label) {
    await fetch('/api/branch-roots', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: rootId, story, label }) });
    setSubRoots(prev => prev.map(r => r.id === rootId ? { ...r, story, label } : r)); setEditingRootId(null); setEditingRootLabel('');
  }
  function searchRoots(v) { setRootSearchQ(v); if (v.length < 1) { setRootSearchResults([]); return; } setRootSearchResults(persons.filter(p => getFullThreeNames(persons, p).toLowerCase().includes(v.toLowerCase().trim())).slice(0, 10)); }
  function getPersonById(id) { return persons.find(p => p.id === id); }

  const checkRelatives = (personId) => {
    if (!personId) return false;
    const g1 = sel, g2 = persons.find(p => p.id === g1?.father_id), g3 = persons.find(p => p.id === g2?.father_id), g4 = persons.find(p => p.id === g3?.father_id);
    return persons.some(p => p.father_id === personId && p.id !== g1?.id && p.id !== g2?.id && p.id !== g3?.id && p.id !== g4?.id);
  };

  // ========== واجهة الجوال ==========
  if (isMobile) {
    const g1 = sel || rootPerson;
    const g2 = persons.find(p => p.id === g1?.father_id);
    const g3 = persons.find(p => p.id === g2?.father_id);
    const g4 = persons.find(p => p.id === g3?.father_id);

    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0C1828] px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/30 via-[#0C1828] to-[#0C1828] opacity-90 pointer-events-none"></div>
        {[...Array(20)].map((_, i) => (<div key={i} className="absolute rounded-full bg-amber-500/20" style={{ width: Math.random()*3+1+'px', height: Math.random()*3+1+'px', top: Math.random()*100+'%', left: Math.random()*100+'%', animation: `pulse ${Math.random()*3+2}s ease-in-out infinite`, animationDelay: Math.random()*2+'s' }} />))}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center">
          <div style={{ color: '#D4AF37', fontSize: 18, fontWeight: 900, letterSpacing: 8 }}>⚔️ سُلَيْل</div>
        </div>

        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-[360px]">
          <input type="text" placeholder="🔍 ابحث عن اسم..." value={q} onChange={e => search(e.target.value)}
            className="w-full px-5 py-3 bg-[#12243A]/95 border-2 border-[#D4AF3740] rounded-2xl text-right text-sm outline-none text-white placeholder:text-[#8A95A4]" />
          {qr.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-[#12243A]/98 border border-[#D4AF3730] rounded-2xl shadow-2xl overflow-hidden z-30 max-h-[40vh] overflow-y-auto">
              {qr.map(p => (<button key={p.id} onClick={() => { setQ(''); setQr([]); setSel(p); }} className="w-full text-right px-4 py-3 text-sm hover:bg-[#D4AF3715] border-b border-[#D4AF3710] text-white flex items-center gap-3"><span className="text-lg">{icon(p)}</span><span>{getFullThreeNames(persons, p)}</span></button>))}
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center justify-between h-full py-24 z-10 w-full max-w-xs">
          <GlowingSeal person={g4} title="جد الجد" isActive={true} onClick={setSel} hasRelatives={checkRelatives(g4?.id)} onRelativesClick={setShowRelatives} />
          {g4 && <div className="w-0.5 flex-grow bg-gradient-to-b from-amber-500 to-amber-500/40 shadow-[0_0_10px_#f59e0b]"></div>}
          <GlowingSeal person={g3} title="الجد الأكبر" isActive={true} onClick={setSel} hasRelatives={checkRelatives(g3?.id)} onRelativesClick={setShowRelatives} />
          {g3 && <div className="w-0.5 flex-grow bg-gradient-to-b from-amber-500/40 to-amber-500/20 shadow-[0_0_8px_#f59e0b]"></div>}
          <GlowingSeal person={g2} title="الوالد" isActive={false} onClick={setSel} hasRelatives={checkRelatives(g2?.id)} onRelativesClick={setShowRelatives} />
          {g2 && <div className="w-0.5 flex-grow bg-gradient-to-b from-amber-500/20 to-transparent"></div>}
          <GlowingSeal person={g1} title="الاسم النشط" isActive={false} onClick={setSel} hasRelatives={checkRelatives(g1?.id)} onRelativesClick={setShowRelatives} />
        </div>

        {showRelatives && <RelativesPopup person={showRelatives} allPersons={persons} onClose={() => setShowRelatives(null)} onNodeClick={(p) => { setShowRelatives(null); setSel(p); }} />}

        {sel && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4" onClick={() => setSel(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-[#12243A] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp border border-[#D4AF3740] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#B49450] px-6 py-5 text-center">
                <button onClick={() => setSel(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white text-sm">✕</button>
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-lg">{icon(sel)}</div>
                <h3 className="text-[#0A1628] font-bold text-xl">{sel.display_name || sel.full_name}</h3>
              </div>
              <div className="p-5 text-center space-y-4">
                <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em]">⭐ {sel.public_id || 'BR-000'} ⭐</p>
                <div className="flex justify-center gap-4 text-xs text-[#B0C0D0]"><span>{sel.status || 'حي أطال الله بعمره'}</span>{sel.birth_year && <span>• ~ {age(sel.birth_year)} سنة</span>}</div>
                <div className="space-y-3 text-xs bg-[#1A3055] rounded-2xl p-4">
                  <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الميلاد</span><span className="text-white font-bold">{sel.birth_year || 'غير مسجل'}</span></div>
                  <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">العمر</span><span className="text-white font-bold">{age(sel.birth_year) ? `~ ${age(sel.birth_year)} سنة` : 'غير مسجل'}</span></div>
                  <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الأب</span><span className="text-white font-bold">{getFather(persons, sel)}</span></div>
                  <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الأبناء</span><span className="text-white font-bold text-left max-w-[60%]">{getRelatives(persons, null, sel.id)}</span></div>
                  <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الإخوة</span><span className="text-white font-bold text-left max-w-[60%]">{getRelatives(persons, sel, sel.father_id)}</span></div>
                  <div className="flex justify-between pb-2"><span className="text-[#8A95A4]">الأعمام</span><span className="text-white font-bold text-left max-w-[60%]">{getUncles(persons, sel)}</span></div>
                </div>
                <div className="bg-[#1A3055] rounded-2xl p-4 border border-[#D4AF3715]"><p className="text-[10px] text-[#D4AF37] leading-relaxed font-heading text-center">📜 {getLineage(persons, sel)}</p></div>
                <div className="flex justify-center mt-2"><div style={{ width: 85, height: 85, borderRadius: '50%', border: '2.5px solid #D4AF3750', background: 'linear-gradient(135deg, #D4AF3710, #D4AF3705)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: '#D4AF37', lineHeight: 1.5, transform: 'rotate(-5deg)', boxShadow: '0 0 20px rgba(212,175,55,0.15)', letterSpacing: 0.5 }}><span>عشيرة</span><span style={{ fontSize: 10, color: '#D4AF37' }}>العليان</span><span>قبيلة</span><span style={{ fontSize: 10, color: '#D4AF37' }}>بني خالد</span></div></div>
                {isAdmin && (<div className="flex gap-2 mt-4 justify-center flex-wrap">{['➕ ابن', '👬 أخ', '👆 أب', '✏️ تعديل', '🗑️ حذف'].map((l, i) => (<button key={i} className="text-white px-4 py-2 rounded-full text-[11px] font-bold shadow-lg" style={{ background: ['#4CAF50','#FF9800','#9C27B0','#2196F3','#E53935'][i] }}>{l}</button>))}</div>)}
                <p className="text-center text-[8px] text-[#8A95A4] mt-3">⚠️ هذه الهوية خاصة بأفراد الفخذ وليست هوية رسمية</p>
              </div>
            </div>
          </div>
        )}
        <style jsx>{`@keyframes pulse{0%,100%{opacity:0.2}50%{opacity:0.7}}@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slideUp{animation:slideUp .4s cubic-bezier(.16,1,.3,1)}`}</style>
      </div>
    );
  }

  // ========== واجهة الكمبيوتر (Canvas) ==========
  return (
    <div ref={cr} className="relative"
      style={{ minHeight: '100vh', height: '100vh', background: 'linear-gradient(180deg, #0C1828 0%, #12243A 40%, #0C1828 100%)', position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onWheel={handleWheel}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-center">
        <div style={{ color: '#D4AF37', fontSize: 18, fontWeight: 900, letterSpacing: 8, textShadow: '0 0 20px rgba(212,175,55,0.5)' }}>⚔️ سُلَيْل</div>
        <div style={{ color: '#B4945080', fontSize: 8, letterSpacing: 4, marginTop: 2 }}>الْمَنْصَةُ الرَّقَمِيَّةُ لِلْأَنْسَابِ</div>
      </div>
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 w-[90%] max-w-[360px]">
        <button onClick={() => setShowStats(true)} className="bg-[#12243A]/90 border border-[#D4AF3740] text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1A3055] transition shadow-lg whitespace-nowrap">📊</button>
        <input type="text" placeholder="🔍 ابحث عن اسم..." value={q} onChange={e => search(e.target.value)}
          className="flex-1 px-5 py-3.5 bg-[#12243A]/95 backdrop-blur-xl border-2 border-[#D4AF3740] rounded-2xl text-right text-sm outline-none text-white placeholder:text-[#8A95A4] shadow-2xl focus:border-[#D4AF37] transition-all" />
        {qr.length > 0 && (
          <div className="absolute top-full mt-3 left-0 right-0 bg-[#12243A]/98 backdrop-blur-2xl border border-[#D4AF3730] rounded-2xl shadow-2xl overflow-hidden z-30 max-h-[50vh] overflow-y-auto">
            {qr.map(p => (<button key={p.id} onClick={() => go(p)} className="w-full text-right px-5 py-3.5 text-sm hover:bg-[#D4AF3715] transition border-b border-[#D4AF3710] last:border-0 text-white flex items-center gap-3"><span className="text-lg">{icon(p)}</span><span>{getFullThreeNames(persons, p)}</span></button>))}
          </div>
        )}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-[#12243A]/90 backdrop-blur-xl rounded-2xl px-4 py-3 border border-[#D4AF3740] shadow-2xl">
        <button onClick={() => setScale(s => Math.min(2.5, s + 0.15))} className="w-12 h-12 bg-[#1A3055] rounded-xl shadow-lg text-[#D4AF37] font-bold text-xl border border-[#D4AF3740]">+</button>
        <button onClick={() => setScale(s => Math.max(0.3, s - 0.15))} className="w-12 h-12 bg-[#1A3055] rounded-xl shadow-lg text-[#D4AF37] font-bold text-xl border border-[#D4AF3740]">−</button>
        <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="w-12 h-12 bg-[#1A3055] rounded-xl shadow-lg text-[#D4AF37] text-xs font-bold border border-[#D4AF3740]">↺</button>
        <button onClick={() => window.history.back()} className="w-12 h-12 bg-[#1A3055] rounded-xl shadow-lg text-[#D4AF37] text-lg border border-[#D4AF3740]">←</button>
      </div>
      <canvas ref={cv} onClick={handleCanvasClick}
        style={{ position: 'absolute', top: 0, left: 0, transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: 'top left', transition: dragging ? 'none' : 'transform 0.3s ease' }} />
      {showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => { setShowStats(false); setShowAddRoot(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#12243A] rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slideUp border border-[#D4AF3740]" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B49450] px-6 py-4 text-center"><button onClick={() => setShowStats(false)} className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white text-sm">✕</button><h3 className="text-[#0A1628] font-bold text-lg">📊 إحصائيات الفرع</h3></div>
            <div className="p-6 space-y-5">
              {rootPerson && (
                <div className="bg-[#1A3055] rounded-2xl p-4 text-center border border-[#D4AF3720]">
                  <p className="text-[#8A95A4] text-xs mb-1">الجذر الرئيسي</p><p className="text-white font-bold text-lg">{rootPerson.display_name || rootPerson.full_name}</p>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div><p className="text-[#D4AF37] font-bold">{1 + countDescendants(persons, rootPerson)}</p><p className="text-[#8A95A4] text-[9px]">إجمالي</p></div>
                    <div><p className="text-[#4CAF50] font-bold">{countStatus(persons, rootPerson, 'حي')}</p><p className="text-[#8A95A4] text-[9px]">أحياء</p></div>
                    <div><p className="text-[#B0C0D0] font-bold">{countStatus(persons, rootPerson, 'انتقل')}</p><p className="text-[#8A95A4] text-[9px]">متوفون</p></div>
                    <div><p className="text-[#E53935] font-bold">{countStatus(persons, rootPerson, 'شهيد')}</p><p className="text-[#8A95A4] text-[9px]">شهداء</p></div>
                  </div>
                  {isAdmin && (<div className="mt-3"><textarea value={branchStory} onChange={e => setBranchStory(e.target.value)} placeholder="نبذة عن الفرع الرئيسي..." rows={3} className="w-full px-4 py-2 bg-[#0A1628] border border-[#D4AF3720] rounded-xl text-right text-xs text-white placeholder:text-[#8A95A4] resize-none" /><button onClick={saveStory} className="bg-[#D4AF37] text-[#0A1628] px-4 py-2 rounded-xl text-xs font-bold mt-2">💾 حفظ</button>{storySaved && <span className="text-[#4CAF50] text-xs mr-2">✅ تم الحفظ</span>}</div>)}
                </div>
              )}
              <div>
                <p className="text-[#D4AF37] text-xs font-bold mb-3">🌿 فروع داخل الشجرة</p>
                {subRoots.map(sr => { const p = getPersonById(sr.person_id); if (!p) return null; return (
                  <div key={sr.id} className="bg-[#1A3055] rounded-2xl p-4 mb-3 text-center border border-[#D4AF3720]">
                    <p className="text-white font-bold text-sm">{sr.label || p.display_name || p.full_name}</p>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <div><p className="text-[#D4AF37] font-bold">{1 + countDescendants(persons, p)}</p><p className="text-[#8A95A4] text-[9px]">إجمالي</p></div>
                      <div><p className="text-[#4CAF50] font-bold">{countStatus(persons, p, 'حي')}</p><p className="text-[#8A95A4] text-[9px]">أحياء</p></div>
                      <div><p className="text-[#B0C0D0] font-bold">{countStatus(persons, p, 'انتقل')}</p><p className="text-[#8A95A4] text-[9px]">متوفون</p></div>
                      <div><p className="text-[#E53935] font-bold">{countStatus(persons, p, 'شهيد')}</p><p className="text-[#8A95A4] text-[9px]">شهداء</p></div>
                    </div>
                    {isAdmin && (<div className="mt-2">{editingRootId === sr.id ? (<div><input type="text" value={editingRootLabel} onChange={e => setEditingRootLabel(e.target.value)} placeholder="اسم الفرع..." className="w-full px-4 py-2 bg-[#0A1628] border border-[#D4AF3720] rounded-xl text-right text-xs text-white mb-2" /><textarea value={editingRootStory} onChange={e => setEditingRootStory(e.target.value)} rows={2} className="w-full px-4 py-2 bg-[#0A1628] border border-[#D4AF3720] rounded-xl text-right text-xs text-white resize-none" /><div className="flex gap-2 justify-center mt-2"><button onClick={() => saveSubRootStory(sr.id, editingRootStory, editingRootLabel)} className="bg-[#D4AF37] text-[#0A1628] px-3 py-1 rounded-lg text-xs font-bold">💾 حفظ</button><button onClick={() => setEditingRootId(null)} className="bg-[#1A3055] text-white px-3 py-1 rounded-lg text-xs border border-[#D4AF3720]">إلغاء</button></div></div>) : (<div>{sr.story && <p className="text-white text-xs mb-2 whitespace-pre-wrap">{sr.story}</p>}<button onClick={() => { setEditingRootId(sr.id); setEditingRootStory(sr.story || ''); setEditingRootLabel(sr.label || ''); }} className="text-[#D4AF37] text-xs">✏️ تعديل</button></div>)}</div>)}
                  </div>
                );})}
                {isAdmin && (<div className="text-center mt-3">{!showAddRoot ? (<button onClick={() => setShowAddRoot(true)} className="bg-[#D4AF37] text-[#0A1628] px-4 py-2 rounded-xl text-xs font-bold">➕ إضافة جذر فرعي</button>) : (<div className="bg-[#1A3055] rounded-2xl p-4 border border-[#D4AF3720]"><input type="text" placeholder="🔍 ابحث عن الشخص..." value={rootSearchQ} onChange={e => searchRoots(e.target.value)} className="w-full px-4 py-2 bg-[#0A1628] border border-[#D4AF3740] rounded-xl text-right text-xs text-white mb-2" />{rootSearchResults.map(p => (<button key={p.id} onClick={() => addSubRoot(p.id)} className="w-full text-right px-4 py-2 text-xs text-white hover:bg-[#D4AF3715] rounded-lg">{getFullThreeNames(persons, p)}</button>))}<button onClick={() => { setShowAddRoot(false); setRootSearchQ(''); }} className="text-[#8A95A4] text-xs mt-2">إلغاء</button></div>)}</div>)}
              </div>
            </div>
          </div>
        </div>
      )}
      {sel && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4" onClick={() => setSel(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#12243A] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp border border-[#D4AF3740] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B49450] px-6 py-5 text-center"><button onClick={() => setSel(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white text-sm">✕</button><div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-lg">{icon(sel)}</div><h3 className="text-[#0A1628] font-bold text-xl">{sel.display_name || sel.full_name}</h3></div>
            <div className="p-5 text-center space-y-4">
              <p className="text-[#D4AF37] text-[10px] font-bold tracking-[0.3em]">⭐ {sel.public_id || 'BR-000'} ⭐</p>
              <div className="flex justify-center gap-4 text-xs text-[#B0C0D0]"><span>{sel.status || 'حي أطال الله بعمره'}</span>{sel.birth_year && <span>• ~ {age(sel.birth_year)} سنة</span>}</div>
              <div className="space-y-3 text-xs bg-[#1A3055] rounded-2xl p-4">
                <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الميلاد</span><span className="text-white font-bold">{sel.birth_year || 'غير مسجل'}</span></div>
                <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">العمر</span><span className="text-white font-bold">{age(sel.birth_year) ? `~ ${age(sel.birth_year)} سنة` : 'غير مسجل'}</span></div>
                <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الأب</span><span className="text-white font-bold">{getFather(persons, sel)}</span></div>
                <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الأبناء</span><span className="text-white font-bold text-left max-w-[60%]">{getRelatives(persons, null, sel.id)}</span></div>
                <div className="flex justify-between border-b border-[#D4AF3715] pb-2"><span className="text-[#8A95A4]">الإخوة</span><span className="text-white font-bold text-left max-w-[60%]">{getRelatives(persons, sel, sel.father_id)}</span></div>
                <div className="flex justify-between pb-2"><span className="text-[#8A95A4]">الأعمام</span><span className="text-white font-bold text-left max-w-[60%]">{getUncles(persons, sel)}</span></div>
              </div>
              <div className="bg-[#1A3055] rounded-2xl p-4 border border-[#D4AF3715]"><p className="text-[10px] text-[#D4AF37] leading-relaxed font-heading text-center">📜 {getLineage(persons, sel)}</p></div>
              <div className="flex justify-center mt-2"><div style={{ width: 85, height: 85, borderRadius: '50%', border: '2.5px solid #D4AF3750', background: 'linear-gradient(135deg, #D4AF3710, #D4AF3705)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: '#D4AF37', lineHeight: 1.5, transform: 'rotate(-5deg)', boxShadow: '0 0 20px rgba(212,175,55,0.15)', letterSpacing: 0.5 }}><span>عشيرة</span><span style={{ fontSize: 10, color: '#D4AF37' }}>العليان</span><span>قبيلة</span><span style={{ fontSize: 10, color: '#D4AF37' }}>بني خالد</span></div></div>
              {isAdmin && (<div className="flex gap-2 mt-4 justify-center flex-wrap">{['➕ ابن', '👬 أخ', '👆 أب', '✏️ تعديل', '🗑️ حذف'].map((l, i) => (<button key={i} onClick={() => { setSel(null); if (i===3) onEdit(sel); else if (i===4) onDelete(sel.id); else onAdd(['son','brother','father'][i], sel); }} className="text-white px-4 py-2 rounded-full text-[11px] font-bold shadow-lg" style={{ background: ['#4CAF50','#FF9800','#9C27B0','#2196F3','#E53935'][i] }}>{l}</button>))}</div>)}
              <p className="text-center text-[8px] text-[#8A95A4] mt-3">⚠️ هذه الهوية خاصة بأفراد الفخذ وليست هوية رسمية</p>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`@keyframes slideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slideUp{animation:slideUp .4s cubic-bezier(.16,1,.3,1)}`}</style>
    </div>
  );
}