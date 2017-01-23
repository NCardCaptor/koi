/**
 *     Copyright (c) 2015 ARRIS Group Inc. All rights reserved.
 *
 *     This program is confidential and proprietary to ARRIS Group, Inc. (ARRIS),
 *     and may not be copied, reproduced, modified, disclosed to others, published
 *     or used, in whole or in part, without the express prior written permission
 *     of ARRIS.
 *
 *     author: sbruno
 */

"use strict";

exports.getEnvVarOrFail = function(varName) {
    var value = process.env[varName];
    if (!value) {
        throw "Required environment variable [" + varName +  "] is not set";
    }
    return value;
};
