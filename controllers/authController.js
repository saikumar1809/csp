/* eslint-disable arrow-body-style */
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const mentorReq = require("../models/requestModel");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
    secure: req.secure || req.get("x-forwarded-proto") === "https",
  });

  //Remove the password form the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // let additional = {};
  // console.log("user->", req.body.role);
  // if (req.body.role === "student") {
  //   additional = { mentor: req.body.mentor, cohort: req.params.cohort };
  // }
  // let fileds = {};
  const newUser = await User.create(
    req.body
    // name: req.body.name,
    // email: req.body.email,
    // password: req.body.password,
    // passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    // role: req.body.role,
  );
  const url = `${req.protocol}://${req.get("host")}/me`;
  // console.log(url);
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
  next();
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1)check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  //2) check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password"); //{email:email}
  //use bcrypt to generate password and compare it with encrypted one
  //correctPassword method is a instance method it is available in all the users document
  // console.log(user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3) If everything is ok,send token to client

  createSendToken(user, 200, req, res);
});
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};
exports.protect = catchAsync(async (req, res, next) => {
  //1)Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== "loggedout") {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in please login to get acess", 401)
    );
  }
  //2)Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3)Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to the token no longer exist", 401)
    );
  }
  //4)Check if user change password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
//Only for rendered pages,no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1)Verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //console.log(decoded);

      //3)Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //4)Check if user change password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //There is a logged in user
      //There is a logged in user

      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin','lead-guide'],role='user
    console.log("in the restrict to");
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get u  ser based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address", 404));
  }
  //2)Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3)send it to user's email
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) If token has not expires and there is user ,set the password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3)update changePassowordAt property to the user
  //4)Log the user in,send Jwt
  createSendToken(user, 200, req, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)Get the user from collection

  const user = await User.findById(req.user.id).select("+password");
  //2) check if posted password is correct
  //const { password } = req.body;

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //3)If so update the passeword
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //console.log(user.password);
  //4)Log userin ,send JwT

  createSendToken(user, 201, req, res);
});
