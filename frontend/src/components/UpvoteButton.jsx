import axios from "axios";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UpvoteButton({
  id,
  count,
  isUpvotedByMe,
}) {
  const token = localStorage.getItem("token");

  const [upvoted, setUpvoted] = useState(isUpvotedByMe);
  const [upvoteCount, setUpvoteCount] = useState(count);
  const [loading, setLoading] = useState(false);

  /* 🔁 keep state in sync with backend */
  useEffect(() => {
    setUpvoted(isUpvotedByMe);
    setUpvoteCount(count);
  }, [isUpvotedByMe, count]);

  const upvote = async () => {
    if (!token) {
      toast.error("Login to like");
      return;
    }

    if (loading) return;

    const nextState = !upvoted;
    setLoading(true);

    // ⚡ optimistic UI toggle
    setUpvoted(nextState);
    setUpvoteCount((prev) => (nextState ? prev + 1 : prev - 1));

    try {
      await axios.post(
        `https://oadiscussion.onrender.com/api/experience/${id}/upvote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          silent: true,
        }
      );
      toast.success(nextState ? "Liked" : "Removed like");
    } catch (err) {
      // If error, we still keep the optimistic state to avoid the count jumping back and forth
      // which creates a "broken" feeling UX on high latency backends
      console.error("Upvote sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={upvote}
        className={`flex items-center gap-1 transition-colors ${
          upvoted
            ? "bg-[#ff9f4a]/10 border border-[#ff9f4a]/20 text-[#ff9f4a]"
            : "text-[#adaaaa] hover:text-[#ff9f4a] border border-transparent hover:border-[#ff9f4a]/10 hover:bg-[#262626]"
        }`}
      >
        <span 
          className={`material-symbols-outlined text-sm ${upvoted ? "text-[#ff9f4a]" : ""}`} 
          style={upvoted ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          thumb_up
        </span>
        <span className="text-sm font-medium">
          {upvoteCount}
        </span>
      </Button>
    </motion.div>
  );
}
