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

var config = require("../support/config/config");

exports.getUri = function() {
    return process.env.FM_PLAYBACKSESSIONS_URI ||
        "/fm/v3/subscribers/:subscriberId/recordings/:subscriberRecordingId/playbacksessions/";
};

exports.getByIdUri = function() {
    return this.getUri() + ":id";
};

exports.getStatusUri = function() {
    return this.getByIdUri() + "/status";
};

exports.isChannelBelongsToSubscriberValidationEnabled = function() {
    return config.getValue(config.KEYS.VALIDATE_CHANNEL_SUBSCRIBER) === "true";
};

exports.isDeviceValidationEnabled = function() {
    return config.getValue(config.KEYS.VALIDATE_REGISTERED_DEVICES) === "true";
};

// Time in seconds in which a playback session will timeout if no keep alive has been received.
exports.getTimeoutWindow = function() {
    return Number(config.getValue(config.KEYS.PLAYBACKSESSIONS_TIMEOUTWINDOW));
};
