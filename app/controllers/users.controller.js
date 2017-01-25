"use strict";

var logger = require("../config/logger.configuration");

var cls = require("../config/namespace.configuration");
var Promise = cls.Promise;

var _ = require("lodash");
var Users = require("../models/users.model");
var config = require("../config/user.configuration");




//get (all users)
module.exports.get = function (request, response) {

    function getUsers() {
        return new Promise(function (fulfill, reject) {
            Users.find({}, function (err, results) {
                if (err) {
                    reject("error");
                } else {
                    fulfill(results);
                }
            });
        });
    };

    getUsers().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.get():", {
            error: err
        });
    }).done();
};

//getById (get a user by its id)
module.exports.getById = function (request, response) {

    function getUserById() {
        return new Promise(function (fulfill, reject) {
            var userId = request.params.id;
            Users.find({
                id: userId
            }, function (err, results) {
                if (err) {
                    reject("error");
                } else {
                    fulfill(results);
                }
            });
        });
    };

    getUserById().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.getById():", {
            error: err
        });
    }).done();
};

//create (create a user)
module.exports.create = function (request, response) {

    function createUser() {
        return new Promise(function (fulfill, reject) {
            var user = {
                username: request.body.username,
                password: request.body.password
            }

            Users.create(user, function (err, results) {
                if (err) {
                    reject("error");
                } else {
                    fulfill(results);
                }
            });
        });
    };

    createUser().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.createUser():", {
            error: err
        });
    }).done();
};

//update (update a user by its id)
module.exports.update = function (request, response) {

    function updateUser() {
        return new Promise(function (fulfill, reject) {
            var userId = request.params.id;
            var user = {
                username: request.body.username,
                password: request.body.password
            }
            Users.get(userId, function (err, results) {
                if (err) {
                   reject("error");
                } else {
                    results.username = user.username;
                    results.password = user.password;
                    results.save(function (err, results) {
                        if (err) {
                            reject("error");
                        } else {
                            fulfill(results);
                        }
                    });
                }
            });
        });
    };

    updateUser().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.update():", {
            error: err
        });
    }).done();
};

//delete (delete a user by its id)
module.exports.delete = function (request, response) {

    function deleteUser() {
        return new Promise(function (fulfill, reject) {
            var userId = request.params.id;
            Users.find({
                id: userId
            }).remove(function (err, results) {
                if (err) {
                    reject("error");
                } else {
                    fulfill(results);
                }
            });
        });
    };

    deleteUser().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.delete():", {
            error: err
        });
    }).done();
};