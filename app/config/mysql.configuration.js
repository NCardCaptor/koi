var common = require("./common.configuration");

var host = "localhost";
var port = "3306";
var dbName = "koidb";
var connectionInterval = 60000;
var logger = require("./logger.configuration");
var orm = require('orm');


var databaseUrl = "mysql://root:root@" + host + ":" + port + "/" + dbName;
var orm = require("orm");
var db  = orm.connect(databaseUrl);
var connected = false;

db.on("open", function() {
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
    orm.connect(databaseUrl);
}

connectToDb();

exports.getDb = function() {
    return db;
};

function isConnected() {
    return connected;
}

exports.isConnected = isConnected;



