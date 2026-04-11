import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MOCK_TRENDING } from "../services/mockData";

const SLUG_MAP = {
  Anthropic: "anthropic",
  Stripe: "stripe",
  Vercel: "vercel",
  NVIDIA: "nvidia",
  PhonePe: "phonepe",
  Google: "google",
  Amazon: "amazon",
  Microsoft: "microsoft",
  Meta: "meta",
  Apple: "apple",
  Netflix: "netflix",
};

const CATEGORIES = ["All", "AI", "Fintech", "Cloud", "Frontend", "Systems"];

export default function Trending() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    axios
      .get("https://oadiscussion.onrender.com/api/experience/trending", {
        headers: { Authorization: `Bearer ${token}` },
        silent: true,
      })
      .then((res) => {
        const rawData = res.data || [];
        const filtered = rawData.filter(item => 
          !item.author || (item.author.email && item.author.email !== 'UNKNOWN' && item.author.email !== 'null')
        );
        if (filtered.length === 0) {
          setTrending(MOCK_TRENDING);
        } else {
          setTrending(filtered);
        }
      })
      .catch(() => {
        setTrending(MOCK_TRENDING);
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryMatch = (cat, item) => {
    if (cat === "All") return true;
    const c = (item.category || "").toLowerCase();
    const catLower = cat.toLowerCase();
    if (catLower === "ai") return c.includes("ai") || c.includes("gpu");
    if (catLower === "fintech") return c.includes("fintech") || c.includes("payment");
    if (catLower === "cloud") return c.includes("cloud") || c.includes("infrastructure");
    if (catLower === "frontend") return c.includes("frontend");
    if (catLower === "systems") return c.includes("system") || c.includes("distributed");
    return true;
  };

  const filtered = trending.filter((item) => categoryMatch(activeCategory, item));

  const renderLogo = (company, size = "w-full h-full") => {
    const slug = SLUG_MAP[company];
    if (slug) {
      return (
        <>
          <img
            src={`https://cdn.simpleicons.org/${slug}/ffffff`}
            alt={company}
            className={`${size} object-contain rounded-lg p-1`}
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
          <span className="text-xl font-black text-[#ff9f4a] hidden items-center justify-center w-full h-full bg-[#ff9f4a]/10 rounded-lg">{company?.[0] || "?"}</span>
        </>
      );
    }
    return (
      <span className="text-xl font-black text-[#ff9f4a] flex items-center justify-center w-full h-full bg-[#ff9f4a]/10 rounded-lg">{company?.[0] || "?"}</span>
    );
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pt-8 pb-12 px-6 lg:px-12 max-w-5xl mx-auto space-y-8"
    >
      <div className="flex-1 space-y-8 min-w-0">
        {/* Header */}
        <section>
          <h1 className="text-5xl font-extrabold tracking-[-0.04em] text-white italic">
            Trending{" "}
            <span className="material-symbols-outlined text-[#ff9f4a] text-4xl align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </h1>
          <p className="text-[#adaaaa] text-lg max-w-3xl mt-2">
            Live insights into the most active discussions, top-tier engineering
            interviews, and high-growth platform shifts currently defining the
            tech ecosystem.
          </p>
        </section>

        {/* ── Category Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-[#ff9f4a]/10 text-[#ff9f4a] border border-[#ff9f4a]/30"
                  : "bg-[#201f1f] text-[#adaaaa] border border-transparent hover:border-[#484847]/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-[360px] w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#adaaaa]">No trending items in this category</p>
          </div>
        ) : (
          <>
            {/* Top 3 Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.slice(0, 3).map((item, idx) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#201f1f] rounded-xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[360px]"
                >
                  <div className="absolute top-4 right-4 molten-gradient text-[#180800] w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                    #{idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#131313] flex items-center justify-center p-1 relative">
                        {renderLogo(item.company)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{item.company}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-[#adaaaa]">
                          {item.category || item.role || "Tech"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(item.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#131313] text-[#adaaaa] text-[10px] rounded-full uppercase tracking-widest font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-[#adaaaa] text-sm leading-relaxed">
                      {item.description || item.experience?.substring(0, 160) || "Trending discussion this week."}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 mt-6">
                    <div className="flex -space-x-2">
                      {[1, 2].map((a) => (
                        <div key={a} className="w-8 h-8 rounded-full bg-[#262626] border-2 border-[#201f1f] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#adaaaa] text-xs">person</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate(`/app/experience/${item.relatedExperience || item._id}`)} className="flex items-center space-x-2 text-[#ff9f4a] text-sm font-bold hover:underline">
                      <span>View Discussion</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Row */}
            {filtered.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.slice(3, 5).map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="bg-[#201f1f] rounded-xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between min-h-[280px]"
                  >
                    <div className="absolute top-4 right-4 bg-[#262626] text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg">
                      #{idx + 4}
                    </div>

                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#131313] flex items-center justify-center p-1 relative">
                          {renderLogo(item.company, "w-full h-full")}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{item.company}</h3>
                          {item.category && (
                            <p className="text-[10px] uppercase tracking-widest text-[#adaaaa]">
                              {item.category}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(item.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-[#131313] text-[#adaaaa] text-[10px] rounded-full uppercase tracking-widest font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-[#adaaaa] text-sm leading-relaxed">
                        {item.description || item.experience?.substring(0, 160) || "Active discussion."}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4">
                      <button onClick={() => navigate(`/app/experience/${item.relatedExperience || item._id}`)} className="flex items-center space-x-2 text-[#ff9f4a] text-sm font-bold hover:underline">
                        <span>View Discussion</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.main>
  );
}
