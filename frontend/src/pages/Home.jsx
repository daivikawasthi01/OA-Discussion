import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CompanyLogo from "../components/CompanyLogo";

const COMPANY_LOGOS = [
  // Big Tech
  { name: "Google" },
  { name: "Meta" },
  { name: "Apple" },
  { name: "Microsoft" },
  { name: "Amazon" },
  { name: "Netflix" },
  // Developer Tools & Infra
  { name: "GitHub" },
  { name: "Atlassian" },
  { name: "Stripe" },
  { name: "Figma" },
  { name: "Notion" },
  { name: "Slack" },
  { name: "Vercel" },
  { name: "Cloudflare" },
  { name: "Docker" },
  { name: "Kubernetes" },
  { name: "Terraform" },
  { name: "Datadog" },
  { name: "Grafana" },
  { name: "Sentry" },
  { name: "Postman" },
  { name: "Supabase" },
  { name: "Firebase" },
  { name: "MongoDB" },
  { name: "Redis" },
  { name: "Elasticsearch" },
  { name: "Jenkins" },
  { name: "GitLab" },
  { name: "Bitbucket" },
  { name: "Linear" },
  // Consumer / Social
  { name: "Spotify" },
  { name: "Uber" },
  { name: "Airbnb" },
  { name: "Snapchat" },
  { name: "Pinterest" },
  { name: "LinkedIn" },
  { name: "Discord" },
  { name: "Reddit" },
  { name: "Twitch" },
  { name: "YouTube" },
  { name: "TikTok" },
  { name: "WhatsApp" },
  { name: "Telegram" },
  // Fintech & Payments
  { name: "Razorpay" },
  { name: "PayPal" },
  { name: "Visa" },
  { name: "Mastercard" },
  { name: "Coinbase" },
  { name: "Robinhood" },
  // Cloud & AI
  { name: "OpenAI" },
  { name: "Anthropic" },
  { name: "Hugging Face" },
  { name: "NVIDIA" },
  { name: "Salesforce" },
  { name: "Adobe" },
  { name: "Shopify" },
  { name: "Twilio" },
  { name: "Zoom" },
  // Indian Tech
  { name: "Flipkart" },
  { name: "Infosys" },
  { name: "Wipro" },
  { name: "Tata Consultancy Services" },
];



// Duplicate for seamless marquee loop
const MARQUEE_LOGOS = [...COMPANY_LOGOS, ...COMPANY_LOGOS];

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[800px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Cinematic background image & overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Hero background" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/60 via-[#0e0e0e]/80 to-[#0e0e0e]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff9f4a]/10 rounded-full blur-[160px] pointer-events-none opacity-40 z-0" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-black tracking-[-0.04em] leading-[0.95] mb-6">
            <span className="text-white">Real OA &amp; Interview Experiences</span>
            <br />
            <span className="bg-gradient-to-r from-[#ff9f4a] to-[#ffa52a] bg-clip-text text-transparent">
              from Real Candidates
            </span>
          </h1>

          <p className="text-[#adaaaa] text-lg md:text-xl max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
            Read authentic online assessment and interview experiences. Join a
            community of tech leaders curating the most accurate prep materials.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => navigate(isLoggedIn ? "/app/feed" : "/signup")}
              className="molten-gradient text-[#180800] font-bold px-14 py-5 rounded-full text-lg shadow-[0_10px_40px_rgba(255,159,74,0.25)] hover:scale-105 active:scale-95 transition-all min-w-[220px]"
            >
              Get Started →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-white font-semibold px-14 py-5 rounded-full text-lg border border-[#484847]/30 hover:bg-[#201f1f] transition-all min-w-[220px]"
            >
              Login
            </button>
          </div>
        </div>

        {/* ── Featured Industry Giants ── */}
        <div className="mt-24 w-full relative z-10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#adaaaa] text-center mb-10 opacity-60 font-bold">
            Featured Industry Giants
          </p>

          {/* Marquee wrapper — masks left & right edges with a fade */}
          <div
            className="relative overflow-hidden w-full"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          >
            <style>{`
              @keyframes marquee {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-track {
                display: flex;
                width: max-content;
                animation: marquee 60s linear infinite;
              }
              .marquee-track:hover {
                animation-play-state: paused;
              }
            `}</style>

            <div className="marquee-track">
              {MARQUEE_LOGOS.map((c, idx) => (
                <div
                  key={idx}
                  className="group flex flex-col items-center gap-3 mx-8 cursor-pointer flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3 group-hover:bg-white/10 group-hover:border-[#ff9f4a]/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                    <CompanyLogo
                      name={c.name}
                      className="w-full h-full"
                      color="ffffff"
                    />
                  </div>
                  <span className="text-[10px] text-[#767575] font-bold uppercase tracking-widest group-hover:text-[#adaaaa] transition-colors whitespace-nowrap">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ BENTO GRID ═══════════════ */}
      <section className="max-w-[1440px] mx-auto px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Large Feature Card — Verified Experiences */}
          <div className="md:col-span-8 bg-[#201f1f] rounded-[2.5rem] p-12 min-h-[420px] flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 border border-[#484847]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff9f4a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#ff9f4a]/10 rounded-2xl flex items-center justify-center mb-8">
                <span
                  className="material-symbols-outlined text-[#ff9f4a] text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">
                Verified Experiences
              </h3>
              <p className="text-[#adaaaa] text-base max-w-md leading-relaxed">
                Every report is peer-vetted for accuracy. No more outdated
                leaks—only high-fidelity, recent patterns from the top-tier tech
                firms.
              </p>
            </div>
            <div className="mt-8 flex -space-x-4 relative z-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-[#201f1f] bg-[#262626] flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[#adaaaa] text-sm">person</span>
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#201f1f] bg-[#ff9f4a]/20 flex items-center justify-center text-[#ff9f4a] text-xs font-bold">
                +2.4k
              </div>
            </div>
          </div>

          {/* Side Card — Community Driven */}
          <div className="md:col-span-4 bg-[#201f1f] rounded-[2.5rem] p-12 min-h-[420px] flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all border border-[#484847]/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#ff9f4a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#ff9f4a]/10 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-[#ff9f4a] text-4xl">groups</span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">
                Community Driven
              </h3>
              <p className="text-[#adaaaa] text-base leading-relaxed">
                Curated by a collective of candidates who believe in transparency.
                Share your journey and help others rise.
              </p>
              <div className="mt-8 flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#201f1f] bg-[#262626] flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[#adaaaa] text-xs">person</span>
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#201f1f] bg-[#ff9f4a]/20 flex items-center justify-center text-[#ff9f4a] text-[10px] font-bold">
                  +2.4k
                </div>
              </div>
            </div>
          </div>

          {/* Side Card — Leaderboard */}
          <div className="md:col-span-4 bg-[#201f1f] rounded-[2.5rem] p-12 min-h-[420px] border border-[#484847]/10 flex flex-col justify-between group hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#ff9f4a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-[#ff9f4a]/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ff9f4a] text-4xl">leaderboard</span>
                </div>
                <span className="text-xs text-[#ff9f4a] bg-[#ff9f4a]/10 px-3 py-1 rounded-full uppercase tracking-widest font-bold self-start">
                  Global
                </span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">
                Leaderboard
              </h3>
              <p className="text-[#adaaaa] text-base leading-relaxed mb-6">
                Ranked contributors get exclusive access to premium mock
                sessions and direct recruiter referrals.
              </p>
              <div className="w-full bg-[#262626] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ff9f4a] w-2/3 h-full rounded-full shadow-[0_0_10px_#ff9f4a]" />
              </div>
            </div>
          </div>

          {/* Long Feature Card — Data-Rich Insights */}
          <div className="md:col-span-8 relative overflow-hidden bg-[#201f1f] rounded-[2.5rem] p-12 min-h-[420px] flex items-center justify-between group border border-[#484847]/10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#ff9f4a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="z-10 max-w-sm relative">
              <div className="w-16 h-16 bg-[#ff9f4a]/10 rounded-2xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-[#ff9f4a] text-4xl">monitoring</span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-4">
                Data-Rich Insights
              </h3>
              <p className="text-[#adaaaa] text-base leading-relaxed">
                Every OA breakdown includes difficulty ratings, time-on-task
                metrics, and specific concept heatmaps.
              </p>
            </div>
            <div className="absolute right-[-10%] top-0 bottom-0 w-1/2 opacity-20 pointer-events-none">
              <div className="h-full w-full bg-gradient-to-l from-[#ff9f4a]/30 to-transparent blur-3xl" />
            </div>
            <span className="material-symbols-outlined text-[160px] text-[#ff9f4a]/5 absolute right-8 bottom-[-40px] pointer-events-none select-none">
              monitoring
            </span>
          </div>

        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="max-w-[1440px] mx-auto px-8 mb-24">
        <div className="relative w-full rounded-[3rem] overflow-hidden p-[1px] bg-gradient-to-br from-[#ff9f4a]/30 to-transparent">
          <div className="bg-[#131313] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff9f4a]/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffa52a]/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                Unlock the full feed
              </h2>
              <p className="text-[#adaaaa] text-lg max-w-lg leading-relaxed">
                Contributing your recent experience unlocks 30 days of full
                access to the OADiscuss Global Feed and exclusive OA solutions.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
              <button
                onClick={() => navigate(isLoggedIn ? "/app/forum" : "/signup")}
                className="molten-gradient text-[#180800] font-bold px-14 py-5 rounded-full text-lg shadow-[0_20px_40px_rgba(255,159,74,0.15)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all min-w-[220px]"
              >
                Contribute Now
              </button>
              <p className="text-[10px] text-center text-[#adaaaa] uppercase tracking-[0.25em] font-bold">
                Join 12,000+ contributors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-black py-16 px-8 border-t border-[#484847]/5">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="text-2xl font-black tracking-tighter text-[#ff9f4a] mb-6">
              OADiscuss
            </div>
            <p className="text-[#adaaaa] max-w-xs text-sm leading-relaxed">
              The premier destination for high-fidelity technical interview
              curation and community intelligence.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white mb-6 font-bold">Platform</h4>
              <ul className="space-y-4 text-sm text-[#adaaaa] font-medium">
                <li><Link className="hover:text-[#ff9f4a] transition-colors" to="/app/feed">Browse Feed</Link></li>
                <li><Link className="hover:text-[#ff9f4a] transition-colors" to="/app/feed">OA Database</Link></li>
                <li><Link className="hover:text-[#ff9f4a] transition-colors" to="/app/leaderboard">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white mb-6 font-bold">Community</h4>
              <ul className="space-y-4 text-sm text-[#adaaaa] font-medium">
                <li><a className="hover:text-[#ff9f4a] transition-colors" href="#">Discord</a></li>
                <li><a className="hover:text-[#ff9f4a] transition-colors" href="#">Guidelines</a></li>
                <li><a className="hover:text-[#ff9f4a] transition-colors" href="#">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white mb-6 font-bold">Legal</h4>
              <ul className="space-y-4 text-sm text-[#adaaaa] font-medium">
                <li><a className="hover:text-[#ff9f4a] transition-colors" href="#">Privacy</a></li>
                <li><a className="hover:text-[#ff9f4a] transition-colors" href="#">Terms</a></li>
                <li><a className="hover:text-[#ff9f4a] transition-colors" href="#">Ethics</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-16 pt-8 border-t border-[#484847]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-[#adaaaa] uppercase tracking-widest font-bold">
            © 2026 OADiscuss. The Kinetic Curator.
          </p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-[#adaaaa] hover:text-[#ff9f4a] cursor-pointer transition-colors">share</span>
            <span className="material-symbols-outlined text-[#adaaaa] hover:text-[#ff9f4a] cursor-pointer transition-colors">rss_feed</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}