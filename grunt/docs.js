/**
 *     Copyright (c) 2015 ARRIS Group Inc. All rights reserved.
 *
 *     This program is confidential and proprietary to ARRIS Group, Inc. (ARRIS),
 *     and may not be copied, reproduced, modified, disclosed to others, published
 *     or used, in whole or in part, without the express prior written permission
 *     of ARRIS.
 *
 *     author: jibanez
 */

/// <reference path="../../typings/node/node.d.ts"/>

"use strict";

var parser = require("comment-parser");
var Promise = require("bluebird");
var glob = require("glob");
var fs = require("fs");
var _ = require("lodash");

var files = [];
var header = "";
var models = "definitions:\n";
var paths = {};
var output = "./app/swagger/swagger.yaml";

function f_glob (pattern, callback) {
    var deferred = Promise.defer();
    glob(pattern, function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    deferred.promise.nodeify(callback);
    return deferred.promise;
};

function f_parse (file, callback) {
    var deferred = Promise.defer();
    parser.file(file, function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    deferred.promise.nodeify(callback);
    return deferred.promise;
};

function addFiles (err, data) {
    if (err) {
        console.error("Error Adding Files: " + err);
    }
    files = files.concat(data);
};

function processTag (tag) {
    if (tag.type === "model") {
        models += "    " + tag.name + ":\n" + tag.description + "\n";
    } else if (tag.type === "path") {
        if (!paths[tag.name]) {
            paths[tag.name] = "    /" + tag.name + ":\n";
        }
        paths[tag.name] +=  tag.description + "\n";
    }
};

function processFile (err, data) {
    if (err) {
        console.error("Error processing file: " + err);
    }
    data.forEach(function(entry) {
        entry.tags.forEach(function (tag) {
            if (tag.tag === "swagger") {
                processTag(tag);
            }
        });
    });
};

function generateYAML() {

    fs.writeFileSync(output, header + "\n");
    var lines = ["paths:\n"];

     _.forEach(paths, function (path) {
         lines = lines.concat(path.split("\n"));
     });

    lines = lines.concat(models.split("\n"));
    lines.forEach(function(line) {
        line = line.replace(/^\|/, "        ");
        line = line.replace(/\bref\b/, "$ref");
        fs.appendFileSync(output, line + "\n");
    });
};

module.exports = function(grunt) {

    function getErrorCodes() {
        var errors = fs.readFileSync("app/support/errors/errors.js", "utf-8");
        var httpCodes = [];
        var errorCodes = [];

        // Get HTTP Codes
        var regex = new RegExp("\\s([A-Z_]+)\:\\s+\{\\s*code\:\\s*([^\\s]+),\\s+description\:\\s+\"([^\"]+)\"", "g");
        var match = regex.exec(errors);
        while(match) {
            httpCodes.push({ code: match[2], description: match[3], key: match[1]});
            match = regex.exec(errors);
        }

        // Get Error Codes
        regex = new RegExp("\\s([A-Z_]+)\:\\s+\{\\s*code\:\\s*([^\\s]+),\\s+httpCode\:\\s+([^\\s]+),\\s+message\:\\s+\"([^\"]+)\"", "g");
        match = regex.exec(errors);
        var output = "";
        while (match) {
            var httpCodeKey = match[3];
            httpCodeKey = httpCodeKey.replace(/[^\\.]+\./, "");
            httpCodeKey = httpCodeKey.replace(/\.[^\\.]+/, "");
            var httpCode = _.find(httpCodes, { key: httpCodeKey });
            if (httpCode) {
                errorCodes.push({ code: match[2], key: match[1], httpCode: httpCode.code, message: match[4]});
            } else {
                grunt.fail.warn("Invalid HTTP Code in errors.js: " + httpCodeKey);
            }
            match = regex.exec(errors);
        }

        httpCodes = _.sortBy(httpCodes, "code");
        errorCodes = _.sortByAll(errorCodes, [ "httpCode", "code" ]);
        _.forEach(httpCodes, function(httpCode) {
            var color = httpCode.code >= "400" ? "<font color=\"#ff0000\">" : "<font color=\"#008000\">";
            output += "         - " + color + "**" + httpCode.code + "** - " + httpCode.description + "</font>\n";
            _.forEach(_.filter(errorCodes, { "httpCode": httpCode.code }), function(errorCode) {
                var message = errorCode.message.replace(/\%s/g, "__&lt;value&gt;__");
                output += "           - **" + errorCode.code + " - " + errorCode.key + ":** " + message + "\n";
            });
        });

        header = header.replace("^ERROR_DOCUMENTATION^", output);
    };

    var generateDocs = function() {

        var done = this.async();
        grunt.log.ok("Swagger Doc Generator");

        var patterns = ["app/routes/**/*.js", "app/models/**/*.js" ];
        var p = [];
        for (var i = 0; i < patterns.length; ++i) {
            p.push(f_glob(patterns[i], addFiles));
        }

        var parsePromises = [];
        Promise.all(p)
            .then(function() {
                files.forEach(function(file) {
                    grunt.log.writeln("Parsing: " + file);
                    parsePromises.push(f_parse(file, processFile));
                });
                return Promise.all(parsePromises);
            })
            .then(function() {
                header = fs.readFileSync("./app/swagger/header.yaml", "utf-8");
                header = header.replace("^VERSION^", grunt.config.get("package.version"));
                getErrorCodes();
                generateYAML();
                done();
            })
            .catch(function() {
                done();
            });
    };

    // Register Tasks
    grunt.registerTask("docs", "Generates Swagger Documentation", generateDocs);
};