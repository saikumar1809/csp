const express = require("express");
const authController = require("../controllers/authController");
const viewsController = require("../controllers/viewController");
const userController = require("../controllers/userController");

const router = express.Router();
router.get("/", viewsController.getHomepage);
router.get("/signup", viewsController.signupDonar);
router.get("/donorship", viewsController.getDonorship);
router.get("/aboutUs", viewsController.getAboutUs);
router.get("/mentorship", viewsController.getMentorship);
router.get("/login", viewsController.login);
router.route("/cohortLead").get(viewsController.getCohortLead);
router.route("/student").get(viewsController.getStudent);
router.route("/mentor").get(viewsController.getMentor);
router.route("/donor").get(viewsController.getDonor);
router.route("/me").get(userController.getMe);
router.get("/me", userController.getMe, userController.getUser);

module.exports = router;
