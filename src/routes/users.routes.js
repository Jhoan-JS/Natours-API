const Router = require('express').Router();

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/users.controller');

Router.route('/').get(getAllUsers).post(createUser);

Router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = Router;
