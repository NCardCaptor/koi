"use strict";

var logger = require("../config/logger.configuration");

var cls = require("../config/namespace.configuration");
var Promise = require("bluebird");

var _ = require("lodash");
var Users = require("../models/users.model");
var config = require("../config/user.configuration");
var errors = require("../support/error");

//global functions
function getUserById(request) {
    return new Promise(function (resolve, reject) {
        // validates userId
        if (_.isEmpty(request.params.id)) {
            reject("required user");
        }

        var userId = request.params.id;

        Users.get(userId, function (err, results) {
            if (err) {
                reject("error while finding user");
            } else {
                if (_.isEmpty(results)) {
                    reject("user not found");
                }
                resolve(results);
            }
        });

    });
};

//get (all users)
module.exports.get = function (request, response) {

    function getUsers() {
        return new Promise(function (resolve, reject) {
            Users.find({}, function (err, results) {
                if (err) {
                    reject("error getting users");
                } else {
                    resolve(results);
                }
            });
        });
    };

    getUsers().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.get():", {
            error: err
        });
    }).done();
};

//getById (get a user by its id)
module.exports.getById = function (request, response) {

    getUserById(request).then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.getById():", {
            error: err
        });
    }).done();
};

//create (create a user)
module.exports.create = function (request, response) {

    function createUser() {
        return new Promise(function (resolve, reject) {
            var today = new Date();
            var user = {
                username: request.body.username,
                password: request.body.password,
                status: "ACTIVE",
                lastModifyDate: today,
                createDate: today,
                caducityDate: new Date(today.getTime() + 30 * 86400000) //TODO: get days from database and change "30" in function
            }

            Users.create(user, function (err, results) {
                if (err) {
                    reject("error getting user");
                } else {
                    resolve(results);
                }
            });
        });
    };

    createUser().then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.createUser():", {
            error: err
        });
    }).done();
};

//reset (resets user's password)
module.exports.reset = function (request, response) {

    function resetUser(user) {
        return new Promise(function (resolve, reject) {
            if (user.statuss != "SUSPENDED") {
                reject("status must be SUSPENDED");
            }

            var today = new Date();
            var newUser = {
                password: "lala", //TODO: generate password
                status: "ACTIVE",
                lastModifyDate: today,
                caducityDate: new Date(today.getTime() + 30 * 86400000) //TODO: get days from database and change "30" in function
            }

            user.password = newUser.password;
            user.status = newUser.status;
            user.lastModifyDate = newUser.lastModifyDate;
            user.caducityDate = newUser.caducityDate;
            user.save(function (err, results) {
                if (err) {
                    reject("error reset");
                } else {
                    resolve(results);
                }
            });
        });
    };

    getUserById(request).then(
        resetUser
    ).then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.reset():", {
            error: err
        });
    }).done();
};

//changePassword (changes user's password)
module.exports.changePassword = function (request, response) {

    function validateUser() {

        // validates userId
        if (_.isEmpty(request.params.id)) {
            return Promise.reject("required user");
        }

        // validates password
        if (_.isEmpty(request.body.password)) {
            return Promise.reject("required password");
        }

        // validates oldPassword
        if (_.isEmpty(request.body.oldPassword)) {
            return Promise.reject("required oldPassword");
        }

        return getUserById(request);

    };

    function changePassword(user) {
        return new Promise(function (resolve, reject) {

            var today = new Date();
            var newUser = {
                password: request.body.password,
                oldPassword: request.body.oldPassword,
                status: "ACTIVE",
                lastModifyDate: today,
                caducityDate: new Date(today.getTime() + 30 * 86400000) //TODO: get days from database and change "30" in function
            }

            if (user.password === newUser.oldPassword) {
                user.password = newUser.password;
                user.status = newUser.status;
                user.lastModifyDate = newUser.lastModifyDate;
                user.caducityDate = newUser.caducityDate;
                user.save(function (err, results) {
                    if (err) {
                        reject("error changing password");
                    } else {
                        resolve(results);
                    }
                });
            } else {
                reject("passwords doesn't match");
            }

        });
    };



    validateUser().then(
        changePassword
    ).then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.changePassword():", {
            error: err
        });
    }).done();
};

//suspend (changes user status to "SUSPENDED")
module.exports.suspend = function (request, response) {

    function suspendUser(user) {
        return new Promise(function (resolve, reject) {

            var today = new Date();
            var newUser = {
                status: "SUSPENDED",
                lastModifyDate: today,
                caducityDate: new Date(today.getTime() + 30 * 86400000) //TODO: get days from database and change "30" in function
            }

            user.status = newUser.status;
            user.lastModifyDate = newUser.lastModifyDate;
            user.caducityDate = newUser.caducityDate;
            user.save(function (err, results) {
                if (err) {
                    reject("error suspend");
                } else {
                    resolve(results);
                }
            });
        });
    };

    getById(request).then(
        suspendUser
    ).then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.suspend():", {
            error: err
        });
    }).done();
};

//inactive (changes user status to "INACTIVE")
module.exports.inactive = function (request, response) {

    function inactiveUser(user) {

        return new Promise(function (resolve, reject) {

            var today = new Date();
            var newUser = {
                status: "INACTIVE",
                lastModifyDate: today,
                caducityDate: new Date(today.getTime() + 30 * 86400000) //TODO: get days from database and change "30" in function
            }

            user.status = newUser.status;
            user.lastModifyDate = newUser.lastModifyDate;
            user.caducityDate = newUser.caducityDate;
            user.save(function (err, results) {
                if (err) {
                    reject("error inactive");
                } else {
                    resolve(results);
                }
            });
        });
    };

    getUserById(request).then(
        inactiveUser
    ).then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.inactive():", {
            error: err
        });
    }).done();
};

//active (changes user status to "ACTIVE")
module.exports.active = function (request, response) {

    function activeUser(user) {

        return new Promise(function (resolve, reject) {

            var today = new Date();
            var newUser = {
                status: "ACTIVE",
                lastModifyDate: today,
                caducityDate: new Date(today.getTime() + 30 * 86400000) //TODO: get days from database and change "30" in function
            }

            user.status = newUser.status;
            user.lastModifyDate = newUser.lastModifyDate;
            user.caducityDate = newUser.caducityDate;
            user.save(function (err, results) {
                if (err) {
                    reject("error active");
                } else {
                    resolve(results);
                }
            });
        });
    };

    getById(request).then(
        activeUser
    ).then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("UserController.active():", {
            error: err
        });
    }).done();
};