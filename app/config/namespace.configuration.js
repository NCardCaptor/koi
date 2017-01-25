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

var continuation = require("continuation-local-storage");
var namespace = continuation.createNamespace("com.koi.core");

var Promise = require("bluebird");
require("cls-bluebird")(namespace);

module.exports = {
    namespace: namespace,
    Promise: Promise
};