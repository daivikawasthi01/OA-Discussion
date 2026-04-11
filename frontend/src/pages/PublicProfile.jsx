import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import ExperienceCard from "../components/ExperienceCard";
import { getCompanyKey } from "../services/normalize";
import CompanyLogo from "../components/CompanyLogo";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`https://oadiscussion.onrender.com/api/users/${id}/public`, { silent: true })
      .then((res) => setProfile(res.data))
      .catch(() => {});

    // Fetch recent contributions
    axios
      .get("https://oadiscussion.onrender.com/api/experience", {
        params: { author: id, limit: 5 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        silent: true,
      })
      .then((res) => setRecentPosts(res.data.data || res.data || []))
      .catch(() => {});
  }, [id]);

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="max-w-4xl mx-auto p-4 space-y-4"
      >
        <div className="skeleton h-48 w-full" />
        <div className="skeleton h-32 w-full" />
      </motion.div>
    );
  }

  const tags = profile.companyTags || [];
  const loopedTags = [...tags, ...tags];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="max-w-4xl mx-auto p-4 space-y-8"
    >
      {/* ================= HEADER ================= */}
      <div className="relative overflow-hidden bg-[#201f1f] rounded-2xl p-8 border border-[#484847]/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#ff9f4a] flex items-center justify-center text-2xl font-black text-[#180800] shrink-0">
            {profile.username?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {profile.username}
              </h2>

              {profile.points >= 120 && (
                <span
                  className="material-symbols-outlined text-[#ff9f4a] text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              )}
            </div>

            <p className="text-sm text-[#adaaaa]">
              Public contributor profile
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border border-[#484847]/10 p-4 bg-[#131313]">
            <div className="flex items-center gap-2 text-sm text-[#adaaaa]">
              <span className="material-symbols-outlined text-[#ff9f4a] text-base">military_tech</span>
              Reputation
            </div>
            <p className="text-2xl font-bold text-[#ff9f4a] mt-1">
              {profile.points}
              <span className="text-sm font-normal text-[#adaaaa] ml-1">
                pts
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-[#484847]/10 p-4 bg-[#131313]">
            <div className="flex items-center gap-2 text-sm text-[#adaaaa]">
              <span className="material-symbols-outlined text-[#ff9f4a] text-base">monetization_on</span>
              Coins
            </div>
            <p className="text-2xl font-bold text-[#ff9f4a] mt-1">
              {profile.coins ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-[#484847]/10 p-4 bg-[#131313]">
            <div className="flex items-center gap-2 text-sm text-[#adaaaa]">
              <span className="material-symbols-outlined text-[#ff9f4a] text-base">apartment</span>
              OA Experiences
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {profile.totalPosts}
            </p>
          </div>
        </div>
      </div>

      {/* ================= CONTRIBUTIONS ================= */}
      <div className="bg-[#201f1f] rounded-2xl border border-[#484847]/10 overflow-hidden">
        <div className="p-6 border-b border-[#484847]/10">
          <h3 className="font-bold text-lg text-white">
            Company Contributions
          </h3>
        </div>

        <div
          className="relative overflow-hidden py-4 px-6"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          {tags.length > 0 ? (
            <motion.div
              className="flex gap-3 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: Math.max(20, tags.length * 3),
              }}
              whileHover={{ animationPlayState: "paused" }}
            >
              {loopedTags.map((c, i) => (
                <span
                  key={`${c.company}-${c.tag}-${i}`}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[#131313] border border-[#484847]/10 rounded-full whitespace-nowrap text-sm text-[#adaaaa] hover:bg-[#262626] transition-colors"
                >
                  <div className="w-5 h-5 rounded bg-black/40 flex items-center justify-center p-1">
                    <CompanyLogo name={c.company} className="w-full h-full" />
                  </div>
                  {c.company}
                  <span className="mx-0.5 text-[#767575]">·</span>
                  {c.tag}
                  <span className="ml-1 text-[#ff9f4a] font-semibold">
                    ({c.count})
                  </span>
                </span>
              ))}
            </motion.div>
          ) : (
            <p className="text-sm text-[#adaaaa] text-center">
              No contributions yet
            </p>
          )}
        </div>
      </div>

      {/* ================= RECENT POSTS ================= */}
      {recentPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#adaaaa] font-bold">
            Recent Contributions
          </h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <ExperienceCard
                key={post._id}
                exp={post}
                variant="compact"
                isFollowing={false}
                onFollowChange={() => {}}
              />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
