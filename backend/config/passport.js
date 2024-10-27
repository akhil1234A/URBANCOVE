const User = require('../models/User');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(passport) {
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ googleId: profile.id });
            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = new User({ googleId: profile.id, name: profile.displayName });
            await newUser.save();
            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    }));

    // Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await User.findOne({ facebookId: profile.id });
            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = new User({ facebookId: profile.id, name: profile.displayName });
            await newUser.save();
            done(null, newUser);
        } catch (error) {
            done(error, null);
        }
    }));

    // Serialize and deserialize user instances for session management
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
