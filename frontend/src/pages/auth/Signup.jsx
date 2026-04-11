import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import GoogleIcon from "@/services/googleIcon";

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

      toast.success("OTP sent to your email ");

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
    // ✅ SIMPLE ROOT — AppLayout handles centering
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-full flex justify-center mt-20"
    >
      <Card
        className="
          w-[360px]
          border border-white/20
          bg-card
          shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)]
        "
      >
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-center">
            Create Account
          </h2>

          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-white/20 focus-visible:border-primary focus-visible:ring-primary/40"
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-white/20 focus-visible:border-primary focus-visible:ring-primary/40"
          />

          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={signup}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Sign Up"}
          </Button>

          {/* GOOGLE SIGNUP */}
          <Button
            variant="outline"
            className="w-full border-white/20 hover:border-primary/40"
            onClick={() =>
              (window.location.href =
                "https://oadiscussion.onrender.com/auth/google")
            }
          >
            <GoogleIcon size={18} />
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="underline cursor-pointer hover:text-primary"
            >
              Login
            </span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
