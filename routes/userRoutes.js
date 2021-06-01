const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const viewController = require("../controllers/viewController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router
  .route("/mentorRequest")
  .post(userController.createMentorRequest)
  .get(
    authController.protect,
    authController.restrictTo("coordinator"),
    userController.getMentorRequests
  );
router.use(authController.protect);
router
  .route("/mentorRequest/:id")
  .get(
    authController.restrictTo("coordinator"),
    userController.getMentorRequest
  )
  .patch(
    authController.restrictTo("coordinator"),
    userController.approveMentorRequest
  )
  .delete(
    authController.restrictTo("coordinator"),
    userController.rejectMentorRequest
  );

router
  .route("/me")
  .get(userController.getMe, userController.getUser)
  .patch(userController.getMe, userController.updateMe);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router.route("/:role").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
