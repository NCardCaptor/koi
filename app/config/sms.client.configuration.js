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

exports.getHost = function() {
    return common.getEnvVarOrFail("SMS_PORT_25130_TCP_ADDR");
};

exports.getPort = function() {
    return common.getEnvVarOrFail("SMS_PORT_25130_TCP_PORT");
};

exports.getBasePath = function() {
    var basePath = process.env.SMS_BASE_PATH || "/sms/v3/";
    return basePath;
};

exports.getSubscribersPath = function() {
    return process.env.SMS_SUBSCRIBERS_PATH ||
        this.getBasePath() + "subscribers/";
};

exports.getServicePackagePath = function(){
    return process.env.SMS_SERVICE_PACKAGE_PATH ||
        this.getBasePath() + "servicePackages/";
};

exports.getChannelPackagePath = function() {
    return process.env.SMS_CHANNEL_PACKAGE_PATH ||
        this.getBasePath() + "channelPackages/";
};

exports.getBaseUrl = function() {
    return "http://" + this.getHost() + ":" + this.getPort() + this.getBasePath();
};

// Testing Hooks
exports.setPort = function(port) {
    process.env.SMS_PORT_25130_TCP_PORT = port;
};