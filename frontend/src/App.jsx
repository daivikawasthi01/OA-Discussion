import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

/* AUTH PAGES */
import Signup from "./pages/auth/Signup";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import OAuthSuccess from "./pages/auth/OAuthSuccess";

/* APP PAGES */
import Feed from "./pages/Feed";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import Forum from "./pages/Forum";
import Home from "./pages/Home";
import Bookmarks from "./pages/Bookmark";
import Trending from "./pages/Trending";
import ExperienceDetail from "./pages/ExperienceDetail";
import Profile from "./pages/userProfile";
import CompareCompanies from "./pages/companyCompare";
import Unlocks from "./pages/Unlock";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/pageNotFound";

/* ROUTES & LAYOUTS */
import ProtectedRoute from "./routes/ProtectedRoutes";
import AdminRoute from "./routes/AdminRoute";
import AppLayout from "./layouts/AppLayout";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/*  PUBLIC ROUTES */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/*  PUBLIC 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/*  PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app/feed" element={<Feed />} />
            <Route path="/app/leaderboard" element={<Leaderboard />} />
            <Route path="/app/forum" element={<Forum />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/app/experience/:id" element={<ExperienceDetail />} />
            <Route path="/app/profile" element={<Profile />} />
            <Route path="/app/compare" element={<CompareCompanies />} />
            <Route path="/app/unlocks" element={<Unlocks />} />
            <Route path="/user/:id" element={<PublicProfile />} />

            {/*  ADMIN */}
            <Route element={<AdminRoute />}>
              <Route path="/app/admin" element={<Admin />} />
            </Route>

            {/*  PROTECTED 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

      </Routes>
    </AnimatePresence>
  );
}
