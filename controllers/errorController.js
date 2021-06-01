/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-useless-path-segments */
const AppError = require("./../utils/appError");
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDb = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate field value:${value},please enter an other value`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJWTExpiredError = () =>
  new AppError("Token has expired please login again", 401);
const handleJWTerror = () => new AppError("Invalid Token please login in", 401);
const sendErrorPro = (err, req, res) => {
  //A operational:trusted then send a message to the client
  if (req.originalUrl.startsWith("/api")) {
    //Api
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //B programming or another unknown error

    //log server
    console.error("Error 🔥", err);
    //send generic message
    return res.status(500).json({
      status: "error",
      message: "oops something went very wrong",
    });
  }
  //B RENDERD WEBSITE
  //A operational:trusted then send a message to the client
  if (err.isOperational) {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  //programming or another unknown error
  else {
    //log server
    console.error("Error 🔥", err);
    //send generic message
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: "Please try again later",
    });
  }
};
const sendErrorDev = (err, req, res) => {
  //A)API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //B) RENDERED WEBSITE
  console.error("Error 🔥", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } //else if (process.env.NODE_ENV === 'production')
  else {
    let error = Object.create(err);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDb(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTerror();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorPro(error, req, res);
  }
};
