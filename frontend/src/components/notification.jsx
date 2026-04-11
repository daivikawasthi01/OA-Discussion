import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { formatDateTime } from "@/services/dateFormater";
import {
  Bell,
  Trash2,
  CheckCheck,
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* ================= ICON + STYLE MAP ================= */

const NOTIFICATION_META = {
  LIKE: {
    icon: Heart,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  COMMENT: {
    icon: MessageCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  NEW_POST: {
    icon: Sparkles,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  DEFAULT: {
    icon: Bell,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export default function NotificationBell({ mobile = false }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= FETCH ================= */

  const fetchNotifications = async () => {
    if (!token) return;

    const res = await axios.get(
      "https://oadiscussion.onrender.com/api/notifications",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotifications(res.data || []);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* ================= ESC CLOSE ================= */

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  /* ================= ACTIONS ================= */

  const openNotification = async (n) => {
    if (!n.isRead) {
      await axios.put(
        `https://oadiscussion.onrender.com/api/notifications/${n._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(x =>
          x._id === n._id ? { ...x, isRead: true } : x
        )
      );
    }

    setOpen(false);
    if (n.url) navigate(n.url);
  };

  const markAllRead = async () => {
    await axios.put(
      "https://oadiscussion.onrender.com/api/notifications/clear",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };
  useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [open]);


  const deleteAll = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setOpen(false);

      await axios.delete(
        "https://oadiscussion.onrender.com/api/notifications/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {/* 🔔 Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(p => !p)}
        className="relative"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span
            className="
              absolute -top-1 -right-1
              h-5 min-w-[18px]
              rounded-full bg-blue-500
              text-[11px] font-semibold text-white
              flex items-center justify-center
            "
          >
            {unreadCount}
          </span>
        )}
      </Button>

      {open &&
        createPortal(
          <AnimatePresence>
            <>
              {/* BACKDROP — BLOCKS FEED SCROLL */}
              <motion.div
                className="fixed inset-0 z-[9998]"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 12 }}
  className={`
    fixed z-[9999]
    ${mobile
      ? "bottom-4 left-5 right-5 h-[78vh] rounded-2xl"
      : "top-16 right-6 w-[380px] max-w-[380px] max-h-[70vh] rounded-2xl"}
  `}
>


              <Card className="h-full max-h-[70vh] flex flex-col shadow-xl overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <p className="font-semibold">Notifications</p>

                    {notifications.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={markAllRead}
                          className="gap-1 text-xs"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Read
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1 text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                              Clear
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="z-[20000]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete all notifications?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={deleteAll}
                                disabled={loading}
                              >
                                {loading ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>

                  {/* LIST — SCROLL FIXED */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden hover-scrollbar overscroll-contain">
                    {notifications.length === 0 && (
                      <p className="p-6 text-sm text-muted-foreground text-center">
                        You’re all caught up 
                      </p>
                    )}

                    {notifications.map((n) => {
                      const meta =
                        NOTIFICATION_META[n.type] ||
                        NOTIFICATION_META.DEFAULT;
                      const Icon = meta.icon;

                      return (
                        <div
                          key={n._id}
                          onClick={() => openNotification(n)}
                          className={`
                            group relative flex gap-3 px-4 py-4 border-b cursor-pointer
                            transition
                            ${n.isRead ? "bg-background" : "bg-muted/60"}
                            hover:bg-muted
                          `}
                        >
                          {!n.isRead && (
                            <span
                              className="
                                absolute left-2 top-5
                                h-2 w-2 rounded-full bg-blue-500
                              "
                            />
                          )}

                          <div
                            className={`
                              flex h-9 w-9 items-center justify-center rounded-full
                              ${meta.bg}
                            `}
                          >
                            <Icon className={`h-4 w-4 ${meta.color}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium break-words">
                              {n.title}
                            </p>

                            <p className="text-xs text-muted-foreground mt-0.5 break-words">
                              {n.body}
                            </p>

                            {/* EXACT BACKEND DATE */}
                            {n.createdAt && (
  <p className="mt-1 text-[10px] text-muted-foreground">
    {formatDateTime(n.createdAt)}
  </p>
)}

                            
                            
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            </>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
