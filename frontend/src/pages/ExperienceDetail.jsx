import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";

import ExperienceCard from "../components/ExperienceCard";
import { getCompanyKey } from "../services/normalize";
import CompanyLogo from "../components/CompanyLogo";

export default function ExperienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exp, setExp] = useState(null);
  const [followedCompanies, setFollowedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  /* ================= SCROLL PROGRESS ================= */
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchAll = async () => {
      try {
        const [expRes, followRes] = await Promise.all([
          api.get(`/api/experience/${id}`),
          api.get("/api/users/followed/companies", { silent: true }),
        ]);

        setExp(expRes.data);
        setFollowedCompanies(
          (followRes.data || []).map(getCompanyKey)
        );

        // Fetch related
        if (expRes.data?.company) {
          api
            .get("/api/experience", {
              params: { company: expRes.data.company, limit: 3 },
              silent: true,
            })
            .then((res) => {
              const items = (res.data.data || res.data || []).filter(
                (r) => r._id !== id
              );
              setRelated(items.slice(0, 3));
            })
            .catch(() => {});
        }
      } catch {
        setExp(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="mx-auto max-w-4xl space-y-4 p-4"
      >
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-80 w-full" />
      </motion.div>
    );
  }

  if (!exp) {
    return (
      <p className="text-center text-[#adaaaa] pt-24">
        Experience not found
      </p>
    );
  }

  const companyKey = getCompanyKey(exp.company);
  const isFollowing = followedCompanies.includes(companyKey);

  /* ================= FOLLOW HANDLER ================= */
  const handleFollowChange = (_, followed) => {
    setFollowedCompanies((prev) =>
      followed
        ? [...new Set([...prev, companyKey])]
        : prev.filter((c) => c !== companyKey)
    );
  };

  /* ================= PAGE ================= */
  return (
    <>
      {/* ── Sticky reading progress bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
        <motion.div
          className="h-full bg-[#ff9f4a]"
          style={{ transformOrigin: "left", scaleX: scrollProgress }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="mx-auto max-w-4xl space-y-6 p-4"
      >
        {/* ================= DETAIL HEADER ================= */}
        <div className="relative overflow-hidden bg-[#201f1f] rounded-2xl p-8 border border-[#484847]/10 border-l-4 border-l-[#ff9f4a]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-[#ff9f4a] font-bold">
                Experience Detail
              </p>

              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <CompanyLogo name={exp.company} className="w-7 h-7" />
                {exp.company}
              </h1>

              <p className="text-sm text-[#adaaaa]">
                {exp.role} · Full interview breakdown
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-[#adaaaa] hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* ================= EXPERIENCE CARD ================= */}
        <ExperienceCard
          exp={exp}
          isFollowing={isFollowing}
          onFollowChange={handleFollowChange}
        />

        {/* ================= RELATED EXPERIENCES ================= */}
        {related.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-[#adaaaa] font-bold">
              More from {exp.company}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible">
              {related.map((r) => (
                <ExperienceCard
                  key={r._id}
                  exp={r}
                  variant="compact"
                  isFollowing={followedCompanies.includes(getCompanyKey(r.company))}
                  onFollowChange={handleFollowChange}
                />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </>
  );
}
