const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
const createAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: "30d",
    }
  );
};
const createRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    process.env.REFRESH_TOKEN_KEY,
    { expiresIn: "60d" }
  );
};
let refreshTokens = [];

const authController = {
  registerUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json("Please fill out all fields");
      }
      if (!validateEmail(email)) {
        return res.status(400).json("Invalid Email");
      }
      const checkEmail = await User.findOne({ email: email.toLowerCase() });
      const checkUserName = await User.findOne({
        username: username.toLowerCase(),
      });
      if (checkEmail) {
        return res.status(400).json("The email already exists");
      }
      if (checkUserName) {
        return res.status(400).json("The username already exists");
      }
      if (password.length < 5) {
        return res
          .status(400)
          .json("Password must contain more than 5 characters");
      }
      const hashed = await bcrypt.hash(password.toLowerCase(), 10);
      const newUser = await new User({
        username: username,
        email: email,
        password: hashed,
      });
      await newUser.save();
      return res.status(200).json("Register successfully");
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json("This email does not exists!");
      }
      const validPassword = await bcrypt.compare(
        password.toLowerCase(),
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Wrong password!");
      }
      if (user && validPassword) {
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);
        // refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          expires: new Date(Date.now() + 60 * 24 * 3600000),
          path: "/",
          sameSite: "none",
        });
        const { password, ...rest } = user._doc;
        return res.status(200).json({ user: { ...rest, accessToken } });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  logOutUser: async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    return res.status(200).json("Logout successfully");
  },

  rqRefreshToken: async (req, res) => {
    const rfToken = req.cookies.refreshToken;
    if (!rfToken) {
      return res.status(401).json("You are not authenticated");
    }
    // if (!refreshTokens.includes(rfToken)) {
    //   return res.status(403).json("Refresh Token are Not Valid");
    // }
    jwt.verify(rfToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
      if (err) {
        return res.status.json(err);
      }
      // refreshTokens = refreshTokens.filter((token) => token !== rfToken);
      // create new acc and refresh token
      const newAccessToken = createAccessToken(user);
      const newRefreshToken = createRefreshToken(user);
      // refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 60 * 24 * 3600000),
        path: "/",
        sameSite: "none",
      });
      res.status(200).json({ accessToken: newAccessToken });
    });
  },
};

module.exports = authController;
