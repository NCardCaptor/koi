var express = require('express');
var router = express.Router();

var controller = require('../controllers/users.controller.js');

router.route('/users')
  .get(function (req, res, next) {
    controller.get(req, res);
  });


router.route('/users/:id')
  .get(function (req, res, next) {
    controller.getById(req, res);
  });

router.route('/users')
  .post(function (req, res, next) {
    controller.create(req, res);
  });
  
  router.route('/users/:id')
  .put(function (req, res, next) {
    controller.update(req, res);
  });
  
   router.route('/users/:id')
  .delete(function (req, res, next) {
    controller.delete(req, res);
  });


module.exports = router;