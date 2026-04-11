const Experience = require("../models/Experience");
const Reward = require("../models/Reward");
const User = require("../models/User");
const Notification = require("../models/inAppNotification");

const sendPush = require("../config/sendpush");
const normalizeCompanyName = require("../config/normalize");

const AppError = require("../config/AppError");
const catchAsync = require("../config/catchAsync");

/* ============================
   HELPERS
============================ */
const normalizeArray = (val) =>
  Array.isArray(val)
    ? val.flatMap(v => v.split(/[,\s]+/))
    : typeof val === "string"
    ? val.split(/[,\s]+/)
    : [];

/* ============================
   CREATE EXPERIENCE
============================ */
exports.createExperience = catchAsync(async (req, res) => {
  let { topics, questionPatterns, company, ...rest } = req.body;

  const normalizedCompany = normalizeCompanyName(company);
  if (!normalizedCompany) {
    throw new AppError("Company is required", 400);
  }

  const experience = await Experience.create({
    ...rest,
    company: normalizedCompany,
    topics: normalizeArray(topics).map(t => t.trim().toUpperCase()),
    questionPatterns: normalizeArray(questionPatterns).map(p => p.trim().toUpperCase()),
    author: req.userId,
  });

  await Reward.create({
    user: req.userId,
    action: "POST_EXPERIENCE",
    points: 10,
  });

  await User.findByIdAndUpdate(req.userId, {
    $inc: { points: 10, coins: 5 },
  });

  const followers = await User.find({
    followedCompanies: normalizedCompany,
    _id: { $ne: req.userId },
  }).select("_id");

  for (const f of followers) {
    await Notification.create({
      user: f._id,
      title: "New OA Experience",
      body: `New OA experience posted for ${normalizedCompany}`,
      type: "NEW_POST",
      experienceId: experience._id,
      url: `/app/experience/${experience._id}`,
    });

    await sendPush(f._id, {
      title: "New OA Experience",
      body: `New OA experience posted for ${normalizedCompany}`,
      url: `/app/experience/${experience._id}`,
    });
  }

  res.status(201).json({
    success: true,
    experienceId: experience._id,
  });
});

/* ============================
   GET EXPERIENCES
============================ */
exports.getExperiences = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { cursor, limit = 10 } = req.query;

  // ✅ Parse cursor safely
  const parsedCursor = cursor ? JSON.parse(cursor) : null;

  // ✅ Correct cursor query (NO DUPLICATES)
  const query = parsedCursor
    ? {
        $or: [
          { createdAt: { $lt: new Date(parsedCursor.createdAt) } },
          {
            createdAt: new Date(parsedCursor.createdAt),
            _id: { $lt: parsedCursor.id },
          },
        ],
      }
    : {};

  const experiences = await Experience.find(query)
    .populate("author", "email role points")
    .sort({ createdAt: -1, _id: -1 }) // ✅ CRITICAL
    .limit(Number(limit) + 1) // fetch one extra
    .lean();

  // 🔁 detect if more data exists
  const hasMore = experiences.length > limit;
  if (hasMore) experiences.pop();

  // ✅ Keep your computed fields exactly as-is
  const data = experiences.map(exp => ({
    ...exp,
    isUpvotedByMe: exp.upvotes.some(id => id.toString() === userId),
    isBookmarked: exp.bookmarks?.some(id => id.toString() === userId),
    savedCount: exp.bookmarks?.length || 0,
    usedCount: exp.usedBy?.length || 0,
    helpedCount:
      (exp.bookmarks?.length || 0) +
      (exp.usedBy?.length || 0),
  }));

  res.json({
    data,
    hasMore, 
    nextCursor: experiences.length
      ? JSON.stringify({
          createdAt: experiences[experiences.length - 1].createdAt,
          id: experiences[experiences.length - 1]._id,
        })
      : null,
  });
});

/* ============================
   GET EXPERIENCE BY ID
============================ */
exports.getExperienceById = catchAsync(async (req, res) => {
  const userId = req.userId;

  const exp = await Experience.findById(req.params.id)
    .populate("author", "email role points")
    .lean();

  if (!exp) {
    throw new AppError("Experience not found", 404);
  }

  res.json({
    ...exp,
    isUpvotedByMe: exp.upvotes.some(id => id.toString() === userId),
    isBookmarked: exp.bookmarks.some(id => id.toString() === userId),
    savedCount: exp.bookmarks.length,
    usedCount: exp.usedBy.length,
    helpedCount: exp.bookmarks.length + exp.usedBy.length,
  });
});

/* ============================
   UPVOTE EXPERIENCE
============================ */
exports.upvote = catchAsync(async (req, res) => {
  const exp = await Experience.findById(req.params.id);
  if (!exp) throw new AppError("Experience not found", 404);

  if (exp.author.toString() === req.userId) {
    throw new AppError("You cannot upvote your own experience", 400);
  }

  if (exp.upvotes.some(id => id.toString() === req.userId)) {
    throw new AppError("Already upvoted", 400);
  }

  exp.upvotes.push(req.userId);
  await exp.save();

  await Reward.create({
    user: exp.author,
    action: "UPVOTE_RECEIVED",
    points: 2,
  });

  await User.findByIdAndUpdate(exp.author, {
    $inc: { points: 2, coins: 2 },
  });

  await Notification.create({
    user: exp.author,
    title: "New Like",
    body: "Someone liked your OA experience",
    type: "LIKE",
    experienceId: exp._id,
    url: `/app/experience/${exp._id}`,
  });

  await sendPush(exp.author, {
    title: "New Like",
    body: "Someone liked your OA experience",
    url: `/app/experience/${exp._id}`,
  });

  res.json({
    success: true,
    upvotes: exp.upvotes.length,
  });
});

/* ============================
   TOGGLE USED IN PREP
============================ */
exports.toggleUsedInPrep = catchAsync(async (req, res) => {
  const userId = req.userId;
  const exp = await Experience.findById(req.params.id);

  if (!exp) throw new AppError("Experience not found", 404);

  const exists = exp.usedBy.some(id => id.toString() === userId);

  exp.usedBy = exists
    ? exp.usedBy.filter(id => id.toString() !== userId)
    : [...exp.usedBy, userId];

  await exp.save();

  res.json({
    used: !exists,
    usedCount: exp.usedBy.length,
    helpedCount: exp.bookmarks.length + exp.usedBy.length,
  });
});

/* ============================
   REPORT EXPERIENCE
============================ */
exports.report = catchAsync(async (req, res) => {
  const exp = await Experience.findById(req.params.id);
  if (!exp) throw new AppError("Experience not found", 404);

  exp.reports.push(req.userId);
  await exp.save();

  res.json({ success: true });
});

/* ============================
   TOGGLE BOOKMARK
============================ */
exports.toggleBookmark = catchAsync(async (req, res) => {
  const userId = req.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const exp = await Experience.findById(req.params.id);
  if (!exp) throw new AppError("Experience not found", 404);

  const alreadyBookmarked = exp.bookmarks.some(id => id.toString() === userId);

  exp.bookmarks = alreadyBookmarked
    ? exp.bookmarks.filter(id => id.toString() !== userId)
    : [...exp.bookmarks, userId];

  await exp.save();

  res.json({
    bookmarked: !alreadyBookmarked,
    count: exp.bookmarks.length,
  });
});

/* ============================
   GET MY BOOKMARKS
============================ */
exports.getMyBookmarks = catchAsync(async (req, res) => {
  const userId = req.userId;

  const experiences = await Experience.find({ bookmarks: userId })
    .populate("author", "email role points")
    .sort({ createdAt: -1 });

  const data = experiences.map(exp => ({
    ...exp.toObject(),
    isUpvotedByMe: exp.upvotes.some(id => id.toString() === userId),
    isBookmarked: true,
  }));

  res.json(data);
});

/* ============================
   FILTER EXPERIENCES
============================ */
exports.filterExperiences = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { company, role, topic, pattern, minSalary, maxSalary } = req.query;

  const filter = {};

  if (company) filter.company = new RegExp(company, "i");
  if (role) filter.role = new RegExp(role, "i");
  if (topic) filter.topics = topic.toUpperCase();
  if (pattern) filter.questionPatterns = pattern.toUpperCase();

  if (minSalary || maxSalary) {
    filter.salaryLPA = {
      $gte: Number(minSalary) || 0,
      $lte: Number(maxSalary) || 200,
    };
  }

  const experiences = await Experience.find(filter)
    .populate("author", "email role points")
    .sort({ createdAt: -1 });

  const data = experiences.map(exp => ({
    ...exp.toObject(),
    isUpvotedByMe: exp.upvotes.some(id => id.toString() === userId),
    isBookmarked: exp.bookmarks.some(id => id.toString() === userId),
  }));

  res.json(data);
});

/* ============================
   TRENDING EXPERIENCES
============================ */
exports.getTrendingExperiences = catchAsync(async (req, res) => {
  const userId = req.userId;

  const experiences = await Experience.find()
    .populate("author", "email role points")
    .sort({ upvotes: -1, createdAt: -1 })
    .limit(10)
    .lean();

  const data = experiences.map(exp => ({
    ...exp,
    upvoteCount: exp.upvotes.length,
    isUpvotedByMe: exp.upvotes.some(id => id.toString() === userId),
    isBookmarked: exp.bookmarks.some(id => id.toString() === userId),
  }));

  res.json(data);
});

/* ============================
   GET REPORTED (ADMIN)
============================ */
exports.getReported = catchAsync(async (req, res) => {
  const data = await Experience.find({
    reports: { $exists: true, $ne: [] },
  }).populate("author", "email role points");

  res.json(data);
});

/* ============================
   DELETE EXPERIENCE (ADMIN)
============================ */
exports.deleteExperienceAdmin = catchAsync(async (req, res) => {
  if (req.userRole !== "admin") {
    throw new AppError("Access denied. Admin only.", 403);
  }

  const exp = await Experience.findById(req.params.id);
  if (!exp) throw new AppError("Experience not found", 404);

  await Experience.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Experience deleted by admin",
  });
});
