var express = require('express');
var router = express.Router();

var controller = require('../controllers/users.controller.js');

//get (all users)
router.route('/users')
  .get(function (req, res, next) {
    controller.get(req, res);
  });

//getById (get a user by its id)
router.route('/users/:id')
  .get(function (req, res, next) {
    controller.getById(req, res);
  });

//create (create a user)
router.route('/users')
  .post(function (req, res, next) {
    controller.create(req, res);
  });

//reset (resets user's password)
router.route('/users/reset/:id')
  .put(function (req, res, next) {
    controller.reset(req, res);
  });

//changePassword (changes user's password)
router.route('/users/changePassword/:id')
  .put(function (req, res, next) {
    controller.changePassword(req, res);
  });

//suspend (changes user status to "SUSPENDED")
router.route('/users/suspend/:id')
  .put(function (req, res, next) {
    controller.suspend(req, res);
  });

//inactive (changes user status to "INACTIVE")
router.route('/users/inactive/:id')
  .put(function (req, res, next) {
    controller.inactive(req, res);
  });

//active (changes user status to "ACTIVE")
router.route('/users/active/:id')
  .put(function (req, res, next) {
    controller.active(req, res);
  });

module.exports = router;