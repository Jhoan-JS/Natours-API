const Router = require('express').Router();

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getToursStats,
  getMonthlyPlan,
} = require('../controllers/tours.controller');

// Router.param('id', checkID);

Router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

Router.route('/tours-stats').get(getToursStats);
Router.route('/monthly-plan/:year').get(getMonthlyPlan);

Router.route('/').get(getAllTours).post(createTour);

Router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = Router;
