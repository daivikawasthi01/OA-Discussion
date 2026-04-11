const Comment = require("../models/Comment");
const Experience = require("../models/Experience");
const Reward = require("../models/Reward");
const User = require("../models/User");
const sendPush = require("../config/sendpush");
const createNotification = require("../config/createNotification");
const Notification = require("../models/inAppNotification");

const AppError = require("../config/AppError");
const catchAsync = require("../config/catchAsync");

/**
 * ===============================
 * ADD COMMENT OR REPLY
 * ===============================
 */
exports.addComment = catchAsync(async (req, res) => {
  const { text, isAnonymous, parentComment } = req.body;
  const { experienceId } = req.params;

  const experience = await Experience.findById(experienceId);
  if (!experience) {
    throw new AppError("Experience not found", 404);
  }

  if (!text || !text.trim()) {
    throw new AppError("Comment cannot be empty", 400);
  }

  let parent = null;

  if (parentComment) {
    parent = await Comment.findById(parentComment);
    if (!parent) {
      throw new AppError("Parent comment not found", 404);
    }

    if (parent.parentComment) {
      throw new AppError("Nested replies not allowed", 400);
    }
  }

  const comment = await Comment.create({
    text,
    experience: experienceId,
    author: req.userId,
    isAnonymous: !!isAnonymous,
    parentComment: parentComment || null,
  });

  // 🔢 Counters
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, {
      $inc: { replyCount: 1 },
    });
  } else {
    await Experience.findByIdAndUpdate(experienceId, {
      $inc: { commentCount: 1 },
    });
  }

  // 🎁 Rewards
  await Reward.create({
    user: req.userId,
    action: "COMMENT",
    points: 1,
  });

  await User.findByIdAndUpdate(req.userId, {
    $inc: { points: 1, coins: 2 },
  });

  // 🔔 REPLY NOTIFICATION (redirects to post)
  if (parent && parent.author.toString() !== req.userId) {
    await Notification.create({
      user: parent.author,
      title: "New Reply",
      body: "Someone replied to your comment",
      type: "COMMENT",
      experienceId,
      commentId: comment._id,
      url: `/app/experience/${experience._id}`,
    });

    await sendPush(parent.author, {
      title: "New Reply",
      body: "Someone replied to your comment",
      url: `/app/experience/${experience._id}`,
    });
  }

  // 🔔 POST AUTHOR NOTIFICATION (same redirect logic as upvote)
  if (experience.author.toString() !== req.userId) {
    await Notification.create({
      user: experience.author,
      title: "New Comment",
      body: "Someone commented on your OA experience",
      type: "COMMENT",
      experienceId,
      commentId: comment._id,
      url: `/app/experience/${experience._id}`,
    });
  }

  const populatedComment = await Comment.findById(comment._id)
    .populate("author", "email role");

  res.status(201).json(populatedComment);
});

/**
 * ===============================
 * GET COMMENTS
 * ===============================
 */
exports.getComments = catchAsync(async (req, res) => {
  const { experienceId } = req.params;

  const all = await Comment.find({ experience: experienceId })
    .populate("author", "email role")
    .sort({ createdAt: 1 })
    .lean();

  const parents = all.filter(c => !c.parentComment);
  const replies = all.filter(c => c.parentComment);

  const replyMap = {};
  replies.forEach(r => {
    const pid = r.parentComment.toString();
    if (!replyMap[pid]) replyMap[pid] = [];
    replyMap[pid].push(r);
  });

  const result = parents.map(p => ({
    ...p,
    replies: replyMap[p._id.toString()] || [],
  }));

  res.json(result);
});

/**
 * ===============================
 * LIKE / UNLIKE COMMENT
 * ===============================
 */
exports.toggleLikeComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  const alreadyLiked = comment.likes.some(
    id => id.toString() === userId
  );

  if (alreadyLiked) {
    await Comment.findByIdAndUpdate(commentId, {
      $pull: { likes: userId },
      $inc: { likeCount: -1 },
    });
  } else {
    await Comment.findByIdAndUpdate(commentId, {
      $addToSet: { likes: userId },
      $pull: { dislikes: userId },
      $inc: { likeCount: 1 },
    });
  }

  res.json({ liked: !alreadyLiked });
});

/**
 * ===============================
 * DELETE COMMENT (WITH REPLIES)
 * ===============================
 */
exports.deleteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (
    comment.author.toString() !== req.userId &&
    req.userRole !== "admin"
  ) {
    throw new AppError("Not allowed", 403);
  }

  const replyResult = await Comment.deleteMany({
    parentComment: comment._id,
  });

  await Comment.findByIdAndDelete(comment._id);

  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $inc: { replyCount: -1 },
    });
  } else {
    await Experience.findByIdAndUpdate(comment.experience, {
      $inc: { commentCount: -1 },
    });
  }

  res.json({
    success: true,
    repliesDeleted: replyResult.deletedCount,
  });
});
