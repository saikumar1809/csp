const mongoose = require("mongoose");
const validator = require("validator");
const mentorRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phoneNumber: {
    type: String,
    maxlength: [10, "phone number should not exceed 10 digits"],
    minlength: [10, "phone number should not be lessthan 10 digits"],
    required: [true, `mentor must have a phone number`],
  },
  jobRole: {
    type: String,
    required: true,
  },

  workingAt: {
    type: String,
    required: true,
  },

  question1: {
    type: String,
  },
  question2: {
    type: String,
  },
  question3: {
    type: String,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  rejectionReason: {
    type: String,
  },
});
mentorRequestSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});
const mentorRequest = mongoose.model("mentorRequest", mentorRequestSchema);
module.exports = mentorRequest;
