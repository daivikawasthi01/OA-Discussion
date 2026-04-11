const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin");
const ctrl = require("../controllers/experience.controller");

router.post("/", auth, ctrl.createExperience);
router.get("/",auth, ctrl.getExperiences);

router.get("/filter", auth, ctrl.filterExperiences);
router.get("/trending", auth, ctrl.getTrendingExperiences);
router.get("/bookmarks/me", auth, ctrl.getMyBookmarks);

router.post("/:id/upvote", auth, ctrl.upvote);
router.post("/:id/report", auth, ctrl.report);
router.post("/:id/bookmark", auth, ctrl.toggleBookmark);

router.get("/admin/reported", auth, admin, ctrl.getReported);
router.delete("/admin/:id", auth, admin, ctrl.deleteExperienceAdmin);

router.get("/:id", auth, ctrl.getExperienceById);

module.exports = router;
