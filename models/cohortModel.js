const mongoose = require("mongoose");
const slugify = require("slugify");

const cohortSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "cohort must have name"],
      unique: true,
      trim: true,
      maxlength: [
        20,
        "A cohort name must have less or equal than 20 charecters",
      ],
      minlength: [
        5,
        "A cohort name must have greater or equal than 5 charecters",
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A cohort must have duration in years"],
    },
    imageCover: {
      type: String,
      required: [true, "A cohort must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    cohortLead: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
cohortSchema.index({ slug: 1 });
cohortSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
cohortSchema.pre(/^find/, function (next) {
  this.populate({
    path: "cohort-lead",
    select: "-__v",
  });
  next();
});
const Cohort = mongoose.model("Cohort", cohortSchema);
module.exports = Cohort;
