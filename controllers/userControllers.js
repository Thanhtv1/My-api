const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userController = {
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user._id });
      const { password, ...rest } = user._doc;
      return res.status(200).json(rest);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  updateUserAvatar: async (req, res) => {
    try {
      const { picture } = req.body;
      await User.findByIdAndUpdate(
        req.user._id,
        {
          avatar: picture,
        },
        { new: true }
      );
      // await save();
      return res.status(200).json("Updated avatar successfully");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  updateUserProfile: async (req, res) => {
    try {
      const { currentPass, newEmail, newPass, username } = req.body;
      const validPassword = await bcrypt.compare(
        currentPass,
        req.user.password
      );
      if (validPassword) {
        const isEmailAvailable = await User.findOne({ email: newEmail });
        const isUsernameAvailable = await User.findOne({ username });
        if (isEmailAvailable) {
          return res.status(401).json("This email already exists");
        }
        if (isUsernameAvailable) {
          return res.status(401).json("This username already exists");
        }
        await User.findByIdAndUpdate(
          req.user._id,
          {
            username: username || req.user.username,
            email: newEmail || req.user.email,
            password:
              newPass === ""
                ? req.user.password
                : await bcrypt.hash(newPass, 10),
          },
          { new: true }
        );
        return res.status(200).json("Updated profile successfully");
      } else {
        return res.status(404).json("Invalid Confirm Password");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { confirmPass } = req.body;
      const validPassword = await bcrypt.compare(
        confirmPass,
        req.user.password
      );
      res.clearCookie("refreshToken");
      if (validPassword) {
        await User.findOneAndDelete({ _id: req.user._id });
        res.clearCookie("refreshToken");
        return res.status(200).json("Delete Successfully");
      } else {
        res.status(403).json("Invalid Confirm Password");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  addToFavoriteLists: async (req, res) => {
    try {
      const { data } = req.body;
      const user = await User.findOne({ _id: req.user.id });
      if (user) {
        const { favMovies } = user;
        const isAlreadyAdded = favMovies.find(({ id }) => id == data.id);
        if (!isAlreadyAdded) {
          await User.findByIdAndUpdate(
            user._id,
            {
              favMovies: [...user.favMovies, data],
            },
            { new: true }
          );
        } else return res.status(400).json("You have already added this");
      }
      return res.json({ msg: "Added successfully", data: user });
    } catch (error) {
      return res.json("Error adding");
    }
  },

  removeAFilm: async (req, res) => {
    try {
      const { data } = req.body;
      // return res.status(200).json(req.body.data);
      const user = await User.findOne({ _id: req.user._id });
      if (user) {
        let { favMovies } = user;
        const isAvailable = favMovies.find(({ id }) => id == data);
        if (isAvailable) {
          const newArr = favMovies.filter(({ id }) => id !== data * 1);
          await User.findByIdAndUpdate(
            user._id,
            {
              favMovies: newArr,
            },
            { new: true }
          );
        } else return res.status(400).json("The item is already removed");
      }
      return res.status(200).json("Remove successfully");
    } catch (error) {
      return res.status(400).json("Error Removing");
    }
  },
  removeAllFilms: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.user._id });
      if (user) {
        const { favMovies } = user;
        if (favMovies.length > 0) {
          await User.findByIdAndUpdate(
            user._id,
            {
              favMovies: [],
            },
            { new: true }
          );
          return res.status(200).json("Remove all films successfully");
        } else {
          return res.status(400).json("You have not added any films yet");
        }
      } else {
        return res.status(404).json("User not found");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = userController;
