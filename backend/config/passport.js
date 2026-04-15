const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email }
          ],
        });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName || email.split('@')[0],
            googleId: profile.id,
            isVerified: true,
          });
        } else if (!user.googleId) {
          // account linking
          user.googleId = profile.id;
          user.name = user.name || profile.displayName || email.split('@')[0];
          user.isVerified = true;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
