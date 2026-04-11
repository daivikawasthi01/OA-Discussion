import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
          Forgot Password
        </h2>

        <p className="text-sm text-center text-muted-foreground">
          Enter your registered email to receive an OTP
        </p>

        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          className="w-full flex items-center justify-center gap-2"
          onClick={sendOtp}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      </div>
    </motion.div>
  );
}
