const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
require("dotenv").config();

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
    },
    (payload, done) => {
      try {
        console.log("payload", payload);
        // return res.status(200).json(payload);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
