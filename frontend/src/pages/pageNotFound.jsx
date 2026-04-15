import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4 relative overflow-hidden"
    >
      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#ff9f4a]/20"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      <h1 className="text-[120px] sm:text-[180px] font-black leading-none bg-gradient-to-r from-[#ff9f4a] to-[#ffa52a] bg-clip-text text-transparent select-none">
        404
      </h1>
      <p className="text-white text-2xl font-bold mt-4">
        You've gone off the grid.
      </p>
      <p className="mt-2 text-[#adaaaa] max-w-md">
        This page doesn't exist in the OADiscuss ecosystem.
      </p>

      <Link
        to="/app/feed"
        className="mt-10 molten-gradient text-[#180800] font-bold px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,159,74,0.15)]"
      >
        Return to Feed
      </Link>
    </motion.div>
  );
}
