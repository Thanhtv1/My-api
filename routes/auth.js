const authController = require("../controllers/authControllers");
const router = require("express").Router();
const middlewareController = require("../controllers/middlewareControllers");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post(
  "/logout",
  middlewareController.verifyToken,
  authController.logOutUser
);
router.post("/refresh", authController.rqRefreshToken);

module.exports = router;
