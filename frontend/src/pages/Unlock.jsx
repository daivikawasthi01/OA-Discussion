import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

export default function Unlocks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    api
      .get("/api/users/me/unlocks", {
        silent: true,
      })
      .then((res) => setData(res.data))
      .catch(() => setData({ points: 0, unlocks: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="max-w-3xl mx-auto pt-8 pb-24 px-6 space-y-4"
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32 w-full" />
        ))}
      </motion.div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="max-w-3xl mx-auto pt-8 pb-24 px-6"
    >
      <h1 className="text-4xl font-black text-white tracking-tight mb-2">
        Unlocks
      </h1>
      <p className="text-[#adaaaa] mb-8">
        Earn points to unlock premium content · <span className="text-[#ff9f4a] font-bold">{data.points} pts</span>
      </p>

      <div className="space-y-4">
        {(data.unlocks || []).map((u) => {
          const progress = Math.min((data.points / u.requiredPoints) * 100, 100);

          return (
            <div
              key={u.key}
              className={`relative bg-[#201f1f] rounded-2xl p-8 border overflow-hidden ${
                u.unlocked
                  ? "border-[#ff9f4a]/20 ring-1 ring-[#ff9f4a]/10"
                  : "border-[#484847]/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {u.title}
                  </h3>
                  <p
                    className={`text-sm text-[#adaaaa] ${
                      !u.unlocked ? "blur-sm select-none" : ""
                    }`}
                  >
                    {u.description || `Requires ${u.requiredPoints} points to unlock this exclusive content.`}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#262626] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#ff9f4a] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] text-[#767575] font-bold uppercase tracking-widest whitespace-nowrap">
                      {data.points}/{u.requiredPoints}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {u.unlocked ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[#ff9f4a] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      {u.link && (
                        <a
                          href={u.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold uppercase tracking-widest text-[#ff9f4a] hover:underline"
                        >
                          Open
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-[#ff9f4a] text-3xl">
                      lock
                    </span>
                  )}
                </div>
              </div>

              {/* Locked overlay */}
              {!u.unlocked && (
                <div className="absolute inset-0 bg-[#131313]/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none rounded-2xl">
                  <span className="material-symbols-outlined text-[#ff9f4a] text-5xl opacity-40">
                    lock
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
