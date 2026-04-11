const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authCtrl = require("../controllers/auth.controller");

/* EMAIL AUTH */
router.post("/signup", authCtrl.signup);
router.post("/verify-otp", authCtrl.verifyOtp);
router.post("/login", authCtrl.login);
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);


/* GOOGLE AUTH */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email, 
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${token}&role=${req.user.role}&email=${req.user.email}`
    );
  }
);

module.exports = router;
