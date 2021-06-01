const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  role: {
    type: String,
    enum: ["student", "mentor", "cohort-lead", "donor", "coordinator"],
    default: "student",
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  DOB: {
    type: Date,
    //required:[true,user must have date of birth]
  },

  gender: {
    type: String,
    enum: ["male", "female"],
    required: function () {
      return this.role === "student";
    },
  },

  languages: {
    language1: { type: Boolean, required: false, default: true },
    language2: { type: Boolean, required: false, default: true },
  },

  phoneNo: {
    type: String,
    maxlength: [10, "phone number should not exceed 10 digits"],
    minlength: [10, "phone number should not be lessthan 10 digits"],
    required: [true, `${this.role} must have a phone number`],
  },
  //student specfic
  goal: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  score: {
    type: Number,
    default: 0,
  },

  photo: {
    type: String,
    default: "default.jpg",
  },

  cohort: {
    type: mongoose.Schema.ObjectId,
    required: function () {
      return this.role === "student" || this.role === "cohort";
    },
    ref: "Cohort",
  },
  mentor: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "student";
    },
  },
  fatherName: {
    type: String,
    //required: [true, "Please tell us your mother name!"],
    required: function () {
      return this.role === "student";
    },
  },
  motherName: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  fatherOccupation: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  motherOccupation: {
    type: String,
    required: function () {
      return this.role === "student";
    },
  },
  fatherPhone: {
    type: String,
    maxlength: [10, "phone number should not exceed 10 digits"],
    minlength: [10, "phone number should not be lessthan 10 digits"],
  },
  siblings: {
    type: Number,
    required: function () {
      return this.role === "student";
    },
  },
  address: {
    type: String,
    hno: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    //required: [true, "user must have address"],
  },

  //mentor specific
  mentee: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: function () {
      return this.role === "mentor";
    },
  },
  currentJob: {
    type: String,
    required: function () {
      return this.role === "mentor";
    },
  },
  currentCompany: {
    type: String,
    required: function () {
      return this.role === "mentor";
    },
  },
  qualification: {
    type: String,
    required: function () {
      return this.role === "mentor";
    },
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please conform your password"],
    validate: {
      //this only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password; //abc === abc
      },
      message: "Passwords are not same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  //runs between recive the data and send it to data base
  //only run this function if the password was actually modified
  if (!this.isModified("password")) return next();
  //hashes the password
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 5000;
  next();
});
userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; //100<200
  }
  //False means Not changed
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
