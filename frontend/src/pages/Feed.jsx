import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import ExperienceCard from "../components/ExperienceCard";
import { useSearchParams } from "react-router-dom";
import CompanyLogo from "../components/CompanyLogo";

import {
  COMPANY_FILTERS,
  ROLE_FILTERS,
  TOPIC_FILTERS,
  PATTERN_FILTERS,
} from "../services/filter";

import { getCompanyKey } from "../services/normalize";


/* ================= PUSH HELPERS ================= */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
const LIMIT = 10;

/* ========================================================= */

export default function Feed() {
  const [data, setData] = useState([]);
  const [locked, setLocked] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [followLoaded, setFollowLoaded] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [showPushUI, setShowPushUI] = useState(false);

  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const targetPostId = searchParams.get("post");
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const fetchingCursorRef = useRef(null);
  const navigate = useNavigate();

  /* ================= SERVICE WORKER ================= */
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("✅ SW registered"))
      .catch((err) => console.error("❌ SW failed", err));
  }, []);

  /* ================= SCROLL TO POST ================= */
  useEffect(() => {
    if (!targetPostId || data.length === 0) return;
    const el = document.getElementById(`post-${targetPostId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    el.classList.add("ring-2", "ring-primary");
    setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 1800);
  }, [targetPostId, data]);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    company: "", role: "", topic: "", pattern: "",
    minSalary: "", maxSalary: "", search: "",
  });

  /* ================= FETCH FEED ================= */

  const loadInitialFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/experience", {
        params: { limit: LIMIT }, silent: true,
      });
      const rawData = res.data.data || [];
      const filtered = rawData.filter(exp => 
        exp.author && 
        exp.author.email && 
        exp.author.email !== 'UNKNOWN' && 
        exp.author.email !== 'null'
      );
      setData(filtered);
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Feed load failed", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadInitialFeed(); }, []);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    if (fetchingCursorRef.current === cursor) return;
    fetchingCursorRef.current = cursor;
    setLoadingMore(true);
    try {
      const res = await api.get("/api/experience", {
        params: { cursor, limit: LIMIT }, silent: true,
      });
      if (!res.data.data?.length) { setHasMore(false); return; }
      setData(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const newItems = res.data.data.filter(item => !existingIds.has(item._id));
        return [...prev, ...newItems];
      });
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch {
      setHasMore(false);
    } finally { setLoadingMore(false); }
  };

  useEffect(() => {
    if (!hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, cursor]);

  /* ================= FOLLOWED COMPANIES ================= */
  useEffect(() => {
    if (!token) { setFollowLoaded(true); return; }
    api
      .get("/api/users/followed/companies", { silent: true })
      .then((res) => setFollowedCompanies((res.data || []).map(getCompanyKey)))
      .catch(() => {})
      .finally(() => setFollowLoaded(true));
  }, []);

  /* ================= PUSH ================= */
  const enablePushFromUI = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await api.post("/api/push/subscribe", sub);
      setShowPushUI(false);
    } catch (err) { console.error("Push failed", err); }
  };

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const check = async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (Notification.permission === "default" || (Notification.permission === "granted" && !sub))
        setShowPushUI(true); else setShowPushUI(false);
    };
    check();
  }, []);

  /* ================= DAILY CLAIM ================= */
  useEffect(() => {
    if (!token) return;
    api.post("/api/shop/claim", {}, { silent: true })
      .then(() => { setDailyClaimed(true); setTimeout(() => setDailyClaimed(false), 3000); })
      .catch(() => {});
  }, []);

  /* ================= FILTER ================= */
  const applyQuickFilter = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    if ("search" in newFilters) return;
    const { search, ...backendFilters } = updated;
    setLoading(true);
    api
      .get("/api/experience/filter", {
        params: backendFilters, silent: true,
      })
      .then((res) => {
        setData(res.data || []); setLocked(false); setCursor(null); setHasMore(false);
        toast.success("Filters applied");
      })
      .catch((err) => {
        // Fallback to client-side filtering
        let filtered = [...data];
        if (backendFilters.company) filtered = filtered.filter(f => getCompanyKey(f.company) === getCompanyKey(backendFilters.company));
        if (backendFilters.role) filtered = filtered.filter(f => f.role?.toLowerCase() === backendFilters.role?.toLowerCase());
        if (backendFilters.topic) filtered = filtered.filter(f => f.topics?.includes(backendFilters.topic));
        if (backendFilters.pattern) filtered = filtered.filter(f => f.dsaPatterns?.includes(backendFilters.pattern));
        setData(filtered);
        setHasMore(false);
        toast.info("Offline filtering applied");
      })
      .finally(() => setLoading(false));
  };

  const clearFilter = () => {
    setFilters({ company: "", role: "", topic: "", pattern: "", minSalary: "", maxSalary: "", search: "" });
    loadInitialFeed(); setMobileFilterOpen(false);
  };

  const hasActiveFilter = filters.company || filters.role || filters.topic || filters.pattern || filters.minSalary;

  /* ================= RENDER ================= */
  return (
    <>
      {/* Skeleton Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto pt-8 px-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-[#201f1f] border border-[#484847]/10 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton-circle w-10 h-10" />
                  <div className="space-y-2 flex-1">
                    <div className="skeleton-text w-32" />
                    <div className="skeleton-text w-48" />
                  </div>
                </div>
                <div className="skeleton h-20 w-full" />
                <div className="flex gap-2">
                  <div className="skeleton-text w-16" />
                  <div className="skeleton-text w-20" />
                  <div className="skeleton-text w-12" />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Claim */}
      <AnimatePresence>
        {dailyClaimed && (
          <motion.div key="daily-claim" className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.75, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }} className="relative z-10">
              <div className="rounded-3xl bg-gradient-to-br from-[#ff9f4a] via-[#fd8b00] to-[#ffa52a] p-[2px] shadow-2xl">
                <div className="relative overflow-hidden rounded-3xl bg-[#0e0e0e] px-8 py-7 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff9f4a]/20 text-[#ff9f4a]">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white">Daily Reward Claimed</h3>
                  <p className="mt-1 text-sm text-[#adaaaa]">Thanks for coming back today</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <span className="rounded-full bg-[#ff9f4a]/15 px-3 py-1 text-xs font-bold text-[#ff9f4a]">+1 Coin</span>
                    <span className="rounded-full bg-[#fd8b00]/15 px-3 py-1 text-xs font-bold text-[#fd8b00]">+5 Points</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ MAIN SINGLE COL LAYOUT ═══════════ */}
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-6">
        
        {/* ── STICKY HORIZONTAL FILTER BAR ── */}
        <div className="sticky top-20 z-30 mb-8 rounded-2xl bg-[#0e0e0e]/80 p-4 backdrop-blur-xl border border-white/5 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767575] text-sm">search</span>
              <input
                className="w-full bg-[#131313] border-none rounded-xl pl-10 py-3 text-sm text-white focus:ring-1 focus:ring-[#ff9f4a] placeholder:text-[#767575] transition-shadow"
                placeholder="Search experiences..."
                value={filters.search}
                onChange={(e) => applyQuickFilter({ search: e.target.value })}
              />
            </div>
            <div className="hidden lg:flex shrink-0">
               <button onClick={() => setMobileFilterOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#201f1f] px-4 py-3 text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2c2c2c] transition-colors border border-white/5">
                 <span className="material-symbols-outlined text-lg">tune</span> Detailed Filters
               </button>
            </div>
          </div>
          
          <div className="hidden lg:block overflow-x-auto hover-scrollbar pb-2">
            <Filters filters={filters} apply={applyQuickFilter} horizontal />
          </div>
          {hasActiveFilter && (
            <div className="hidden lg:flex justify-end mt-2">
              <button className="text-[10px] font-bold uppercase tracking-widest text-[#ff9f4a] hover:underline" onClick={clearFilter}>
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ── CENTRAL FEED ── */}
        <section className="space-y-6">
          <div className="flex justify-between items-end mb-2 px-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Recent Experiences</h1>
            <div className="flex space-x-4 text-xs font-bold text-[#adaaaa] uppercase tracking-widest">
              <button className="text-[#ff9f4a] border-b border-[#ff9f4a]">Latest</button>
              <button className="hover:text-[#ff9f4a] transition-colors">Popular</button>
            </div>
          </div>

          <AnimatePresence>
            {followLoaded && data.length === 0 && !loading && (
              <EmptyFeed onReset={clearFilter} />
            )}
            {followLoaded && data.map((exp) => {
              const companyKey = getCompanyKey(exp.company);
              const isFollowing = followedCompanies.includes(companyKey);
              return (
                <motion.div key={exp._id} id={`post-${exp._id}`} style={{ scrollMarginTop: "110px" }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
                  <ExperienceCard exp={exp} compact isFollowing={isFollowing}
                    onFollowChange={(company, followed) => {
                      const key = getCompanyKey(company);
                      setFollowedCompanies((prev) =>
                        followed ? [...new Set([...prev, key])] : prev.filter((c) => c !== key)
                      );
                    }} />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {hasMore && (
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {loadingMore && <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#adaaaa] border-t-transparent" />}
            </div>
          )}
          {!hasMore && data.length > 0 && (
            <p className="text-center text-xs text-[#adaaaa] py-6 mb-12">You've reached the end</p>
          )}
        </section>
      </main>

      {/* ═══════════ FAB ═══════════ */}
      <button
        onClick={() => navigate("/app/forum")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#ff9f4a] to-[#fd8b00] rounded-full flex items-center justify-center shadow-2xl text-[#180800] hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
        <span className="absolute right-full mr-4 bg-[#201f1f] px-3 py-2 rounded-lg text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Create Post
        </span>
      </button>

      {/* ═══════════ MOBILE FILTER ═══════════ */}
      <div className="lg:hidden fixed bottom-20 right-5 z-40">
        <button onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 rounded-xl molten-gradient px-4 py-2.5 text-[#180800] text-xs font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-lg">tune</span> Filters
        </button>
      </div>
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40" onClick={() => setMobileFilterOpen(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] rounded-t-2xl bg-[#131313] p-6 overflow-y-auto border-t border-white/5">
              <Filters filters={filters} apply={applyQuickFilter} />
              <div className="mt-8 flex flex-col gap-3">
                <button 
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest text-[#180800] molten-gradient rounded-xl shadow-lg" 
                  onClick={() => setMobileFilterOpen(false)}
                >
                  View Results
                </button>
                {hasActiveFilter && (
                  <button className="w-full py-3 text-xs font-bold uppercase tracking-widest text-[#ff9f4a] bg-[#201f1f] rounded-xl" onClick={clearFilter}>
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════ FILTER COMPONENTS ═══════════ */

function Filters({ filters, apply, horizontal = false }) {
  const q = filters.search?.toLowerCase() || "";
  const filterList = (list) => list.filter((item) => item.toLowerCase().includes(q));

  const content = (
    <>
      <FilterSection title="Company" horizontal={horizontal}>
        {filterList(COMPANY_FILTERS).map((c) => {
          const isActive = filters.company === c;
          return (
            <FilterPill key={c} active={isActive} onClick={() => apply({ company: isActive ? "" : c })}>
              {c}
            </FilterPill>
          );
        })}
      </FilterSection>
      <FilterSection title="Role" horizontal={horizontal}>
        {filterList(ROLE_FILTERS).map((r) => {
          const isActive = filters.role === r;
          return <FilterPill key={r} active={isActive} onClick={() => apply({ role: isActive ? "" : r })}>{r}</FilterPill>
        })}
      </FilterSection>
      <FilterSection title="Topic" horizontal={horizontal}>
        {filterList(TOPIC_FILTERS).map((t) => {
          const isActive = filters.topic === t;
          return <FilterPill key={t} active={isActive} onClick={() => apply({ topic: isActive ? "" : t })}>{t}</FilterPill>
        })}
      </FilterSection>
      <FilterSection title="Pattern" horizontal={horizontal}>
        {filterList(PATTERN_FILTERS).map((p) => {
          const isActive = filters.pattern === p;
          return <FilterPill key={p} active={isActive} onClick={() => apply({ pattern: isActive ? "" : p })}>{p}</FilterPill>
        })}
      </FilterSection>
    </>
  );

  return horizontal ? (
    <div className="flex gap-8 whitespace-nowrap">{content}</div>
  ) : (
    <div className="space-y-6">{content}</div>
  );
}

function FilterSection({ title, children, horizontal }) {
  return (
    <div className={horizontal ? "inline-flex items-center gap-3" : ""}>
      <span className={`text-[10px] font-bold uppercase tracking-tighter text-[#ff9f4a] ${horizontal ? "shrink-0" : "block mb-3"}`}>{title}</span>
      <div className={`flex flex-wrap gap-2 ${horizontal ? "flex-nowrap" : ""}`}>{children}</div>
    </div>
  );
}

function FilterPill({ children, active, onClick }) {
  return (
    <button
      className={`relative px-3 py-1 text-xs rounded-full cursor-pointer transition-colors ${
        active
          ? "text-[#ffc78a]"
          : "bg-[#201f1f] text-[#adaaaa] hover:bg-[#2c2c2c]"
      }`}
      onClick={onClick}
    >
      {active && (
        <motion.div
          layoutId="filter-pill"
          className="absolute inset-0 bg-[#875200]/20 rounded-full -z-10"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      {children}
    </button>
  );
}

function EmptyFeed({ onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="relative mt-12 flex justify-center">
      <div className="relative z-10 max-w-md rounded-2xl bg-[#201f1f] border border-white/5 px-8 py-12 text-center">
        <span className="material-symbols-outlined text-[#ff9f4a]/40 text-6xl block mb-4" style={{ fontVariationSettings: "'wght' 200" }}>search_off</span>
        <h3 className="text-xl font-bold tracking-tight text-white">No experiences found</h3>
        <p className="mt-2 text-sm text-[#adaaaa]">Be the first to explore and share experiences</p>
        <button onClick={onReset} className="mt-6 px-7 py-3 molten-gradient text-[#180800] text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform active:scale-95">
          Reset filters
        </button>
      </div>
    </motion.div>
  );
}
