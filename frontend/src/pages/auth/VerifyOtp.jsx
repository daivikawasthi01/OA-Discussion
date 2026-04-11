import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.email) {
    navigate("/", { replace: true });
    return null;
  }

  const verify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/verify-otp", {
        email: state.email,
        otp,
      });

      toast.success("Verification successful");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid or expired OTP"
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
              Verify Identity
            </h2>
            <p className="text-xs text-[#adaaaa] uppercase tracking-widest font-bold">
              The Kinetic Curator
            </p>
          </div>

          <div className="text-center text-sm text-[#adaaaa] px-4">
            A 6-digit code has been sent to <br/>
            <span className="text-white font-bold">{state.email}</span>
          </div>

          {/* OTP Input */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] block mb-2">Code</label>
            <input
              placeholder="000 000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-[#000000] border-none rounded-xl px-5 py-4 text-center text-xl font-mono tracking-[0.5em] text-white focus:ring-1 focus:ring-[#ff9f4a] placeholder:text-[#484847] placeholder:tracking-normal"
            />
          </div>

          {/* Verify Button */}
          <button
            className="w-full py-4 molten-gradient text-[#180800] font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#ff9f4a]/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={verify}
            disabled={loading}
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#180800] border-t-transparent" />
            )}
            {loading ? "Verifying..." : "Confirm Verification"}
          </button>

          {/* Links */}
          <div className="text-center pt-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#767575] cursor-pointer hover:text-white transition-colors">
              Resend Code
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
