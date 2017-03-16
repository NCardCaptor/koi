var express = require('express');
var router = express.Router();

var controller = require('../controllers/login.controller.js');

//authenticate (login with credentials)
router.route('/login/authenticate/')
  .put(function (req, res, next) {
    controller.authenticate(req, res);
  });

  module.exports = router;