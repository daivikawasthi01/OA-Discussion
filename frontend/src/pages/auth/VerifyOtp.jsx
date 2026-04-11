import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

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

      toast.success("Verification successful ");
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
      className="w-full flex justify-center mt-20"
    >
      <Card className="w-[360px] border-border shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h2 className="text-lg font-semibold">Verify OTP</h2>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Sent to <span className="font-medium">{state.email}</span>
          </p>

          <Input
            placeholder="6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
          />

          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={verify}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
