"use strict";

var logger = require("../config/logger.configuration");

var cls = require("../config/namespace.configuration");
var Promise = cls.Promise;

var _ = require("lodash");
var mysql = require('../config/mysql.configuration.js')
var Users = require("../models/users.model");
var config = require("../config/user.configuration");
var db = mysql.getDb();

// inserts or updates master user
db.driver.execQuery("INSERT INTO users (username,password) VALUES ('master', 'master') ON DUPLICATE KEY UPDATE password = 'master'", function (err, data) { 
    if(err){
        console.log(err);
        // TODO: change password
    }
});


//get (all users)
module.exports.get = function (request, response) {

    function getUsers() {
        var deferred = Promise.defer();
        Users.find({}, function (err, results) {
            if (err) {
                deferred.reject("error");
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    };

    getUsers().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.get():", { error: err });
    }).done();
};

//getById (get a user by its id)
module.exports.getById = function (request, response) {

    function getUserById() {
        var deferred = Promise.defer();
        var userId = request.params.id;
        Users.find({ id: userId }, function (err, results) {
            if (err) {
                deferred.reject("error");
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    };

    getUserById().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.getById():", { error: err });
    }).done();
};

//create (create a user)
module.exports.create = function (request, response) {

    function createUser() {
        var deferred = Promise.defer();
        var user = {
            username: request.body.username,
            password: request.body.password
        }

        Users.create(user, function (err, results) {
            if (err) {
                deferred.reject("error");
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    };

    createUser().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.createUser():", { error: err });
    }).done();
};

//update (update a user by its id)
module.exports.update = function (request, response) {

    function updateUser() {
        var deferred = Promise.defer();
        var userId = request.params.id;
        var user = {
            username: request.body.username,
            password: request.body.password
        }
        Users.get(userId, function (err, results) {
            if (err) {
                deferred.reject("error");
            } else {
                results.username = user.username;
                results.password = user.password;
                results.save(function (err, results) {
                    if (err) {
                        deferred.reject("error");
                    } else {
                        deferred.resolve(results);
                    }
                });
            }
        });
        return deferred.promise;
    };

    updateUser().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.update():", { error: err });
    }).done();
};

//delete (delete a user by its id)
module.exports.delete = function (request, response) {

    function deleteUser() {
        var deferred = Promise.defer();
        var userId = request.params.id;
        Users.find({ id: userId }).remove(function (err, results) {
            if (err) {
                deferred.reject("error");
            } else {
                deferred.resolve(results);
            }
        });
        return deferred.promise;
    };

    deleteUser().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        //errors.sendError(err, response);
        logger.error("UserController.delete():", { error: err });
    }).done();
};