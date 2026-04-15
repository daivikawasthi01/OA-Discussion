import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import api from "../services/api";

/* ── useCountUp hook ── */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!target) return;
    let start = 0;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return value;
}

/* ── CountUpDisplay component ── */
function CountUpDisplay({ value, className }) {
  const count = useCountUp(value);
  return <span className={className}>{count.toLocaleString()}</span>;
}

// Moved outside component — static constant, no need to redefine on every render
const CATEGORY_MAP = {
  "DSA": ["Algorithms", "Data Structures", "Dynamic Programming", "Graph Traversal", "Sliding Window", "Trees", "Trie", "Backtracking"],
  "System Design": ["Distributed Systems", "Low-latency", "System Design", "Low-level Design", "Concurrency", "Database"],
  "HR": ["Behavioral", "Leadership Principles", "HR", "Culture Fit"]
};

export default function Leaderboard() {
  const token = localStorage.getItem("token");
  const [leaderboard, setLeaderboard] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [range, setRange] = useState("WEEKLY");
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Overall");

  useEffect(() => {
    const fetchEverything = async () => {
      setLoading(true);
      try {
        const [lbRes, postsRes] = await Promise.all([
          api.get("/api/users/leaderboard", {
            params: { range: range.toLowerCase() },
            silent: true
          }),
          api.get("/api/experience", {
            params: { limit: 1000 },
            silent: true
          })
        ]);

        const arr = Array.isArray(lbRes.data) ? lbRes.data : (lbRes.data?.data || []);
        setLeaderboard(arr);

        const postsArr = postsRes.data?.data || [];
        setAllPosts(postsArr);
      } catch (err) {
        console.error("Fetch failed", err);
        setLeaderboard([]);
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, [range, token]);

  const filteredLeaderboard = useMemo(() => {
    if (category === "Overall" || !allPosts.length) return [...leaderboard];

    const keywords = CATEGORY_MAP[category] || [];

    return leaderboard
      .filter(user => {
        if (user.dominantCategory === category) return true;

        const userPosts = allPosts.filter(p =>
          (p.author?._id === user._id) ||
          (p.user?._id === user._id) ||
          (p.author?.email === user.email) ||
          (p.user?.email === user.email)
        );

        if (userPosts.length === 0) return false;

        return userPosts.some(p => {
          const combined = [
            ...(p.topics || []),
            ...(p.questionPatterns || []),
            ...(p.dsaPatterns || [])
          ].map(t => t.toLowerCase());
          return keywords.some(k => combined.some(c => c.includes(k.toLowerCase())));
        });
      })
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [leaderboard, allPosts, category]);

  const top3 = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const categories = ["Overall", "DSA", "System Design", "HR"];

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pt-8 pb-24 px-6 lg:px-12 max-w-5xl mx-auto space-y-8"
    >
      <div className="flex-1 space-y-8 min-w-0">
        <section className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-[-0.04em] text-white">
            The High Table
          </h1>
          <p className="text-[#adaaaa] text-lg max-w-2xl">
            Recognizing the architects of discourse. The most influential
            contributors driving the future of technical narrative.
          </p>
        </section>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-none relative">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`relative px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                category === cat ? "text-[#180800]" : "text-[#adaaaa] hover:text-white"
              }`}
            >
              {category === cat && (
                <motion.div
                  layoutId="cat-pill"
                  className="absolute inset-0 bg-[#ff9f4a] rounded-full"
                  style={{ zIndex: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-[300px] w-full" />
            ))}
          </div>
        ) : filteredLeaderboard.length > 0 ? (
          <section key={category} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {podiumOrder.map((user, idx) => {
              if (!user) return null;
              const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const isFirst = rank === 1;
              const delays = [0, 0.15, 0.3];
              return (
                <motion.div
                  key={user._id || rank}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    ...(isFirst ? { scale: [1, 1.02, 1] } : {}),
                  }}
                  transition={{
                    delay: delays[idx],
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className={`${
                    isFirst ? "order-1 md:order-2" : idx === 0 ? "order-2 md:order-1" : "order-3"
                  } bg-[#201f1f] rounded-xl ${
                    isFirst ? "p-10 ring-1 ring-[#ff9f4a]/20" : "p-8"
                  } flex flex-col items-center justify-center space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
                  style={isFirst ? { boxShadow: "0 0 48px rgba(255,140,0,0.04)" } : {}}
                >
                  {isFirst && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#ff9f4a]/10 to-transparent" />
                  )}
                  <div className="relative">
                    <div
                      className={`${isFirst ? "w-32 h-32" : "w-24 h-24"} rounded-full p-1 ${
                        isFirst ? "molten-gradient" : "bg-[#262626]"
                      }`}
                    >
                      <div className="w-full h-full rounded-full bg-[#201f1f] flex items-center justify-center text-2xl font-bold text-white border-4 border-[#201f1f]">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    </div>
                    <div
                      className={`absolute -bottom-2 -right-2 ${
                        isFirst
                          ? "molten-gradient text-[#180800] w-14 h-14 text-2xl shadow-xl shadow-[#ff9f4a]/20"
                          : rank === 2
                          ? "bg-slate-400 text-[#0e0e0e] w-10 h-10 text-lg"
                          : "bg-orange-800 text-white w-10 h-10 text-lg"
                      } rounded-full flex items-center justify-center font-black border-4 border-[#201f1f]`}
                    >
                      {rank}
                    </div>
                  </div>
                  <div className="text-center relative z-10">
                    <h3 className={`${isFirst ? "text-2xl" : "text-xl"} font-bold tracking-tight`}>
                      {user.name || "Curator"}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-[#adaaaa]">
                      @{user.email?.split("@")[0] || "curator"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center relative z-10">
                    <CountUpDisplay
                      value={user.points || 0}
                      className={`${isFirst ? "text-5xl text-[#ff9f4a]" : rank === 2 ? "text-3xl text-slate-300" : "text-3xl text-orange-700/80"} font-black`}
                    />
                    <span className="text-[10px] uppercase tracking-widest text-[#adaaaa]">
                      Kinetic Points
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-[#484847] text-6xl mb-4">group_off</span>
            <h3 className="text-white font-bold text-xl mb-2">No contributors yet</h3>
            <p className="text-[#adaaaa] text-sm">Be the first to post a {category} experience</p>
          </div>
        )}

        {/* Contribution Density Chart */}
        <section className="bg-[#131313] rounded-xl p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-xs uppercase tracking-[0.2em] text-[#adaaaa]">
                Weekly Velocity
              </h2>
              <p className="text-2xl font-bold text-white">Contribution Density</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setRange("WEEKLY")}
                className={`h-10 w-24 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${range === "WEEKLY" ? "bg-[#ff9f4a]/10 text-[#ff9f4a] ring-1 ring-[#ff9f4a]/20" : "bg-[#201f1f] text-[#adaaaa]"}`}
              >
                WEEKLY
              </button>
              <button
                onClick={() => setRange("MONTHLY")}
                className={`h-10 w-24 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${range === "MONTHLY" ? "bg-[#ff9f4a]/10 text-[#ff9f4a] ring-1 ring-[#ff9f4a]/20" : "bg-[#201f1f] text-[#adaaaa]"}`}
              >
                MONTHLY
              </button>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-3 pt-4">
            {[30, 45, 25, 60, 85, 100, 55, 40, 35, 50, 45, 30].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full ${
                  i < 6 ? "molten-gradient" : "bg-[#262626]"
                }`}
                style={{
                  height: `${h}%`,
                  opacity: i < 6 ? 0.2 + i * 0.16 : 1,
                  boxShadow: i === 5 ? "0 0 24px rgba(255,159,74,0.3)" : "none",
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#adaaaa] pt-2">
            <span>Oct 01</span>
            <span>Oct 15</span>
            <span>Oct 31</span>
          </div>
        </section>

        {/* Rankings Table */}
        <section className="bg-[#131313] rounded-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-[#484847]/10 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">The Rankings</h2>
            <div className="flex items-center space-x-2 text-[#adaaaa] text-sm">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="uppercase tracking-widest text-xs">Filter by category</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-[#adaaaa] border-b border-[#484847]/5">
                  <th className="px-8 py-5 font-semibold">Rank</th>
                  <th className="px-8 py-5 font-semibold">User</th>
                  <th className="px-8 py-5 font-semibold">Activity</th>
                  <th className="px-8 py-5 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#484847]/5">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-8 py-4">
                        <div className="h-16 w-full bg-[#201f1f] rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filteredLeaderboard.length > 0 ? (
                  rest.map((user, i) => (
                    <tr key={user._id || i} className="group hover:bg-[#2c2c2c] transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-lg font-black text-[#adaaaa] group-hover:text-[#ff9f4a] transition-colors">
                          {String(i + 4).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-sm font-bold text-white">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-white">{user.name || "Curator"}</div>
                            <div className="text-xs text-[#adaaaa]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-1">
                          {[0.4, 0.8, 0.2, 0.6, 0.3].map((op, j) => (
                            <span key={j} className="w-2 h-2 rounded-full bg-[#ff9f4a]" style={{ opacity: op }} />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <CountUpDisplay
                          value={user.points || 0}
                          className="font-bold text-lg text-white"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-[#adaaaa]">
                      No rankings available for this category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Your Rank Sticky Footer ── */}
      {(() => {
        const email = localStorage.getItem("email");
        if (!email) return null;
        const idx = filteredLeaderboard.findIndex(
          (u) => u.email === email || u.name === email
        );
        if (idx === -1) return null;
        const me = filteredLeaderboard[idx];
        return (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 bg-[#131313]/80 backdrop-blur-xl border-t border-[#484847]/20 py-5 px-8 z-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff9f4a] font-black">
                  Current Rank {category !== "Overall" && `in ${category}`}
                </span>
                <span className="text-white font-black text-2xl">#{idx + 1}</span>
              </div>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] font-bold">
                  Curator
                </span>
                <span className="text-white font-bold">{me.name}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] font-bold">
                Balance
              </span>
              <span className="text-[#ff9f4a] font-black text-xl">
                {(me.points || 0).toLocaleString()} <span className="text-xs ml-1">KINETIC PTS</span>
              </span>
            </div>
          </motion.div>
        );
      })()}
    </motion.main>
  );
}