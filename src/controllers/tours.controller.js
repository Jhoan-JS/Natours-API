// const fs = require('fs');

const Tour = require('../models/Tours.model');

const APIFeatures = require('../utils/APIFeatures');

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  // const { id } = req.params;
  // const tour = tours.find((el) => el.id === Number(id));
  // if (!tour) {

  // }

  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);

    res.status(200).json({
      status: 'success',
      data: { tour: tour },
    });
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      // message: 'Invalid data sent',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: 'success', data: { tour: updatedTour } });
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    await Tour.findByIdAndDelete(id);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

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

exports.getToursStats = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
