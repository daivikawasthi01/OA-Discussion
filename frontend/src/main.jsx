import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster, toast } from "sonner";
import axios from "axios";

import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";

/* =====================================================
   🔥 GLOBAL AXIOS ERROR HANDLER (RUNS ONCE)
===================================================== */

// Endpoints that should NEVER show user-facing error toasts
const SILENT_URL_PATTERNS = [
  "/api/shop/claim",
  "/api/users/followed",
  "/api/comments/",
  "/api/experience/trending",
  "/api/experience/compare",
  "/api/experience/generate",
  "/api/experience/filter",
  "/api/leaderboard",
  "/api/users/leaderboard",
  "/api/push/subscribe",
  "/api/users/profile",
  "/api/experience/bookmarks",
  "/api/sidebar",
  "/api/notifications",
];

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // 🔕 SILENT REQUEST (explicit flag OR matched URL pattern)
    const isSilent =
      error.config?.silent ||
      SILENT_URL_PATTERNS.some((pattern) => url.includes(pattern));

    if (isSilent) {
      return Promise.reject(error);
    }

    // 🔐 AUTH ERRORS
    if (status === 401) {
      toast.error("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ❌ NORMAL USER-FACING ERRORS (only for explicit user actions)
    const message =
      error.response?.data?.message ||
      "Something went wrong. Please try again.";
    toast.error(message);

    return Promise.reject(error);
  }
);


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
