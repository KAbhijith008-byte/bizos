// ═══ [01] IMPORTS ═══
import {
  StrictMode, useEffect, useState, useMemo, useCallback, useRef,
  createContext, useContext, memo, type ReactNode, type CSSProperties,
} from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate, useParams,
} from "react-router-dom";
import {
  motion, AnimatePresence, useReducedMotion, useMotionValue, animate,
} from "framer-motion";
import { initializeApp } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, type User,
} from "firebase/auth";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Home as HomeIcon, Inbox as InboxIcon, Users, IndianRupee, CheckSquare,
  Radio, Leaf, ShieldCheck, Settings as SettingsIcon, Bell, Search,
  Sparkles, ChevronRight, AlertTriangle, Check, X, Edit3, UserPlus,
  RefreshCw, ArrowRight, ArrowLeft, Filter, Zap, Clock, FileText, Building2,
  Download, Share2, Loader2, Table2, BarChart3, Image as ImageIcon,
  ZoomIn, ZoomOut, RotateCw, Flag, Layers,
  Receipt, Calendar, Wallet, Landmark, FileSpreadsheet, Truck,
  ClipboardList, Camera, MessageCircle, type LucideIcon,
} from "lucide-react";
import "./index.css";

// ═══ [02] TOKENS ═══
export const T = {
  canvas: "#F6F3EC",
  ink: "#101828",
  primary: "#17706A",
  accent: "#F2A33A",
  surface: "#FFFFFF",
  muted: "#667085",
  border: "rgba(16,24,40,0.08)",
  borderStrong: "rgba(16,24,40,0.15)",
  good: "#12B76A",
  watch: "#B45309",
  critical: "#F04438",
  primarySoft: "rgba(23,112,106,0.08)",
  goodSoft: "#E9F7EF",
  watchSoft: "#FBEEE0",
  criticalSoft: "#FDECEC",
  telegram: "#229ED9",
  telegramDark: "#17212B",
  telegramBubble: "#182533",
  telegramOut: "#2B5278",
} as const;

export const CHART = {
  grid: "#EDE7DA",
  axis: "#6B7280",
  series1: T.primary,
  series2: T.accent,
  series3: T.good,
  series4: "#B45309",
  series5: "#B42318",
  series6: "#4B5563",
} as const;

// ═══ [03] FORMATTERS ═══
export const fmtINR = (n: number) => {
  const s = Math.abs(Math.round(n)).toString();
  if (s.length <= 3) return "₹" + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (n < 0 ? "-₹" : "₹") + rest + "," + last3;
};
export const fmtShort = (n: number) => {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + " L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
};
export const daysAgo = (d: number) =>
  d < 1 ? "today" : d < 30 ? `${d}d` : `${Math.floor(d / 30)}mo`;
export const relTime = (ms: number) => {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

// ═══ [04] DEMO MODE ═══
const DEMO_KEY = "bizos_demo_mode";
export const isDemoMode = () => localStorage.getItem(DEMO_KEY) === "1";
export const enableDemo = () => localStorage.setItem(DEMO_KEY, "1");
export const disableDemo = () => localStorage.removeItem(DEMO_KEY);

// ═══ [05] DEMO DATA ═══
export const DEMO_USER = {
  id: "demo-user", email: "rajesh@abccomponents.in",
  business_name: "ABC Components Pvt Ltd", gstin: "27AABCA1234F1Z5",
  industry: "manufacturing", city: "Mumbai", onboarding_completed: true,
};

export const DEMO_ENTITIES = [
  { id: "c1", type: "customer", name: "Sharma Traders", data: { tier: "top5", city: "Mumbai", lifetime_value: 2100000, phone: "+91 98765 43210", email: "accounts@sharmatraders.in" } },
  { id: "c2", type: "customer", name: "Zenith Technologies LLP", data: { tier: "top5", city: "Bengaluru", lifetime_value: 1750000 } },
  { id: "c3", type: "customer", name: "Patel Precision Works", data: { tier: "top5", city: "Ahmedabad", lifetime_value: 1480000 } },
  { id: "c4", type: "customer", name: "ABC Enterprises Pvt Ltd", data: { tier: "top5", city: "Mumbai", lifetime_value: 1120000 } },
  { id: "c5", type: "customer", name: "XYZ Engineering Works", data: { tier: "top5", city: "Pune", lifetime_value: 950000 } },
  { id: "i1", type: "invoice", name: "INV-104", data: { customer_name: "Sharma Traders", total: 420000, gst: 64068, status: "overdue", days_overdue: 35, due_date: "2026-09-05", issued_date: "2026-08-06", top_customer: true, confidence: 0.94, reminder_sent_hours_ago: 2 } },
  { id: "i2", type: "invoice", name: "INV-105", data: { customer_name: "Zenith Technologies LLP", total: 285000, status: "overdue", days_overdue: 28, due_date: "2026-09-12", confidence: 0.91 } },
  { id: "i3", type: "invoice", name: "INV-106", data: { customer_name: "Patel Precision Works", total: 178000, status: "overdue", days_overdue: 22, due_date: "2026-09-18", confidence: 0.88 } },
  { id: "i4", type: "invoice", name: "INV-107", data: { customer_name: "ABC Enterprises Pvt Ltd", total: 245000, status: "overdue", days_overdue: 18, due_date: "2026-09-22", confidence: 0.72 } },
  { id: "i5", type: "invoice", name: "INV-108", data: { customer_name: "XYZ Engineering Works", total: 132000, status: "overdue", days_overdue: 15, due_date: "2026-09-25", confidence: 0.95 } },
  { id: "i6", type: "invoice", name: "INV-201", data: { customer_name: "Sharma Traders", total: 320000, status: "paid", paid_date: "2026-08-28", confidence: 0.98 } },
  { id: "i7", type: "invoice", name: "INV-202", data: { customer_name: "Zenith Technologies LLP", total: 285000, status: "paid", paid_date: "2026-09-04", confidence: 0.97 } },
  { id: "i8", type: "invoice", name: "INV-203", data: { customer_name: "Patel Precision Works", total: 178000, status: "paid", paid_date: "2026-09-10", confidence: 0.96 } },
  { id: "t1", type: "task", name: "Follow up with Sharma Traders on ₹4.2L overdue", data: { status: "open", owner: "Ravi", priority: "high", due_date: "2026-10-11", created_by: "agent", age_hours: 52 } },
  { id: "t2", type: "task", name: "Send final reminder to Zenith Technologies", data: { status: "open", owner: "Ravi", priority: "high", due_date: "2026-10-12", created_by: "agent", age_hours: 30 } },
  { id: "t3", type: "task", name: "Verify GSTR-3B filing data", data: { status: "in_progress", owner: "Meera", priority: "high", due_date: "2026-10-13", age_hours: 22 } },
  { id: "t4", type: "task", name: "Negotiate with Bharat Steel Suppliers", data: { status: "open", owner: "Ankit", priority: "medium", due_date: "2026-10-15", age_hours: 8 } },
  { id: "t5", type: "task", name: "Approve purchase order", data: { status: "open", owner: "Ankit", priority: "high", due_date: "2026-10-11", age_hours: 4 } },
  { id: "t6", type: "task", name: "Schedule demo with Patel Precision", data: { status: "open", owner: "Priya", priority: "low", due_date: "2026-10-18", age_hours: 2 } },
  { id: "t7", type: "task", name: "Reconcile bank statement", data: { status: "in_progress", owner: "Ravi", priority: "low", due_date: "2026-10-14", age_hours: 20 } },
  { id: "t8", type: "task", name: "Update DPDP consent ledger", data: { status: "open", owner: "Meera", priority: "medium", due_date: "2026-10-16", age_hours: 12 } },
  { id: "v1", type: "vendor", name: "Bharat Steel Suppliers Pvt Ltd", data: { category: "Raw Material - Steel", rating: 4.5 } },
  { id: "v2", type: "vendor", name: "Surya Packaging Industries", data: { category: "Packaging", rating: 4.2 } },
  { id: "v3", type: "vendor", name: "Delhivery Logistics", data: { category: "Logistics", rating: 4.0 } },
  { id: "e1", type: "esg_metric", name: "Governance Coverage", data: { category: "governance", value: 68, target: 90 } },
];

// ═══ [06] FIREBASE + API ═══
const fb = initializeApp({
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
});
const auth = getAuth(fb);
export const signInGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logOut = () => { disableDemo(); signOut(auth); window.location.href = "/login"; };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://10.0.2.43:8080",
});
api.interceptors.request.use(async (cfg) => {
  if (isDemoMode()) return cfg;
  const u = auth.currentUser;
  if (u) cfg.headers.Authorization = `Bearer ${await u.getIdToken()}`;
  return cfg;
});

// ═══ [07] TYPES ═══
export type Entity = { id: string; type: string; name: string | null; data?: Record<string, any> };
export type Me = {
  id: string; email: string | null; business_name: string | null;
  gstin: string | null; industry: string | null; city: string | null;
  onboarding_completed: boolean;
};
export type Severity = "critical" | "watch" | "good";

type ApprovalState = { approved: number; bump: () => void; reset: () => void };
const ApprovalCtx = createContext<ApprovalState>({ approved: 0, bump: () => {}, reset: () => {} });
export const useApprovals = () => useContext(ApprovalCtx);

// ═══ [08] HOOKS ═══
function useLive<T>(fetcher: () => Promise<T>, intervalMs = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);
  const load = useCallback(async () => {
    if (isDemoMode()) { setData(DEMO_ENTITIES as unknown as T); setLoading(false); return; }
    try { const res = await fetcherRef.current(); setData(res); setError(null); }
    catch (e: any) { setError(e?.message ?? "fetch failed"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); const id = setInterval(load, intervalMs); return () => clearInterval(id); }, [load, intervalMs]);
  return { data, loading, error, refresh: load };
}
const fetchEntities = async () => (await api.get<Entity[]>("/entities")).data;
export const useEntities = () => useLive(fetchEntities);

export function useLocalState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV] as const;
}

export function useHotkeys(map: Record<string, (e: KeyboardEvent) => void>, enabled = true) {
  const mapRef = useRef(map);
  useEffect(() => { mapRef.current = map; });
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      const fn = mapRef.current[e.key];
      if (fn) fn(e);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
}

export const useCalm = () => useReducedMotion() ?? false;
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), intervalMs); return () => clearInterval(id); }, [intervalMs]);
  return now;
}

// ═══ [09] PRIMITIVES ═══
export function Sparkline({ data, colour, width = 60, height = 20, fill = false }:
  { data: number[]; colour: string; width?: number; height?: number; fill?: boolean }) {
  const calm = useCalm();
  if (!data || data.length < 2) return <svg width={width} height={height} aria-hidden />;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / range) * height]);
  const points = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M 0 ${height} L ${points.split(" ").join(" L ")} L ${width} ${height} Z`;
  const gid = `spark-${colour.replace(/[^a-z0-9]/gi, "")}-${width}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }} aria-hidden>
      {fill && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colour} stopOpacity="0.22" />
            <stop offset="100%" stopColor={colour} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <motion.polyline points={points} fill="none" stroke={colour} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={calm ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }} />
    </svg>
  );
}

export function EsgGauge({ value, colour, size = 80, label }:
  { value: number; colour: string; size?: number; label?: string }) {
  const calm = useCalm();
  const r = size * 0.4, c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={label ?? `Coverage ${value} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F6F3EC" strokeWidth={size * 0.1} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={colour} strokeWidth={size * 0.1} strokeDasharray={c}
          initial={{ strokeDashoffset: calm ? c - (c * value) / 100 : c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: calm ? 0 : 0.9, ease: "easeOut" }}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold tabular-nums"
        style={{ color: colour, fontSize: size * 0.22 }}>
        <AnimatedNumber value={value} format={(n) => `${Math.round(n)}%`} />
      </div>
    </div>
  );
}

export function AnimatedNumber({ value, format = (n: number) => Math.round(n).toLocaleString("en-IN"),
  className, style, duration = 0.6 }:
  { value: number; format?: (n: number) => string; className?: string; style?: CSSProperties; duration?: number }) {
  const calm = useCalm();
  const mv = useMotionValue(value);
  const [text, setText] = useState(() => format(value));
  const fmtRef = useRef(format); fmtRef.current = format;
  useEffect(() => {
    if (calm) { setText(fmtRef.current(value)); return; }
    const controls = animate(mv, value, { duration, ease: "easeOut", onUpdate: (v) => setText(fmtRef.current(v)) });
    return () => controls.stop();
  }, [value, calm, duration]);
  return <span className={`tabular-nums ${className ?? ""}`} style={style}>{text}</span>;
}

export function SeverityPill({ severity, label }: { severity: Severity; label?: string }) {
  const bg = severity === "critical" ? T.criticalSoft : severity === "watch" ? T.watchSoft : T.goodSoft;
  const color = severity === "critical" ? T.critical : severity === "watch" ? T.watch : T.good;
  return (
    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium whitespace-nowrap"
      style={{ background: bg, color }}>{label ?? severity}</span>
  );
}

export function EvidenceField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: T.muted }}>{label}</div>
      <div className={`text-sm p-3 rounded-lg ${mono ? "font-mono text-xs" : ""}`}
        style={{ background: "#F6F3EC", color: T.ink, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

export function Chip({ icon, label, tone }: { icon: string; label: string; tone?: Severity }) {
  const color = tone === "critical" ? T.critical : tone === "watch" ? T.watch : tone === "good" ? T.good : T.muted;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5"
      style={{ borderColor: T.border, background: T.surface, color }}>
      <span aria-hidden>{icon}</span>{label}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono mx-0.5"
      style={{ borderColor: T.border, background: T.surface, color: T.muted }}>{children}</kbd>
  );
}

export function EmptyState({ icon = "✓", title, body, action }:
  { icon?: ReactNode; title: string; body?: string; action?: { label: string; onClick: () => void } }) {
  const calm = useCalm();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-16 text-center"
      style={{ borderColor: T.border, background: T.surface }}>
      <motion.div initial={calm ? false : { scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
        style={{ background: T.goodSoft, color: T.good }}>{icon}</motion.div>
      <div className="font-display text-xl mb-2">{title}</div>
      {body && <div className="text-sm mb-4" style={{ color: T.muted }}>{body}</div>}
      {action && (
        <button onClick={action.onClick}
          className="text-sm px-4 py-2 rounded-lg font-medium text-white"
          style={{ background: T.primary }}>{action.label}</button>
      )}
    </motion.div>
  );
}

// ═══ [10] CHART SYSTEM ═══
export function FreshnessChip({ at, staleAfterMs = 5 * 60_000 }: { at: number; staleAfterMs?: number }) {
  const now = useNow(30_000);
  const stale = now - at > staleAfterMs;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ background: stale ? T.watchSoft : "#F6F3EC", color: stale ? T.watch : T.muted }}>
      as of {relTime(at)}
    </span>
  );
}

export function ExportMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const items = [
    { icon: <ImageIcon size={12} />, label: "Download PNG", msg: `${name} exported as PNG` },
    { icon: <Table2 size={12} />, label: "Download CSV", msg: `${name} exported as CSV` },
    { icon: <Share2 size={12} />, label: "Copy share link", msg: "Share link copied" },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} aria-label={`Export ${name}`}
        className="w-6 h-6 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC] transition"
        style={{ borderColor: T.border, color: T.muted }}>
        <Download size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.12 }}
            className="absolute right-0 top-7 z-30 w-44 rounded-xl overflow-hidden glass-3">
            {items.map((it) => (
              <button key={it.label} onClick={() => { setOpen(false); toast.success(it.msg); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-white/60 transition"
                style={{ color: T.ink }}>
                {it.icon}{it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChartFrame({ title, subtitle, fresh, ranges, range, onRange,
  children, table, actions, empty, loading, minHeight = 0 }:
  { title: string; subtitle?: string; fresh?: number; ranges?: number[]; range?: number;
    onRange?: (r: number) => void; children?: ReactNode; table?: ReactNode;
    actions?: ReactNode; empty?: boolean; loading?: boolean; minHeight?: number }) {
  const [showTable, setShowTable] = useState(false);
  const calm = useCalm();
  return (
    <motion.div whileHover={calm ? undefined : { boxShadow: "0 8px 30px -12px rgba(16,24,40,0.15)" }}
      className="rounded-2xl border p-5 transition-all"
      style={{ borderColor: T.border, background: T.surface, minHeight }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="font-display text-base flex items-center gap-2 flex-wrap">
            {title}
            {fresh !== undefined && <FreshnessChip at={fresh} />}
          </div>
          {subtitle && <div className="text-xs mt-1" style={{ color: T.muted }}>{subtitle}</div>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {ranges && onRange && ranges.map((r) => (
            <motion.button key={r} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onRange(r)}
              className="text-xs px-2.5 py-1 rounded font-medium transition"
              style={{ background: range === r ? T.primary : "transparent",
                color: range === r ? "#fff" : T.muted,
                border: range === r ? "none" : `1px solid ${T.border}` }}>{r}d</motion.button>
          ))}
          {table && (
            <button onClick={() => setShowTable((v) => !v)} aria-pressed={showTable} aria-label="View as table"
              className="w-6 h-6 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC] transition"
              style={{ borderColor: showTable ? T.primary : T.border, color: showTable ? T.primary : T.muted }}>
              {showTable ? <BarChart3 size={11} /> : <Table2 size={11} />}
            </button>
          )}
          <ExportMenu name={title} />
          {actions}
        </div>
      </div>
      {loading ? (
        <div className="h-40 rounded-xl animate-pulse" style={{ background: "rgba(16,24,40,0.05)" }} />
      ) : empty ? (
        <EmptyState title="No data yet" body="Connect a source to populate this chart." />
      ) : showTable && table ? (
        <div className="overflow-x-auto">{table}</div>
      ) : children}
    </motion.div>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>
          {head.map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t" style={{ borderColor: T.border }}>
            {r.map((c, j) => (
              <td key={j} className={`px-2 py-2 ${j > 0 ? "tabular-nums" : ""}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ═══ [11] CHART LIBRARY ═══
export function CashProjectionChart({ onDrill }: { onDrill?: () => void }) {
  const [range, setRange] = useLocalState<number>("bizos.cash.range", 30);
  const calm = useCalm();
  const points = useMemo(() => {
    const out: { x: number; y: number; v: number; lo: number; hi: number }[] = [];
    let cash = 4200000;
    for (let i = 0; i < range; i++) {
      cash += Math.sin(i / 10) * 180000 + (i < 10 ? 120000 : 40000);
      const v = Math.round(cash);
      out.push({ x: (i / (range - 1)) * 100, y: 0, v, lo: Math.round(v * 0.94), hi: Math.round(v * 1.06) });
    }
    const max = Math.max(...out.map((p) => p.hi));
    const min = Math.min(...out.map((p) => p.lo));
    const r = max - min || 1;
    out.forEach((p) => { p.y = 100 - ((p.v - min) / r) * 100; });
    return out;
  }, [range]);
  const yMin = Math.min(...points.map((p) => p.lo));
  const yMax = Math.max(...points.map((p) => p.hi));
  const yRange = yMax - yMin || 1;
  const normY = (v: number) => 100 - ((v - yMin) / yRange) * 100;
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${normY(p.v)}`).join(" ");
  const upperPts = points.map((p) => `${p.x} ${normY(p.hi)}`);
  const lowerPts = [...points].reverse().map((p) => `${p.x} ${normY(p.lo)}`);
  const bandPath = `M ${upperPts.join(" L ")} L ${lowerPts.join(" L ")} Z`;
  const table = (
    <DataTable head={["Day", "Projected", "Low", "High"]}
      rows={points.filter((_, i) => i % Math.max(1, Math.floor(range / 8)) === 0)
        .map((p, i) => [`+${i * Math.max(1, Math.floor(range / 8))}d`, fmtINR(p.v), fmtINR(p.lo), fmtINR(p.hi)])} />
  );
  return (
    <ChartFrame title="Cash Projection" subtitle="Confidence band · updated 2 min ago"
      fresh={Date.now() - 120_000} ranges={[30, 60, 90]} range={range} onRange={setRange} table={table}>
      <div className="relative cursor-pointer" style={{ height: 220 }} onClick={onDrill}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}
          role="img" aria-label={`Cash projection over ${range} days, runway 47 days`}>
          <defs>
            <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.primary} stopOpacity="0.22" />
              <stop offset="100%" stopColor={T.primary} stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={CHART.grid} strokeWidth="0.15" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" y1="80" x2="100" y2="80" stroke={T.critical} strokeDasharray="2 2" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          <path d={bandPath} fill="url(#bandFill)" />
          <motion.path d={linePath} fill="none" stroke={T.primary} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
            initial={calm ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: calm ? 0 : 1.2, ease: "easeOut" }} />
        </svg>
        <div className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded font-mono"
          style={{ background: T.goodSoft, color: T.good }}>
          <AnimatedNumber value={4230000} format={fmtShort} /> today
        </div>
      </div>
      <div className="flex justify-between text-[10px] mt-2" style={{ color: T.muted }}>
        <span>Today</span><span>+{Math.round(range / 3)}d</span>
        <span>+{Math.round((2 * range) / 3)}d</span><span>+{range}d</span>
      </div>
    </ChartFrame>
  );
}

export function AgeingBars({ onDrill }: { onDrill?: (bucket: string) => void }) {
  const buckets = [
    { name: "0–30d", amount: 620000, colour: T.good },
    { name: "31–60d", amount: 420000, colour: T.watch },
    { name: "61–90d", amount: 380000, colour: T.critical },
    { name: "90+d", amount: 210000, colour: T.critical },
  ];
  const max = Math.max(...buckets.map((b) => b.amount));
  const total = buckets.reduce((s, b) => s + b.amount, 0);
  const table = (
    <DataTable head={["Bucket", "Amount", "% of total"]}
      rows={buckets.map((b) => [b.name, fmtINR(b.amount), `${Math.round((b.amount / total) * 100)}%`])} />
  );
  return (
    <ChartFrame title="Receivables Ageing" subtitle="Click a bucket to filter invoices"
      fresh={Date.now() - 90_000} table={table}>
      <div className="space-y-3">
        {buckets.map((b, i) => (
          <motion.div key={b.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.01 }}
            className="cursor-pointer group" onClick={() => onDrill?.(b.name)}>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5" style={{ color: T.muted }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.colour }} />{b.name}
              </span>
              <span className="font-medium tabular-nums">{fmtINR(b.amount)}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F6F3EC" }}>
              <motion.div className="h-full rounded-full group-hover:opacity-80"
                initial={{ width: 0 }} animate={{ width: `${(b.amount / max) * 100}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.06 }}
                style={{ background: b.colour }} />
            </div>
          </motion.div>
        ))}
      </div>
    </ChartFrame>
  );
}

export const ApprovalVolumeBar = memo(function ApprovalVolumeBar({ onBarClick, days = 14 }:
  { onBarClick?: (daysAgo: number) => void; days?: number }) {
  const data = useMemo(() => Array.from({ length: days }, (_, i) => 3 + Math.floor(Math.abs(Math.sin(i / 2) * 8))), [days]);
  const max = Math.max(...data);
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-0.5 h-10" role="group" aria-label="Approvals per day, last 14 days">
      {data.map((v, i) => (
        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.02, duration: 0.3, ease: "easeOut" }}
          whileHover={{ scaleY: 1.15 }}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          onClick={() => onBarClick?.(days - i)}
          className="w-1.5 rounded-sm cursor-pointer"
          style={{ background: i === data.length - 1 ? T.primary : hovered === i ? T.primary : "rgba(23,112,106,0.35)", minHeight: 3 }}
          title={`${v} approvals · ${days - i}d ago`} />
      ))}
    </div>
  );
});

export const AgeHistogram = memo(function AgeHistogram({ onBrush, active }:
  { onBrush?: (bucket: string) => void; active?: string | null }) {
  const buckets = [
    { label: "<1d", v: 2, key: "<1d" }, { label: "1–3d", v: 5, key: "1-3d" },
    { label: "3–7d", v: 8, key: "3-7d" }, { label: "7–14d", v: 4, key: "7-14d" },
    { label: "14–30d", v: 3, key: "14-30d" }, { label: "30d+", v: 1, key: "30d+" },
  ];
  const max = Math.max(...buckets.map((b) => b.v));
  return (
    <div className="flex items-end gap-1 h-[60px]">
      {buckets.map((b) => (
        <motion.button key={b.label} whileHover={{ scaleY: 1.05 }}
          onClick={() => onBrush?.(b.key)}
          className="flex-1 flex flex-col items-center justify-end group"
          title={`${b.label}: ${b.v} items`} aria-pressed={active === b.key}>
          <div className="w-full rounded-t-sm transition-all group-hover:opacity-80"
            style={{ height: `${(b.v / max) * 100}%`, background: active === b.key ? T.accent : T.primary, minHeight: 4 }} />
          <div className="text-[8px] mt-1" style={{ color: active === b.key ? T.primary : T.muted }}>{b.label}</div>
        </motion.button>
      ))}
    </div>
  );
});

export const RiskMixDonut = memo(function RiskMixDonut({ critical, watch, good }:
  { critical: number; watch: number; good: number }) {
  const total = critical + watch + good || 1;
  const crit = (critical / total) * 100, wat = (watch / total) * 100;
  const r = 6, c = 2 * Math.PI * r;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: "rotate(-90deg)" }} role="img"
      aria-label={`Risk mix: ${critical} critical, ${watch} watch, ${good} good`}>
      <circle cx="8" cy="8" r={r} fill="none" stroke={T.goodSoft} strokeWidth="3" />
      <circle cx="8" cy="8" r={r} fill="none" stroke={T.watch} strokeWidth="3"
        strokeDasharray={`${(wat / 100) * c} ${c}`} strokeDashoffset={-(crit / 100) * c} />
      <circle cx="8" cy="8" r={r} fill="none" stroke={T.critical} strokeWidth="3"
        strokeDasharray={`${(crit / 100) * c} ${c}`} />
    </svg>
  );
});

export function ConfidenceBar({ value, label = "OCR confidence" }: { value: number; label?: string }) {
  const pct = Math.round(value * 100);
  const colour = pct >= 90 ? T.good : pct >= 75 ? T.watch : T.critical;
  const word = pct >= 90 ? "High" : pct >= 75 ? "Check" : "Low";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span style={{ color: T.muted }}>{label}</span>
        <span className="font-mono font-medium" style={{ color: colour }}>
          {word} · <AnimatedNumber value={pct} format={(n) => `${Math.round(n)}%`} />
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F6F3EC" }}>
        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }} style={{ background: colour }} />
      </div>
    </div>
  );
}

export function HealthTile({ label, state, sparkline, onClick }:
  { label: string; state: Severity; sparkline: number[]; onClick?: () => void }) {
  const colour = state === "good" ? T.good : state === "watch" ? T.watch : T.critical;
  const bg = state === "good" ? T.goodSoft : state === "watch" ? T.watchSoft : T.criticalSoft;
  return (
    <motion.div whileHover={{ y: -2, boxShadow: "0 8px 24px -12px rgba(16,24,40,0.15)" }}
      onClick={onClick}
      className="rounded-2xl border p-4 cursor-pointer transition-all"
      style={{ borderColor: T.border, background: T.surface }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
          style={{ background: bg, color: colour }}>{state}</span>
      </div>
      <Sparkline data={sparkline} colour={colour} width={80} height={24} fill />
    </motion.div>
  );
}

export function QueueProgress({ cleared, skipped, flagged, remaining, activeFilter, onSegment }:
  { cleared: number; skipped: number; flagged: number; remaining: number;
    activeFilter: string | null;
    onSegment: (key: "cleared" | "skipped" | "flagged" | "remaining") => void }) {
  const total = Math.max(1, cleared + skipped + flagged + remaining);
  const segs = [
    { key: "cleared" as const, label: "Cleared", value: cleared, colour: T.good },
    { key: "skipped" as const, label: "Skipped", value: skipped, colour: "#98A2B3" },
    { key: "flagged" as const, label: "Flagged", value: flagged, colour: T.watch },
    { key: "remaining" as const, label: "Remaining", value: remaining, colour: "#EDE7DA" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium tabular-nums">{cleared} of {total} cleared</div>
        {activeFilter && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
            style={{ background: T.primarySoft, color: T.primary }}>filter: {activeFilter}</span>
        )}
      </div>
      <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "#F6F3EC" }}>
        {segs.map((s) => s.value > 0 && (
          <motion.button key={s.key} layout initial={{ width: 0 }}
            animate={{ width: `${(s.value / total) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={() => onSegment(s.key)} title={`${s.label}: ${s.value}`}
            aria-label={`Filter by ${s.label}`} className="h-full transition-opacity hover:opacity-80"
            style={{ background: s.colour, opacity: activeFilter && activeFilter !== s.key ? 0.35 : 1 }} />
        ))}
      </div>
      <div className="flex gap-3 mt-2 text-[10px] flex-wrap" style={{ color: T.muted }}>
        {segs.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.colour }} />
            {s.label} · <span className="tabular-nums">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function FieldConfidence({ value, width = 44 }: { value: number; width?: number }) {
  const pct = Math.round(value * 100);
  const colour = pct >= 90 ? T.good : pct >= 75 ? T.watch : T.critical;
  const word = pct >= 90 ? "High" : pct >= 75 ? "Check" : "Low";
  return (
    <div className="flex items-center gap-2" title={`${word} · ${pct}%`}>
      <div className="rounded-sm overflow-hidden" style={{ width, height: 5, background: "#F6F3EC" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }}
          style={{ height: "100%", background: colour }} />
      </div>
      <span className="text-[9px] font-mono tabular-nums" style={{ color: colour }}>{pct}</span>
    </div>
  );
}

export function AmountHistogram({ values, active, onBrush }:
  { values: number[]; active: [number, number] | null; onBrush: (r: [number, number] | null) => void }) {
  const buckets = useMemo(() => {
    const edges = [0, 100_000, 200_000, 300_000, 500_000, 1_000_000, Infinity];
    const labels = ["<1L", "1–2L", "2–3L", "3–5L", "5–10L", "10L+"];
    return labels.map((label, i) => ({
      label, lo: edges[i], hi: edges[i + 1],
      v: values.filter((x) => x >= edges[i] && x < edges[i + 1]).length,
    }));
  }, [values]);
  const max = Math.max(1, ...buckets.map((b) => b.v));
  return (
    <div className="flex items-end gap-1.5 h-[110px]" role="group" aria-label="Invoice amount distribution">
      {buckets.map((b) => {
        const selected = active && active[0] === b.lo;
        const pct = (b.v / max) * 100;
        return (
          <button key={b.label} onClick={() => onBrush(selected ? null : [b.lo, b.hi])}
            className="flex-1 h-full flex flex-col items-center justify-end group"
            aria-pressed={!!selected} aria-label={`${b.label}: ${b.v} invoices`}>
            <div className="text-[10px] font-medium tabular-nums mb-1 transition-colors"
              style={{ color: selected ? T.primary : b.v > 0 ? T.ink : T.muted }}>
              {b.v}
            </div>
            <div className="w-full rounded-t transition-all group-hover:opacity-85"
              style={{
                height: `${Math.max(pct, b.v > 0 ? 6 : 2)}%`,
                background: selected ? T.accent : b.v > 0 ? T.primary : "#E7E2D5",
                minHeight: b.v > 0 ? 6 : 2,
              }} />
            <div className="text-[9px] mt-1.5 whitespace-nowrap transition-colors"
              style={{ color: selected ? T.primary : T.muted }}>
              {b.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function OcrAccuracyTrend() {
  const calm = useCalm();
  const data = useMemo(() => Array.from({ length: 30 }, (_, i) => 88 + Math.sin(i / 4) * 3 + (i > 20 ? 3 : 0)), []);
  const max = 100, min = 80, w = 400, h = 140;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / (max - min)) * h]);
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  return (
    <div className="pt-4 border-t" style={{ borderColor: T.border }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-display text-sm">OCR accuracy · last 30 days</div>
          <div className="text-[10px]" style={{ color: T.muted }}>Trust signal · higher is better</div>
        </div>
        <div className="text-xs font-mono tabular-nums" style={{ color: T.good }}>
          {data[data.length - 1].toFixed(1)}%
        </div>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxWidth: w, height: "auto" }}
        role="img" aria-label="OCR accuracy trend, last 30 days">
        {[0.25, 0.5, 0.75].map((y) => (
          <line key={y} x1="0" y1={h * y} x2={w} y2={h * y} stroke={CHART.grid} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={path} fill="none" stroke={T.primary} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          initial={calm ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: calm ? 0 : 0.9, ease: "easeOut" }} />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// [12] LANDING — v5
//  Designated sections:
//   1. HERO      — warm paper, dot grid, floating product cards
//   2. STRIP     — rolling marquee of capabilities
//   3. PROOF ★   — NEW "Every action, proven" section (evidence drawer mock)
//   4. WHY       — bento grid
//   5. CHAT      — WhatsApp live demo
//   6. HOW       — 3-step sequence
//   7. CTA       — closing
//   8. FOOTER
// ═══════════════════════════════════════════════════════════════════

/* WhatsApp brand colours — local to Landing */
const WA = {
  green: "#25D366",
  dark: "#0B141A",
  bubbleIn: "#202C33",
  bubbleOut: "#005C4B",
  text: "#E9EDEF",
  textMuted: "#8696A0",
  tick: "#53BDEB",
};

/* ───────── Floating product cards ───────── */
const HERO_CARDS = [
  {
    key: "overdue",
    body: (
      <div className="p-3.5 h-full flex flex-col">
        <div className="text-[10px] mb-1" style={{ color: T.muted }}>Overdue</div>
        <div className="text-2xl leading-none tabular-nums" style={{ color: T.ink, fontWeight: 700 }}>₹12.6L</div>
        <div className="text-[10px] mt-1 mb-3" style={{ color: T.critical }}>5 invoices</div>
        {[["Sharma Traders", "35d"], ["Zenith Tech", "28d"], ["Patel Precision", "22d"]].map(([n, d]) => (
          <div key={n} className="flex justify-between text-[10px] py-1.5 border-t"
            style={{ borderColor: T.border, color: T.ink }}>
            <span className="truncate pr-2">{n}</span>
            <span style={{ color: T.muted }}>{d}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "snap",
    body: (
      <div className="h-full flex flex-col" style={{ background: `linear-gradient(160deg, ${T.accent}, #F7C77A)` }}>
        <div className="flex-1 flex items-center justify-center">
          <Camera size={40} color={T.ink} strokeWidth={1.6} />
        </div>
        <div className="m-2 rounded-xl bg-white/90 px-3 py-2">
          <div className="text-[9px]" style={{ color: T.muted }}>Invoice read</div>
          <div className="flex justify-between text-[11px] font-semibold tabular-nums" style={{ color: T.ink }}>
            <span>INV-107</span><span>₹1,20,000</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "cash",
    body: (
      <div className="p-3.5 h-full flex flex-col">
        <div className="text-[10px]" style={{ color: T.muted }}>Cash flow · next 30d</div>
        <div className="text-xl mt-1 tabular-nums" style={{ color: T.ink, fontWeight: 700 }}>+₹3.4L</div>
        <svg viewBox="0 0 120 60" className="mt-auto w-full">
          <defs>
            <linearGradient id="cf" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={T.primary} stopOpacity="0.35" />
              <stop offset="1" stopColor={T.primary} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 48 L20 40 L40 44 L60 26 L80 30 L100 12 L120 8 L120 60 L0 60Z" fill="url(#cf)" />
          <path d="M0 48 L20 40 L40 44 L60 26 L80 30 L100 12 L120 8" fill="none"
            stroke={T.primary} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    key: "chat",
    featured: true,
    body: (
      <div className="h-full p-3.5 flex flex-col justify-between" style={{ background: WA.dark }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            style={{ background: WA.green }}>BD</div>
          <div className="text-[11px] text-white font-medium">BizOS Bot</div>
          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: WA.green }} />
        </div>
        <div className="space-y-1.5">
          <div className="ml-auto max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10px]"
            style={{ background: WA.bubbleOut, color: WA.text }}>who owes me money?</div>
          <div className="max-w-[92%] rounded-xl px-2.5 py-1.5 text-[10px]"
            style={{ background: WA.bubbleIn, color: WA.text }}>5 invoices · ₹12.6L. Want me to send reminders?</div>
        </div>
      </div>
    ),
  },
  {
    key: "gst",
    body: (
      <div className="p-3.5 h-full flex flex-col" style={{ background: T.ink }}>
        <div className="text-[10px] text-white/60">Compliance</div>
        <div className="text-lg text-white mt-1 leading-tight" style={{ fontWeight: 700 }}>GSTR-3B due in 3 days</div>
        <div className="mt-auto flex items-center gap-2 text-[10px]" style={{ color: T.accent }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.accent }} />
          Reminder set · 7:00 AM
        </div>
      </div>
    ),
  },
  {
    key: "tasks",
    body: (
      <div className="p-3.5 h-full">
        <div className="text-[10px] mb-2" style={{ color: T.muted }}>Open tasks · 8</div>
        {["Send GST data to CA", "Follow up Zenith", "Pay vendor"].map((t, i) => (
          <div key={t} className="flex items-center gap-2 text-[10px] py-1.5" style={{ color: T.ink }}>
            <span className="w-3 h-3 rounded border flex items-center justify-center"
              style={{ borderColor: T.primary, background: i === 0 ? T.primary : "transparent" }}>
              {i === 0 && <Check size={7} color="#fff" strokeWidth={3} />}
            </span>
            <span className={i === 0 ? "line-through opacity-50" : ""}>{t}</span>
          </div>
        ))}
      </div>
    ),
  },
];

function HeroCards({ calm }: { calm: boolean }) {
  const n = HERO_CARDS.length;
  const mid = (n - 1) / 2;
  return (
    <div className="relative mx-auto w-full overflow-hidden" style={{ perspective: 1400 }}>
      <div className="flex items-end justify-center gap-3 md:gap-4 px-4 min-w-[860px] md:min-w-0">
        {HERO_CARDS.map((c, i) => {
          const off = i - mid;
          const rotY = -off * 13;
          const lift = Math.abs(off) * 14;
          const featured = c.featured;
          return (
            <div key={c.key}
              style={{
                transform: `translateY(${lift}px) rotateY(${rotY}deg) scale(${featured ? 1.12 : 1 - Math.abs(off) * 0.04})`,
                transformStyle: "preserve-3d",
                zIndex: featured ? 10 : 5 - Math.round(Math.abs(off)),
              }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={calm ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -8, 0] }}
                transition={calm
                  ? { duration: 0.5 }
                  : {
                      opacity: { duration: 0.6, delay: 0.5 + i * 0.08 },
                      y: { duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                    }}
                whileHover={{ y: -14, scale: 1.04 }}
                className="w-[128px] h-[168px] md:w-[148px] md:h-[196px] rounded-2xl overflow-hidden"
                style={{
                  background: "#fff",
                  boxShadow: "0 24px 50px -18px rgba(5,40,38,0.45), 0 0 0 1px rgba(255,255,255,0.5)",
                }}>
                {c.body}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Scrolling strip ───────── */
type StripItem = { Icon: LucideIcon; label: string; tone: string };

const STRIP: StripItem[] = [
  { Icon: Receipt,          label: "GST invoices",      tone: "rgba(23,112,106,0.10)" },
  { Icon: Calendar,         label: "GSTR-1 & 3B",       tone: "rgba(242,163,58,0.18)" },
  { Icon: Wallet,           label: "Payment reminders", tone: "rgba(23,112,106,0.10)" },
  { Icon: Landmark,         label: "Cash-flow alerts",  tone: "rgba(23,112,106,0.10)" },
  { Icon: FileSpreadsheet,  label: "TDS dates",         tone: "rgba(242,163,58,0.18)" },
  { Icon: Truck,            label: "e-Way bills",       tone: "rgba(23,112,106,0.10)" },
  { Icon: ClipboardList,    label: "Task tracking",     tone: "rgba(23,112,106,0.10)" },
  { Icon: Users,            label: "Customer ledgers",  tone: "rgba(242,163,58,0.18)" },
];

function StripChip({ Icon, label, tone, calm }: StripItem & { calm: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ y: -4, boxShadow: "0 14px 30px -14px rgba(16,24,40,0.22)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="flex items-center gap-2.5 pl-2 pr-5 py-2 rounded-full cursor-pointer whitespace-nowrap"
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: "0 1px 2px rgba(16,24,40,0.03)",
      }}>
      <span className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: tone }}>
        <motion.span
          animate={hover && !calm ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center">
          <Icon size={15} strokeWidth={2.2} style={{ color: T.primary }} />
        </motion.span>
      </span>
      <span className="text-sm font-medium" style={{ color: T.ink }}>{label}</span>
    </motion.div>
  );
}

function Strip({ calm }: { calm: boolean }) {
  const items = [...STRIP, ...STRIP];
  const [paused, setPaused] = useState(false);
  return (
    <>
      <style>{`@keyframes bizos-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      <div
        className="relative overflow-hidden py-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        }}>
        <div
          className="flex gap-3 w-max pr-3"
          style={{
            animation: calm ? "none" : "bizos-marquee 46s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}>
          {items.map((item, i) => (
            <StripChip key={i} {...item} calm={calm} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ───────── Headline inline chip ───────── */
function HeadlineChip({ children, bg, color = "#fff" }: {
  children: ReactNode;
  bg: string;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center justify-center align-middle w-[0.95em] h-[0.95em] rounded-full mx-1 text-[0.5em] -translate-y-[0.06em]"
      style={{ background: bg, color }}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ★ PROOF SECTION — designated new section for the landing page
// Shows: hash, rule, approver chain + Verify button + real numbers
// This is the "Every action, proven" story that was missing.
// ═══════════════════════════════════════════════════════════════════
const PROOF_STATS = [
  { value: "1,247", label: "Actions logged", sub: "last 30 days" },
  { value: "100%",  label: "Verified",       sub: "zero mismatches" },
  { value: "<120ms", label: "Verify time",   sub: "median response" },
  { value: "8",     label: "Data sources",   sub: "bank · GST · Tally" },
];

function ProofSection({ calm }: { calm: boolean }) {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const doVerify = () => {
    if (verifying || verified) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 900);
  };

  return (
    <section id="proof" className="relative max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="grid md:grid-cols-2 gap-14 items-center">
        {/* Left: copy + stats */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs mb-6 font-medium" style={{ color: T.muted }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.primary }} />
            Proof, not promises
          </div>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-5">
            Every action,<br />cryptographically proven.
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8 max-w-md" style={{ color: T.muted }}>
            When BizOS sends a reminder, files a return, or approves an action — it writes the source, rule, and approver to a verifiable ledger. Anyone can check. No one can tamper.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 max-w-md">
            {PROOF_STATS.map((s) => (
              <div key={s.label}
                className="rounded-2xl border p-4"
                style={{ borderColor: T.border, background: T.surface }}>
                <div className="text-2xl tabular-nums mb-1" style={{ color: T.ink, fontWeight: 700 }}>
                  {s.value}
                </div>
                <div className="text-xs font-medium" style={{ color: T.ink }}>{s.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5"
              style={{ borderColor: T.border, background: T.surface, color: T.muted }}>
              <FileText size={11} /> Source
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5"
              style={{ borderColor: T.border, background: T.surface, color: T.muted }}>
              <ShieldCheck size={11} /> Rule
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5"
              style={{ borderColor: T.border, background: T.surface, color: T.muted }}>
              <Users size={11} /> Approver
            </span>
          </div>
        </div>

        {/* Right: evidence drawer mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-md w-full mx-auto md:ml-auto relative">
          <div className="absolute -inset-6 rounded-[40px] pointer-events-none"
            style={{ background: "rgba(23,112,106,0.10)", filter: "blur(50px)" }} />

          <div className="relative rounded-3xl p-6"
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              boxShadow: "0 25px 60px -20px rgba(16,24,40,0.25)",
            }}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b" style={{ borderColor: T.border }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: T.primarySoft }}>
                <FileText size={18} color={T.primary} strokeWidth={2.2} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold" style={{ color: T.ink }}>Evidence drawer</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: T.muted }}>INV-104 · Sharma Traders</div>
              </div>
              {verified && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: T.goodSoft }}>
                  <Check size={13} color={T.good} strokeWidth={3} />
                </motion.div>
              )}
            </div>

            {/* Rows */}
            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Source</div>
                <div className="text-xs p-2.5 rounded-lg font-mono"
                  style={{ background: "#F6F3EC", color: T.ink }}>
                  tally.sync · invoice 104 · due 2026-09-05
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Rule</div>
                <div className="text-xs p-2.5 rounded-lg"
                  style={{ background: "#F6F3EC", color: T.ink }}>
                  Overdue &gt; 30 days + top-5 customer → manager approval required
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Hash</div>
                <div className="text-[10px] p-2.5 rounded-lg font-mono break-all"
                  style={{ background: "#F6F3EC", color: T.muted }}>
                  8f4a2b1c9e7d3f6a5b8c2e1d4f7a9b3c5e8d1f4a7b2c5e8d1f4a7b2c5e8d1f4a
                </div>
              </div>
            </div>

            {/* Verify button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={doVerify}
              disabled={verifying || verified}
              className="w-full mt-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
              style={{
                background: verified ? T.goodSoft : T.primary,
                color: verified ? T.good : "#fff",
                cursor: verified ? "default" : "pointer",
              }}>
              {verifying ? <Loader2 size={14} className="animate-spin" />
                : verified ? <Check size={14} strokeWidth={3} />
                  : <ShieldCheck size={14} />}
              {verifying ? "Recomputing hash…" : verified ? "Verified · matches" : "Verify this action"}
            </motion.button>
            <div className="text-[10px] text-center mt-2" style={{ color: T.muted }}>
              Anyone with the link can verify — no login needed
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── Landing root ───────── */
function Landing() {
  const nav = useNavigate();
  const calm = useCalm();

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: T.canvas, color: T.ink }}>

      {/* ══════ SECTION 1 · HERO ══════ */}
      <section className="p-3 md:p-4">
        <div
          className="relative rounded-[28px] md:rounded-[36px] overflow-hidden"
          style={{ background: "linear-gradient(180deg, #FBF8F1 0%, #F6F3EC 55%, #EFEADC 100%)" }}>

          <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: "rgba(23,112,106,0.10)", filter: "blur(120px)" }} />
          <div className="absolute -top-20 right-[-10%] w-[520px] h-[520px] rounded-full pointer-events-none"
            style={{ background: "rgba(242,163,58,0.18)", filter: "blur(120px)" }} />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(rgba(16,24,40,0.10) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)",
              opacity: 0.5,
            }} />
          <div
            className="absolute left-0 right-0 bottom-0 h-40 pointer-events-none"
            style={{
              backgroundImage: "repeating-linear-gradient(180deg, rgba(16,24,40,0.05) 0 1px, transparent 1px 26px)",
              maskImage: "linear-gradient(180deg, transparent 0%, #000 100%)",
              WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 100%)",
            }} />

          <nav className="relative flex items-center justify-between px-5 md:px-10 py-5 md:py-6">
            <div className="font-display text-2xl md:text-3xl tracking-tight" style={{ color: T.ink }}>
              Biz<span style={{ color: T.primary }}>OS</span>
            </div>
            <div className="hidden md:flex items-center gap-9 text-sm" style={{ color: T.muted }}>
              <a href="#proof" className="hover:opacity-70 transition">Proof</a>
              <a href="#why" className="hover:opacity-70 transition">Why BizOS</a>
              <a href="#chat" className="hover:opacity-70 transition">See it live</a>
            </div>
            <button type="button" onClick={() => nav("/login")}
              className="text-sm px-5 py-2 rounded-full font-semibold transition hover:brightness-110"
              style={{ background: T.ink, color: "#fff" }}>
              Sign in
            </button>
          </nav>

          <div className="relative text-center px-6 pt-12 md:pt-20 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 text-xs rounded-full font-medium"
                style={{
                  background: "rgba(23,112,106,0.08)",
                  border: "1px solid rgba(23,112,106,0.18)",
                  color: T.primary,
                }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.primary }} />
                Built for Indian MSMEs
              </div>

              <h1 className="font-display text-5xl md:text-7xl leading-[1.04] mb-6" style={{ color: T.ink }}>
                Run your business<br />on <span style={{ color: T.primary }}>WhatsApp</span>
              </h1>

              <p className="text-base md:text-xl max-w-2xl mx-auto mb-9 leading-relaxed" style={{ color: T.muted }}>
                One operating system for compliance, invoices, cash flow, and customers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <motion.button type="button"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  onClick={() => nav("/login")}
                  className="pl-7 pr-2 py-2 rounded-full font-semibold flex items-center gap-4"
                  style={{
                    background: T.accent,
                    color: T.ink,
                    boxShadow: "0 14px 34px -12px rgba(242,163,58,0.65)",
                  }}>
                  Get started free
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                    style={{ background: T.ink }}>↗</span>
                </motion.button>
                <a href="#chat"
                  className="px-7 py-3.5 rounded-full text-sm font-medium border transition hover:bg-white"
                  style={{ borderColor: T.border, color: T.ink, background: T.surface }}>
                  See it live
                </a>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-xs" style={{ color: T.muted }}>
                {["Free for 3 users", "No credit card", "Setup in 2 minutes"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Check size={12} style={{ color: T.good }} strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative pt-14 md:pt-20 pb-10 md:pb-14">
            <HeroCards calm={calm} />
            <p className="text-center text-xs md:text-sm mt-10" style={{ color: T.muted }}>
              Free to start · No new app — just WhatsApp
            </p>
          </div>
        </div>
      </section>

      {/* ══════ SECTION 2 · STRIP ══════ */}
      <Strip calm={calm} />

      {/* ══════ SECTION 3 · PROOF ★ (designated new section) ══════ */}
      <ProofSection calm={calm} />

      {/* ══════ SECTION 4 · WHY ══════ */}
      <section id="why" className="relative max-w-6xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs mb-6 font-medium" style={{ color: T.muted }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.primary }} /> Why BizOS
          </div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.1] tracking-tight">
            Your back-office, <HeadlineChip bg={T.primary}>₹</HeadlineChip> finally<br />
            as simple as <HeadlineChip bg={T.accent} color={T.ink}>
              <MessageCircle size={12} strokeWidth={2.5} />
            </HeadlineChip> a chat
            <span style={{ color: "#9AA4B2" }}>
              {" "}— no<br className="hidden md:block" /> software to learn.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-12 gap-4 md:auto-rows-[minmax(0,1fr)]">

          <motion.div whileHover={{ y: -4 }}
            className="md:col-span-5 md:row-span-2 relative rounded-[28px] overflow-hidden p-6 min-h-[380px] flex flex-col justify-between text-white"
            style={{ background: "linear-gradient(170deg, #17706A 0%, #0B4F4A 100%)" }}>
            <div className="flex items-center justify-between">
              <div className="font-display text-xl">Biz<span style={{ color: T.accent }}>OS</span></div>
              <div className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center">
                <BarChart3 size={16} style={{ color: T.primary }} strokeWidth={2.2} />
              </div>
            </div>
            <div className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full"
              style={{ background: "rgba(242,163,58,0.25)", filter: "blur(70px)" }} />
            <div className="relative rounded-2xl p-5" style={{ background: "#fff", color: T.ink }}>
              <div className="font-display text-5xl leading-none">1 chat</div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: T.muted }}>
                Invoices, dues, filings and follow-ups — all handled in the WhatsApp app you already use every day.
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}
            className="md:col-span-4 rounded-[28px] p-6 flex flex-col justify-between min-h-[180px]"
            style={{ background: "#F1F3F2" }}>
            <div className="text-sm" style={{ color: T.muted }}>Setup time</div>
            <div>
              <div className="font-display text-5xl">~2 min</div>
              <p className="text-sm mt-2" style={{ color: T.muted }}>
                Sign in, open the bot, send your first invoice photo.
              </p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}
            className="md:col-span-3 rounded-[28px] p-6 flex flex-col justify-between min-h-[180px]"
            style={{ background: T.accent, color: T.ink }}>
            <div className="text-sm font-medium">Every morning</div>
            <div>
              <div className="font-display text-4xl tabular-nums">7:00 AM</div>
              <p className="text-sm mt-2 font-medium opacity-80">Your daily brief: dues, tasks, deadlines.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}
            className="md:col-span-3 rounded-[28px] p-6 flex items-center justify-between min-h-[110px] text-white"
            style={{ background: T.ink }}>
            <span className="text-sm text-white/70">Deadlines watched</span>
            <span className="font-display text-4xl tabular-nums">24/7</span>
          </motion.div>

          <motion.div whileHover={{ y: -4 }}
            className="md:col-span-4 rounded-[28px] p-6 flex items-center gap-4 min-h-[110px] border"
            style={{ background: T.surface, borderColor: T.border }}>
            <div className="flex -space-x-2">
              {[Receipt, Calendar, Wallet].map((Ic, i) => (
                <span key={i}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: i === 1 ? "rgba(242,163,58,0.25)" : "rgba(23,112,106,0.15)" }}>
                  <Ic size={16} style={{ color: T.primary }} strokeWidth={2.2} />
                </span>
              ))}
            </div>
            <p className="text-sm leading-snug" style={{ color: T.muted }}>
              Compliance, invoices and cash flow in one place — not three apps and a spreadsheet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════ SECTION 5 · LIVE CHAT — WhatsApp ══════ */}
      <section id="chat" className="relative max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-5">
              Just ask. <br />Your business answers.
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-8 max-w-md" style={{ color: T.muted }}>
              No dashboards to dig through. Type what you'd ask your accountant — BizOS replies on WhatsApp with real numbers from your own books.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["Who owes me money?", "What's due this week?", "Remind Zenith Tech", "Show cash flow"].map((q) => (
                <span key={q}
                  className="px-4 py-2 rounded-full text-sm border bg-white"
                  style={{ borderColor: T.border }}>{q}</span>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-sm w-full mx-auto md:ml-auto relative">
            <div className="absolute -inset-6 rounded-[40px] pointer-events-none"
              style={{ background: "rgba(37,211,102,0.15)", filter: "blur(50px)" }} />

            <div className="relative rounded-3xl p-6 text-left"
              style={{ background: WA.dark, boxShadow: "0 25px 60px -20px rgba(37,211,102,0.4)" }}>

              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: WA.green }}>BD</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">BizOS Bot</div>
                  <div className="text-xs" style={{ color: WA.green }}>online</div>
                </div>
              </div>

              <div className="text-xs mb-3 text-center" style={{ color: WA.textMuted }}>Today</div>

              <motion.div
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="rounded-2xl rounded-tl-sm p-4 mb-3"
                style={{ background: WA.bubbleIn }}>
                <p className="text-sm font-medium mb-2" style={{ color: WA.text }}>Good morning.</p>
                <p className="text-xs leading-relaxed" style={{ color: WA.text, opacity: 0.9 }}>
                  <span style={{ color: T.critical, fontWeight: 700 }}>•</span> <b>5 invoices overdue</b> · ₹12.6L<br />
                  <span style={{ color: T.accent, fontWeight: 700 }}>•</span> 8 open tasks<br />
                  <span style={{ color: T.primary, fontWeight: 700 }}>•</span> GSTR-3B due in 3 days
                </p>
                <div className="text-[10px] mt-2 text-right" style={{ color: WA.textMuted }}>7:00 AM</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.8 }}
                className="rounded-2xl rounded-tr-sm p-3 ml-auto max-w-[80%]"
                style={{ background: WA.bubbleOut }}>
                <p className="text-xs" style={{ color: WA.text }}>who owes me money?</p>
                <div className="text-[10px] mt-1 text-right flex items-center justify-end gap-1" style={{ color: WA.textMuted }}>
                  7:01 AM <span style={{ color: WA.tick }}>✓✓</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: 1.3 }}
                className="rounded-2xl rounded-tl-sm p-4 mt-3"
                style={{ background: WA.bubbleIn }}>
                <p className="text-xs leading-relaxed" style={{ color: WA.text, opacity: 0.9 }}>
                  INV-104 — Sharma Traders — ₹4.2L — 35d<br />
                  INV-105 — Zenith Tech — ₹2.85L — 28d<br />
                  INV-106 — Patel Precision — ₹1.78L — 22d
                </p>
                <div className="text-[10px] mt-2 text-right" style={{ color: WA.textMuted }}>7:01 AM</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════ SECTION 6 · HOW ══════ */}
      <section id="how" className="relative max-w-6xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl">Built for how Indian businesses actually run</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-[58px] left-[16%] right-[16%] h-px"
            style={{ background: `repeating-linear-gradient(90deg, ${T.primary}55 0 6px, transparent 6px 12px)` }} />
          {[
            { num: "1", title: "Snap an invoice", desc: "Send a photo on WhatsApp. We read it, log it, and track the payment.", Icon: Camera, tint: "rgba(23,112,106,0.12)" },
            { num: "2", title: "Ask anything", desc: '"Who owes me money?" "What\'s due this week?" — get real answers.', Icon: MessageCircle, tint: "rgba(242,163,58,0.2)" },
            { num: "3", title: "Auto-pilot", desc: "Reminders, compliance deadlines, cash-flow alerts. Handled automatically.", Icon: Zap, tint: "rgba(23,112,106,0.12)" },
          ].map((f, i) => (
            <motion.div key={f.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 16px 44px -14px rgba(16,24,40,0.18)" }}
              className="relative p-8 rounded-[28px] border transition-shadow"
              style={{ borderColor: T.border, background: T.surface }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative"
                style={{ background: f.tint }}>
                <f.Icon size={22} style={{ color: T.primary }} strokeWidth={2.2} />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center text-white"
                  style={{ background: T.primary }}>{f.num}</span>
              </div>
              <h3 className="font-display text-xl mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ SECTION 7 · CTA ══════ */}
      <section className="px-3 md:px-4 pb-4">
        <div className="relative rounded-[28px] md:rounded-[36px] overflow-hidden text-center px-6 py-20 md:py-28"
          style={{ background: "linear-gradient(180deg, #17706A 0%, #0B4F4A 100%)" }}>
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[560px] h-[360px] rounded-full pointer-events-none"
            style={{ background: "rgba(242,163,58,0.28)", filter: "blur(110px)" }} />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl text-white leading-tight mb-4">
              Run your business<br />on <span style={{ color: T.accent }}>WhatsApp</span>
            </h2>
            <p className="text-white/80 mb-9 max-w-md mx-auto">
              Ready to get your business in order? Start free — it takes two minutes.
            </p>
            <motion.button type="button"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              onClick={() => nav("/login")}
              className="pl-8 pr-2 py-2 rounded-full font-semibold inline-flex items-center gap-4"
              style={{ background: T.accent, color: T.ink }}>
              Start free
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                style={{ background: T.ink }}>↗</span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* ══════ SECTION 8 · FOOTER ══════ */}
      <footer className="py-10 text-center text-xs" style={{ color: T.muted }}>
        <div className="flex justify-center gap-6 mb-4">
          <a href="#" className="hover:opacity-70 transition">Terms</a>
          <a href="#" className="hover:opacity-70 transition">Privacy</a>
          <a href="#" className="hover:opacity-70 transition">Help</a>
        </div>
        <div>BizOS · Built in India · © 2026</div>
      </footer>
    </div>
  );
}

// ═══ [13] LOGIN ═══
const DEMO_CODE = "123456";
type LoginStep = "choose" | "phone" | "otp" | "email" | "emailSent" | "mfa";

function Login() {
  const [step, setStep] = useState<LoginStep>("choose");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = () => {
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) { setError("Enter a 10-digit phone"); return; }
    setError(null); setBusy(true);
    setTimeout(() => { setBusy(false); setStep("otp"); }, 800);
  };
  const verifyOtp = () => {
    if (otp.replace(/\D/g, "").length < 6) { setError("Enter the 6-digit code"); return; }
    if (otp !== DEMO_CODE) { setError(`Demo code is ${DEMO_CODE}`); return; }
    setError(null); setBusy(true);
    setTimeout(() => { setBusy(false); setStep("mfa"); }, 700);
  };
  const sendEmailLink = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Enter a valid email"); return; }
    setError(null); setBusy(true);
    setTimeout(() => { setBusy(false); setStep("emailSent"); }, 800);
  };
  const verifyMfa = () => {
    if (mfaCode.replace(/\D/g, "").length < 6) { setError("Enter the 6-digit MFA code"); return; }
    if (mfaCode !== DEMO_CODE) { setError(`Demo code is ${DEMO_CODE}`); return; }
    setError(null); enableDemo(); window.location.href = "/";
  };
  const demoLogin = () => { enableDemo(); window.location.href = "/"; };

  const wrap = {
    initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: T.canvas, color: T.ink }}>
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="font-display text-4xl mb-3">Biz<span style={{ color: T.primary }}>OS</span></div>
          <div className="text-sm" style={{ color: T.muted }}>Your business operating system</div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "choose" && (
            <motion.div key="choose" {...wrap} className="space-y-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep("phone")}
                className="w-full px-6 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-3"
                style={{ background: T.primary }}>
                <MessageCircle size={16} /> Continue with Phone
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={signInGoogle}
                className="w-full px-6 py-3 rounded-xl font-medium border flex items-center justify-center gap-3 hover:bg-white"
                style={{ borderColor: T.border, background: T.surface }}>
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
                </svg>Continue with Google
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep("email")}
                className="w-full px-6 py-3 rounded-xl font-medium border hover:bg-white flex items-center justify-center gap-3"
                style={{ borderColor: T.border, background: T.surface }}>
                <FileText size={16} /> Continue with Email
              </motion.button>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: T.border }} />
                <div className="text-xs" style={{ color: T.muted }}>or</div>
                <div className="flex-1 h-px" style={{ background: T.border }} />
              </div>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={demoLogin} disabled={busy}
                className="w-full px-6 py-3 rounded-xl font-medium border hover:bg-[#EFEBE0] disabled:opacity-50"
                style={{ borderColor: T.border, background: T.surface, color: T.ink }}>
                {busy ? "Entering…" : "Demo as Rajesh (ABC Components)"}
              </motion.button>
              <div className="mt-6 text-xs text-center" style={{ color: T.muted }}>
                Demo mode uses sample data — no signup needed.
              </div>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div key="phone" {...wrap}>
              <h2 className="font-display text-2xl mb-2">Enter your phone</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>We'll send a 6-digit OTP.</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-3 rounded-xl border text-sm font-medium"
                  style={{ borderColor: T.border, background: T.surface }}>+91</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210" inputMode="numeric" autoFocus
                  className="flex-1 px-4 py-3 rounded-xl border outline-none text-lg tracking-wider focus:ring-2 focus:ring-[#17706A]/20"
                  style={{ borderColor: T.border, background: T.surface }} />
              </div>
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={sendOtp} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: T.primary }}>
                {busy && <Loader2 size={14} className="animate-spin" />}
                {busy ? "Sending…" : "Send OTP"}
              </motion.button>
              <button onClick={() => { setStep("choose"); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div key="otp" {...wrap}>
              <h2 className="font-display text-2xl mb-2">Enter OTP</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Sent to <b>+91 {phone}</b> · <i>Demo: {DEMO_CODE}</i>
              </p>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" inputMode="numeric" maxLength={6} autoFocus
                className="w-full px-4 py-4 rounded-xl border outline-none text-2xl tracking-[0.5em] text-center font-mono mb-4"
                style={{ borderColor: T.border, background: T.surface }} />
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={verifyOtp} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                style={{ background: T.primary }}>{busy ? "Verifying…" : "Verify & continue"}</motion.button>
              <button onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Change number</button>
            </motion.div>
          )}

          {step === "email" && (
            <motion.div key="email" {...wrap}>
              <h2 className="font-display text-2xl mb-2">Enter your email</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>We'll send you a magic link.</p>
              <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.in" type="email" autoFocus
                className="w-full px-4 py-3 rounded-xl border outline-none mb-4"
                style={{ borderColor: T.border, background: T.surface }} />
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={sendEmailLink} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                style={{ background: T.primary }}>{busy ? "Sending…" : "Send magic link"}</motion.button>
              <button onClick={() => { setStep("choose"); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}

          {step === "emailSent" && (
            <motion.div key="emailSent" {...wrap} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: T.primarySoft }}>
                <FileText size={28} color={T.primary} />
              </motion.div>
              <h2 className="font-display text-2xl mb-2">Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Sent a magic link to <b>{email}</b>
              </p>
              <motion.button whileTap={{ scale: 0.99 }} onClick={() => setStep("mfa")}
                className="w-full py-3 rounded-xl font-medium text-white"
                style={{ background: T.primary }}>Simulate opening link →</motion.button>
              <button onClick={() => { setStep("choose"); setEmail(""); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}

          {step === "mfa" && (
            <motion.div key="mfa" {...wrap}>
              <div className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-medium inline-block mb-2"
                style={{ background: "rgba(242,163,58,0.12)", color: T.accent }}>MFA · step 2 of 2</div>
              <h2 className="font-display text-2xl mb-2">Two-factor code</h2>
              <p className="text-sm mb-6" style={{ color: T.muted }}>
                Enter the 6-digit code from your authenticator. <i>Demo: {DEMO_CODE}</i>
              </p>
              <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000" inputMode="numeric" maxLength={6} autoFocus
                className="w-full px-4 py-4 rounded-xl border outline-none text-2xl tracking-[0.5em] text-center font-mono mb-4"
                style={{ borderColor: T.border, background: T.surface }} />
              <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer" style={{ color: T.muted }}>
                <input type="checkbox" checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)}
                  className="w-4 h-4 rounded" />Trust this device for 30 days
              </label>
              {error && <p className="text-xs mb-3" style={{ color: T.critical }}>{error}</p>}
              <motion.button whileTap={{ scale: 0.99 }} onClick={verifyMfa} disabled={busy}
                className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                style={{ background: T.primary }}>{busy ? "Verifying…" : "Verify & sign in"}</motion.button>
              <button onClick={() => { setStep("choose"); setMfaCode(""); setError(null); }}
                className="w-full py-3 mt-3 text-sm font-medium" style={{ color: T.muted }}>← Back</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══ [14] ONBOARDING ═══
function Onboarding({ onDone }: { onDone: (name: string, city: string) => void }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (!isDemoMode()) {
        await api.put("/me/business", { business_name: name.trim(), gstin: null, industry: "manufacturing", city: city.trim() || "Mumbai" });
        await api.post("/me/complete-onboarding");
      }
      onDone(name.trim(), city.trim() || "Mumbai");
    } finally { setSaving(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: T.canvas, color: T.ink }}>
      <div className="w-full max-w-md">
        <div className="font-display text-3xl mb-8">Biz<span style={{ color: T.primary }}>OS</span></div>
        <h1 className="font-display text-2xl mb-2">Set up your business</h1>
        <p className="text-sm mb-8" style={{ color: T.muted }}>Two fields. That's it.</p>
        <div className="space-y-4 mb-8">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name"
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ borderColor: T.border, background: T.surface }} />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
            className="w-full px-4 py-3 rounded-xl border outline-none"
            style={{ borderColor: T.border, background: T.surface }} />
        </div>
        <motion.button whileTap={{ scale: 0.99 }} onClick={save} disabled={saving || !name.trim()}
          className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-40"
          style={{ background: T.primary }}>{saving ? "Setting up…" : "Go to dashboard →"}</motion.button>
      </div>
    </div>
  );
}

// ═══ [15] SHELL ═══
const NAV = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/inbox", label: "Inbox", Icon: InboxIcon, badgeKey: "inbox" as const },
  { to: "/customers", label: "Customers", Icon: Users },
  { to: "/ledger", label: "Money", Icon: IndianRupee },
  { to: "/tasks", label: "Work", Icon: CheckSquare },
  { to: "/live", label: "Live", Icon: Radio },
  { to: "/impact", label: "Impact", Icon: Leaf },
  { to: "/trust", label: "Trust", Icon: ShieldCheck },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
];

function Shell({ children, me, onLogout, onCopilot, badges }:
  { children: ReactNode; me: Me; onLogout: () => void; onCopilot: () => void; badges: { inbox: number } }) {
  const demo = isDemoMode();
  return (
    <div className="min-h-screen flex" style={{ background: T.canvas, color: T.ink }}>
      <aside className="hidden md:flex flex-col w-56 glass-2 sticky top-0 h-screen"
        style={{ borderRight: "1px solid rgba(255,255,255,0.6)" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(16,24,40,0.06)" }}>
          <div className="font-display text-2xl tracking-tight">
            Biz<span style={{ color: T.primary }}>OS</span>
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>Business Operating System</div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon, badgeKey }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition hover:bg-white/60"
              style={({ isActive }: any) => ({
                background: isActive ? "rgba(255,255,255,0.75)" : "transparent",
                color: isActive ? T.ink : T.muted,
                fontWeight: isActive ? 700 : 400,
                boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(16,24,40,0.04)" : "none",
              })}>
              <span className="flex items-center gap-3">
                <Icon size={14} style={{ color: T.primary }} />{label}
              </span>
              {badgeKey && badges[badgeKey] > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-semibold"
                  style={{ background: T.critical }}>{badges[badgeKey]}</motion.span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t text-xs" style={{ borderColor: "rgba(16,24,40,0.06)", color: T.muted }}>
          {demo && (
            <div className="text-[10px] uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block"
              style={{ background: "rgba(242,163,58,0.14)", color: T.watch }}>Demo mode</div>
          )}
          <div className="truncate mb-2">{me.business_name ?? me.email}</div>
          <button onClick={onLogout} className="hover:opacity-70">Sign out →</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 py-3 glass-2 sticky top-0 z-20"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.6)" }}>
          <button className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition hover:bg-white/60"
            style={{ borderColor: T.border, color: T.muted }}>
            <Search size={14} />
            <Kbd>⌘K</Kbd>
            <span className="hidden sm:inline">Search…</span>
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={onCopilot}
              className="hidden sm:flex text-sm px-3 py-1.5 rounded-lg font-medium text-white items-center gap-1.5"
              style={{ background: T.primary, boxShadow: "0 4px 14px -4px rgba(23,112,106,0.5)" }}>
              <Sparkles size={14} /> Copilot
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              className="relative w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-white/60"
              style={{ borderColor: T.border }} aria-label="Notifications">
              <Bell size={16} />
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                style={{ background: T.accent }} />
            </motion.button>
            <div className="text-sm px-2 md:px-3 py-1.5 rounded-lg border flex items-center gap-2 cursor-pointer hover:bg-white/60"
              style={{ borderColor: T.border }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: T.primary }}>{(me.business_name ?? "B")[0].toUpperCase()}</span>
              <span className="hidden sm:inline">{me.business_name ?? "Business"}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-20 glass-2"
          style={{ borderColor: "rgba(255,255,255,0.6)" }}>
          {NAV.slice(0, 5).map(({ to, label, Icon, badgeKey }) => (
            <NavLink key={to} to={to} end={to === "/"}
              className="flex-1 py-2.5 text-[10px] flex flex-col items-center gap-0.5 relative"
              style={({ isActive }: any) => ({ color: isActive ? T.primary : T.muted })}>
              <Icon size={16} />{label}
              {badgeKey && badges[badgeKey] > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold"
                  style={{ background: T.critical }}>{badges[badgeKey] > 9 ? "9+" : badges[badgeKey]}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

// ═══ [16] HOME ═══
function Home({ me, onNavigate, inboxBadge }: { me: Me; onNavigate: (p: string) => void; inboxBadge: number }) {
  const { data: entities, loading, refresh } = useEntities();
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(() => Date.now());

  const stats = useMemo(() => {
    const list = entities ?? [];
    const invoices = list.filter((e) => e.type === "invoice");
    const tasks = list.filter((e) => e.type === "task");
    const customers = list.filter((e) => e.type === "customer");
    const overdue = invoices.filter((i) => i.data?.status === "overdue");
    const overdueAmt = overdue.reduce((s, i) => s + (i.data?.total ?? 0), 0);
    const openTasks = tasks.filter((t) => t.data?.status === "open" || t.data?.status === "in_progress");
    const revenue = invoices.filter((i) => i.data?.status === "paid").reduce((s, i) => s + (i.data?.total ?? 0), 0);
    const esg = list.find((e) => e.type === "esg_metric");
    return { overdueCount: overdue.length, overdueAmt, openTasks: openTasks.length,
      customers: customers.length, revenue, invoiceCount: invoices.length,
      esgCoverage: esg?.data?.value ?? 68 };
  }, [entities]);

  const priorities = useMemo(() => buildPriorities(entities ?? []), [entities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setLastChecked(Date.now());
    setTimeout(() => setRefreshing(false), 500);
    toast.success("Refreshed");
  };

  if (loading) return <HomeSkeleton />;
  const allClear = priorities.length === 0 && inboxBadge === 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.muted }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">
            Good {greeting()}, Rajesh
          </h1>
          <p className="mt-2 text-sm" style={{ color: T.muted }}>
            Here's what needs your attention today at {me.business_name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FreshnessChip at={lastChecked} />
          <motion.button whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }}
            onClick={handleRefresh} aria-label="Refresh"
            className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-white/60"
            style={{ borderColor: T.border }}>
            <RefreshCw size={14} style={{ color: refreshing ? T.primary : T.muted }} />
          </motion.button>
        </div>
      </motion.div>

      {allClear ? (
        <EmptyState icon={<Check size={28} />} title="All clear. Nothing needs you today."
          body={`Last checked ${relTime(lastChecked)}`}
          action={{ label: "Review yesterday", onClick: () => onNavigate("/ledger") }} />
      ) : (
        <>
          <div className="space-y-3">
            {priorities.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4, boxShadow: "0 8px 30px -12px rgba(16,24,40,0.15)" }}
                onClick={() => onNavigate(p.action === "Review" ? "/inbox" : "/tasks")}
                className="rounded-2xl border p-5 transition-all cursor-pointer"
                style={{ borderColor: T.border, background: T.surface, borderLeftWidth: 3,
                  borderLeftColor: p.severity === "critical" ? T.critical : p.severity === "watch" ? T.watch : T.good }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <SeverityPill severity={p.severity} />
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: T.muted }}>{p.source}</span>
                    </div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm mt-1" style={{ color: T.muted }}>{p.detail}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Sparkline data={[40, 42, 38, 45, 52, 58, 55, 62, 68, 71, 74, 78]}
                      colour={p.severity === "critical" ? T.critical : p.severity === "watch" ? T.watch : T.good} />
                    <motion.button whileHover={{ x: 2 }}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap flex items-center gap-1 transition hover:bg-[#F6F3EC]"
                      style={{ borderColor: T.border }}>{p.action}<ChevronRight size={12} /></motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <HealthTile label="Finance"
              state={stats.overdueAmt > 500000 ? "critical" : stats.overdueAmt > 200000 ? "watch" : "good"}
              sparkline={[62, 58, 55, 60, 65, 68, 72, 70, 68, 74, 76, 72, 70, 68]}
              onClick={() => onNavigate("/ledger")} />
            <HealthTile label="Operations" state="good"
              sparkline={[50, 55, 60, 62, 68, 72, 75, 78, 76, 80, 82, 84, 86, 88]}
              onClick={() => onNavigate("/tasks")} />
            <HealthTile label="Compliance" state="good"
              sparkline={[70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96]}
              onClick={() => onNavigate("/trust")} />
            <HealthTile label="People" state="watch"
              sparkline={[80, 78, 76, 72, 70, 68, 66, 64, 62, 60, 58, 56, 54, 52]}
              onClick={() => onNavigate("/tasks")} />
          </div>
        </>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <CashProjectionChart onDrill={() => onNavigate("/ledger")} />
          <AgeingBars onDrill={(bucket) => toast.success(`Filter invoices: ${bucket}`)} />
        </div>
        <div className="space-y-4">
          <motion.div whileHover={{ y: -2 }} onClick={() => onNavigate("/inbox")}
            className="rounded-2xl border p-5 cursor-pointer transition-all"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Pending approvals</div>
              {inboxBadge > 0 && (
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-5 h-5 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                  style={{ background: T.critical }}>{inboxBadge}</motion.span>
              )}
            </div>
            <div className="text-4xl tracking-tight mb-1 tabular-nums" style={{ color: T.primary, fontWeight: 700 }}>
              <AnimatedNumber value={inboxBadge} />
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border font-medium w-full mt-3 flex items-center justify-center gap-1 hover:bg-[#F6F3EC] transition"
              style={{ borderColor: T.border }}>Open Inbox<ChevronRight size={12} /></button>
          </motion.div>

          <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: T.muted }}>Top risks</div>
            <div className="space-y-3">
              {[
                { label: "Cash flow", score: 78 }, { label: "Overdue INV-104", score: 72 },
                { label: "Vendor concentration", score: 48 }, { label: "Compliance deadline", score: 42 },
                { label: "Task backlog", score: 28 },
              ].map((r, i) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{r.label}</span>
                    <span className="tabular-nums" style={{ color: T.muted }}>{r.score}</span>
                  </div>
                  <div className="h-2 rounded-sm overflow-hidden" style={{ background: "#F6F3EC" }}>
                    <motion.div className="h-full rounded-sm" initial={{ width: 0 }} animate={{ width: `${r.score}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                      style={{ background: r.score >= 70 ? T.critical : r.score >= 40 ? T.watch : T.good }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.div whileHover={{ y: -2 }} onClick={() => onNavigate("/tasks")}
            className="rounded-2xl border p-5 cursor-pointer transition-all"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Overdue & blocked</div>
            <div className="text-4xl tracking-tight mb-1 tabular-nums" style={{ color: T.watch, fontWeight: 700 }}>
              <AnimatedNumber value={stats.openTasks} />
            </div>
            <div className="text-xs" style={{ color: T.muted }}>tasks pending attention</div>
          </motion.div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }}
          className="rounded-2xl border p-5 cursor-pointer transition-all"
          style={{ borderColor: T.border, background: T.surface }}
          onClick={() => onNavigate("/live")}>
          <div className="flex items-center gap-2 mb-3">
            <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full" style={{ background: T.good }} />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Machine M-01</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl tabular-nums" style={{ fontWeight: 700 }}>
              <AnimatedNumber value={72.4} format={(n) => `${n.toFixed(1)}°C`} />
            </div>
            <Sparkline data={[68, 70, 71, 69, 72, 73, 71, 72, 74, 72, 71, 72, 73, 72]}
              colour={T.good} width={120} height={32} fill />
          </div>
          <div className="text-xs mt-2" style={{ color: T.muted }}>Last 60 min · normal</div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}
          className="rounded-2xl border p-5 flex items-center gap-4 cursor-pointer transition-all"
          style={{ borderColor: T.border, background: T.surface }}
          onClick={() => onNavigate("/impact")}>
          <EsgGauge value={Math.round(stats.esgCoverage)} colour={stats.esgCoverage >= 75 ? T.good : T.watch} />
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: T.muted }}>ESG Coverage</div>
            <div className="font-medium">Governance {Math.round(stats.esgCoverage)}%</div>
            <div className="text-xs mt-1 flex items-center gap-1" style={{ color: T.primary }}>
              View impact<ChevronRight size={12} />
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}
          className="rounded-2xl border p-5 cursor-pointer transition-all"
          style={{ borderColor: T.border, background: T.surface }}
          onClick={() => onNavigate("/customers")}>
          <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Customers</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl tabular-nums" style={{ fontWeight: 700 }}>
              <AnimatedNumber value={stats.customers} />
            </div>
            <Sparkline data={[42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68]}
              colour={T.primary} width={120} height={32} fill />
          </div>
          <div className="text-xs mt-2" style={{ color: T.muted }}>Active this quarter</div>
        </motion.div>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 rounded" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />)}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-72 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
        <div className="h-72 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function buildPriorities(entities: Entity[]) {
  const out: any[] = [];
  const overdue = entities.filter((e) => e.type === "invoice" && e.data?.status === "overdue");
  if (overdue.length > 0) {
    const sorted = [...overdue].sort((a, b) => (b.data?.days_overdue ?? 0) - (a.data?.days_overdue ?? 0));
    const top = sorted[0];
    const total = overdue.reduce((s, i) => s + (i.data?.total ?? 0), 0);
    out.push({ id: "overdue", severity: overdue.length >= 10 ? "critical" : "watch", source: "Collections Agent",
      title: `${overdue.length} invoices overdue · ${fmtINR(total)}`,
      detail: `Largest: ${top.data?.customer_name ?? top.name} · ${top.data?.days_overdue}d`, action: "Review" });
  }
  const tasks = entities.filter((e) => e.type === "task" && (e.data?.status === "open" || e.data?.status === "in_progress"));
  if (tasks.length > 0) {
    out.push({ id: "tasks", severity: "watch", source: "Operations",
      title: `${tasks.length} open tasks`,
      detail: "Team has pending work across collections, compliance, and sales", action: "View" });
  }
  return out.slice(0, 5);
}

// ═══ [17] INBOX ═══
type InboxItem = {
  id: string; kind: "approval" | "exception" | "mention";
  severity: Severity; source: string; team: string;
  title: string; subtitle: string; detail: string;
  amount?: number; ageHours?: number; confidence?: number;
  entity?: Entity;
  evidence?: { source: string; rule: string; evidence: string; agent: string };
};

const AGE_BUCKETS: { key: string; label: string; test: (h: number) => boolean }[] = [
  { key: "<1d", label: "<1d", test: (h) => h < 24 },
  { key: "1-3d", label: "1–3d", test: (h) => h >= 24 && h < 72 },
  { key: "3-7d", label: "3–7d", test: (h) => h >= 72 && h < 168 },
  { key: "7-14d", label: "7–14d", test: (h) => h >= 168 && h < 336 },
  { key: "14-30d", label: "14–30d", test: (h) => h >= 336 && h < 720 },
  { key: "30d+", label: "30d+", test: (h) => h >= 720 },
];
const TEAMS = ["Collections", "Operations", "Compliance", "Sales"];
const RISKS: Severity[] = ["critical", "watch", "good"];

function Inbox({ onCountChange }: { onCountChange?: (n: number) => void }) {
  const nav = useNavigate();
  const { data: entities, loading } = useEntities();
  const { bump } = useApprovals();
  const [tab, setTab] = useState<"approvals" | "exceptions" | "mentions">("approvals");
  const [selected, setSelected] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<InboxItem | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [ageFilter, setAgeFilter] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<Severity | null>(null);
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedMany, setSelectedMany] = useState<Set<string>>(new Set());
  const [dayFilter, setDayFilter] = useState<number | null>(null);

  const items: InboxItem[] = useMemo(() => {
    const list = entities ?? [];
    const out: InboxItem[] = [];
    list.filter((e) => e.type === "invoice" && e.data?.status === "overdue").forEach((inv) => {
      const days = inv.data?.days_overdue ?? 0;
      out.push({ id: `exc-${inv.id}`, kind: "exception",
        severity: days > 30 ? "critical" : "watch", source: "Collections Agent", team: "Collections",
        title: inv.name ?? "Invoice", subtitle: inv.data?.customer_name ?? "—",
        detail: `${days}d overdue · ${fmtINR(inv.data?.total ?? 0)}`,
        amount: inv.data?.total ?? 0, ageHours: days * 24,
        confidence: inv.data?.confidence ?? 0.9, entity: inv,
        evidence: { source: `Tally sync · invoice ${inv.name} · due ${inv.data?.due_date}`,
          rule: "Overdue > 30 days + top-5 customer → manager approval required",
          evidence: `Days overdue: ${days}\nAmount: ${fmtINR(inv.data?.total ?? 0)}\nLast reminder: 2 days ago · no response\nPrior payment avg: 12 days`,
          agent: "Collections Agent v1.2" } });
    });
    list.filter((e) => e.type === "task" && e.data?.priority === "high" && e.data?.status === "open").forEach((t) => {
      const owner = t.data?.owner ?? "—";
      out.push({ id: `app-${t.id}`, kind: "approval", severity: "watch",
        source: t.data?.created_by === "agent" ? "Operations Agent" : "You", team: "Operations",
        title: t.name ?? "Task", subtitle: `Owner · ${owner}`,
        detail: `Due ${t.data?.due_date ?? "—"}`, ageHours: t.data?.age_hours ?? 12, entity: t,
        evidence: { source: `Task created by ${t.data?.created_by ?? "user"}`,
          rule: "Manual review required for high-priority items",
          evidence: `Priority: high\nOwner: ${owner}\nDue: ${t.data?.due_date}`,
          agent: "Operations Agent" } });
    });
    list.filter((e) => e.type === "customer").slice(0, 5).forEach((c) => {
      out.push({ id: `men-${c.id}`, kind: "mention", severity: "good",
        source: "Customer Success Agent", team: "Sales",
        title: c.name ?? "Customer", subtitle: `${c.data?.city ?? "—"} · ${c.data?.tier ?? "standard"}`,
        detail: `LTV ${fmtINR(c.data?.lifetime_value ?? 0)}`, ageHours: 2, entity: c,
        evidence: { source: `Customer ${c.name}`, rule: "Track customer relationships and health",
          evidence: `City: ${c.data?.city}\nLifetime value: ${fmtINR(c.data?.lifetime_value ?? 0)}`,
          agent: "Customer Success Agent" } });
    });
    return out;
  }, [entities]);

  const filtered = useMemo(() => {
    const wantKind = tab === "approvals" ? "approval" : tab === "exceptions" ? "exception" : "mention";
    const f = items.filter((i) => {
      if (i.kind !== wantKind) return false;
      if (ageFilter) { const bucket = AGE_BUCKETS.find((b) => b.key === ageFilter); if (bucket && !bucket.test(i.ageHours ?? 0)) return false; }
      if (riskFilter && i.severity !== riskFilter) return false;
      if (teamFilter && i.team !== teamFilter) return false;
      if (dayFilter !== null) { const d = Math.floor((i.ageHours ?? 0) / 24); if (d !== dayFilter - 1) return false; }
      return true;
    });
    const rank = (s: Severity) => (s === "critical" ? 3 : s === "watch" ? 2 : 1);
    f.sort((a, b) => {
      if (rank(a.severity) !== rank(b.severity)) return rank(b.severity) - rank(a.severity);
      if ((b.amount ?? 0) !== (a.amount ?? 0)) return (b.amount ?? 0) - (a.amount ?? 0);
      return (b.ageHours ?? 0) - (a.ageHours ?? 0);
    });
    return f;
  }, [items, tab, ageFilter, riskFilter, teamFilter, dayFilter]);

  const sel = useMemo(() => filtered.find((i) => i.id === selected) ?? filtered[0] ?? null, [filtered, selected]);
  const riskMix = useMemo(() => ({
    critical: items.filter((i) => i.severity === "critical").length,
    watch: items.filter((i) => i.severity === "watch").length,
    good: items.filter((i) => i.severity === "good").length,
  }), [items]);
  const activeFilterCount = (ageFilter ? 1 : 0) + (riskFilter ? 1 : 0) + (teamFilter ? 1 : 0) + (dayFilter !== null ? 1 : 0);

  useEffect(() => {
    const n = items.filter((i) => i.kind !== "mention" && !handled.has(i.id)).length;
    onCountChange?.(n);
  }, [items, handled, onCountChange]);

  useEffect(() => { if (sel) setEditedText(sel.subtitle); }, [sel]);

  const handleApprove = useCallback((item: InboxItem) => {
    setHandled((s) => new Set(s).add(item.id));
    bump();
    toast.custom((t) => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: t.visible ? 1 : 0, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="rounded-xl px-4 py-3 flex items-center gap-3 max-w-md glass-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: T.goodSoft }}>
          <Check size={14} color={T.good} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Approved. WhatsApp reminder sent.</div>
          <div className="text-xs truncate" style={{ color: T.muted }}>{item.title} · {item.subtitle}</div>
        </div>
        <button onClick={() => { toast.dismiss(t.id); nav("/ledger"); }}
          className="text-xs px-2 py-1 rounded border font-medium whitespace-nowrap"
          style={{ borderColor: T.border, color: T.primary }}>Ledger</button>
        <button onClick={() => {
          toast.dismiss(t.id);
          setHandled((s) => { const n = new Set(s); n.delete(item.id); return n; });
          toast.success("Reverted");
        }} className="text-xs px-2 py-1 rounded border font-medium whitespace-nowrap"
          style={{ borderColor: T.border, color: T.muted }}>Undo</button>
      </motion.div>
    ), { duration: 10000 });
  }, [bump, nav]);

  const handleReject = useCallback((item: InboxItem) => {
    setHandled((s) => new Set(s).add(item.id));
    toast.error(`Rejected: ${item.title}`);
  }, []);

  const handleBulkApprove = () => {
    const lowRisk = filtered.filter((i) => i.severity !== "critical" && !handled.has(i.id));
    if (lowRisk.length === 0) { toast.error("No low-risk items to bulk approve"); return; }
    lowRisk.forEach((i) => { setHandled((s) => new Set(s).add(i.id)); bump(); });
    setBulkMode(false); setSelectedMany(new Set());
    toast.success(`Bulk approved ${lowRisk.length} low-risk items`);
  };

  useHotkeys({
    j: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.min(idx + 1, filtered.length - 1)]?.id ?? null); },
    ArrowDown: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.min(idx + 1, filtered.length - 1)]?.id ?? null); },
    k: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.max(idx - 1, 0)]?.id ?? null); },
    ArrowUp: (e) => { if (drawer || delegateOpen || editMode) return; e.preventDefault();
      const idx = filtered.findIndex((i) => i.id === sel?.id);
      setSelected(filtered[Math.max(idx - 1, 0)]?.id ?? null); },
    a: () => { if (!drawer && !delegateOpen && !editMode && sel) handleApprove(sel); },
    r: () => { if (!drawer && !delegateOpen && !editMode && sel) handleReject(sel); },
    e: () => { if (!drawer && !delegateOpen && sel) setEditMode(true); },
    d: () => { if (!drawer && sel) setDelegateOpen(true); },
    Escape: () => { if (drawer) setDrawer(null); else if (delegateOpen) setDelegateOpen(false);
      else if (editMode) setEditMode(false); else if (showFilter) setShowFilter(false); },
  }, true);

  if (loading) return <InboxSkeleton />;

  const tabs = [
    { id: "approvals" as const, label: "Approvals", count: items.filter((i) => i.kind === "approval" && !handled.has(i.id)).length },
    { id: "exceptions" as const, label: "Exceptions", count: items.filter((i) => i.kind === "exception" && !handled.has(i.id)).length },
    { id: "mentions" as const, label: "Mentions", count: items.filter((i) => i.kind === "mention").length },
  ];

  return (
    <div className="pb-14">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Inbox</h1>
          <p className="text-sm" style={{ color: T.muted }}>What needs your attention</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Approvals / 14d</div>
            <div className="text-[10px]" style={{ color: T.muted }}>
              {dayFilter === null ? "Click a bar to filter" : `Filtered: ${dayFilter}d ago`}
            </div>
          </div>
          <ApprovalVolumeBar onBarClick={(d) => {
            setDayFilter((cur) => (cur === d ? null : d));
            toast.success(d === dayFilter ? "Cleared day filter" : `Filtered: ${d} days ago`);
          }} />
        </div>
      </div>

      <div className="flex gap-1 border-b mb-6 flex-wrap" style={{ borderColor: T.border }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }}
            className="px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition"
            style={{ color: tab === t.id ? T.ink : T.muted,
              borderBottom: tab === t.id ? `2px solid ${T.primary}` : "2px solid transparent", marginBottom: "-1px" }}>
            {t.label}
            {t.count > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium tabular-nums"
                style={{ background: tab === t.id ? T.primarySoft : "#F6F3EC", color: tab === t.id ? T.primary : T.muted }}>{t.count}</span>
            )}
            {t.id === "approvals" && <RiskMixDonut critical={riskMix.critical} watch={riskMix.watch} good={riskMix.good} />}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {bulkMode ? (
            <>
              <button onClick={handleBulkApprove} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                style={{ background: T.primary }}>Approve {filtered.filter((i) => i.severity !== "critical").length} low-risk</button>
              <button onClick={() => { setBulkMode(false); setSelectedMany(new Set()); }}
                className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                style={{ borderColor: T.border, color: T.muted }}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setBulkMode(true)}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium hover:bg-[#F6F3EC]"
              style={{ borderColor: T.border, color: T.muted }}>Bulk</button>
          )}
          <button onClick={() => setShowFilter((v) => !v)} aria-expanded={showFilter}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}>
            <Filter size={12} /> Filter {activeFilterCount > 0 && `· ${activeFilterCount}`}
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xs flex items-center gap-2 flex-wrap">
          <span style={{ color: T.muted }}>Filters:</span>
          {ageFilter && <FilterChip label={`Age ${ageFilter}`} onClear={() => setAgeFilter(null)} />}
          {riskFilter && <FilterChip label={`Risk ${riskFilter}`} onClear={() => setRiskFilter(null)} />}
          {teamFilter && <FilterChip label={`Team ${teamFilter}`} onClear={() => setTeamFilter(null)} />}
          {dayFilter !== null && <FilterChip label={`${dayFilter}d ago`} onClear={() => setDayFilter(null)} />}
        </motion.div>
      )}

      <AnimatePresence>
        {showFilter && (
          <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }} className="mb-6 rounded-2xl border p-4 overflow-hidden"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-semibold">Age distribution</div>
                <div className="text-[10px]" style={{ color: T.muted }}>Click a bar to filter by age</div>
              </div>
              <button onClick={() => setShowFilter(false)} className="text-xs" style={{ color: T.muted }}>close</button>
            </div>
            <AgeHistogram active={ageFilter} onBrush={(bucket) => {
              setAgeFilter((cur) => (cur === bucket ? null : bucket));
              toast.success(`Filtered by ${bucket}`);
            }} />
            <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-4 border-t" style={{ borderColor: T.border }}>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Risk</div>
                <div className="flex flex-wrap gap-1.5">
                  {RISKS.map((r) => (
                    <button key={r} onClick={() => setRiskFilter((cur) => (cur === r ? null : r))}
                      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
                      style={{ borderColor: riskFilter === r ? T.primary : T.border,
                        background: riskFilter === r ? T.primarySoft : T.surface,
                        color: riskFilter === r ? T.primary : T.muted }}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>Team</div>
                <div className="flex flex-wrap gap-1.5">
                  {TEAMS.map((tm) => (
                    <button key={tm} onClick={() => setTeamFilter((cur) => (cur === tm ? null : tm))}
                      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition"
                      style={{ borderColor: teamFilter === tm ? T.primary : T.border,
                        background: teamFilter === tm ? T.primarySoft : T.surface,
                        color: teamFilter === tm ? T.primary : T.muted }}>{tm}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <EmptyState icon={<Check size={28} />} title="Inbox zero. Nothing needs you."
          body={activeFilterCount > 0 ? "Try clearing your filters." : "You're all caught up."}
          action={activeFilterCount > 0 ? { label: "Clear filters",
            onClick: () => { setAgeFilter(null); setRiskFilter(null); setTeamFilter(null); setDayFilter(null); } } : undefined} />
      ) : (
        <div className="grid md:grid-cols-[360px_minmax(0,1fr)] gap-4">
          <div className="space-y-2 md:max-h-[calc(100vh-300px)] md:overflow-y-auto md:pr-1">
            {filtered.map((item, i) => (
              <InboxRow key={item.id} item={item} index={i}
                active={sel?.id === item.id} handled={handled.has(item.id)}
                bulkMode={bulkMode} checked={selectedMany.has(item.id)}
                onCheck={(next) => setSelectedMany((s) => {
                  const n = new Set(s); next ? n.add(item.id) : n.delete(item.id); return n;
                })}
                onSelect={() => setSelected(item.id)} />
            ))}
          </div>

          {sel && (
            <motion.div key={sel.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border p-6"
              style={{ borderColor: T.border, background: T.surface }}>
              {sel.ageHours !== undefined && sel.ageHours > 48 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: T.criticalSoft }}>
                  <AlertTriangle size={16} color={T.critical} />
                  <div className="text-xs" style={{ color: T.critical }}>
                    <b>Escalated to owner</b> · Reminder sent {Math.floor(sel.ageHours / 24)}h ago
                  </div>
                </motion.div>
              )}
              {sel.ageHours !== undefined && sel.ageHours > 24 && sel.ageHours <= 48 && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ background: T.watchSoft }}>
                  <AlertTriangle size={16} color={T.watch} />
                  <div className="text-xs" style={{ color: T.watch }}>
                    <b>Reminder sent</b> · 2h ago · awaiting response
                  </div>
                </motion.div>
              )}

              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>{sel.kind}</div>

              {editMode ? (
                <div className="mb-6">
                  <label className="text-xs font-medium block mb-2">Edit subject</label>
                  <input value={editedText} onChange={(e) => setEditedText(e.target.value)} autoFocus
                    className="w-full px-3 py-2 rounded-lg border outline-none text-sm mb-2"
                    style={{ borderColor: T.border, background: T.surface }} />
                  <div className="flex gap-2">
                    <button onClick={() => { setEditMode(false); toast.success("Saved"); }}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                      style={{ background: T.primary }}>Save</button>
                    <button onClick={() => setEditMode(false)}
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                      style={{ borderColor: T.border }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl mb-1">{sel.title}</h2>
                  <p className="text-sm mb-6" style={{ color: T.muted }}>{sel.subtitle} · {sel.detail}</p>
                </>
              )}

              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Why it exists</div>
                <p className="text-sm leading-relaxed">
                  {sel.kind === "exception" && `${sel.title} is ${sel.ageHours ? Math.floor(sel.ageHours / 24) : 0} days past due and ${sel.subtitle} is a top-5 customer. Unresolved receivables at this aging typically slip to 90+ days.`}
                  {sel.kind === "approval" && `This high-priority task requires manager sign-off before it can proceed.`}
                  {sel.kind === "mention" && `${sel.subtitle} was recently active — worth a check-in.`}
                </p>
              </div>

              {sel.evidence && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <Chip icon="📄" label={sel.evidence.source.split("·")[0].trim()} />
                  <Chip icon="⚖️" label="Rule applied" />
                  <Chip icon="🧠" label="Business memory" />
                </div>
              )}

              {sel.kind === "exception" && (
                <div className="mb-4 rounded-2xl border p-4" style={{ borderColor: T.border, background: "#F6F3EC" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: T.muted }}>
                      <Zap size={11} color={T.primary} /> WhatsApp draft
                    </div>
                    <button onClick={() => setEditMode(true)} className="text-[10px] flex items-center gap-1"
                      style={{ color: T.primary }}><Edit3 size={11} /> Edit</button>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="rounded-xl p-3" style={{ background: WA.dark }}>
                    <p className="text-xs leading-relaxed" style={{ color: WA.text, opacity: 0.9 }}>
                      Dear {sel.subtitle},<br /><br />
                      This is a gentle reminder regarding invoice <b>{sel.title}</b> for{" "}
                      <b>{sel.amount ? fmtINR(sel.amount) : "the pending amount"}</b>, now{" "}
                      {sel.ageHours ? Math.floor(sel.ageHours / 24) : 0} days overdue.<br /><br />
                      We value our relationship and would appreciate your attention. Please let us know if there are any issues.<br /><br />
                      Thank you.
                    </p>
                  </motion.div>
                </div>
              )}

              <div className="mb-4 text-xs p-3 rounded-lg border flex items-center gap-2"
                style={{ borderColor: T.border, background: T.primarySoft, color: T.primary }}>
                <ShieldCheck size={14} />Top-5 customer: manager approval required
              </div>

              {sel.confidence !== undefined && <div className="mb-6"><ConfidenceBar value={sel.confidence} /></div>}

              <div className="flex flex-wrap gap-2 mb-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleApprove(sel)}
                  className="flex-1 min-w-[120px] py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5"
                  style={{ background: T.primary }}><Check size={14} /> Approve</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditMode(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#F6F3EC]"
                  style={{ borderColor: T.border }}><Edit3 size={14} /> Edit</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleReject(sel)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#FDECEC]"
                  style={{ borderColor: T.border, color: T.critical }}><X size={14} /> Reject</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDelegateOpen(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#F6F3EC]"
                  style={{ borderColor: T.border }}><UserPlus size={14} /> Delegate</motion.button>
              </div>

              <button onClick={() => setDrawer(sel)}
                className="text-xs flex items-center gap-1 font-medium hover:gap-2 transition-all"
                style={{ color: T.primary }}>Open evidence drawer <ArrowRight size={12} /></button>
            </motion.div>
          )}
        </div>
      )}

      <div className="fixed bottom-4 md:bottom-4 left-1/2 -translate-x-1/2 z-30 hidden sm:block pointer-events-none">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] glass-3"
          style={{ color: T.muted }}>
          <Kbd>J</Kbd><Kbd>K</Kbd> move
          <span className="opacity-30">·</span>
          <Kbd>A</Kbd> approve
          <span className="opacity-30">·</span>
          <Kbd>R</Kbd> reject
          <span className="opacity-30">·</span>
          <Kbd>E</Kbd> edit
          <span className="opacity-30">·</span>
          <Kbd>D</Kbd> delegate
        </motion.div>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawer(null)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto glass-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.75)" }}
              role="dialog" aria-label="Evidence drawer">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: T.muted }}>
                    <FileText size={14} /> Evidence drawer
                  </div>
                  <button onClick={() => setDrawer(null)} className="hover:opacity-60" aria-label="Close">
                    <X size={18} />
                  </button>
                </div>
                <div className="font-display text-lg mb-1">{drawer.title}</div>
                <div className="text-sm mb-6" style={{ color: T.muted }}>{drawer.subtitle} · {drawer.detail}</div>
                {drawer.evidence && (
                  <div className="space-y-4">
                    <EvidenceField label="Source" value={drawer.evidence.source} />
                    <EvidenceField label="Rule" value={drawer.evidence.rule} />
                    <EvidenceField label="Evidence" value={drawer.evidence.evidence} mono />
                    <EvidenceField label="Approver" value="Rajesh (Owner)" />
                    <EvidenceField label="Result" value="pending" />
                    <EvidenceField label="Agent" value={drawer.evidence.agent} />
                  </div>
                )}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: T.border }}>
                  <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>Actions</div>
                  <div className="flex gap-2">
                    <button onClick={() => { handleApprove(drawer); setDrawer(null); }}
                      className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                      style={{ background: T.primary }}>Approve</button>
                    <button onClick={() => setDrawer(null)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border"
                      style={{ borderColor: T.border }}>Close</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {delegateOpen && sel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setDelegateOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl p-6 z-50 glass-3"
              role="dialog" aria-label="Delegate">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: T.muted }}>Delegate</div>
              <h3 className="font-display text-lg mb-4">{sel.title}</h3>
              <div className="space-y-2 mb-4">
                {["Ravi Kumar · Collections", "Meera Iyer · Compliance", "Ankit Sharma · Operations", "Priya Nair · Sales"].map((u) => (
                  <motion.button key={u} whileHover={{ x: 4 }}
                    onClick={() => { setDelegateOpen(false); toast.success(`Delegated to ${u.split(" · ")[0]}`); }}
                    className="w-full text-left px-4 py-3 rounded-lg border hover:bg-white/60 text-sm transition flex items-center justify-between"
                    style={{ borderColor: T.border }}>
                    {u}<ChevronRight size={14} style={{ color: T.muted }} />
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setDelegateOpen(false)}
                className="w-full py-2 text-sm font-medium" style={{ color: T.muted }}>Cancel</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
      style={{ background: T.primarySoft, color: T.primary }}>
      {label}
      <button onClick={onClear} className="hover:opacity-70" aria-label={`Clear ${label}`}><X size={10} /></button>
    </motion.span>
  );
}

const InboxRow = memo(function InboxRow({ item, active, handled, bulkMode, checked, onCheck, onSelect, index }:
  { item: InboxItem; active: boolean; handled: boolean; bulkMode: boolean; checked: boolean;
    onCheck: (next: boolean) => void; onSelect: () => void; index: number }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ x: 2 }} onClick={onSelect}
      className="rounded-xl border p-4 cursor-pointer transition-all relative"
      style={{ borderColor: active ? T.primary : T.border,
        background: active ? T.primarySoft : handled ? "#FAFAF8" : T.surface,
        opacity: handled ? 0.55 : 1, borderLeftWidth: active ? 3 : 1 }}>
      {bulkMode && item.severity !== "critical" && (
        <input type="checkbox" checked={checked}
          onChange={(e) => { e.stopPropagation(); onCheck(e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 w-4 h-4 rounded" aria-label={`Select ${item.title}`} />
      )}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <SeverityPill severity={item.severity} />
        {item.amount !== undefined && <span className="text-xs font-medium tabular-nums">{fmtINR(item.amount)}</span>}
      </div>
      <div className="font-medium text-sm mb-0.5 leading-tight">{item.title} · {item.subtitle}</div>
      <div className="text-xs mb-1.5 truncate" style={{ color: T.muted }}>{item.detail}</div>
      <div className="flex items-center justify-between text-[11px]" style={{ color: T.muted }}>
        <span className="truncate">{item.source}</span>
        {item.ageHours !== undefined && (
          <span className="flex items-center gap-1 shrink-0"><Clock size={10} />{daysAgo(Math.floor(item.ageHours / 24))}</span>
        )}
      </div>
      {handled && (
        <div className="absolute top-2 right-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium"
          style={{ background: T.goodSoft, color: T.good }}>done</div>
      )}
    </motion.div>
  );
});

function InboxSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-48 rounded" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="grid md:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl" style={{ background: "rgba(16,24,40,0.05)" }} />)}
        </div>
        <div className="h-96 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
    </div>
  );
}

// ═══ [18] INVOICE REVIEW ═══
type FieldKey = "number" | "date" | "vendor" | "gstin" | "amount" | "tax" | "total";
type FieldDef = { key: FieldKey; label: string; value: string; confidence: number; box: { x: number; y: number; w: number; h: number } };

function buildFields(inv: Entity): FieldDef[] {
  const d = inv.data ?? {};
  const base = d.confidence ?? 0.9;
  return [
    { key: "number", label: "Invoice #", value: inv.name ?? "—", confidence: base, box: { x: 62, y: 8, w: 32, h: 4 } },
    { key: "date", label: "Date", value: d.issued_date ?? "—", confidence: base - 0.02, box: { x: 62, y: 14, w: 32, h: 4 } },
    { key: "vendor", label: "Vendor", value: d.customer_name ?? "—", confidence: base - 0.01, box: { x: 6, y: 26, w: 60, h: 5 } },
    { key: "gstin", label: "GSTIN", value: d.gstin ?? "27AABCA1234F1Z5", confidence: base - 0.15, box: { x: 6, y: 35, w: 60, h: 4 } },
    { key: "amount", label: "Amount", value: fmtINR((d.total ?? 0) - (d.gst ?? 0)), confidence: base, box: { x: 58, y: 76, w: 36, h: 4 } },
    { key: "tax", label: "Tax (GST)", value: fmtINR(d.gst ?? 0), confidence: base - 0.08, box: { x: 58, y: 82, w: 36, h: 4 } },
    { key: "total", label: "Total", value: fmtINR(d.total ?? 0), confidence: base + 0.02, box: { x: 54, y: 89, w: 40, h: 6 } },
  ];
}

function InvoiceReview() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data: allEntities, loading } = useEntities();

  const queue = useMemo(() => {
    const list = (allEntities ?? []).filter((e) => e.type === "invoice");
    if (!id) return list;
    const idx = list.findIndex((e) => e.id === id);
    if (idx <= 0) return list;
    return [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)];
  }, [allEntities, id]);

  const [currentId, setCurrentId] = useState<string | null>(id ?? null);
  const [queueStatus, setQueueStatus] = useState<Record<string, "cleared" | "skipped" | "flagged">>({});
  const [filter, setFilter] = useState<"cleared" | "skipped" | "flagged" | "remaining" | null>(null);
  const [amountRange, setAmountRange] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [page, setPage] = useState(1);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [editField, setEditField] = useState<FieldKey | null>(null);
  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [showOcr, setShowOcr] = useState(false);
  const [duplicateAck, setDuplicateAck] = useState(false);
  const [entityAccepted, setEntityAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    setEdits({}); setZoom(100); setRotation(0); setPage(1);
    setEditField(null); setActiveField(null); setDuplicateAck(false); setEntityAccepted(null);
  }, [currentId]);

  const current = useMemo(() => queue.find((q) => q.id === currentId) ?? queue[0], [queue, currentId]);
  const fields = useMemo(() => (current ? buildFields(current) : []), [current]);

  const filteredQueue = useMemo(() => queue.filter((q) => {
    const status = queueStatus[q.id];
    if (filter === "remaining") return !status;
    if (filter === "cleared") return status === "cleared";
    if (filter === "skipped") return status === "skipped";
    if (filter === "flagged") return status === "flagged";
    if (amountRange) { const amt = q.data?.total ?? 0; if (amt < amountRange[0] || amt >= amountRange[1]) return false; }
    return true;
  }), [queue, queueStatus, filter, amountRange]);

  const counts = useMemo(() => {
    let cleared = 0, skipped = 0, flagged = 0;
    for (const q of queue) {
      const s = queueStatus[q.id];
      if (s === "cleared") cleared++; else if (s === "skipped") skipped++; else if (s === "flagged") flagged++;
    }
    return { cleared, skipped, flagged, remaining: queue.length - cleared - skipped - flagged };
  }, [queue, queueStatus]);

  const allAmounts = useMemo(() => queue.map((q) => q.data?.total ?? 0).filter((n) => n > 0), [queue]);

  const goNext = useCallback(() => {
    if (filteredQueue.length === 0) return;
    const idx = filteredQueue.findIndex((q) => q.id === currentId);
    const next = filteredQueue[(idx + 1) % filteredQueue.length];
    setCurrentId(next.id);
  }, [filteredQueue, currentId]);

  const confirm = useCallback(() => {
    if (!current) return;
    setQueueStatus((s) => ({ ...s, [current.id]: "cleared" }));
    toast.success(`${current.name} confirmed · next`);
    setTimeout(goNext, 180);
  }, [current, goNext]);

  const skip = useCallback(() => {
    if (!current) return;
    setQueueStatus((s) => ({ ...s, [current.id]: "skipped" }));
    toast(`Skipped ${current.name}`);
    setTimeout(goNext, 180);
  }, [current, goNext]);

  const flag = useCallback(() => {
    if (!current) return;
    setQueueStatus((s) => ({ ...s, [current.id]: "flagged" }));
    toast.error(`${current.name} flagged for review`);
    setTimeout(goNext, 180);
  }, [current, goNext]);

  useHotkeys({
    Enter: (e) => { if (editField) return; e.preventDefault(); confirm(); },
    s: (e) => { if (!editField) { e.preventDefault(); skip(); } },
    S: (e) => { if (!editField) { e.preventDefault(); skip(); } },
    f: (e) => { if (!editField) { e.preventDefault(); flag(); } },
    F: (e) => { if (!editField) { e.preventDefault(); flag(); } },
    Escape: () => { if (editField) setEditField(null); else nav("/ledger"); },
  }, true);

  if (loading || !current) return <InvoiceReviewSkeleton />;

  const isDuplicate = queue.some((q) => q.id !== current.id
    && q.data?.total === current.data?.total
    && q.data?.customer_name === current.data?.customer_name);
  const entitySuggestion = (allEntities ?? []).find((e) => e.type === "customer" && e.name === current.data?.customer_name);

  const lineItems = [
    { desc: "Steel brackets · 240 units", amt: 168000 },
    { desc: "Fasteners · 1200 units", amt: 122000 },
    { desc: "Surface coating service", amt: 65932 },
  ];

  return (
    <div className="pb-24">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => nav("/ledger")}
            className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-white/60"
            style={{ borderColor: T.border, color: T.muted }} aria-label="Back">
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>
              Invoice review · {current.name}
            </div>
            <h1 className="font-display text-2xl tracking-tight">{current.data?.customer_name}</h1>
          </div>
        </div>
        <button onClick={() => setShowOcr((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-white/60"
          style={{ borderColor: T.border, color: T.muted }}>
          <Layers size={12} />{showOcr ? "Hide" : "Show"} OCR trend
        </button>
      </div>

      <div className="rounded-2xl border p-4 mb-4" style={{ borderColor: T.border, background: T.surface }}>
        <QueueProgress {...counts} activeFilter={filter}
          onSegment={(key) => setFilter((cur) => (cur === key ? null : key))} />
      </div>

      <AnimatePresence>
        {showOcr && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
            <div className="rounded-2xl border p-5" style={{ borderColor: T.border, background: T.surface }}>
              <OcrAccuracyTrend />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border overflow-hidden"
          style={{ borderColor: T.border, background: T.surface }}>
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: T.border }}>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC]"
                style={{ borderColor: T.border, color: T.muted }} aria-label="Zoom out">
                <ZoomOut size={12} />
              </button>
              <span className="text-xs font-mono tabular-nums w-10 text-center" style={{ color: T.muted }}>{zoom}%</span>
              <button onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC]"
                style={{ borderColor: T.border, color: T.muted }} aria-label="Zoom in">
                <ZoomIn size={12} />
              </button>
              <button onClick={() => setRotation((r) => (r + 90) % 360)}
                className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-[#F6F3EC] ml-1"
                style={{ borderColor: T.border, color: T.muted }} aria-label="Rotate">
                <RotateCw size={12} />
              </button>
            </div>
            <div className="text-xs flex items-center gap-2" style={{ color: T.muted }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="hover:opacity-70" aria-label="Previous page">‹</button>
              <span className="font-mono tabular-nums">{page} / 1</span>
              <button onClick={() => setPage((p) => Math.min(1, p + 1))} className="hover:opacity-60" aria-label="Next page">›</button>
            </div>
          </div>

          <div className="relative flex items-center justify-center p-6"
            style={{ minHeight: 560, background: "#EAE5D9" }}>
            <div className="relative bg-white shadow-lg transition-transform"
              style={{
                width: "78%", aspectRatio: "0.76",
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease",
              }}>
              <div className="absolute left-[6%] top-[6%] w-[38%] h-[2.5%] rounded"
                style={{ background: "#EAE5D9" }} />
              <div className="absolute right-[6%] top-[6%] text-[8px] font-mono" style={{ color: T.muted }}>
                {current.name}
              </div>

              <div className="absolute left-[6%] right-[6%] top-[52%] space-y-2">
                {lineItems.map((row, i) => (
                  <div key={i} className="flex justify-between text-[9px] pb-1.5 border-b border-dashed"
                    style={{ borderColor: "rgba(16,24,40,0.12)" }}>
                    <span style={{ color: T.muted }}>{row.desc}</span>
                    <span className="tabular-nums" style={{ color: T.ink }}>{fmtINR(row.amt)}</span>
                  </div>
                ))}
              </div>

              {fields.map((f) => {
                const isActive = activeField === f.key;
                const low = f.confidence < 0.75;
                return (
                  <button key={f.key}
                    onClick={() => { setActiveField(f.key); setEditField(f.key); }}
                    className="absolute transition-all group"
                    style={{
                      left: `${f.box.x}%`, top: `${f.box.y}%`,
                      width: `${f.box.w}%`, height: `${f.box.h}%`,
                      border: `1.5px ${isActive ? "solid" : "dashed"} ${isActive ? T.primary : low ? T.critical : "rgba(23,112,106,0.55)"}`,
                      background: isActive ? "rgba(23,112,106,0.10)" : "transparent",
                      borderRadius: 3,
                    }}
                    aria-label={`Jump to ${f.label}`}>
                    <span className="absolute -top-2 left-1 text-[8px] px-1 rounded font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition"
                      style={{ background: T.ink, color: "#fff" }}>{f.label}</span>
                  </button>
                );
              })}

              <div className="absolute left-[6%] top-[26%] text-[10px] font-medium" style={{ color: T.ink }}>
                {current.data?.customer_name}
              </div>
              <div className="absolute left-[6%] top-[35%] text-[9px] font-mono" style={{ color: T.muted }}>
                {current.data?.gstin ?? "27AABCA1234F1Z5"}
              </div>
              <div className="absolute right-[6%] top-[76%] text-[10px] tabular-nums" style={{ color: T.ink }}>
                {fmtINR((current.data?.total ?? 0) - (current.data?.gst ?? 0))}
              </div>
              <div className="absolute right-[6%] top-[82%] text-[10px] tabular-nums" style={{ color: T.ink }}>
                {fmtINR(current.data?.gst ?? 0)}
              </div>
              <div className="absolute right-[6%] top-[89%] text-[12px] font-bold tabular-nums" style={{ color: T.ink }}>
                {fmtINR(current.data?.total ?? 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-5 space-y-4"
          style={{ borderColor: T.border, background: T.surface }}>
          <AnimatePresence>
            {isDuplicate && !duplicateAck && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="rounded-lg p-3 flex items-start gap-2" style={{ background: T.watchSoft }}>
                <AlertTriangle size={16} color={T.watch} />
                <div className="flex-1 text-xs" style={{ color: T.watch }}>
                  <b>Possible duplicate.</b> Another invoice with the same total and customer exists.
                </div>
                <button onClick={() => setDuplicateAck(true)}
                  className="text-[10px] px-2 py-0.5 rounded border font-medium whitespace-nowrap"
                  style={{ borderColor: T.watch, color: T.watch }}>Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>

          {entitySuggestion && entityAccepted === null && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-3 flex items-center gap-2" style={{ background: T.primarySoft }}>
              <Users size={14} color={T.primary} />
              <div className="flex-1 text-xs" style={{ color: T.primary }}>
                Match found: <b>{entitySuggestion.name}</b>
              </div>
              <button onClick={() => { setEntityAccepted(true); toast.success("Linked to customer"); }}
                className="text-[10px] px-2 py-0.5 rounded font-medium text-white"
                style={{ background: T.primary }}>Accept</button>
              <button onClick={() => { setEntityAccepted(false); toast("Ignored"); }}
                className="text-[10px] px-2 py-0.5 rounded border font-medium"
                style={{ borderColor: T.border, color: T.muted }}>Reject</button>
            </motion.div>
          )}
          {entityAccepted === true && (
            <div className="text-[10px] flex items-center gap-1.5" style={{ color: T.good }}>
              <Check size={12} /> Linked to <b>{entitySuggestion?.name}</b>
            </div>
          )}

          <div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="font-display text-base">Extracted fields</div>
                <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                  {fields.length} fields ·{" "}
                  {fields.filter((f) => f.confidence >= 0.9).length} high confidence
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {fields.map((f) => {
                const editing = editField === f.key;
                const value = edits[f.key] ?? f.value;
                const low = f.confidence < 0.75;
                return (
                  <div key={f.key} onClick={() => setActiveField(f.key)}
                    className="rounded-lg border p-2.5 transition cursor-pointer"
                    style={{
                      borderColor: activeField === f.key ? T.primary : T.border,
                      background: activeField === f.key ? T.primarySoft : T.surface,
                    }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: T.muted }}>{f.label}</span>
                        <FieldConfidence value={f.confidence} />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setEditField(editing ? null : f.key); }}
                        className="text-[10px] flex items-center gap-1" style={{ color: T.primary }}>
                        <Edit3 size={10} /> {editing ? "Cancel" : "Edit"}
                      </button>
                    </div>
                    {editing ? (
                      <input autoFocus value={value}
                        onChange={(e) => setEdits((s) => ({ ...s, [f.key]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); setEditField(null); toast.success("Saved"); }
                        }}
                        className="w-full px-2 py-1 rounded border outline-none text-sm"
                        style={{ borderColor: T.primary, background: T.surface }} />
                    ) : (
                      <div className="text-sm tabular-nums" style={{ color: low ? T.critical : T.ink }}>{value}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: T.border }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>Amount distribution</div>
              {amountRange && (
                <button onClick={() => setAmountRange(null)}
                  className="text-[10px] flex items-center gap-1" style={{ color: T.primary }}>
                  <X size={10} /> clear
                </button>
              )}
            </div>
            <AmountHistogram values={allAmounts} active={amountRange}
              onBrush={(r) => {
                setAmountRange(r);
                if (r) toast.success(`Filtered queue to ${fmtShort(r[0])}–${r[1] === Infinity ? "∞" : fmtShort(r[1])}`);
              }} />
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: T.border }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirm}
              className="flex-1 min-w-[140px] py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-1.5"
              style={{ background: T.primary }}><Check size={14} /> Confirm & next</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={skip}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#F6F3EC]"
              style={{ borderColor: T.border, color: T.muted }}>Skip</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={flag}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 hover:bg-[#FEF4E6]"
              style={{ borderColor: T.border, color: T.watch }}><Flag size={14} /> Flag</motion.button>
          </div>

          {filteredQueue.length === 0 && (
            <div className="pt-3 border-t text-center" style={{ borderColor: T.border }}>
              <div className="font-display text-base mb-1">Queue clear.</div>
              <div className="text-xs" style={{ color: T.muted }}>{counts.cleared} of {queue.length} done.</div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 hidden sm:block pointer-events-none">
        <div className="px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] glass-3"
          style={{ color: T.muted }}>
          <Kbd>Enter</Kbd> confirm
          <span className="opacity-30">·</span>
          <Kbd>S</Kbd> skip
          <span className="opacity-30">·</span>
          <Kbd>F</Kbd> flag
          <span className="opacity-30">·</span>
          <Kbd>Esc</Kbd> back
        </div>
      </div>
    </div>
  );
}

function InvoiceReviewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-64 rounded" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="h-12 rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="h-[560px] rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
        <div className="h-[560px] rounded-2xl" style={{ background: "rgba(16,24,40,0.05)" }} />
      </div>
    </div>
  );
}

// ═══ [19] LEDGER ═══
function Ledger() {
  const nav = useNavigate();
  const { data: entities } = useEntities();
  const rows = useMemo(() => {
    const list = entities ?? [];
    return list.filter((e) => e.data?.created_by === "agent" || e.type === "invoice")
      .slice(0, 25)
      .map((e, i) => ({
        id: e.id,
        time: new Date(Date.now() - i * 3600_000).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        source: e.type === "invoice" ? "Collections Agent" : "Operations Agent",
        action: e.type === "invoice" ? `Detected overdue · ${e.name}` : e.name ?? "Action",
        rule: e.type === "invoice" ? "Invoice overdue > 15 days" : "Task escalated",
        approver: e.data?.created_by === "agent" ? "Auto" : "You",
        result: "Verified",
      }));
  }, [entities]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Action Ledger</h1>
          <p className="text-sm" style={{ color: T.muted }}>Every autonomous action, logged and verifiable.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.success("CSV export queued")}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}><Download size={12} /> Export CSV</button>
          <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 hover:bg-[#F6F3EC]"
            style={{ borderColor: T.border, color: T.muted }}><Share2 size={12} /> Share</button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden overflow-x-auto"
        style={{ borderColor: T.border, background: T.surface }}>
        <table className="w-full text-sm">
          <thead style={{ background: "#F6F3EC" }}>
            <tr className="text-left text-[10px] uppercase tracking-widest" style={{ color: T.muted }}>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Source</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Rule</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Approver</th>
              <th className="px-4 py-3 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                onClick={() => nav(`/money/invoices/${r.id}/review`)}
                className="border-t hover:bg-[#F6F3EC]/50 transition cursor-pointer"
                style={{ borderColor: T.border }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: T.muted }}>{r.time}</td>
                <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: T.muted }}>{r.source}</td>
                <td className="px-4 py-3">{r.action}</td>
                <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: T.muted }}>{r.rule}</td>
                <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: T.muted }}>{r.approver}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium flex items-center gap-1 w-fit"
                    style={{ background: T.goodSoft, color: T.good }}><Check size={10} /> {r.result}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══ [20] TRUST ═══
function Trust() {
  const [open, setOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const verify = () => {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); toast.success("Hash verified · matches"); }, 900);
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-tight mb-1">Trust</h1>
        <p className="text-sm" style={{ color: T.muted }}>Proof of every action. Verifiable.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: "Actions logged", value: "1,247", hint: "Last 30 days" },
          { label: "Verified", value: "100%", hint: "Zero mismatches" },
          { label: "Data sources", value: "8", hint: "Bank, GST, WhatsApp, Tally" },
          { label: "Uptime", value: "99.97%", hint: "Last 90 days" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="rounded-2xl border p-5"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: T.muted }}>{c.label}</div>
            <div className="text-3xl tracking-tight mb-1 tabular-nums" style={{ fontWeight: 700 }}>{c.value}</div>
            <div className="text-xs" style={{ color: T.muted }}>{c.hint}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: T.border, background: T.surface }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="font-display text-base mb-1">Verify action</div>
            <div className="text-sm" style={{ color: T.muted }}>Check any action against its cryptographic proof.</div>
          </div>
          <button onClick={() => setOpen((v) => !v)} className="text-sm px-4 py-2 rounded-lg font-medium text-white"
            style={{ background: T.primary }}>{open ? "Hide" : "Open proof drawer"}</button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-3 pt-4 border-t" style={{ borderColor: T.border }}>
                <div className="text-xs uppercase tracking-widest" style={{ color: T.muted }}>
                  Action: Invoice INV-104 escalated
                </div>
                <div className="p-3 rounded-lg font-mono text-xs break-all" style={{ background: "#F6F3EC" }}>
                  8f4a2b1c9e7d3f6a5b8c2e1d4f7a9b3c5e8d1f4a7b2c5e8d1f4a7b2c5e8d1f4a
                </div>
                <div className="text-xs" style={{ color: T.muted }}>
                  Timestamp: 2026-10-10T07:42:11+05:30 · Signer: BizOS Agent v1.2 · Chain: block #4821
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={verify} disabled={verifying || verified}
                  className="px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-1.5"
                  style={{ borderColor: verified ? T.good : T.border, color: verified ? T.good : T.ink }}>
                  {verifying ? <Loader2 size={14} className="animate-spin" /> : verified ? <Check size={14} /> : <ShieldCheck size={14} />}
                  {verifying ? "Verifying…" : verified ? "Verified · matches" : "Verify hash"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══ [21] IMPACT ═══
function Impact() {
  const { data: entities } = useEntities();
  const { approved } = useApprovals();
  const esg = (entities ?? []).find((e) => e.type === "esg_metric");
  const baseCoverage = esg?.data?.value ?? 68;
  const coverage = Math.min(100, baseCoverage + approved * 4);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-tight mb-1">Impact</h1>
        <p className="text-sm" style={{ color: T.muted }}>ESG coverage and business value unlocked.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Governance", value: Math.round(coverage), colour: coverage >= 75 ? T.good : T.watch },
          { label: "Environment", value: 42, colour: T.watch },
          { label: "Social", value: 61, colour: T.watch },
        ].map((g, i) => (
          <motion.div key={g.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border p-5 flex items-center gap-4"
            style={{ borderColor: T.border, background: T.surface }}>
            <EsgGauge value={g.value} colour={g.colour} label={`${g.label} coverage`} />
            <div>
              <div className="font-display text-lg">{g.label}</div>
              <div className="text-xs" style={{ color: T.muted }}>Coverage</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="rounded-2xl border p-6" style={{ borderColor: T.border, background: T.surface }}>
        <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted }}>
          Demo — approving an Inbox item grows coverage
        </div>
        <motion.div key={approved} initial={{ scale: 1.06 }} animate={{ scale: 1 }} className="mb-3">
          <span className="text-3xl tracking-tight tabular-nums" style={{ fontWeight: 700 }}>
            <AnimatedNumber value={approved} />
          </span>
          <span className="font-display text-2xl ml-2">approvals handled</span>
        </motion.div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
          onClick={() => toast.success(`Governance +4% → ${Math.min(100, coverage + 4)}%`)}
          className="text-sm px-4 py-2 rounded-lg font-medium text-white flex items-center gap-1.5"
          style={{ background: T.primary }}>
          <Check size={14} /> Simulate INV-104 approval
        </motion.button>
        <div className="text-xs mt-3" style={{ color: T.muted }}>Each approval increases governance coverage by 4%.</div>
      </div>
    </div>
  );
}

// ═══ [22] CUSTOMERS ═══
function Customers() {
  const { data: entities, loading } = useEntities();
  const [filter, setFilter] = useState("");
  if (loading) return <div className="text-sm" style={{ color: T.muted }}>Loading…</div>;
  const customers = (entities ?? []).filter((e) => e.type === "customer")
    .filter((c) => !filter || (c.name ?? "").toLowerCase().includes(filter.toLowerCase()));
  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight mb-1">Customers</h1>
          <p className="text-sm" style={{ color: T.muted }}>{customers.length} active relationships</p>
        </div>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search customers…"
          className="px-3 py-2 rounded-lg border outline-none text-sm w-full sm:w-64"
          style={{ borderColor: T.border, background: T.surface }} />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {customers.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3) }}
            whileHover={{ y: -2, boxShadow: "0 12px 40px -12px rgba(16,24,40,0.15)" }}
            className="rounded-2xl border p-5 transition-all cursor-pointer"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-sm truncate">{c.name}</div>
              {c.data?.tier === "top5" && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                  style={{ background: "rgba(242,163,58,0.12)", color: T.accent }}>Top 5</span>
              )}
            </div>
            <div className="text-xs space-y-1" style={{ color: T.muted }}>
              {c.data?.city && <div className="flex items-center gap-1.5"><Building2 size={11} />{c.data.city}</div>}
              {c.data?.lifetime_value && <div>LTV {fmtINR(c.data.lifetime_value)}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══ [23] TASKS ═══
function Tasks() {
  const { data: entities, loading } = useEntities();
  if (loading) return <div className="text-sm" style={{ color: T.muted }}>Loading…</div>;
  const tasks = (entities ?? []).filter((e) => e.type === "task");
  const columns = [
    { id: "open", label: "Open", colour: T.watch },
    { id: "in_progress", label: "In progress", colour: T.primary },
    { id: "completed", label: "Done", colour: T.good },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight mb-6">Work</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const list = tasks.filter((t) => t.data?.status === col.id || (col.id === "open" && !t.data?.status));
          return (
            <div key={col.id}>
              <div className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: T.muted }}>
                <span className="w-2 h-2 rounded-full" style={{ background: col.colour }} />
                {col.label} · {list.length}
              </div>
              <div className="space-y-2">
                {list.slice(0, 10).map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px -12px rgba(16,24,40,0.15)" }}
                    className="rounded-xl border p-4 transition-all cursor-pointer"
                    style={{ borderColor: T.border, background: T.surface }}>
                    <div className="flex items-center justify-between mb-2">
                      <SeverityPill severity={t.data?.priority === "high" ? "critical" : t.data?.priority === "medium" ? "watch" : "good"} />
                      <span className="text-[10px] tabular-nums" style={{ color: T.muted }}>{t.data?.due_date ?? "—"}</span>
                    </div>
                    <div className="text-sm font-medium mb-1">{t.name}</div>
                    <div className="text-xs flex items-center gap-1.5" style={{ color: T.muted }}>
                      <Users size={11} /> {t.data?.owner ?? "—"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══ [24] LIVE ═══
function Live() {
  const { data: entities } = useEntities();
  const recent = (entities ?? []).slice(0, 20);
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-3xl tracking-tight">Live</h1>
        <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
          style={{ background: T.goodSoft, color: T.good }}>
          <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full" style={{ background: T.good }} />
          Live
        </span>
      </div>
      <div className="space-y-2">
        {recent.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
            className="rounded-xl border p-3 flex items-center justify-between hover:bg-[#F6F3EC]/40 transition"
            style={{ borderColor: T.border, background: T.surface }}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F6F3EC", color: T.muted }}>{e.type}</span>
              <span className="text-sm truncate">{e.name}</span>
            </div>
            <span className="text-xs font-mono whitespace-nowrap" style={{ color: T.muted }}>{i * 3}s ago</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══ [25] SETTINGS ═══
function Settings() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight mb-6">Settings</h1>
      <div className="rounded-2xl border p-6 text-sm"
        style={{ borderColor: T.border, background: T.surface, color: T.muted }}>
        Business profile, team, integrations. Coming soon.
      </div>
    </div>
  );
}

// ═══ [26] COPILOT ═══
function CopilotDrawer({ open, onClose, context }: { open: boolean; onClose: () => void; context: string }) {
  const [messages, setMessages] = useState<{ role: "user" | "copilot"; text: string }[]>([
    { role: "copilot", text: "Hi Rajesh. You have 1 exception today — INV-104 overdue 35 days." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const send = (override?: string) => {
    const q = (override ?? input).trim();
    if (!q || thinking) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [...m, { role: "copilot", text: "Looking into that…" },
        { role: "copilot", text: "Nothing else. You're clear." }]);
    }, 900);
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col glass-3"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.75)" }}
            role="dialog" aria-label="Copilot">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: T.primarySoft }}>
                  <Sparkles size={16} color={T.primary} />
                </div>
                <div>
                  <div className="font-display text-base">Copilot</div>
                  <div className="text-xs" style={{ color: T.muted }}>Context: {context}</div>
                </div>
              </div>
              <button onClick={onClose} className="hover:opacity-60" aria-label="Close copilot"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`text-sm p-3 rounded-2xl max-w-[85%] ${m.role === "user" ? "ml-auto text-white" : ""}`}
                  style={m.role === "user" ? { background: T.primary } : { background: "#F6F3EC" }}>
                  {m.text}
                  {m.role === "copilot" && i === 0 && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: T.border }}>
                      <Sparkline data={[4, 6, 5, 8, 7, 9, 6, 5, 7, 6, 4, 5]} colour={T.critical} width={160} height={28} fill />
                      <div className="text-[10px] mt-1" style={{ color: T.muted }}>Overdue invoices · last 12 weeks</div>
                    </div>
                  )}
                </motion.div>
              ))}
              {thinking && (
                <div className="flex items-center gap-1 text-xs" style={{ color: T.muted }}>
                  {[0, 0.2, 0.4].map((d) => (
                    <motion.span key={d} animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d }}>●</motion.span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t" style={{ borderColor: T.border }}>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {["What needs me today?", "Show overdue", "Draft reminder"].map((q) => (
                  <button key={q} onClick={() => send(q)}
                    className="text-[11px] px-2 py-1 rounded-full border hover:bg-white/60"
                    style={{ borderColor: T.border, color: T.muted }}>{q}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask anything…"
                  className="flex-1 px-3 py-2 rounded-xl border outline-none text-sm"
                  style={{ borderColor: T.border, background: "rgba(255,255,255,0.7)" }} />
                <button onClick={() => send()} disabled={thinking}
                  className="px-4 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                  style={{ background: T.primary }}>Send</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══ [27] AUTHED ═══
function Authed() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [inboxBadge, setInboxBadge] = useState(3);
  const [approved, setApproved] = useState(0);

  useEffect(() => {
    if (isDemoMode()) { setMe(DEMO_USER as Me); setLoading(false); return; }
    const unsub: () => void = onAuthStateChanged(auth, (u: User | null) => {
      if (!u) { nav("/login"); return; }
      api.get<Me>("/me").then(({ data }) => setMe(data)).catch(() => nav("/login")).finally(() => setLoading(false));
    });
    return () => { unsub(); };
  }, [nav]);

  const approvalState = useMemo(
    () => ({ approved, bump: () => setApproved((n) => n + 1), reset: () => setApproved(0) }),
    [approved],
  );

  if (loading || !me) return <div className="min-h-screen" style={{ background: T.canvas }} />;
  if (!me.onboarding_completed) {
    return <Onboarding onDone={(name, city) => setMe({ ...me, business_name: name, city, onboarding_completed: true })} />;
  }

  return (
    <ApprovalCtx.Provider value={approvalState}>
      <Shell me={me} onLogout={logOut} onCopilot={() => setCopilotOpen(true)} badges={{ inbox: inboxBadge }}>
        <Routes>
          <Route path="/" element={<Home me={me} onNavigate={nav} inboxBadge={inboxBadge} />} />
          <Route path="/inbox" element={<Inbox onCountChange={setInboxBadge} />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/money/invoices/:id/review" element={<InvoiceReview />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/live" element={<Live />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
      <CopilotDrawer open={copilotOpen} onClose={() => setCopilotOpen(false)} context="Home" />
    </ApprovalCtx.Provider>
  );
}

// ═══ [28] APP ═══
function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    if (isDemoMode()) { setAuthed(true); return; }
    const unsub: () => void = onAuthStateChanged(auth, (u: User | null) => setAuthed(!!u));
    return () => { unsub(); };
  }, []);
  if (authed === null) return <div style={{ background: T.canvas, minHeight: "100vh" }} />;
  if (!authed) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }
  return <Routes><Route path="/*" element={<Authed />} /></Routes>;
}

// ═══ [29] BOOT ═══
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="bottom-right" toastOptions={{
        className: "glass-3",
        style: { color: T.ink, borderRadius: 12, fontSize: 13, border: "none", background: "transparent" },
      }} />
    </BrowserRouter>
  </StrictMode>,
);