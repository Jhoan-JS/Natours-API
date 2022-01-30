// const fs = require('fs');

const Tour = require('../models/Tours.model');

const APIFeatures = require('../utils/APIFeatures');

const AppError = require('../utils/AppError');

const catchAsync = require('../utils/catchAsync');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const freatures = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  //EXECUTE QUERY
  const tours = await freatures.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours: tours },
  });

  //

  // // } catch (error) {
  // //   // res.status(400).json({
  // //   //   status: 'fail',
  // //   //   message: error,
  // //   // });
  // // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const tour = await Tour.findById(id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { tour: tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: { tour: newTour } });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     // message: 'Invalid data sent',
  //     message: error,
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { tour: updatedTour } });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedTour = await Tour.findByIdAndDelete(id);

  if (!deletedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});

exports.aliasTopTours = (req, res, next) => {
  // req.query = {
  //   sort: '-ratingsAverage,price',
  //   limit: 5,
  //   fields: 'name,price,ratingsAverage,summary,difficulty',
  // };

  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';

  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({ status: 'success', stats });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  console.log(typeof year);
  const monthlyPlan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStats: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },

    { $sort: { numToursStats: -1 } },
  ]);

  res.status(200).json({ status: 'success', monthlyPlan });
});
