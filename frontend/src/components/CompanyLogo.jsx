import { useState } from "react";

const COMPANY_SLUGS = {
  // Big Tech
  Amazon: "amazon",
  Google: "google",
  Meta: "meta",
  Apple: "apple",
  Netflix: "netflix",
  Microsoft: "microsoft",
  NVIDIA: "nvidia",
  Tesla: "tesla",
  // Developer Tools & Infra
  GitHub: "github",
  GitLab: "gitlab",
  Bitbucket: "bitbucket",
  Atlassian: "atlassian",
  Stripe: "stripe",
  Figma: "figma",
  Notion: "notion",
  Slack: "slack",
  Linear: "linear",
  Vercel: "vercel",
  Cloudflare: "cloudflare",
  Docker: "docker",
  Kubernetes: "kubernetes",
  Terraform: "terraform",
  Datadog: "datadog",
  Grafana: "grafana",
  Sentry: "sentry",
  Postman: "postman",
  Supabase: "supabase",
  Firebase: "firebase",
  MongoDB: "mongodb",
  Redis: "redis",
  Elasticsearch: "elasticsearch",
  Jenkins: "jenkins",
  // Consumer / Social
  Spotify: "spotify",
  Uber: "uber",
  Airbnb: "airbnb",
  Snapchat: "snapchat",
  Pinterest: "pinterest",
  LinkedIn: "linkedin",
  Discord: "discord",
  Reddit: "reddit",
  Twitch: "twitch",
  YouTube: "youtube",
  TikTok: "tiktok",
  WhatsApp: "whatsapp",
  Telegram: "telegram",
  // Payments / Fintech
  Razorpay: "razorpay",
  Flipkart: "flipkart",
  PayPal: "paypal",
  Visa: "visa",
  Mastercard: "mastercard",
  Coinbase: "coinbase",
  Robinhood: "robinhood",
  Salesforce: "salesforce",
  Shopify: "shopify",
  // Cloud & AI
  OpenAI: "openai",
  Anthropic: "anthropic",
  "Hugging Face": "huggingface",
  Adobe: "adobe",
  Twilio: "twilio",
  Zoom: "zoom",
  // Indian Tech
  Infosys: "infosys",
  Wipro: "wipro",
  "Tata Consultancy Services": "tataconsultancyservices",
  X: "x",
};

// Converts a hex color string (e.g. "ff9f4a") to a CSS filter that approximates it.
function hexToFilter(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  const saturate = sPct > 0 ? Math.round((sPct / 100) * 500 + 100) : 100;
  const brightness = Math.round(lPct * 1.8 + 20);

  return `invert(1) sepia(1) saturate(${saturate}%) hue-rotate(${hDeg - 30}deg) brightness(${brightness}%)`;
}

export default function CompanyLogo({ name, className = "w-5 h-5", color = "ff9f4a" }) {
  const [error, setError] = useState(false);
  const slug = COMPANY_SLUGS[name] ?? name?.toLowerCase().replace(/\s+/g, "");

  if (!slug || error) {
    return (
      <div className={`${className} bg-[#ff9f4a]/10 rounded flex items-center justify-center text-[10px] font-bold text-[#ff9f4a]`}>
        {name?.[0]?.toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`}
      className={className}
      alt={`${name} logo`}
      style={{ filter: `var(--company-logo-filter, ${hexToFilter(color)})` }}
      onError={() => setError(true)}
    />
  );
}