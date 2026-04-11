const router = require("express").Router();
const ctrl = require("../controllers/user.controller");
const auth = require("../middleware/auth.middleware");

/* ================= PUBLIC ================= */

// leaderboard (no auth)
router.get("/leaderboard", ctrl.leaderboard);

/* ================= AUTH REQUIRED ================= */

// follow a company
router.post("/follow/company", auth, ctrl.followCompany);

// unfollow a company
router.post("/unfollow/company", auth, ctrl.unfollowCompany);

// get user's followed companies
router.get("/followed/companies", auth, ctrl.getFollowedCompanies);

/* ================= USER PROFILE & REWARDS ================= */

// 🔓 get unlocked assets based on points
router.get("/me/unlocks", auth, ctrl.getMyUnlocks);

// 👤 user profile + company-wise contribution tags
router.get("/me/profile", auth, ctrl.getMyProfile);
// 🌐 public user profile (no auth)
router.get("/:id/public", ctrl.getPublicProfile);


/* ================= COMPANY INSIGHTS ================= */

// 🏢 compare two companies
// example: /api/users/compare?companyA=AMAZON&companyB=GOOGLE
router.get("/compare", auth, ctrl.compareCompanies);

module.exports = router;
