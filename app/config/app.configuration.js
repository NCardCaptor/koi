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

var packageConfig = require("../../package.json");

exports.getPort = function() {
    return process.env.APP_PORT || 25110;
};

exports.getVersion = function() {
    return packageConfig.version;
};