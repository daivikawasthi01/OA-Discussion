import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const TOPIC_OPTIONS = [
  "Distributed Systems", "Low-latency", "Machine Learning", "Concurrency",
];
const DSA_OPTIONS = [
  "Sliding Window", "Trie", "Backtracking", "Graph Traversal",
];

export default function Forum() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    company: "", role: "", platform: "", salaryRange: "",
    experience: "", difficulty: "Moderate",
    topics: [], dsaPatterns: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const draftTimerRef = useRef(null);

  /* ═══ DRAFT RESTORE ON MOUNT ═══ */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oadiscuss_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.company || parsed.experience) {
          setForm((prev) => ({ ...prev, ...parsed }));
          setDraftRestored(true);
        }
      }
    } catch {}
  }, []);

  /* ═══ AUTO-SAVE DRAFT ON KEYSTROKE ═══ */
  const saveDraft = useCallback((formState) => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      localStorage.setItem("oadiscuss_draft", JSON.stringify(formState));
    }, 500);
  }, []);

  const updateWithDraft = (field, value) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      saveDraft(next);
      return next;
    });
  };

  /* ═══ LIVE STATS ═══ */
  const wordCount = form.experience.trim() ? form.experience.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleTag = (field, tag) => {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(tag)
        ? p[field].filter((t) => t !== tag)
        : [...p[field], tag],
    }));
  };

  /* ═══ AI GENERATE ═══ */
  const handleGenerate = async () => {
    if (!form.company) return toast.error("Enter a company name first");
    setAiLoading(true);
    try {
      const res = await axios.post(
        "https://oadiscussion.onrender.com/api/experience/generate",
        { company: form.company, role: form.role || "Software Engineer" },
        { headers: { Authorization: `Bearer ${token}` }, silent: true }
      );
      if (res.data?.experience) update("experience", res.data.experience);
      toast.success("AI draft generated");
    } catch {
      const mockExp = `I recently interviewed at ${form.company} for the ${form.role || "Software Engineer"} position. The process consisted of an initial recruiter screen, followed by a technical assessment focusing on core CS fundamentals. The difficulty felt Moderate. I highly recommend analyzing the underlying system patterns rather than memorizing individual solutions contextually. The team was highly professional throughout the loop.`;
      setForm((p) => ({
        ...p,
        experience: p.experience || mockExp,
        role: p.role || "Software Engineer",
        platform: p.platform || "HackerRank",
        salaryRange: p.salaryRange || "₹18L - ₹22L",
        difficulty: p.difficulty || "Moderate",
        topics: p.topics.length ? p.topics : ["Distributed Systems", "Machine Learning"],
        dsaPatterns: p.dsaPatterns.length ? p.dsaPatterns : ["Sliding Window", "Graph Traversal"]
      }));
      toast.success("Offline AI draft generated");
    } finally {
      setAiLoading(false);
    }
  };

  /* ═══ SUBMIT ═══ */
  const handleSubmit = async () => {
    if (!form.company || !form.experience) return toast.error("Fill required fields");
    setSubmitting(true);
    try {
      await axios.post(
        "https://oadiscussion.onrender.com/api/experience",
        {
          company: form.company, role: form.role, platform: form.platform,
          salaryRange: form.salaryRange, experience: form.experience,
          difficulty: form.difficulty, topics: form.topics, dsaPatterns: form.dsaPatterns,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("oadiscuss_draft");
      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ['#ff9f4a', '#fd8b00', '#ffa52a', '#ffffff'],
        origin: { y: 0.7 },
      });
      toast.success("Experience posted!");
      setTimeout(() => navigate("/app/feed"), 1500);
    } catch {
      toast.error("Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-8 pb-24 px-6 max-w-5xl mx-auto min-h-screen relative z-10"
    >

      {/* Draft restored banner */}
      <AnimatePresence>
        {draftRestored && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-[#201f1f] border border-[#ff9f4a]/20 rounded-xl px-5 py-3 flex items-center justify-between"
          >
            <span className="text-sm text-[#adaaaa]">
              <span className="material-symbols-outlined text-[#ff9f4a] text-base align-middle mr-2">history</span>
              Draft restored from your last session
            </span>
            <button
              onClick={() => setDraftRestored(false)}
              className="text-[#767575] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="mb-16 text-center lg:text-left">
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">
          Share your{" "}
          <span className="text-[#ff9f4a] italic">Kinetic Experience</span>
        </h1>
        <p className="text-[#adaaaa] max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
          Help the community curate the future of tech interviews. Document your
          journey with editorial precision.
        </p>
      </header>

      {/* ═══ BENTO FORM LAYOUT ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── LEFT: Form (8 cols) ── */}
        <div className="lg:col-span-8 space-y-10">
          {/* Core Details Card */}
          <div className="cinematic-surface rounded-2xl p-8 md:p-10 shadow-2xl border border-white/5 transition-all duration-500 hover:shadow-[#ff9f4a]/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff9f4a]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ff9f4a]">edit_note</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Experience Details</h2>
              </div>
              <button
                onClick={handleGenerate}
                disabled={aiLoading}
                className="flex items-center justify-center gap-2 bg-[#ff9f4a]/10 text-[#ff9f4a] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#ff9f4a]/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {aiLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#ff9f4a] border-t-transparent" />
                ) : (
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                )}
                Generate with AI ✨
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Company" placeholder="e.g. NVIDIA, Jane Street" value={form.company} onChange={(v) => updateWithDraft("company", v)} />
              <FormField label="Role" placeholder="e.g. Senior Software Engineer" value={form.role} onChange={(v) => updateWithDraft("role", v)} />
              <FormField label="OA Platform" placeholder="e.g. HackerRank, CodeSignal" value={form.platform} onChange={(v) => updateWithDraft("platform", v)} />
              <FormField label="Salary Range" placeholder="e.g. ₹18L - ₹22L" value={form.salaryRange} onChange={(v) => updateWithDraft("salaryRange", v)} />
            </div>

            <div className="mt-10 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">
                Experience Narrative
              </label>
              <textarea
                className="w-full bg-black border border-white/5 rounded-xl px-5 py-5 text-white focus:ring-0 focus:border-[#ff9f4a]/50 outline-none transition-all placeholder:text-[#767575]/50 resize-none leading-relaxed"
                placeholder="Describe the atmosphere, specific questions (if allowed), and your overall impression..."
                rows="8"
                value={form.experience}
                onChange={(e) => updateWithDraft("experience", e.target.value)}
              />
              {/* Live stats */}
              <p className="text-[10px] text-[#767575] uppercase tracking-widest mt-2">
                {wordCount} words · ~{readTime} min read
              </p>
            </div>
          </div>

          {/* Tags & Meta Card */}
          <div className="cinematic-surface rounded-2xl p-8 md:p-10 border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <TagSection
                icon="label"
                title="Key Topics"
                options={TOPIC_OPTIONS}
                selected={form.topics}
                onToggle={(t) => toggleTag("topics", t)}
              />
              <TagSection
                icon="grid_view"
                title="DSA Patterns"
                options={DSA_OPTIONS}
                selected={form.dsaPatterns}
                onToggle={(t) => toggleTag("dsaPatterns", t)}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Sidebar (4 cols) ── */}
        <div className="lg:col-span-4 space-y-10">
          {/* Experience Tension */}
          <div className="cinematic-surface rounded-2xl p-8 border border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa] mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f4a] animate-pulse" />
              Experience Tension
            </h3>
            <div className="space-y-4">
              {[
                { label: "Effortless", color: "bg-emerald-500", shadow: "rgba(16,185,129,0.3)" },
                { label: "Moderate", color: "bg-amber-500", shadow: "rgba(245,158,11,0.3)" },
                { label: "Extreme", color: "bg-red-500", shadow: "rgba(239,68,68,0.3)" },
              ].map((opt) => (
                <label
                  key={opt.label}
                  className={`flex items-center justify-between p-5 rounded-2xl bg-black/50 border cursor-pointer hover:bg-black transition-all group ${
                    form.difficulty === opt.label
                      ? "border-[#ff9f4a]/20"
                      : "border-white/5 hover:border-[#ff9f4a]/30"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className={`w-3 h-3 rounded-full ${opt.color}`}
                      style={{ boxShadow: `0 0 10px ${opt.shadow}` }}
                    />
                    <span className="font-bold tracking-tight text-white">{opt.label}</span>
                  </span>
                  <input
                    className="w-5 h-5 text-[#ff9f4a] focus:ring-0 bg-transparent border-white/20 rounded-full"
                    name="difficulty"
                    type="radio"
                    checked={form.difficulty === opt.label}
                    onChange={() => update("difficulty", opt.label)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Preview Draft Card */}
          <div className="cinematic-surface rounded-2xl p-8 relative overflow-hidden group border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff9f4a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#262626] border border-white/10 flex items-center justify-center text-white font-bold">
                  {localStorage.getItem("email")?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9f4a]">
                    Your Draft
                  </p>
                  <p className="text-base font-bold tracking-tight text-white">{form.company ? `${form.company} • ${form.role || "Role"}` : "Curated by You"}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-[#adaaaa] overflow-hidden whitespace-normal">
                {form.experience ? (
                  <p className="line-clamp-4">{form.experience}</p>
                ) : (
                  <>
                    <div className="h-3 bg-white/5 rounded-full w-4/5" />
                    <div className="h-3 bg-white/5 rounded-full w-3/5" />
                    <div className="h-3 bg-white/5 rounded-full w-2/3" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="space-y-6 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-6 molten-gradient text-[#180800] rounded-2xl font-black text-xl tracking-tight flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(255,159,74,0.2)] hover:shadow-[0_20px_60px_rgba(255,159,74,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Experience"}
              <span className="material-symbols-outlined font-bold">trending_flat</span>
            </button>
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]/40 px-6 leading-relaxed">
              By posting, you agree to our editorial guidelines and community standards.
            </p>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

/* ═══ HELPER COMPONENTS ═══ */

function FormField({ label, placeholder, value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#adaaaa]">
        {label}
      </label>
      <input
        className="w-full bg-black border border-white/5 rounded-xl px-5 py-4 text-white focus:ring-0 focus:border-[#ff9f4a]/50 outline-none transition-all placeholder:text-[#767575]/50"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TagSection({ icon, title, options, selected, onToggle }) {
  const [isAdding, setIsAdding] = useState(false);
  const [customVal, setCustomVal] = useState("");

  const handleAdd = () => {
    if (customVal.trim() && !selected.includes(customVal.trim())) {
      onToggle(customVal.trim());
      setCustomVal("");
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[#ff9f4a] text-xl">{icon}</span>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {/* Union of static options and dynamic selected tags */}
        {[...new Set([...options, ...selected])].map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selected.includes(opt)
                ? "bg-[#875200]/30 border border-[#875200]/50 text-[#ffc78a]"
                : "bg-black border border-white/5 text-[#adaaaa] hover:border-[#ff9f4a]/30"
            }`}
          >
            {opt}
          </button>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2 bg-black border border-[#ff9f4a]/30 rounded-xl px-3 py-1 animate-in fade-in zoom-in duration-200">
            <input
              autoFocus
              className="bg-transparent border-none outline-none text-white text-xs py-1.5 w-24 placeholder:text-[#484847]"
              placeholder="e.g. Graph"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setIsAdding(false);
              }}
            />
            <button onClick={handleAdd} className="text-[#ff9f4a] hover:scale-110 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-sm">check</span>
            </button>
            <button onClick={() => setIsAdding(false)} className="text-[#767575] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 rounded-xl border-2 border-dashed border-white/10 text-[#adaaaa] text-xs font-bold hover:border-[#ff9f4a]/50 hover:text-[#ff9f4a] transition-all flex items-center gap-1 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span> Add Custom
          </button>
        )}
      </div>
    </div>
  );
}
