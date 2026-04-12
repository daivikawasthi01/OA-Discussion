import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/* ── useCountUp hook ── */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) return;
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

function CountUpCard({ icon, value, label, delay = 0 }) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-[#201f1f] rounded-xl p-4 text-center min-w-[90px] border border-[#484847]/10"
    >
      <span className="material-symbols-outlined text-[#ff9f4a] text-2xl mb-1 block" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <div className="text-xl font-black text-white">{count.toLocaleString()}</div>
      <div className="text-[10px] uppercase tracking-widest text-[#adaaaa]">{label}</div>
    </motion.div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/users/profile")
      .then((res) => setProfile(res.data))
      .catch(() => {
        // If profile fetch fails, redirect to login
        toast.error("Please login to view your profile");
        navigate("/login", { replace: true });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConvert = async (coins, points, packName) => {
    try {
      await api.post("/api/shop/convert", { coins, points });
      toast.success(`${packName} redeemed!`);
      const res = await api.get("/api/users/profile");
      setProfile(res.data);
    } catch {
      toast.error("Not enough coins");
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto pt-8 px-6 space-y-6">
        <div className="skeleton h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  const user = profile || {};
  const points = user.kineticPoints || user.points || 0;
  const coins = user.coins || 0;
  const exp = user.exp || 0;

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pt-8 pb-24 px-6 max-w-[1200px] mx-auto"
    >
      {/* ═══ HERO HEADER ═══ */}
      <section className="flex flex-col md:flex-row items-start gap-8 mb-12">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-[#ff9f4a] to-[#fd8b00]">
            <div className="w-full h-full bg-[#201f1f] m-0.5 rounded-2xl flex items-center justify-center text-4xl font-black text-white">
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 molten-gradient rounded-full flex items-center justify-center text-[#180800]">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-[#ff9f4a] text-[#180800] px-3 py-1 rounded-full">
              Elite Member
            </span>
            {user.verified && (
              <span className="flex items-center gap-1 text-[10px] text-[#adaaaa] uppercase tracking-widest">
                <span className="material-symbols-outlined text-xs text-[#adaaaa]">verified</span>
                Verified
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-1">
            {user.name || "Curator"}
          </h1>
          <p className="text-sm text-[#adaaaa] mb-3">
            {user.email} {user.location && `• ${user.location}`}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#ff9f4a] font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
              Rank {user.rank || "42"} — Master Curator
            </span>
            <span className="text-xs text-[#adaaaa]">78% to Rank 43</span>
          </div>
          <div className="mt-3 w-full max-w-md h-1.5 bg-[#262626] rounded-full overflow-hidden relative">
            <motion.div
              className="h-full molten-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#ff9f4a] rounded-full shadow-[0_0_8px_#ff9f4a]"
              initial={{ left: 0 }}
              animate={{ left: "78%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="flex gap-4 shrink-0">
          <CountUpCard icon="star" value={points} label="Points" delay={0} />
          <CountUpCard icon="monetization_on" value={coins} label="Coins" delay={0.15} />
          <CountUpCard icon="bolt" value={exp} label="EXP" delay={0.3} />
        </div>
      </section>

      {/* ═══ CONVERT COINS ═══ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Convert Coins to Points</h2>
            <p className="text-sm text-[#adaaaa]">Boost your curator rank by trading digital currency</p>
          </div>
          <button onClick={() => toast("Feature history coming soon")} className="flex items-center gap-2 bg-[#201f1f] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors">
            View History
            <span className="material-symbols-outlined text-sm">schedule</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Starter Pack", desc: "Ideal for daily grinders", coins: 100, points: 500, icon: "inventory_2", highlight: false },
            { name: "Pro Curator", desc: "Accelerated rank growth", coins: 500, points: 3000, icon: "bolt", highlight: true },
            { name: "Elite Tier", desc: "Maximum value exchange", coins: 2000, points: 15000, icon: "workspace_premium", highlight: false },
          ].map((pack) => (
            <div
              key={pack.name}
              className={`bg-[#201f1f] rounded-xl p-8 text-center relative overflow-hidden border ${
                pack.highlight ? "border-[#ff9f4a]/20 ring-1 ring-[#ff9f4a]/10" : "border-[#484847]/10"
              }`}
            >
              {pack.highlight && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[#ff9f4a] text-[#180800] px-3 py-1 rounded-full">
                    Popular Choice
                  </span>
                </div>
              )}
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${pack.highlight ? "bg-[#ff9f4a]/10" : "bg-[#262626]"} ${pack.highlight ? "mt-6" : ""}`}>
                <span className="material-symbols-outlined text-[#ff9f4a] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {pack.icon}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{pack.name}</h3>
              <p className="text-xs text-[#adaaaa] mb-4">{pack.desc}</p>
              <div className="mb-2">
                <span className="text-3xl font-black text-[#ff9f4a]">{pack.coins}</span>
                <span className="text-sm text-[#adaaaa] ml-1">Coins</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-xs">
                <span className="text-[#adaaaa] uppercase tracking-widest font-bold">Points Yield</span>
                <span className="font-bold text-white">{pack.points.toLocaleString()} PTS</span>
              </div>
              <button
                onClick={() => handleConvert(pack.coins, pack.points, pack.name)}
                className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 ${
                  pack.highlight
                    ? "molten-gradient text-[#180800] shadow-lg"
                    : "bg-[#131313] text-white border border-[#484847]/20 hover:bg-[#262626]"
                }`}
              >
                {pack.highlight ? "Instant Boost" : "Convert Now"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BOTTOM: UNLOCKED ASSETS + COMPANY CONTRIBUTIONS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Unlocked Assets */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Unlocked Assets</h2>
            <button onClick={() => toast("Asset library coming soon")} className="text-xs text-[#ff9f4a] font-bold uppercase tracking-widest hover:underline">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Neon Lab", type: "Visual Kit", icon: "science", gradient: "bg-gradient-to-br from-[#ff9f4a]/20 to-[#131313]" },
              { name: "Data Flow", type: "Profile Skin", icon: "hub", gradient: "bg-gradient-to-br from-[#fd8b00]/15 to-[#131313]" },
              { name: "Core Badge", type: "Achievement", icon: "military_tech", gradient: "bg-gradient-to-br from-[#ffa52a]/15 to-[#131313]" },
            ].map((asset) => (
              <div
                key={asset.name}
                className="group bg-[#201f1f] rounded-xl aspect-square flex flex-col justify-between p-4 border border-[#484847]/10 relative overflow-hidden hover:border-[#ff9f4a]/30 transition-colors cursor-pointer"
              >
                <div className={`absolute inset-0 ${asset.gradient} opacity-80`} />
                
                {/* Icon Centered */}
                <div className="relative z-10 flex-1 flex items-center justify-center pt-2">
                  <div className="w-16 h-16 rounded-full bg-[#131313] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,159,74,0.1)]">
                    <span className="material-symbols-outlined text-[#ff9f4a] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {asset.icon}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <p className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#ff9f4a] transition-colors">{asset.name}</p>
                  <p className="text-[10px] text-[#adaaaa] font-bold mt-1">{asset.type}</p>
                </div>
              </div>
            ))}
            <div 
              onClick={() => navigate("/app/unlocks")}
              className="group bg-[#201f1f] rounded-xl aspect-square flex flex-col items-center justify-center border border-[#484847]/10 border-dashed cursor-pointer hover:border-[#ff9f4a]/30 transition-colors shadow-inner"
            >
              <span className="material-symbols-outlined text-[#adaaaa] text-3xl mb-2 group-hover:text-[#ff9f4a] group-hover:scale-110 transition-all">add</span>
              <p className="text-[10px] text-[#adaaaa] uppercase tracking-widest font-bold group-hover:text-white transition-colors">Unlock More</p>
            </div>
          </div>
        </section>

        {/* Activity Heatmap */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Activity Heatmap</h2>
          <div className="bg-[#201f1f] rounded-xl p-6 border border-[#484847]/10">
            <div className="flex flex-wrap gap-[3px]">
              {(() => {
                // Generate heatmap data (52 weeks × 7 days)
                const seed = (user.name || "user").length;
                return Array.from({ length: 364 }, (_, i) => {
                  const intensity = Math.floor(Math.sin(i * 0.3 + seed) * 2 + Math.cos(i * 0.7) * 1.5) + 1;
                  const level = Math.max(0, Math.min(3, intensity));
                  const colors = [
                    "bg-[#262626]",
                    "bg-[#ff9f4a]/30",
                    "bg-[#ff9f4a]/60",
                    "bg-[#ff9f4a]",
                  ];
                  return (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-[2px] ${colors[level]}`}
                      title={`${level} post${level !== 1 ? "s" : ""}`}
                    />
                  );
                });
              })()}
            </div>
            {/* Month labels */}
            <div className="flex justify-between mt-3 px-1">
              {(() => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const now = new Date();
                return Array.from({ length: 6 }, (_, i) => {
                  const m = new Date(now);
                  m.setMonth(m.getMonth() - 5 + i);
                  return (
                    <span key={i} className="text-[10px] text-[#767575] uppercase tracking-widest">
                      {months[m.getMonth()]}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
}
