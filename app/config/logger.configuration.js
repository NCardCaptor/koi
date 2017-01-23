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


"use strict";

var winston = require("winston");
var dateformat = require("dateformat");
var os = require("os");
var cluster = require("cluster");

var logLevel = "info";
var hostName = os.hostname();
var logFileName = "logs/koi.log";

var maxFileSize = (5) * 1024 * 1024;
var maxFiles = 5;

var logInfoEnabled = true;
var logDebugEnabled =true;
var logTraceEnabled =true;
var logTransactionEnabled =true;

var cls = require("./namespace.configuration");
var namespace = cls.namespace;

var workerId = cluster.isMaster ? "M" : cluster.worker.id;

var appVersion = require("./app.configuration").getVersion();

var customLevels = {
    levels: {
        error: 7,
        warn: 6,
        transaction: logTransactionEnabled ? 5 : 0,
        info: logInfoEnabled ? 4 : 0,
        debug: logDebugEnabled ? 3 : 0,
        trace: logTraceEnabled ? 2 : 0
    }
};

var consoleFormatter = function(options) {
    var level = options.level.charAt(0).toUpperCase();
    return dateformat(new Date(), "HH:MM:ss") + " " + "[" + workerId + "] " 
};

var fileFormatter = function(options) {
    var correlationId = namespace.get("correlationId") || "";
    var sourceId = namespace.get("sourceId") || "UNKNOWN";
    var meta = JSON.stringify(options.meta);
    return dateformat(new Date(), "isoDateTime") +
        " [" + appVersion + "] [ISOF] " +
        options.level.toUpperCase() + " " +
        "[" + correlationId + "] " +
        "[" + sourceId + "] " +
        "[" + hostName + "] " +
        "[" + workerId + "] " +
        (options.message || "") +
        (meta !== "{}" ? " | Metadata: " + meta : "");
};

var loggerInstance = new winston.Logger({
    transports: [
        new winston.transports.Console({
            colorize: true,
            formatter: consoleFormatter
        }),
        new winston.transports.File({
            filename: logFileName,
            json: false,
            formatter: fileFormatter,
            maxsize: maxFileSize,
            maxFiles: maxFiles,
            tailable: true
        })
    ],
    levels: customLevels.levels,
    level: logLevel
});

var logClientTransaction = function(res) {
    var body = "";
    var startDate = Date.now();
    res.on("data", function(chunk) {
        body += chunk;
    });
    res.on("end", cls.namespace.bind(function() {
        var meta = {
            request: {
                url: res.req.path,
                headers: res.req._headers,
                body: res.req.body,
                method: res.req.method,
                duration: Date.now() - startDate
            },
            response: {
                status: res.statusCode,
                headers: res.headers,
                body: body
            }
        };
        loggerInstance.transaction(JSON.stringify(meta));
    }));
};

var logTransaction = function(req, res) {
    var oldEndEvent = res.end;
    if (typeof(oldEndEvent) === "undefined") {
        var meta = {
            request: {
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
                method: req.method
            },
            response: {
                status: res.statusCode,
                headers: res.headers,
                body: res.body
            }
        };
        loggerInstance.transaction(JSON.stringify(meta));
    } else {
        var startTime = Date.now();
        res.end = cls.namespace.bind(function(data, encoding) {
            res.end = oldEndEvent;
            res.end(data, encoding);
            var duration = Date.now() - startTime;
            var meta = {
                request: {
                    url: req.originalUrl,
                    headers: req.headers,
                    body: req.body,
                    method: req.method,
                    duration: duration
                },
                response: {
                    status: res.statusCode,
                    headers: res._headers,
                    body: JSON.parse(data.toString())
                }
            };
            loggerInstance.transaction(JSON.stringify(meta));
        });
    }
};

module.exports = {
    info: loggerInstance.info,
    error: loggerInstance.error,
    warn: loggerInstance.warn,
    debug: loggerInstance.debug,
    trace: loggerInstance.trace,
    transaction: logTransactionEnabled ? logTransaction : function() {},
    clientTransaction: logTransactionEnabled ? logClientTransaction : function() {}
};
