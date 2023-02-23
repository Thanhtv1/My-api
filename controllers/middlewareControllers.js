const jwt = require("jsonwebtoken");
const User = require("../models/User");

const middlewareController = {
  verifyToken: async (req, res, next) => {
    // return res.status(404).json(req.header('Authorization').split(" ")[1])
    try {
      const token = req.header('Authorization').split(" ")[1];
      if (token) {
        const data = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        const user = await User.findOne({ _id: data.id });
        if (user) {
          req.user = user;
          next();
        } else {
          return res.status(401).json("User Not Found");
        }
      } else {
        return res.status(403).json("Must provide a token");
      }
    } catch (error) {
      return res.status(401).json("Invalid token Or Not authorized to do this");
    }
  },
};

module.exports = middlewareController;
