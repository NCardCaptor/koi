"use strict";

var logger = require("../config/logger.configuration");

var cls = require("../config/namespace.configuration");
var Promise = require("bluebird");

var _ = require("lodash");
var Users = require("../models/users.model");
var config = require("../config/login.configuration");
var errors = require("../support/error");

//global functions
function getUserByUsername(request) {
    return new Promise(function (resolve, reject) {

        // username existence
        if (_.isEmpty(request.body.username)) {
            reject("required username");
        }

        // password existence
        if (_.isEmpty(request.body.password)) {
            reject("required password");
        }

        //TODO: Encrypt password

        var user = {
            username: request.body.username,
            password: request.body.password
        }

        Users.find({
            username: user.username,
            password: user.password
        }, function (err, results) {
            if (err) {
                reject("error while finding user");
            } else {
                if (_.isEmpty(results)) {
                    reject("wrong credentials");
                }
                resolve(results);
            }
        });
    });
};


//authenticate (login with credentials)
module.exports.authenticate = function (request, response) {

    function createSession(user) {
        return new Promise(function (resolve, reject) {


            //TODO: CREATE SESSION

            resolve("session created");

        });
    };

    getUserByUsername(request).then(
        createSession
    ).then(function (result) {
        response.status(200);
        response.json(result);
    }).catch(function (err) {
        errors.sendError(err, response);
        logger.error("LoginController.authenticate():", {
            error: err
        });
    }).done();
};