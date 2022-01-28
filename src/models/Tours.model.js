const mongoose = require('mongoose');

// const validator = require('validator');

const slugify = require('slugify');

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [validator.isAlpha, 'Tour name  must only contain characters'],
    },
    slug: { type: String },
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A tour must have a group size'],
    },

    difficulty: {
      type: String,
      require: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: [0, 'Price must be above 0'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image '],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TourSchema.virtual('durationWeeks').get(function () {
  return Math.round(this.duration / 7);
});

//Document middleware: runs before .save() and .create()
TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

//Query middleware

TourSchema.pre(/^f ind/, function (next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

//Aggregation middleware

TourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// TourSchema.post('save', function (doc, next) {
//   console.log(doc);

//   next();
// });

module.exports = mongoose.model('Tour', TourSchema);
