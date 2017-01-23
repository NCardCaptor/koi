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

var common = require("./common.configuration");

var host = common.getEnvVarOrFail("MDB_PORT_27017_TCP_ADDR");
var port = common.getEnvVarOrFail("MDB_PORT_27017_TCP_PORT");
var dbName = process.env.FM_DB_NAME || "fmappdb";
var connectionInterval = process.env.FM_DB_CONNECTION_INTERVAL || 60000;
var logger = require("./logger.configuration");

var databaseUrl = "mongodb://@" + host + ":" + port + "/" + dbName;
var mongoose = require("mongoose");

var testBootstrap = require("../support/test/test.bootstrap");
testBootstrap.instrumentDb(mongoose);

var connected = false;

function isConnected() {
    return connected;
}

mongoose.connection
    .on("open", function() {
        logger.info("DB Connected");
        connected = true;
    })
    .on("reconnected", function() {
        logger.info("DB Connection restored");
        connected = true;
    })
    .on("error", function(err) {
        if (err && err.state !== 2) {
            logger.error("DB.connection(): DB Connection error", { error: err });
        }
        setTimeout(connectToDb, connectionInterval);
        connected = false;
    })
    .on("close", function() {
        logger.error("DB.connection(): DB Connection closed");
        connected = false;
    });

function connectToDb() {
    logger.info("DB Connecting to: " + databaseUrl);
    mongoose.connect(databaseUrl);
}

connectToDb();

exports.getDb = function() {
    return mongoose;
};

exports.isConnected = isConnected;

