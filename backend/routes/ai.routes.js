const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Experience = require("../models/Experience");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ============================
   GENERATE DESCRIPTION (LC-BASED)
============================ */
router.post("/generate-description", async (req, res) => {
  try {
    const { role, platform, difficulty, topics, questionPatterns } = req.body;

    if (!role || !platform || !difficulty || !topics?.length) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const prompt = `
You are an expert coding interview mentor.

Generate a SHORT, CLEAN OA / interview experience.

STRICT RULES:
- Very concise
- Bullet points only
- NO sample code
- NO custom questions
- Suggest REAL LeetCode problems with numbers
- Questions MUST match topics + difficulty

INPUT:
Role: ${role}
Platform: ${platform}
Difficulty: ${difficulty}
Topics: ${topics.join(", ")}
Question Patterns: ${questionPatterns?.join(", ") || "General DSA"}

FORMAT EXACTLY LIKE THIS:

## Overview
- 1–2 lines describing the OA/interview

## Topics Covered
- ${topics.join("\n- ")}

## Question Patterns
- ${questionPatterns?.join("\n- ") || "General DSA"}

## Question Level
- ${difficulty} (1 short reason)

## LeetCode Practice (Must Do)
- 3–6 questions
- Include LeetCode number
- Group naturally by pattern if possible

## Preparation Tips
- 2–3 short actionable bullets
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You help students prepare for coding interviews." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 550,
    });

    res.json({
      text: completion.choices[0].message.content.trim(),
    });
  } catch (err) {
    console.error("GROQ ERROR:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

/* ============================
   SUMMARIZE (LC-FOCUSED)
============================ */
router.post("/summarize", async (req, res) => {
  try {
    const { text, topics, difficulty, questionPatterns } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const prompt = `
Summarize the following OA / interview experience.

RULES:
- Extremely short
- Pattern focused
- NO filler
- NO code
- NO custom questions
- Suggest ONLY LeetCode problems

FORMAT EXACTLY:

## Topics
- ${topics?.join("\n- ") || "N/A"}

## Question Patterns
- ${questionPatterns?.join("\n- ") || "General DSA"}

## Question Level
- ${difficulty || "Mixed"}

## LeetCode Practice
- 2–4 relevant questions with numbers

TEXT:
${text}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 350,
    });

    res.json({
      summary: completion.choices[0].message.content.trim(),
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Summary failed" });
  }
});

/* ============================
   AI OA TIP (CACHED)
============================ */

/* ============================
   AI OA TIP (SMART + SAFE)
============================ */

let cachedTip = null;
let lastGenerated = 0;
let lastExperienceCount = 0;

router.get("/ai-tip", async (req, res) => {
  try {
    const experienceCount = await Experience.countDocuments();

    // 🔁 Invalidate cache if data changed
    if (
      cachedTip &&
      Date.now() - lastGenerated < 6 * 60 * 60 * 1000 && // 6 hrs
      experienceCount === lastExperienceCount
    ) {
      return res.json({ tip: cachedTip });
    }

    // 🟡 ZERO POSTS → GENERIC TIP
    if (experienceCount === 0) {
      cachedTip =
        "Start by mastering arrays and strings; they appear in almost every OA and build fundamentals for advanced patterns.";
      lastGenerated = Date.now();
      lastExperienceCount = experienceCount;

      return res.json({ tip: cachedTip });
    }

    // 📌 FETCH RECENT EXPERIENCES (trend-based)
    const experiences = await Experience.find(
      {},
      { topics: 1, questionPatterns: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(50);

    const topicCount = {};
    const patternCount = {};

    experiences.forEach((exp, index) => {
      const weight = Math.max(1, 5 - Math.floor(index / 10)); // recent = higher weight

      exp.topics?.forEach(t => {
        topicCount[t] = (topicCount[t] || 0) + weight;
      });

      exp.questionPatterns?.forEach(p => {
        patternCount[p] = (patternCount[p] || 0) + weight;
      });
    });

    const getTop = obj =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

    const topTopic = getTop(topicCount) || "Core DSA";
    const topPattern = getTop(patternCount) || "Common interview patterns";

    const prompt = `
You are a placement mentor.

Generate ONE short OA preparation tip.

RULES:
- Max 25 words
- Actionable
- No emojis
- No markdown

Context:
Recent Topic Trend: ${topTopic}
Recent Pattern Trend: ${topPattern}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 80,
    });

    cachedTip = completion.choices[0].message.content.trim();
    lastGenerated = Date.now();
    lastExperienceCount = experienceCount;

    res.json({ tip: cachedTip });
  } catch (err) {
    console.error("AI TIP ERROR:", err);
    res.json({
      tip:
        "Focus on identifying the core pattern early before coding; most OA mistakes come from wrong pattern selection.",
    });
  }
});

/* ============================
   AI COMPANY COMPARISON
============================ */
router.post("/compare-summary", async (req, res) => {
  try {
    const { comparison, companyA, companyB } = req.body;

    if (!comparison || !companyA || !companyB) {
      return res.status(400).json({
        error: "comparison, companyA and companyB are required",
      });
    }

    const dataA = comparison[companyA];
    const dataB = comparison[companyB];

    if (!dataA || !dataB) {
      return res.status(400).json({
        error: "Invalid comparison data",
      });
    }

    const prompt = `
You are an OA analyst.

Compare ${companyA} vs ${companyB} using ONLY this data.

${companyA}:
- Difficulty: ${JSON.stringify(dataA.difficultyBreakdown)}
- Top Topics: ${dataA.topTopics.map(t => `${t.topic}(${t.count})`).join(", ")}

${companyB}:
- Difficulty: ${JSON.stringify(dataB.difficultyBreakdown)}
- Top Topics: ${dataB.topTopics.map(t => `${t.topic}(${t.count})`).join(", ")}

RULES:
- Max 4 short lines
- No emojis
- No markdown
- Be objective
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    res.json({
      summary: completion.choices[0].message.content.trim(),
    });
  } catch (err) {
    console.error("AI COMPARE ERROR:", err);
    res.status(500).json({
      error: "AI comparison failed",
    });
  }
});

module.exports = router;
