// // server/config/passport.js
// const passport       = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const JwtStrategy    = require("passport-jwt").Strategy;
// const ExtractJwt     = require("passport-jwt").ExtractJwt;
// const User           = require("../models/User");
// const logger         = require("../utils/logger");

// // ── Google OAuth Strategy ─────────────────────────────────────────────────
// passport.use(new GoogleStrategy(
//   {
//     clientID:     process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL:  `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`,
//     // Prevent open redirector attacks — only allow our callback URL
//     proxy: true,
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       if (!profile.emails?.[0]?.value) {
//         return done(new Error("No email returned from Google"), null);
//       }

//       let user = await User.findOne({ googleId: profile.id });

//       if (!user) {
//         user = await User.create({
//           googleId:    profile.id,
//           name:        profile.displayName?.slice(0, 100) || "User",
//           email:       profile.emails[0].value.toLowerCase(),
//           photo:       profile.photos?.[0]?.value || "",
//           coupleId:    null,
//         });
//         logger.info("New user registered via Google OAuth", { userId: user._id });
//       }

//       return done(null, user);
//     } catch (err) {
//       logger.error("Google OAuth error", { error: err.message });
//       return done(err, null);
//     }
//   }
// ));

// // ── JWT Strategy ─────────────────────────────────────────────────────────
// passport.use(new JwtStrategy(
//   {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey:    process.env.JWT_SECRET,
//     // Reject tokens issued before this date (useful for "logout all devices")
//     issuer:         "az-date-api",
//     audience:       "az-date-client",
//   },
//   async (payload, done) => {
//     try {
//       const user = await User.findById(payload.id).select("-__v");
//       if (!user) return done(null, false);
//       return done(null, user);
//     } catch (err) {
//       return done(err, false);
//     }
//   }
// ));

// passport.serializeUser((user, done)   => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   try { done(null, await User.findById(id)); }
//   catch (e) { done(e); }
// });

// module.exports = passport;








// server/config/passport.js
const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy    = require("passport-jwt").Strategy;
const ExtractJwt     = require("passport-jwt").ExtractJwt;
const User           = require("../models/User");
const logger         = require("../utils/logger");

// ── Google OAuth Strategy ─────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.SERVER_URL || "https://heartoz.onrender.com"}/api/auth/google/callback`,
    proxy: true,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (!profile.emails?.[0]?.value) {
        return done(new Error("No email returned from Google"), null);
      }

      const email    = profile.emails[0].value.toLowerCase();
      const googleId = profile.id;

      // 1. Try find by googleId first
      let user = await User.findOne({ googleId });

      // 2. If not found by googleId, try find by email (handles duplicate key case)
      if (!user) {
        user = await User.findOne({ email });
        if (user) {
          // User exists with this email but different/missing googleId — link it
          user.googleId = googleId;
          user.photo    = profile.photos?.[0]?.value || user.photo;
          await user.save();
          logger.info("Linked Google ID to existing user", { userId: user._id });
        }
      }

      // 3. Brand new user — create fresh
      if (!user) {
        user = await User.create({
          googleId,
          name:     profile.displayName?.slice(0, 100) || "User",
          email,
          photo:    profile.photos?.[0]?.value || "",
          coupleId: null,
        });
        logger.info("New user registered via Google OAuth", { userId: user._id });
      }

      return done(null, user);
    } catch (err) {
      // Handle race condition duplicate key — try one more lookup
      if (err.code === 11000) {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          const user  = await User.findOne({ email });
          if (user) return done(null, user);
        } catch (e) { /* fall through */ }
      }
      logger.error("Google OAuth error", { error: err.message });
      return done(err, null);
    }
  }
));

// ── JWT Strategy ─────────────────────────────────────────────────────────
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:    process.env.JWT_SECRET,
    issuer:         "az-date-api",
    audience:       "az-date-client",
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select("-__v");
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

passport.serializeUser((user, done)   => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await User.findById(id)); }
  catch (e) { done(e); }
});

module.exports = passport;