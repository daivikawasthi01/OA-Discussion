const express = require("express");
const router = express.Router();
const Experience = require("../models/Experience");

/* ============================
   SIDEBAR INSIGHTS
============================ */
router.get("/insights", async (req, res) => {
  try {
    const experiences = await Experience.find({}, {
      company: 1,
      topics: 1,
      questionPatterns: 1,
    });

    const companyCount = {};
    const topicCount = {};
    const patternCount = {};

    experiences.forEach(exp => {
      if (exp.company) {
        companyCount[exp.company] =
          (companyCount[exp.company] || 0) + 1;
      }

      exp.topics?.forEach(t => {
        topicCount[t] = (topicCount[t] || 0) + 1;
      });

      exp.questionPatterns?.forEach(p => {
        patternCount[p] = (patternCount[p] || 0) + 1;
      });
    });

    const sortAndLimit = (obj, limit = 6) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));

    res.json({
      trendingCompanies: sortAndLimit(companyCount, 5),
      topTopics: sortAndLimit(topicCount, 6).map(t => t.name),
      topPatterns: sortAndLimit(patternCount, 6).map(p => p.name),
    });

  } catch (err) {
    console.error("SIDEBAR INSIGHTS ERROR:", err);
    res.status(500).json({ error: "Failed to load sidebar insights" });
  }
});

module.exports = router;
