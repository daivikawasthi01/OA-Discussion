import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your registered email");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", { email });

      toast.success("OTP sent to your email successfully");

      navigate("/reset-password", {
        state: { email },
        replace: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Email not found"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-full flex justify-center mt-20 px-6"
    >
      <div className="w-[400px] bg-[#201f1f] rounded-2xl border border-white/5 shadow-[0_0_48px_rgba(255,140,0,0.04)] overflow-hidden">
        {/* Amber top bar */}
        <div className="h-1 w-full molten-gradient" />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tighter text-white">
              Recovery
            </h2>
            <p className="text-xs text-[#adaaaa] uppercase tracking-widest font-bold">
              Password Retrieval
            </p>
          </div>

          <p className="text-sm text-center text-[#adaaaa] leading-relaxed">
            Enter your registered email address. We&apos;ll send you an authentication code to reset your password.
          </p>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] block mb-2">Email address</label>
            <input
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#000000] border-none rounded-xl px-5 py-3.5 text-sm text-white focus:ring-1 focus:ring-[#ff9f4a] placeholder:text-[#484847]"
            />
          </div>

          {/* Send Button */}
          <button
            className="w-full py-4 molten-gradient text-[#180800] font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#ff9f4a]/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={sendOtp}
            disabled={loading}
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#180800] border-t-transparent" />
            )}
            {loading ? "Sending..." : "Request Recovery Code"}
          </button>

          {/* Links */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#adaaaa]">
              Wait, I remember it!{" "}
              <span
                className="cursor-pointer hover:text-[#ff9f4a] transition-colors underline underline-offset-4 text-[#ff9f4a] font-bold"
                onClick={() => navigate("/login")}
              >
                Go back to login
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
