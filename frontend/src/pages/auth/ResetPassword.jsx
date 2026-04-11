import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
      className="w-full flex justify-center mt-20"
    >
      <div
        className="
          w-[360px]
          border border-white/20
          bg-card
          shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]
          rounded-lg
          p-6
          space-y-4
        "
      >
        <h2 className="text-xl font-semibold text-center">
          Reset Password
        </h2>

        <p className="text-sm text-center text-muted-foreground">
          Enter the OTP sent to your email and set a new password
        </p>

        <Input
          placeholder="6-digit OTP"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, ""))
          }
        />

        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          className="w-full flex items-center justify-center gap-2"
          onClick={reset}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </motion.div>
  );
}
