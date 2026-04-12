import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { Heart, Trash2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

/* ========================================================= */
/* 🔧 HELPERS                                                */
/* ========================================================= */

const getAuthorEmail = (author) => {
  if (!author) return "UNKNOWN";
  if (typeof author === "string") return "UNKNOWN";
  return author.email || "UNKNOWN";
};




const getAvatarLetter = (email) =>
  email && email !== "UNKNOWN" ? email[0].toUpperCase() : "?";

/* ========================================================= */

export default function CommentSection({
  experienceId,
  onCommentCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const navigate = useNavigate();


  /* ================= FETCH ================= */
  useEffect(() => {
    api
      .get(`/api/comments/${experienceId}`)
      .then((res) => {
        const mapped = res.data.map(mapComment);
        setComments(mapped);
        onCommentCountChange?.(countAll(mapped));
      });
  }, [experienceId]);

  /* ================= HELPERS ================= */
  const mapComment = (c) => ({
    ...c,
    author: typeof c.author === "string" ? { _id: c.author } : c.author,
    likedByMe: c.likes?.includes(userId),
    replies: (c.replies || []).map((r) => ({
      ...r,
      author: typeof r.author === "string" ? { _id: r.author } : r.author,
      likedByMe: r.likes?.includes(userId),
    })),
  });

  const countAll = (list) =>
    list.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  /* ================= ADD COMMENT ================= */
  const addComment = async () => {
    if (!text.trim()) return;

    const tempId = `tmp-${Date.now()}`;

    const optimistic = {
      _id: tempId,
      text,
      author: { _id: userId, email, role },
      likes: [],
      likeCount: 0,
      likedByMe: false,
      replies: [],
    };

    setComments((p) => [optimistic, ...p]);
    onCommentCountChange?.((c) => c + 1);
    setText("");

    const res = await api.post(
      `/api/comments/${experienceId}`,
      { text },
    );

    setComments((p) =>
      p.map((c) => (c._id === tempId ? mapComment(res.data) : c))
    );
  };

  /* ================= ADD REPLY ================= */
  const addReply = async () => {
    if (!replyText.trim() || !replyTarget) return;

    const { parentId } = replyTarget;
    const tempId = `tmp-${Date.now()}`;

    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  _id: tempId,
                  text: replyText,
                  author: { _id: userId, email, role },
                  likes: [],
                  likeCount: 0,
                  likedByMe: false,
                },
              ],
            }
          : c
      )
    );

    onCommentCountChange?.((c) => c + 1);
    setReplyText("");
    setReplyTarget(null);

    const res = await api.post(
      `/api/comments/${experienceId}`,
      { text: replyText, parentComment: parentId },
    );

    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r._id === tempId ? mapComment(res.data) : r
              ),
            }
          : c
      )
    );
  };
  const goToProfile = (authorId) => {
  if (!authorId) return;

  if (authorId === userId) {
    navigate("/app/profile");        // 🔐 OWN PROFILE
  } else {
    navigate(`/user/${authorId}`);   // 🌍 PUBLIC PROFILE
  }
};

  /* ================= LIKE ================= */
  const toggleLike = async (id, parentId = null) => {
    setComments((prev) =>
      prev.map((c) => {
        if (parentId && c._id === parentId) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r._id === id
                ? {
                    ...r,
                    likedByMe: !r.likedByMe,
                    likeCount: r.likedByMe
                      ? r.likeCount - 1
                      : r.likeCount + 1,
                  }
                : r
            ),
          };
        }

        if (c._id === id) {
          return {
            ...c,
            likedByMe: !c.likedByMe,
            likeCount: c.likedByMe
              ? c.likeCount - 1
              : c.likeCount + 1,
          };
        }

        return c;
      })
    );

    await api.post(
      `/api/comments/like/${id}`,
      {},
    );
  };

  /* ================= DELETE ================= */
  const deleteComment = async (id, parentId = null) => {
    setComments((prev) =>
      parentId
        ? prev.map((c) =>
            c._id === parentId
              ? {
                  ...c,
                  replies: c.replies.filter((r) => r._id !== id),
                }
              : c
          )
        : prev.filter((c) => c._id !== id)
    );

    onCommentCountChange?.((c) => Math.max(0, c - 1));

    await api.delete(`/api/comments/${id}`);
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4 mt-4">
      {/* ADD COMMENT */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button size="icon" onClick={addComment}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {comments.map((c) => {
          const showAll = expandedReplies[c._id];
          const repliesToShow = showAll ? c.replies : c.replies.slice(-1);

          const authorEmail = getAuthorEmail(c.author);
          const avatar = getAvatarLetter(authorEmail);

          return (
            <motion.div key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-3 bg-muted/40">
                <div className="flex gap-2">
                  {/* AVATAR */}
                  <div className="h-8 w-8 rounded-full bg-[#ff9f4a] text-[#180800] flex items-center justify-center text-sm font-bold shrink-0">
                    {avatar}
                  </div>

                  <div className="flex-1">
                   <p
  onClick={() => goToProfile(c.author?._id)}
  className="
    text-xs text-muted-foreground cursor-pointer
    hover:underline hover:text-primary
    w-fit
  "
>
  {authorEmail}
</p>

                    <p className="text-sm">{c.text}</p>

                    <div className="flex gap-4 mt-2 text-xs">
                      <button
                        onClick={() => toggleLike(c._id)}
                        className={c.likedByMe ? "" : ""}
                      >
                        {/* <Heart
                          className={`h-4 w-4 inline ${
                            c.likedByMe && "fill-red-500"
                          }`}
                        />{" "} */}
                        Like{" "}
                        {c.likeCount}
                      </button>

                      <button
                        onClick={() =>
                          setReplyTarget({
                            parentId: c._id,
                            replyingTo: authorEmail,
                          })
                        }
                      >
                        Reply
                      </button>

                      {(c.author._id === userId || role === "admin") && (
                        <Trash2
                          className="h-4 w-4 text-destructive cursor-pointer"
                          onClick={() => deleteComment(c._id)}
                        />
                      )}
                    </div>

                    {/* REPLY INPUT */}
                    {replyTarget?.parentId === c._id && (
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder={`Replying to @${replyTarget.replyingTo}`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <Button size="icon" onClick={addReply}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* TOGGLE REPLIES */}
                    {c.replies.length > 1 && (
                      <button
                        className="mt-2 text-xs text-[#ff9f4a] hover:underline"
                        onClick={() =>
                          setExpandedReplies((p) => ({
                            ...p,
                            [c._id]: !p[c._id],
                          }))
                        }
                      >
                        {showAll
                          ? "Hide replies"
                          : `View all replies (${c.replies.length})`}
                      </button>
                    )}

                    {/* REPLIES */}
                    <div className="ml-6 mt-3 space-y-2">
                      {repliesToShow.map((r) => {
                        const rEmail = getAuthorEmail(r.author);
                        const rAvatar = getAvatarLetter(rEmail);

                        return (
                          <div key={r._id} className="flex gap-2">
                            <div className="h-7 w-7 rounded-full bg-[#ff9f4a]/80 text-[#180800] flex items-center justify-center text-xs font-bold shrink-0">
                              {rAvatar}
                            </div>

                            <div className="flex-1">
                            <p
  onClick={() => goToProfile(r.author?._id)}
  className="
    text-xs text-muted-foreground cursor-pointer
    hover:underline hover:text-primary
    w-fit
  "
>
  {rEmail}
</p>

                              <p className="text-sm">{r.text}</p>

                              <div className="flex gap-3 text-xs">
                                <button
                                  onClick={() => toggleLike(r._id, c._id)}
                                  className={r.likedByMe ? "" : ""}
                                >
                                  {/* <Heart
                                    className={`h-3 w-3 inline ${
                                      r.likedByMe && "fill-red-500"
                                    }`}
                                  />{" "} */}
                                  Like{" "}
                                  {r.likeCount}
                                </button>

                                <button
                                  onClick={() =>
                                    setReplyTarget({
                                      parentId: c._id,
                                      replyingTo: rEmail,
                                    })
                                  }
                                >
                                  Reply
                                </button>

                                {(r.author._id === userId ||
                                  role === "admin") && (
                                  <Trash2
                                    className="h-3 w-3 text-destructive cursor-pointer"
                                    onClick={() =>
                                      deleteComment(r._id, c._id)
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
