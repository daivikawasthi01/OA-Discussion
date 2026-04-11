import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ExperienceCard from "../components/ExperienceCard";

export default function Bookmarks() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Also grab local optimistic bookmarks 
    const local = JSON.parse(localStorage.getItem("localBookmarks") || "[]");
    
    axios
      .get("https://oadiscussion.onrender.com/api/experience/bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
        silent: true,
      })
      .then((res) => {
        const backendBookmarks = res.data || [];
        // Merge without duplicates
        const merged = [...backendBookmarks];
        local.forEach(lb => {
          if (!merged.find(m => m._id === lb._id)) {
            merged.push(lb);
          }
        });
        setBookmarks(merged);
      })
      .catch(() => {
        // Fallback to purely local if backend 404s
        setBookmarks(local);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUnbookmark = (id) => {
    setBookmarks((prev) => prev.filter((b) => b._id !== id));
    // also remove from local 
    const stored = JSON.parse(localStorage.getItem("localBookmarks") || "[]");
    localStorage.setItem("localBookmarks", JSON.stringify(stored.filter(e => e._id !== id)));
  };

  const filtered = bookmarks.filter((exp) => {
    // Client-side ghost filter
    if (!exp.author || (exp.author.email && (exp.author.email === 'UNKNOWN' || exp.author.email === 'null'))) {
      return false;
    }

    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (exp.company || "").toLowerCase().includes(q) ||
      (exp.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pt-8 pb-12 px-6 lg:px-12 max-w-4xl mx-auto space-y-8"
    >
      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 w-full" />
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Saved Experiences
            </h1>

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#767575] text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search by company or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#131313] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#767575] border border-[#484847]/10 focus:border-[#ff9f4a]/30 focus:outline-none transition-colors"
              />
            </div>

            {filtered.length > 0 ? (
              filtered.map((exp) => (
                <ExperienceCard
                  key={exp._id}
                  exp={{ ...exp, isBookmarked: true }}
                  variant="compact"
                  onUnbookmark={handleUnbookmark}
                />
              ))
            ) : (
              <p className="text-[#adaaaa] text-center py-12">
                No bookmarks match "{search}"
              </p>
            )}
          </div>
        ) : (
          /* ═══ EMPTY STATE ═══ */
          <div className="flex flex-col items-center justify-center text-center py-8">
            {/* Bookmark Icon */}
            <div className="relative mb-8">
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[#201f1f] to-[#131313] flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#ff9f4a] text-7xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bookmark
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              No saved experiences
            </h1>
            <p className="text-[#adaaaa] text-lg max-w-lg leading-relaxed mb-10">
              Curate your kinetic library. Save technical insights, market
              comparisons, and discussions to revisit them later.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <button
                onClick={() => navigate("/app/feed")}
                className="molten-gradient text-[#180800] font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
              >
                Browse the Feed
                <span className="material-symbols-outlined text-lg">rss_feed</span>
              </button>
              <button
                onClick={() => navigate("/trending")}
                className="bg-[#201f1f] text-white font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-[#262626] transition-all"
              >
                See What's Trending
                <span className="material-symbols-outlined text-lg">trending_up</span>
              </button>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {[
                {
                  icon: "rss_feed",
                  title: "Browse the Feed",
                  desc: "Discover real interview experiences from candidates across top tech companies.",
                  onClick: () => navigate("/app/feed"),
                },
                {
                  icon: "trending_up",
                  title: "See What's Trending",
                  desc: "Explore the hottest discussions and most-talked-about interview patterns this week.",
                  onClick: () => navigate("/trending"),
                },
                {
                  icon: "edit_note",
                  title: "Share Your Experience",
                  desc: "Help the community by sharing your own OA or interview experience.",
                  onClick: () => navigate("/app/forum"),
                },
              ].map((card) => (
                <div
                  key={card.title}
                  onClick={card.onClick}
                  className="bg-[#201f1f] rounded-xl p-6 border border-[#484847]/10 text-left cursor-pointer hover:border-[#ff9f4a]/20 hover:shadow-[0_8px_32px_rgba(255,159,74,0.06)] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#ff9f4a]/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[#ff9f4a] text-2xl">
                      {card.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ff9f4a] transition-colors">{card.title}</h3>
                  <p className="text-sm text-[#adaaaa] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.main>
  );
}
