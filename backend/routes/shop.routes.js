const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth.middleware");

// 🛒 conversion table
const SHOP_PACKS = {
  small: { coins: 10, points: 5 },
  medium: { coins: 20, points: 12 },
  large: { coins: 50, points: 35 },
};

/* ================= DAILY VISIT CLAIM ================= */

router.post("/claim", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    if (
      user.lastDailyVisit &&
      user.lastDailyVisit.toDateString() === now.toDateString()
    ) {
      return res.status(400).json({ message: "Already claimed today" });
    }

    // ✅ safe increments
    user.coins = (user.coins || 0) + 1;   // 🪙 +1 coin
    user.points = (user.points || 0) + 5; // 🏆 +5 points
    user.lastDailyVisit = now;

    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      points: user.points,
    });
  } catch (err) {
    console.error("DAILY CLAIM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= BUY POINTS ================= */

router.post("/buy-points", auth, async (req, res) => {
  try {
    const { pack } = req.body;
    const selected = SHOP_PACKS[pack];

    if (!selected) {
      return res.status(400).json({ message: "Invalid pack" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.coins = user.coins || 0;
    user.points = user.points || 0;

    if (user.coins < selected.coins) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    user.coins -= selected.coins;
    user.points += selected.points;

    await user.save();

    res.json({
      success: true,
      coinsLeft: user.coins,
      totalPoints: user.points,
    });
  } catch (err) {
    console.error("BUY POINTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
