import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { MOCK_COMPARE_DATA } from "../services/mockData";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COMPANIES = [
  "Amazon", "Google", "Meta", "Apple", "Netflix", "Microsoft",
  "Stripe", "Uber", "Twitter", "Salesforce", "NVIDIA", "Tesla",
];

const COMPANY_SLUGS = {
  Amazon: "amazon",
  Google: "google",
  Meta: "meta",
  Apple: "apple",
  Netflix: "netflix",
  Microsoft: "microsoft",
  Stripe: "stripe",
  Uber: "uber",
  Twitter: "x",
  Salesforce: "salesforce",
  NVIDIA: "nvidia",
  Tesla: "tesla",
};

export default function CompareCompanies() {
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();

  const [companyA, setCompanyA] = useState(
    searchParams.get("a") || "Amazon"
  );
  const [companyB, setCompanyB] = useState(
    searchParams.get("b") || "Google"
  );
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ═══ SHAREABLE URL ═══ */
  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      `/app/compare?a=${companyA}&b=${companyB}`
    );
  }, [companyA, companyB]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const fetchCompare = async () => {
    if (!companyA || !companyB) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `https://oadiscussion.onrender.com/api/experience/compare?companyA=${companyA}&companyB=${companyB}`,
        { headers: { Authorization: `Bearer ${token}` }, silent: true }
      );
      setDataA(res.data?.companyA || null);
      setDataB(res.data?.companyB || null);
    } catch {
      setDataA(mockData(companyA));
      setDataB(mockData(companyB));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompare(); }, [companyA, companyB]);

  /* ═══ FUNNEL CHART DATA ═══ */
  const funnelData = [
    {
      stage: "Recruiter Screen",
      [companyA]: parseFloat(dataA?.passRate) || 85,
      [companyB]: parseFloat(dataB?.passRate) || 42,
    },
    {
      stage: "Technical Phone",
      [companyA]: 60,
      [companyB]: 28,
    },
    {
      stage: "On-Site Loop",
      [companyA]: 25,
      [companyB]: 15,
    },
    {
      stage: "Hiring Committee",
      [companyA]: 95,
      [companyB]: 35,
    },
  ];

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="pt-8 pb-20 px-6 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <header className="mb-12 text-center">
        <span className="text-xs uppercase tracking-widest text-[#ff9f4a] mb-3 block">
          Professional Intelligence
        </span>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4 text-white">
          Compare Companies
        </h1>
        <p className="text-[#adaaaa] max-w-2xl mx-auto text-lg">
          Benchmark technical interview performance and compensation across top-tier engineering organizations.
        </p>
      </header>

      {/* Comparison Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Company Selection Row */}
        <div className="lg:col-span-12 flex flex-col md:flex-row items-center gap-4 mb-8">
          <CompanySelect value={companyA} onChange={setCompanyA} companies={COMPANIES} />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const a = companyA;
                const b = companyB;
                setCompanyA(b);
                setCompanyB(a);
              }}
              className="group flex items-center justify-center p-3 rounded-full bg-[#201f1f] border border-[#484847]/15 text-[#fd8b00] shadow-lg hover:border-[#ff9f4a]/30 hover:scale-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">compare_arrows</span>
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#201f1f] text-[#adaaaa] text-xs font-bold uppercase tracking-widest hover:text-[#ff9f4a] border border-[#484847]/10 hover:border-[#ff9f4a]/20 transition-all"
            >
              <span className="material-symbols-outlined text-sm">link</span>
              Copy link
            </button>
          </div>
          <CompanySelect value={companyB} onChange={setCompanyB} companies={COMPANIES} />
        </div>

        {loading ? (
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="skeleton h-[400px] w-full" />
            <div className="skeleton h-[400px] w-full" />
          </div>
        ) : (
          <>
            {/* Left Side: Company A */}
            <div className="lg:col-span-5 space-y-6">
              <CompanyCard data={dataA || mockData(companyA)} name={companyA} />
              <FocusCard topics={dataA?.interviewFocus || mockData(companyA).interviewFocus} />
            </div>

            {/* Comparison Center Bar */}
            <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-start pt-20 space-y-32">
              <div className="font-black text-[#484847]/20 text-6xl select-none">VS</div>
              <div className="w-px h-full bg-gradient-to-b from-transparent via-[#484847]/20 to-transparent"></div>
            </div>

            {/* Right Side: Company B */}
            <div className="lg:col-span-5 space-y-6">
              <CompanyCard data={dataB || mockData(companyB)} name={companyB} />
              <FocusCard topics={dataB?.interviewFocus || mockData(companyB).interviewFocus} />
            </div>

            {/* Interview Funnel Analysis — Recharts */}
            <div className="lg:col-span-12 mt-12">
              <div className="bg-[#131313] rounded-xl p-10 border border-[#484847]/5">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Interview Funnel Analysis</h3>
                    <p className="text-[#adaaaa]">Historical conversion rates over the last 12 months</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full molten-gradient"></div>
                      <span className="text-xs text-white">{companyA}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-[#484847]"></div>
                      <span className="text-xs text-[#adaaaa]">{companyB}</span>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#484847" strokeOpacity={0.15} />
                    <XAxis
                      dataKey="stage"
                      tick={{ fill: "#adaaaa", fontSize: 11, fontWeight: 700 }}
                      axisLine={{ stroke: "#484847", strokeOpacity: 0.2 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#767575", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#201f1f",
                        border: "1px solid rgba(72,72,71,0.2)",
                        borderRadius: "0.75rem",
                        color: "#fff",
                        fontSize: 12,
                      }}
                      cursor={{ fill: "rgba(255,159,74,0.05)" }}
                    />
                    <Bar
                      dataKey={companyA}
                      fill="#ff9f4a"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey={companyB}
                      fill="#484847"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.main>
  );
}

/* ═══ HELPERS ═══ */

function CompanySelect({ value, onChange, companies }) {
  const slug = COMPANY_SLUGS[value];
  const [logoErr, setLogoErr] = useState(false);

  return (
    <div className="flex-1 w-full relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        {slug && !logoErr ? (
          <img
            src={`https://cdn.simpleicons.org/${slug}/ff9f4a`}
            className="w-5 h-5 object-contain"
            alt=""
            onError={() => setLogoErr(true)}
          />
        ) : (
          <span className="material-symbols-outlined text-[#ff9f4a]">apartment</span>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => {
          setLogoErr(false);
          onChange(e.target.value);
        }}
        className="w-full bg-[#000000] border border-[#262626] rounded-xl py-4 pl-12 pr-4 text-white focus:ring-1 focus:ring-[#ff9f4a]/50 font-medium appearance-none cursor-pointer transition-all hover:bg-[#131313]"
      >
        {companies.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

function CompanyCard({ data, name }) {
  const slug = COMPANY_SLUGS[name];
  const [logoErr, setLogoErr] = useState(false);

  return (
    <div className="bg-[#201f1f] rounded-xl p-8 transition-transform hover:scale-[1.01] duration-300">
      <div className="flex items-center space-x-6 mb-8">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#131313] flex items-center justify-center border border-white/5 shrink-0 shadow-xl group-hover:scale-110 transition-transform">
          {slug && !logoErr ? (
            <img
              alt={`${name} Logo`}
              className="w-10 h-10 object-contain"
              src={`https://cdn.simpleicons.org/${slug}/ff9f4a`}
              onError={() => setLogoErr(true)}
            />
          ) : (
            <span className="w-16 h-16 rounded-2xl bg-[#ff9f4a] flex items-center justify-center text-2xl font-black text-[#180800]">
              {name[0]}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">{name}</h2>
          <p className="text-xs text-[#adaaaa] uppercase tracking-widest">
            {data?.location || "TECH"} • {data?.category || "ENGINEERING"}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Pass Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs uppercase tracking-widest text-[#adaaaa] font-bold">Pass Rate</span>
            <span className="text-3xl font-black text-[#ff9f4a]">{data?.passRate}</span>
          </div>
          <div className="w-full h-2 bg-[#000000] rounded-full overflow-hidden">
            <motion.div
              className="h-full molten-gradient"
              initial={{ width: 0 }}
              animate={{ width: data?.passRate }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex justify-between items-center py-4 border-b border-[#484847]/15">
          <span className="text-xs uppercase tracking-widest text-[#adaaaa] font-bold">Difficulty Level</span>
          <div className="flex items-center space-x-1 text-[#ff9f4a]">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className={`material-symbols-outlined ${i > Number(data?.difficultyScore) ? "text-[#767575]" : ""}`}
                style={i <= Number(data?.difficultyScore) ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                bolt
              </motion.span>
            ))}
            <span className="ml-2 font-bold text-white">{data?.difficultyScore}/5</span>
          </div>
        </div>

        {/* Salary */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-[#adaaaa] font-bold">Average L5 TC</span>
          <div className="text-4xl font-extrabold tracking-tight text-white">{data?.avgTC}</div>
          <p className="text-xs text-[#ffc78a]">{data?.tcNote}</p>
        </div>
      </div>
    </div>
  );
}

function FocusCard({ topics }) {
  return (
    <div className="bg-[#131313] rounded-xl p-8 space-y-4">
      <h3 className="font-bold text-lg text-white">Interview Focus</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <span
            key={t}
            className="px-4 py-2 bg-[#ff9f4a]/10 text-[#ffc78a] text-xs font-bold rounded-full border border-[#875200]/30"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function mockData(company) {
  return MOCK_COMPARE_DATA[company] || { passRate: "5%", difficultyScore: "3.5", avgTC: "₹65,00,000", location: "Gurgaon", category: "Tech", tcNote: "", interviewFocus: ["Coding", "System Design", "Behavioral"] };
}
