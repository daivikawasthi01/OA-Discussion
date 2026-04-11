const User = require("../models/User");
const Experience = require("../models/Experience");
const normalizeCompanyName = require("../config/normalize");
const UNLOCKS = require("../config/unlocks");

const AppError = require("../config/AppError");
const catchAsync = require("../config/catchAsync");

/* ================= LEADERBOARD ================= */

exports.leaderboard = catchAsync(async (req, res) => {
  const users = await User.find()
    .sort({ points: -1 })
    .limit(10)
    .select("email points");

  res.json(users);
});

/* ================= FOLLOW COMPANY ================= */

exports.followCompany = catchAsync(async (req, res) => {
  const userId = req.userId;
  const company = normalizeCompanyName(req.body.company);

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  if (!company) {
    throw new AppError("Company is required", 400);
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { followedCompanies: company },
  });

  res.json({ success: true, followed: company });
});

/* ================= UNFOLLOW COMPANY ================= */

exports.unfollowCompany = catchAsync(async (req, res) => {
  const userId = req.userId;
  const company = normalizeCompanyName(req.body.company);

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  if (!company) {
    throw new AppError("Company is required", 400);
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { followedCompanies: company },
  });

  res.json({ success: true, unfollowed: company });
});

/* ================= GET FOLLOWED COMPANIES ================= */

exports.getFollowedCompanies = catchAsync(async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await User.findById(userId).select("followedCompanies");
  res.json(user?.followedCompanies || []);
});

/* ================= GET MY UNLOCKS ================= */

exports.getMyUnlocks = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId).select("points");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const unlocks = UNLOCKS.map((u) => ({
    key: u.key,
    title: u.title,
    requiredPoints: u.points,
    unlocked: user.points >= u.points,
    link: user.points >= u.points ? u.url || null : null,
  }));

  res.json({
    points: user.points,
    unlocks,
  });
});

/* ================= GET MY PROFILE ================= */

exports.getMyProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId).select("email points coins");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const experiences = await Experience.find({
    author: req.userId,
  }).select("company");

  const companyCount = {};
  experiences.forEach((exp) => {
    if (!exp.company) return;
    companyCount[exp.company] =
      (companyCount[exp.company] || 0) + 1;
  });

  const companyTags = Object.entries(companyCount).map(
    ([company, count]) => ({
      company,
      count,
      tag:
        count >= 5
          ? "Expert Contributor"
          : count >= 3
          ? "Active Contributor"
          : "Contributor",
    })
  );

  res.json({
    email: user.email,
    points: user.points,
    coins: user.coins,
    totalPosts: experiences.length,
    companyTags,
  });
});

/* ================= PUBLIC PROFILE ================= */

exports.getPublicProfile = catchAsync(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select(
    "email isVerified points coins"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const experiences = await Experience.find({
    author: userId,
  }).select("company");

  const companyCount = {};
  experiences.forEach((exp) => {
    if (!exp.company) return;
    companyCount[exp.company] =
      (companyCount[exp.company] || 0) + 1;
  });

  const companyTags = Object.entries(companyCount).map(
    ([company, count]) => ({
      company,
      count,
      tag:
        count >= 5
          ? "Expert Contributor"
          : count >= 3
          ? "Active Contributor"
          : "Contributor",
    })
  );

  res.json({
    username: user.email.split("@")[0],
    isVerified: user.isVerified,
    points: user.points,
    coins: user.coins,
    totalPosts: experiences.length,
    companyTags,
  });
});

/* ================= COMPANY COMPARISON ================= */

exports.compareCompanies = catchAsync(async (req, res) => {
  let { companyA, companyB } = req.query;

  if (!companyA || !companyB) {
    throw new AppError("companyA and companyB are required", 400);
  }

  const normalizedA = companyA.trim().toUpperCase();
  const normalizedB = companyB.trim().toUpperCase();

  const companies = [normalizedA, normalizedB];
  const result = {};

  for (const company of companies) {
    const experiences = await Experience.find({
      company: { $regex: new RegExp(`^${company}$`, "i") },
    });

    const difficultyBreakdown = { EASY: 0, MEDIUM: 0, HARD: 0 };
    const topicCount = {};
    const patternCount = {};

    experiences.forEach((e) => {
      const raw = e.difficulty?.toString().trim().toUpperCase();

      let diff = null;
      if (raw?.startsWith("E")) diff = "EASY";
      else if (raw?.startsWith("M")) diff = "MEDIUM";
      else if (raw?.startsWith("H")) diff = "HARD";

      if (diff) difficultyBreakdown[diff]++;

      (e.topics || []).forEach((t) => {
        topicCount[t.toUpperCase()] =
          (topicCount[t.toUpperCase()] || 0) + 1;
      });

      (e.questionPatterns || []).forEach((p) => {
        patternCount[p.toUpperCase()] =
          (patternCount[p.toUpperCase()] || 0) + 1;
      });
    });

    result[company] = {
      totalExperiences: experiences.length,
      difficultyBreakdown,

      topTopics: Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count })),

      topPatterns: Object.entries(patternCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern, count]) => ({ pattern, count })),
    };
  }

  res.json({
    companyA: normalizedA,
    companyB: normalizedB,
    comparison: result,
  });
});
