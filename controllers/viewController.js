const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const User = require("../models/userModel");
const Cohort = require("../models/CohortModel");
exports.getHomepage = catchAsync(async (req, res, next) => {
  const users = await User.find({
    $or: [{ role: "student" }, { role: "mentor" }],
  });
  const cohorts = await Cohort.find();

  studentCount = 0;
  users.forEach((element) => {
    if (element.role === "student") {
      studentCount += 1;
    }
  });

  // console.log(users.length);
  // console.log(cohorts.length);
  res.status(200).render("homepage", {
    user: "saikumar",
    students: studentCount,
    mentors: users.length - studentCount,
    cohorts: cohorts.length,
  });
});
exports.signupDonar = (req, res) => {
  res.status(200).render("donarRegister", {
    user: "saikumar",
    cohort: "cohort-2",
  });
};
exports.getDonorship = catchAsync(async (req, res, next) => {
  const donars = await User.find({ role: "donor" });
  res.status(200).render("donorship", {
    donars: donars.length,
  });
});


exports.getAboutUs = catchAsync(async (req, res, next) => {
  res.status(200).render("aboutUs", {});
});
exports.getMentorship = catchAsync(async (req, res, next) => {
  res.status(200).render("mentorship", {});
});
exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {});
});

exports.getCohortLead = catchAsync(async (req, res, next) => {
  res.status(200).render("cohortLead", {});
});
exports.getStudent = catchAsync(async (req, res, next) => {
  res.status(200).render("student", {});
});
exports.getMentor = catchAsync(async (req, res, next) => {
  res.status(200).render("mentor", {});
});
exports.getDonor = catchAsync(async (req, res, next) => {
  res.status(200).render("donar", {});
});
