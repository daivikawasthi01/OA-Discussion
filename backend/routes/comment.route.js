const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

/**
 * =========================
 * COMMENTS
 * =========================
 */

// Add comment OR reply
// body: { text, isAnonymous, parentComment? }
router.post(
  "/:experienceId",
  auth,
  commentController.addComment
);

// Get comments for an experience
// Sorted by most liked (Instagram style)
router.get(
  "/:experienceId",
  commentController.getComments
);

// Like / Unlike a comment
router.post(
  "/like/:commentId",
  auth,
  commentController.toggleLikeComment
);

// Delete comment (author or admin)
// Deletes replies automatically
router.delete(
  "/:commentId",
  auth,
  commentController.deleteComment
);

module.exports = router;
