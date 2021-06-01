const User = require("../models/userModel");
const Request = require("../models/requestModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined! Please use signup instead",
  });
};

//Do Not update password with this

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)create an error if the user is trying to update the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates.Please use /updateMyPassword",
        400
      )
    );
  }
  //2)filter out unwanted fields that are not allowed to updated
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;
  //3)Update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createMentorRequest = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const request = await Request.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    workingAt: req.body.workingAt,
    jobRole: req.body.jobRole,
    question1: req.body.question1,
    question2: req.body.question2,
    question3: req.body.question3,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: request,
    },
  });
  console.log("api/v1/user/signup");
  // next();
});
exports.approveMentorRequest = catchAsync(async (req, res, next) => {
  console.log("approving mentor request");
  console.log(req.params.reqId);
  const request = await Request.findById(req.params.reqId);

  if (!request) {
    return next(new AppError("request not found", 400));
  }
  if (request.approved) {
    return next(new AppError("mentor is already approved", 200));
  }

  request.approved = true;
  await request.save();

  res.status(204).json({
    status: "success",
    data: "sucessfully approved",
  });
  next();
  //send register link to the mentor with default name mail id phone number jobROle working at
});
exports.rejectMentorRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.reqId);
  console.log(request);

  if (!request) {
    return next(new AppError("request not found", 400));
  }
  if (request.approved) {
    return next(
      new AppError(
        "mentor is already approved you cannot delete the request now",
        200
      )
    );
  }
  request.active = false;
  request.rejectionReason = req.body.rejectionReason;
  await request.save();
  res.status(204).json({
    status: "success",
    data: null,
  });
  //send email saying the rejection
});
exports.getMentorRequests = factory.getAll(Request);
exports.getMentorRequest = factory.getOne(Request);
