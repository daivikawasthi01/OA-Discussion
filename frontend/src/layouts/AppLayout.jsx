import * as React from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import NotificationBell from "../components/notification.jsx";

import {
  Shield,
  Users,
  FileText,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/* ======================================================= */
/* NAV CONFIG                                              */
/* ======================================================= */

const NAV_ITEMS = [
  { label: "Home",        to: "/",               icon: "home" },
  { label: "Feed",        to: "/app/feed",       icon: "rss_feed" },
  { label: "Forum",       to: "/app/forum",      icon: "edit_note" },
  { label: "Leaderboard", to: "/app/leaderboard", icon: "leaderboard" },
  { label: "Trending",    to: "/trending",       icon: "trending_up" },
];

const AUTH_ITEMS = [
  { label: "Saved",   to: "/bookmarks",    icon: "bookmark" },
  { label: "Profile", to: "/app/profile",  icon: "account_circle" },
  { label: "Compare", to: "/app/compare",  icon: "compare_arrows" },
];

const ADMIN_ITEMS = [
  { label: "Dashboard", to: "/app/admin",         icon: "dashboard" },
  { label: "Users",     to: "/app/admin/users",    icon: "group" },
  { label: "Reports",   to: "/app/admin/reports",  icon: "description" },
];

/* ======================================================= */

export default function AppLayout() {
  const navigate = useNavigate();

  const role  = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  const isLoggedIn = Boolean(token);

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#0e0e0e] text-white relative">
      {/* ================= AMBIENT BACKGROUND GLOW ================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-screen w-screen">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#ff9f4a]/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#fd8b00]/5 blur-[120px]" />
      </div>

      {/* ================= TOP NAV ================= */}
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="
          fixed top-0 w-full z-50
          bg-[#0e0e0e]/60 backdrop-blur-xl
          shadow-[0_0_48px_rgba(255,140,0,0.04)]
        "
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-8 py-3">
          {/* ── Brand ── */}
          <div className="flex items-center space-x-10">
            <Link
              to="/"
              className="text-2xl font-black tracking-tighter text-[#ff9f4a] select-none"
            >
              OADiscuss
            </Link>

            {/* ── Desktop Links ── */}
            <div className="hidden lg:flex items-center space-x-6">
              {NAV_ITEMS.map((item) => (
                <DesktopNavLink key={item.to} {...item} />
              ))}
              {isLoggedIn &&
                AUTH_ITEMS.map((item) => (
                  <DesktopNavLink key={item.to} {...item} />
                ))}
              {role === "admin" && (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="flex items-center gap-2 font-manrope text-xs uppercase tracking-widest font-bold text-[#adaaaa] hover:text-[#ff9f4a] bg-transparent data-[state=open]:bg-transparent">
                        <Shield className="h-3.5 w-3.5" />
                        Admin
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[220px] gap-1 p-2 bg-[#1a1919] border border-white/5 rounded-xl">
                          {ADMIN_ITEMS.map((item) => (
                            <AdminItem key={item.to} {...item} />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              )}
            </div>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <NotificationBell />

                <div className="hidden md:block h-6 w-px bg-[#484847]/20" />

                <button
                  onClick={() => navigate("/app/profile")}
                  className="hidden md:flex items-center space-x-2 p-1 pl-1 pr-3 hover:bg-[#262626]/30 rounded-full transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#fd8b00] flex items-center justify-center text-[#180800] font-bold text-xs">
                    {email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-xs font-bold text-[#adaaaa] group-hover:text-white hidden xl:inline">
                    Profile
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="hidden md:flex items-center text-[#adaaaa] hover:text-[#ff7351] transition-all duration-300"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs font-bold text-[#adaaaa] uppercase tracking-widest hover:text-white transition-all px-4 py-2"
                >
                  Login
                </button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="molten-gradient text-[#180800] font-bold text-xs uppercase tracking-widest px-6 py-2 rounded-xl hover:scale-[1.02] transition-transform border-none shadow-[0_8px_24px_rgba(255,159,74,0.15)]"
                >
                  Join Now
                </Button>
              </div>
            )}

            {/* ── Mobile Menu ── */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 text-[#adaaaa] hover:text-[#ff9f4a] transition-colors">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-[#131313] border-r border-white/5 w-72 p-0"
                >
                  <MobileNav
                    isLoggedIn={isLoggedIn}
                    role={role}
                    email={email}
                    logout={logout}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ================= CONTENT ================= */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full pt-16 relative z-10"
      >
        <Outlet />
      </motion.main>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {isLoggedIn && (
        <nav className="lg:hidden fixed bottom-0 w-full bg-[#0e0e0e]/90 backdrop-blur-xl z-50 px-6 py-3 flex justify-between items-center">
          {[
            { to: "/", icon: "home", label: "Home" },
            { to: "/app/feed", icon: "rss_feed", label: "Feed" },
            { to: "/trending", icon: "trending_up", label: "Trending" },
            { to: "/bookmarks", icon: "bookmark", label: "Saved" },
            { to: "/app/profile", icon: "account_circle", label: "Me" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? "text-[#ff9f4a]" : "text-[#adaaaa]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-xl"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-tight">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

/* ======================================================= */
/* DESKTOP NAV LINK                                        */
/* ======================================================= */

function DesktopNavLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `relative font-manrope tracking-tight font-bold text-xs uppercase tracking-widest transition-all duration-300 px-3 py-1.5 ${
          isActive
            ? "text-[#ff9f4a]"
            : "text-[#adaaaa] hover:text-[#ff9f4a]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 bg-[#ff9f4a]/10 rounded-lg -z-10 border border-[#ff9f4a]/20"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/* ======================================================= */
/* ADMIN ITEM                                              */
/* ======================================================= */

function AdminItem({ to, label, icon }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        to={to}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#adaaaa] hover:bg-[#201f1f] hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span className="font-manrope text-xs font-bold uppercase tracking-widest">
          {label}
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

/* ======================================================= */
/* MOBILE NAV                                              */
/* ======================================================= */

function MobileNav({ isLoggedIn, role, email, logout }) {
  return (
    <div className="flex h-full flex-col p-6 space-y-8">
      {/* Brand */}
      <div className="space-y-1">
        <p className="text-xl font-black text-[#ff9f4a]">OADiscuss</p>
        <p className="font-manrope text-[10px] font-semibold uppercase tracking-[0.2em] text-[#adaaaa]">
          The Kinetic Curator
        </p>
      </div>

      {/* User Info */}
      {isLoggedIn && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fd8b00] flex items-center justify-center text-[#180800] font-bold text-sm">
            {email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="text-sm font-medium text-[#adaaaa] truncate">
            {email}
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex flex-col space-y-1 flex-grow">
        {NAV_ITEMS.map((item) => (
          <MobileNavItem key={item.to} {...item} />
        ))}
        {isLoggedIn &&
          AUTH_ITEMS.map((item) => (
            <MobileNavItem key={item.to} {...item} />
          ))}
        {role === "admin" && (
          <>
            <p className="mt-6 mb-2 text-[10px] uppercase tracking-widest text-[#adaaaa] font-bold">
              Admin
            </p>
            {ADMIN_ITEMS.map((item) => (
              <MobileNavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-2">
        <MobileNavItem to="#" label="Settings" icon="settings" />
        <MobileNavItem to="#" label="Support" icon="help" />

        {isLoggedIn ? (
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 text-[#ff7351] px-4 py-3 font-manrope text-xs font-bold uppercase tracking-widest hover:bg-[#201f1f] rounded-lg transition-colors mt-4"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout</span>
          </button>
        ) : (
          <div className="space-y-3 mt-4">
            <Link
              to="/signup"
              className="w-full block text-center molten-gradient text-[#180800] font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_12px_32px_rgba(255,159,74,0.2)]"
            >
              Join the Curator
            </Link>
            <button
              onClick={() => navigate("/login")}
              className="w-full text-center text-[#adaaaa] font-bold py-3 text-xs uppercase tracking-widest hover:text-white transition-colors"
            >
              Already a member? Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileNavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg font-manrope text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
          isActive
            ? "bg-[#ff9f4a]/10 text-[#ff9f4a]"
            : "text-[#adaaaa] hover:bg-[#201f1f] hover:text-white hover:translate-x-1"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className="material-symbols-outlined text-lg"
            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {icon}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
