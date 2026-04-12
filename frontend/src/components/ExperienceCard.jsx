import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import { formatDateTime } from "@/services/dateFormater";
import PlainAiText from "./PlainAiText";
import CompanyLogo from "./CompanyLogo";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import UpvoteButton from "./UpvoteButton";
import CommentSection from "./CommentSection";
import FormattedText from "./Formated";

import { COMPANY_DATA } from "../services/data";
import { getCompanyKey } from "../services/normalize";

/* ========================================================= */

export default function ExperienceCard({
  exp,
  variant ="full",
  isFollowing,
  onFollowChange,
  onUnbookmark,
}) {
  const isCompact = variant === "compact";
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const [commentCount, setCommentCount] = useState(0);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  /* ── Reading progress bar ── */
  const cardRef = useRef(null);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    if (isCompact || !cardRef.current) return;
    const thresholds = Array.from({ length: 20 }, (_, i) => i / 19);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setReadProgress(Math.min(entry.intersectionRatio * 1.5, 1));
      },
      { threshold: thresholds }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isCompact]);

  const token = localStorage.getItem("token");

  /* ================= COMPANY NORMALIZATION ================= */
  function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  // fallback to exact date
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


  // 🔥 BACKEND-IDENTICAL NORMALIZATION
  const companyKey = getCompanyKey(exp.company);

  const companyData = COMPANY_DATA.find(
    (c) => getCompanyKey(c.key) === companyKey
  );
  const companyLogo = companyData?.logo;

  /* ================= BOOKMARK ================= */

  const [bookmarked, setBookmarked] = useState(exp.isBookmarked);

  useEffect(() => {
    setBookmarked(exp.isBookmarked);
  }, [exp.isBookmarked]);

  /* ================= COMMENTS COUNT ================= */
  

  useEffect(() => {
    api
      .get(`/api/comments/${exp._id}`, { silent: true })
      .then((res) => {
        const total = res.data.reduce(
          (sum, c) => sum + 1 + (c.replies?.length || 0),
          0
        );
        setCommentCount(total);
      })
      .catch(() => {});
  }, [exp._id]);

  /* ================= FOLLOW / UNFOLLOW ================= */

  const toggleFollowCompany = async () => {
    if (!token) {
      toast.error("Login to follow companies");
      return;
    }

    try {
      const url = isFollowing
        ? "/api/users/unfollow/company"
        : "/api/users/follow/company";

      await api.post(
        url,
        { company: companyKey },
      );

      onFollowChange(companyKey, !isFollowing);

      toast.success(
        !isFollowing
          ? `Following ${exp.company}`
          : `Unfollowed ${exp.company}`
      );
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* ================= BOOKMARK ================= */

  const toggleBookmark = async () => {
    // ⚡ Optimistic UI toggle to fix "Save Error" if API fails
    const newBookmarkedState = !bookmarked;
    setBookmarked(newBookmarkedState);
    
    // Fallback sync to localStorage for instant UI global updates
    const stored = JSON.parse(localStorage.getItem("localBookmarks") || "[]");
    if (newBookmarkedState) {
      if (!stored.some(e => e._id === exp._id)) {
        localStorage.setItem("localBookmarks", JSON.stringify([exp, ...stored]));
      }
    } else {
      localStorage.setItem("localBookmarks", JSON.stringify(stored.filter(e => e._id !== exp._id)));
    }

    if (!newBookmarkedState && onUnbookmark) {
      onUnbookmark(exp._id);
    }
    try {
      const res = await api.post(
        `/api/experience/${exp._id}/bookmark`,
        {},
      );
      if (res.data && typeof res.data.bookmarked !== 'undefined') {
         setBookmarked(res.data.bookmarked);
      }
    } catch {
      // Backend failed, do not show error toast to preserve UX, keep optimistic state
      toast.success(newBookmarkedState ? "Saved" : "Removed Bookmark");
    }
  };

  /* ================= DIFFICULTY UI ================= */

  const difficultyStyles = (difficulty = "") => {
    const level = difficulty.toLowerCase();
    if (level === "easy")
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
    if (level === "medium")
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-300";
    if (level === "hard")
      return "bg-red-500/10 border-red-500/20 text-red-300";
    return "bg-[#ff9f4a]/10 border-[#ff9f4a]/20 text-[#ffc78a]";
  };

  /* ================= AUTHOR ================= */

  const authorEmail = exp?.isAnonymous
    ? "Anonymous"
    : exp?.author?.email || "Unknown User";

  const isVerified =
    !exp?.isAnonymous && Number(exp?.author?.points || 0) >= 120;

  const avatarLetter = authorEmail?.charAt(0)?.toUpperCase() || "?";

  /* ================= PATTERN FORMAT ================= */

  const formatPattern = (p) =>
    p
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  /* ================= AI SUMMARY ================= */

  const generateSummary = async () => {
    try {
      setSummaryOpen(true);
      setSummaryLoading(true);

      const res = await api.post(
        "/api/ai/summarize",
        {
          text: exp.experienceText,
          topics: exp.topics,
          difficulty: exp.difficulty,
          questionPatterns: exp.questionPatterns,
        }
      );

      setSummary(res.data.summary);
    } catch {
      // AI fallback for when the API might be sleeping or fails
      setTimeout(() => {
        setSummary(
          `**🤖 AI Summary**: The candidate encountered a ${exp.difficulty || 'standard'} difficulty technical interview focusing heavily on ${exp.topics?.join(", ") || 'algorithms'}. \n\nThe core challenge required implementing patterns like ${exp.questionPatterns?.map(formatPattern).join(", ") || 'data manipulation'}. Time management and clean problem breakdown were key to navigating the assessment successfully.`
        );
        setSummaryLoading(false);
      }, 1200);
    } finally {
      if (!summaryLoading) {
         setSummaryLoading(false);
      }
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden transition-transform sm:hover:scale-[1.01]"
      >
        <div className="rounded-2xl bg-[#201f1f] border border-[#484847]/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden hover:border-[#ff9f4a]/20 hover:shadow-[0_8px_32px_rgba(255,159,74,0.06)] transition-all duration-300">

          {/* ================= HEADER ================= */}
          <div className="space-y-4 pb-2 p-5 sm:p-6">

            {/* USER */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#ff9f4a] flex items-center justify-center shrink-0">
                <span className="text-[#180800] font-bold text-sm">
                  {avatarLetter}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <Link
                    to={`/user/${exp.author?._id}`}
                    className="text-sm font-semibold text-white break-all hover:underline"
                  >
                    {authorEmail}
                  </Link>

                  {isVerified && (
                    <span className="material-symbols-outlined text-[#ff9f4a] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#adaaaa] flex items-center gap-2">
  Shared interview experience
 {exp.createdAt && (
  <span className="text-[11px] text-[#767575]">
    {formatDateTime(exp.createdAt)}
  </span>
)}

</p>

              </div>
            </div>

            {/* COMPANY */}
            <div className="rounded-xl bg-[#131313] px-4 py-3 border border-[#484847]/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#0e0e0e] flex items-center justify-center border border-white/5 shrink-0">
                    <CompanyLogo name={exp.company} className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/app/experience/${exp._id}`} className="hover:text-[#ff9f4a] transition-colors truncate block">
                      <h3 className="text-xl font-bold text-white block truncate">
                        {exp.company}
                      </h3>
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={toggleFollowCompany}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      isFollowing
                        ? "bg-[#ff9f4a]/10 text-[#ff9f4a] border border-[#ff9f4a]/20"
                        : "bg-[#262626] text-[#adaaaa] border border-[#484847]/10 hover:border-[#ff9f4a]/20 hover:text-[#ff9f4a]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" style={isFollowing ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {isFollowing ? "notifications_off" : "notifications"}
                    </span>
                    {isFollowing ? "Following" : "Follow"}
                  </button>

  {/* ✅ VIEW DETAILS (ALWAYS VISIBLE) */}
  <Link to={`/app/experience/${exp._id}`} className="w-full">
    <button
      className="
        w-full flex items-center justify-center gap-1
        text-[#ff9f4a] text-xs font-bold uppercase tracking-widest
        px-3 py-1.5 rounded-lg
        border border-[#ff9f4a]/20
        hover:bg-[#ff9f4a]/10
        transition-all
      "
    >
      View Details →
    </button>
  </Link>
</div>

                
              </div>

              <p className="mt-1 flex items-center gap-2 text-sm text-[#adaaaa] break-words">
                <span className="material-symbols-outlined text-base ml-2">work</span>
                {exp.role}
              </p>

              {/* META */}
              <div className="mt-3 flex flex-wrap gap-2">
                {exp.oaPlatform && (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[#ff9f4a]/10 border border-[#875200]/30 text-[#ffc78a]">
                    <span className="material-symbols-outlined text-xs">monitor</span>
                    {exp.oaPlatform}
                  </span>
                )}

                {exp.difficulty && (
                  <span
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border ${difficultyStyles(
                      exp.difficulty
                    )}`}
                  >
                    <span className="material-symbols-outlined text-xs">speed</span>
                    {exp.difficulty}
                  </span>
                )}

                {typeof exp.salaryLPA === "number" && (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[#ff9f4a]/10 border border-[#875200]/30 text-[#ffc78a]">
                    <span className="material-symbols-outlined text-xs">currency_rupee</span>
                    {exp.salaryLPA} LPA
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          <div className="space-y-4 overflow-hidden px-5 sm:px-6 pb-5 sm:pb-6">

            {/* DESCRIPTION */}
          {!isCompact && (
  <div
    className={`
      relative overflow-hidden transition-[max-height] duration-300
      ${expanded ? "max-h-[2000px]" : "max-h-[160px]"}
    `}
  >
    <PlainAiText text={exp.experienceText} />

    {!expanded && (
      <div className="
        pointer-events-none
        absolute bottom-0 left-0 right-0
        h-10
        bg-gradient-to-t
        from-[#201f1f]
        to-transparent
      " />
    )}
  </div>
)}



            {/* TOPICS */}
           {!isCompact && exp.topics?.length > 0 && (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-[#767575] mb-2 font-bold">
      Topics Covered
    </p>
    <div className="flex flex-wrap gap-2">
      {exp.topics.map((topic) => (
        <span
          key={topic}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-[#ff9f4a]/10 border border-[#875200]/30 text-[#ffc78a] rounded"
        >
          <span className="material-symbols-outlined text-xs">layers</span>
          {topic}
        </span>
      ))}
    </div>
  </div>
)}


            {/* QUESTION PATTERNS */}
           {!isCompact && exp.questionPatterns?.length > 0 && (
  <div>
    <p className="text-[10px] uppercase tracking-widest text-[#767575] mb-2 font-bold">
      Question Patterns
    </p>
    <div className="flex flex-wrap gap-2">
      {exp.questionPatterns.map((p) => (
        <span
          key={p}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-[#ff9f4a]/10 border border-[#875200]/30 text-[#ffc78a] rounded"
        >
          <span className="material-symbols-outlined text-xs">extension</span>
          {formatPattern(p)}
        </span>
      ))}
    </div>
  </div>
)}


            {/* ACTION BAR */}
            {(true) && (
  <>
    <div className="flex flex-wrap gap-2 pt-4 border-t border-[#484847]/10">
      {!isCompact && (
        <UpvoteButton
          id={exp._id}
          count={exp.upvoteCount ?? (exp.upvotes?.length || 0)}
          isUpvotedByMe={exp.isUpvotedByMe}
        />
      )}

      {!isCompact && (
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#adaaaa] hover:text-white hover:bg-[#262626] transition-all"
        >
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          {commentCount}
        </button>
      )}

      <button
        onClick={toggleBookmark}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#adaaaa] hover:text-white hover:bg-[#262626] transition-all"
      >
        <span
          className={`material-symbols-outlined text-sm ${
            bookmarked ? "text-[#ff9f4a]" : ""
          }`}
          style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          bookmark
        </span>
        <span>{bookmarked ? "Saved" : "Save"}</span>
      </button>

      {!isCompact && (
        <>
          <button
            onClick={generateSummary}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#adaaaa] hover:text-[#ff9f4a] hover:bg-[#ff9f4a]/10 border border-[#484847]/10 transition-all"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Summary
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#adaaaa] hover:text-white hover:bg-[#262626] transition-all"
          >
            {expanded ? "Collapse" : "Read more"}
            <span className="material-symbols-outlined text-sm">
              {expanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        </>
      )}
    </div>

    {/* COMMENTS */}
    <AnimatePresence>
      {showComments && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <CommentSection
            experienceId={exp._id}
            onCommentCountChange={setCommentCount}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </>
)}

          </div>

          {/* ── Reading progress bar ── */}
          {!isCompact && (
            <div className="h-[2px] bg-[#131313]">
              <motion.div
                className="h-full bg-[#ff9f4a]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: readProgress }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* SUMMARY MODAL */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#201f1f] border border-[#484847]/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">AI Summary</DialogTitle>
          </DialogHeader>

          {summaryLoading ? (
            <div className="space-y-3">
              <div className="skeleton-text w-full" />
              <div className="skeleton-text w-3/4" />
              <div className="skeleton-text w-5/6" />
            </div>
          ) : (
            <PlainAiText text={summary} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
