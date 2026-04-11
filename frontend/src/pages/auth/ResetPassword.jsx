import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!state?.email) {
    navigate("/forgot-password", { replace: true });
    return null;
  }

  const reset = async () => {
    if (!otp || otp.length !== 6 || !password) {
      toast.error("OTP and new password are required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email: state.email,
        otp,
        password,
      });

      toast.success("Password reset successful");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid OTP or expired request"
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
              Set New Password
            </h2>
            <p className="text-xs text-[#adaaaa] uppercase tracking-widest font-bold">
              Account Security
            </p>
          </div>

          <p className="text-sm text-center text-[#adaaaa] leading-relaxed">
            Verify the code sent to your email and choose a strong new password to regain access.
          </p>

          {/* OTP */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] block mb-2">Recovery Code</label>
            <input
              placeholder="000 000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-[#000000] border-none rounded-xl px-5 py-3.5 text-center text-lg font-mono tracking-widest text-white focus:ring-1 focus:ring-[#ff9f4a] placeholder:text-[#484847]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] block mb-2">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#000000] border-none rounded-xl px-5 py-3.5 text-sm text-white focus:ring-1 focus:ring-[#ff9f4a] placeholder:text-[#484847]"
            />
          </div>

          {/* Reset Button */}
          <button
            className="w-full py-4 molten-gradient text-[#180800] font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#ff9f4a]/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={reset}
            disabled={loading}
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#180800] border-t-transparent" />
            )}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
