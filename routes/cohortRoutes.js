const express = require("express");
const cohortController = require("../controllers/cohortController");
const authController = require("../controllers/authController");

const router = express.Router();
router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("coordinator"),
    cohortController.getAllCohorts
  )
  .post(
    authController.protect,
    authController.restrictTo("coordinator"),
    cohortController.createCohort
  );
router
  .route("/:id")
  .get(cohortController.getCohort)

  .patch(
    authController.protect,
    authController.restrictTo("coordinator", "cohort-lead"),
    cohortController.updateCohort
  )
  .delete(
    authController.protect,
    authController.restrictTo("coordinator"),
    cohortController.deleteCohort
  );
router.route("/:name").get(cohortController.getCohortId);

module.exports = router;
