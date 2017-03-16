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

var util = require("util");
var logger = require("../config/logger.configuration");
var _ = require("lodash");

var jsonError = function(error) {
    var args = [];
    Array.prototype.push.apply(args, arguments);
    args.shift();
    var result = {};
    if (!error) {
        logger.error("Invalid error: " + error);
    } else {
        result.code = error.code;
        result.httpCode = error.httpCode;
        if (args.length === 0) {
            result.description = error.message;
        } else {
            args.unshift(error.message);
            result.description = util.format.apply(this, args);
        }
    }
    return result;
};

/**
 * Gets the http code from an FM json error
 * @param {JSON Object} error: The error where to get the http code from. It may be a
 *                             JSON object or an array of JSON objects if many errors
 *                             were produced.
 * @param {Number} defaultCode: If no http error code was found in the error object
 *                              it will return this value. If no value was provided it
 *                              will return 400.
 * @return {Number} error code
 */
var getHttpCode = function(error, defaultCode) {
    defaultCode = defaultCode || 400;
    var httpCode;
    if (error) {
        if (Array.isArray(error)) {
            httpCode = error[0].httpCode;
        } else {
            httpCode = error.httpCode;
        }
    }
    return httpCode || defaultCode;
};

function buildError(error) {
    if (!Array.isArray(error)) {
        error = [error];
    }
    return _.map(error, function(e) {
        delete e.httpCode;
        return e;
    });
}

var sendError = function(error, response) {
    response.status(getHttpCode(error));
    response.json(buildError(error));
};

var httpCodes = {

    SUCCESS: { code: 200,
        description: "The request was fulfilled correctly." },

    CREATED: { code: 201,
        description: "The request was fulfilled and a new resource was created." },

    ACCEPTED: { code: 202,
        description: "The request was accepted." },

    NO_CONTENT: { code: 204,
        description: "The request was fulfilled correctly, but no content is returned." },

    BAD_REQUEST: { code: 400,
        description: "Bad Request." },

    FORBIDDEN: { code: 403,
        description: "Forbidden." },

    PAGE_NOT_FOUND: { code: 404,
        description: "Page not found." },

    PRECONDITIONS_FAILED: { code: 412,
        description: "Preconditions failed." },

    UNSUPPORTED_MEDIA_TYPE: { code: 415,
        description: "Unsupported media type." },

    INTERNAL_ERROR: { code: 500,
        description: "An internal error occurred." },

    SERVICE_UNAVAILABLE: { code: 503,
        description: "Service is currently unavailable." }
};

var codes = {
    // FM Errors
    NO_ENTITLEMENTS: { code: 1000,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find any entitlement for subscriber '%s'." },

    INVALID_DEVICE: { code: 1001,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find any device with id '%s', for subscriber '%s'." },

    INVALID_SUBSCRIBER: { code: 1002,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find any subscriber with external id '%s'." },

    INVALID_USER: { code: 1003,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Subscriber '%s' is not associated with user id '%s'." },

    INVALID_CONFIGURATION_KEY: { code: 1004,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Invalid configuration key: '%s'." },

    INVALID_CONFIGURATION_VALUE: { code: 1005,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Invalid configuration value for key '%s': '%s'." },

    INVALID_CONFIGURATION_ENTRIES: { code: 1006,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Invalid configuration entries." },

    INVALID_RECORDING: { code: 1007,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find any recording with id '%s'." },

    FORBIDDEN_RECORDING: { code: 1008,
        httpCode: httpCodes.FORBIDDEN.code,
        message: "Recording '%s' doesn't belong to subscriber '%s'." },

    SUBSCRIBER_NOT_SPECIFIED: { code: 1009,
        httpCode: httpCodes.FORBIDDEN.code,
        message: "Subscriber information not specified." },

    CATCHUP_NOT_ENABLED_FOR_SUBSCRIBER: { code: 1010,
        httpCode: httpCodes.FORBIDDEN.code,
        message: "Catch-up is not enabled for subscriber '%s'." },

    CATCHUP_NOT_ENABLED_FOR_CHANNEL: { code: 1011,
        httpCode: httpCodes.FORBIDDEN.code,
        message: "Catch-up is not enabled for channel '%s'." },

    SESSIONS_QUOTA_REACHED: {code: 1012,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Subscriber '%s' reached maximum active playback sessions quota."
    },

    CHANNEL_NO_PLAYBACK: { code: 1027,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Channel '%s' is currently restricted for playback." },

    PROGRAM_NO_PLAYBACK: { code: 1028,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Program '%s' is currently restricted for playback." },

    RECORDING_NOT_PLAYABLE: { code: 1029,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Recording '%s' should be in COMPLETED or CAPTURING state." },

    INVALID_SERVICE_PACKAGE: { code: 1030,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find any ServicePackage with id '%s'." },

    INVALID_PLAYBACKSESSION_STATE: { code: 1031,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Playbacksession '%s' should be in ACTIVE state." },

    INVALID_PLAYBACKSESSION_NEW_STATE: { code: 1032,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "'%s' is not a valid new state for playbacksession '%s'." },

    INVALID_PLAYBACKSESSION: { code: 1033,
        httpCode: httpCodes.PAGE_NOT_FOUND.code,
        message: "Could not find any Playbacksession with id '%s'." },

    FIND_PLAYBACKSESSION: { code: 1034,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred finding a Playbacksession. Error: '%s'" },

    UPDATE_PLAYBACKSESSION: { code: 1035,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred updating the Playbacksession. Error: '%s'" },

    INVALID_CHANNEL_SUBSCRIPTION: { code: 1036,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "The subscriber '%s' is not subscribed to channel id: '%s'" },

    INVALID_PLAYBACK_SESSION_FOR_RECORDING: { code: 1037,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find a PlaybackSession for recording '%s'" },

    INVALID_PLAYBACK_SESSION_FOR_SUBSCRIBER: { code: 1038,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find a PlaybackSession for subscriber '%s'" },

    INVALID_EVENT_TYPE: { code: 1039,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Invalid event type '%s'" },

    FIND_EVENT_ERROR: { code: 1040,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred finding the Event. Error: '%s'" },

    EVENT_NOT_FOUND_FOR_SESSION: { code: 1041,
        httpCode: httpCodes.PAGE_NOT_FOUND.code,
        message: "No event found for session '%s'" },

    SAVE_EVENT_ERROR: { code: 1042,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred saving the Event. Error: '%s'" },

    INVALID_PLAYBACKSESSION_FOR_EVENT: { code: 1043,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Could not find any Playbacksession with id '%s'." },

    DATABASE_ERROR: { code: 1044,
        httpCode: httpCodes.INTERNAL_ERROR.code,
        message: "There is a problem with the database: '%s'." },

    SAVE_BOOKMARK_ERROR: { code: 1045,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred saving the Bookmark. Error: '%s'" },

    DELETE_BOOKMARK_ERROR: { code: 1046,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred deleting the Bookmark. Error: '%s'" },

    FIND_BOOKMARK_ERROR: { code: 1047,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred finding a Bookmark. Error: '%s'" },

    BOOKMARK_NOT_FOUND: { code: 1048,
        httpCode: httpCodes.PAGE_NOT_FOUND.code,
        message: "Bookmark '%s' not found" },

    FIND_PLAYBACKSESSIONS: { code: 1049,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "An error occurred finding Playbacksessions." },

    UNDEFINED_CONFIG_VALUE: { code: 1050,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Undefined config value for key '%s'." },

    ETCD_ERROR: { code: 1051,
        httpCode: httpCodes.INTERNAL_ERROR.code,
        message: "There was a problem with etcd: '%s'." },

    // Common Errors
    INACTIVE_SUBSCRIBER: { code: 9001,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Subscriber '%s' is not in ACTIVE state." },

    INVALID_JSON_IN_REQUEST: { code: 9002,
        httpCode: httpCodes.BAD_REQUEST.code,
        message: "Body cannot be converted to JSON." },

    INVALID_CONTENT_TYPE: { code: 9003,
        httpCode: httpCodes.UNSUPPORTED_MEDIA_TYPE.code,
        message: "This service supports JSON content only." },

    ERROR_GETTING_RESOURCE: { code: 9019,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Error getting resource '%s' with id '%s'." },

    ERROR_PARSING_JSON: { code: 9020,
        httpCode: httpCodes.INTERNAL_ERROR.code,
        message: "Error parsing JSON." },

    ERROR_PERFORMING_REQUEST: { code: 9021,
        httpCode: httpCodes.SERVICE_UNAVAILABLE.code,
        message: "Error performing request to external service." },

    ENTITY_NOT_FOUND: { code: 9022,
        httpCode: httpCodes.PAGE_NOT_FOUND.code,
        message: "Entity '%s' not found."},

    UNSUCCESSFUL_SERVER_RESPONSE: { code: 9023,
        httpCode: httpCodes.SERVICE_UNAVAILABLE.code,
        message: "Unsuccessful server response from external service." },

    URL_NOT_FOUND: { code: 9024,
        httpCode: httpCodes.PAGE_NOT_FOUND.code,
        message: "URL '%s %s' was not found on this server." },

    UNSPECIFIED: { code: 9999,
        httpCode: httpCodes.PRECONDITIONS_FAILED.code,
        message: "Unspecified error: '%s'" }
};

module.exports = {
    codes: codes,
    json: jsonError,
    getHttpCode: getHttpCode,
    sendError: sendError,
    httpCodes: httpCodes
};
