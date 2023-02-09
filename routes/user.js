const middlewareController = require("../controllers/middlewareControllers");
const userController = require("../controllers/userControllers");
const router = require("express").Router();
const passport = require("passport");
const passportConfig = require("../controllers/passport");

router.get(
  "/profile",
  middlewareController.verifyToken,
  userController.getUserProfile
);
// router.get("/secret", passport.authenticate("jwt"));
router.put(
  "/updateProfile",
  middlewareController.verifyToken,
  userController.updateUserProfile
);
router.put(
  "/updateAvatar",
  middlewareController.verifyToken,
  userController.updateUserAvatar
);

router.post(
  "/deleteAccount",
  middlewareController.verifyToken,
  userController.deleteUser
);

router.post(
  "/addFlim",
  middlewareController.verifyToken,
  userController.addToFavoriteLists
);

router.put(
  "/removeAnItem",
  middlewareController.verifyToken,
  userController.removeAFilm
);

router.delete(
  "/removeAllItem",
  middlewareController.verifyToken,
  userController.removeAllFilms
);

module.exports = router;
