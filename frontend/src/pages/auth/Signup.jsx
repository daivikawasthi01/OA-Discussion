import { useState } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GoogleIcon from "@/services/googleIcon";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signup = async () => {
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/signup", { email, password });

      toast.success("OTP sent to your email");

      navigate("/verify-otp", {
        state: { email },
        replace: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Signup failed"
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
              Join the Collective
            </h2>
            <p className="text-xs text-[#adaaaa] uppercase tracking-widest font-bold">
              The Kinetic Curator
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] block mb-2">Email</label>
            <input
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#000000] border-none rounded-xl px-5 py-3.5 text-sm text-white focus:ring-1 focus:ring-[#ff9f4a] placeholder:text-[#484847]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#adaaaa] block mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#000000] border-none rounded-xl px-5 py-3.5 text-sm text-white focus:ring-1 focus:ring-[#ff9f4a] placeholder:text-[#484847]"
            />
          </div>

          {/* Signup Button */}
          <button
            className="w-full py-3.5 molten-gradient text-[#180800] font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#ff9f4a]/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={signup}
            disabled={loading}
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#180800] border-t-transparent" />
            )}
            {loading ? "Creating..." : "Create Account"}
          </button>

          {/* Google Signup */}
          <button
            className="w-full py-3.5 bg-[#131313] border border-white/5 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#1a1919] transition-colors flex items-center justify-center gap-3"
            onClick={() =>
              (window.location.href =
                `${API_URL}/auth/google`)
            }
          >
            <GoogleIcon size={18} />
            Continue with Google
          </button>

          {/* Links */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#adaaaa]">
              Already have an account?{" "}
              <span
                className="cursor-pointer hover:text-[#ff9f4a] transition-colors underline underline-offset-4 text-[#ff9f4a] font-bold"
                onClick={() => navigate("/login")}
              >
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
