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

var logger = require("../config/logger.configuration");
var uuid = require("node-uuid");

var cls = require("../config/namespace.configuration");
var Promise = cls.Promise;

var _ = require("lodash");
var PlaybackSessionModel = require("../models/playbacksession.model");
var commonValidators = require("../support/validators/common.validators");
var playbacksessionValidators = require("../support/validators/playbacksession.validators");
var smsClient = require("../support/clients/sms.client");
var csClient = require("../support/clients/cs.client");
var urlGenerator = require("../support/url.generators/url.generator");
var errors = require("../support/errors/errors");
var config = require("../config/playbacksession.configuration");

function getPlaybacksessionById(sessionData) {

    if (!commonValidators.isValidObjectId(sessionData.id)) {
        logger.error("PlaybackSessionController.getPlaybackSessionById(): Invalid Session Id", { sessionId: sessionData.id });
        return Promise.reject(errors.json(errors.codes.INVALID_PLAYBACKSESSION, sessionData.id));
    }

    var deferred = Promise.defer();

    PlaybackSessionModel.findOne({
        _id: sessionData.id,
        subscriberId: sessionData.subscriberId,
        subscriberRecordingId: sessionData.subscriberRecordingId
    }).exec(function(err, result){
        if (err) {
            deferred.reject(errors.json(errors.codes.DATABASE_ERROR, err));
        } else {
            if (result) {
                deferred.resolve(result);
            } else {
                deferred.reject(errors.json(errors.codes.INVALID_PLAYBACKSESSION, sessionData.id));
            }
        }
    });
    return deferred.promise;
}


// Add Playback Session Specific functions
module.exports.addPlaybackSession = function(request, response) {

    var sessionData = {
        subscriberId: request.params.subscriberId,
        subscriberRecordingId: request.params.subscriberRecordingId,
        deviceId: request.body.deviceId,
        deviceType: request.body.deviceType,
        playbackUriType: request.body.playbackUriType
    };

    // Does the actual creation of the playback session
    var createPlaybackSession = function() {
        commonValidators.validate(playbacksessionValidators.createValidators, sessionData);

        var playbacksession = new PlaybackSessionModel(
            {
                status: "ACTIVE",
                type: "DVR",
                deviceId: sessionData.deviceId,
                deviceType: sessionData.deviceType,
                playbackUri: sessionData.url,
                playbackUriType: "HLS",
                offset: 0,
                sessionId: uuid.v4(),
                creationTime: Date.now(),
                lastUpdated: Date.now(),
                subscriberRecordingId: sessionData.subscriberRecordingId,
                recordingId: sessionData.recording.recordingId,
                subscriberId: sessionData.subscriberId
            }
        );
        if(sessionData.offset && sessionData.offset !== 0) {
            playbacksession.offset=sessionData.offset;
        }

        var deferred = Promise.defer();
        playbacksession.save(function(err, document) {
            if (err) {
                deferred.reject(errors.json(errors.codes.DATABASE_ERROR, err));
            }

            var result = decorateResult(document);
            response.status(errors.httpCodes.CREATED.code);
            response.json(result);
            deferred.resolve(result);
        });
        return deferred.promise;
    };

    var getActivePlaybackSessionsBySubscriberId = function() {
        var deferred = Promise.defer();

        PlaybackSessionModel.count({subscriberId: sessionData.subscriberId, status: "ACTIVE"}, function(err, count) {

            if (err) {
                deferred.reject(errors.json(errors.codes.DATABASE_ERROR, err));
            } else {
                deferred.resolve(count);
            }
        });
        return deferred.promise;
    };

    var getLastPlaybacksessionBySubscriber = function() {
        var deferred = Promise.defer();
        PlaybackSessionModel.findOne({"subscriberId":sessionData.subscriberId, "subscriberRecordingId":sessionData.subscriberRecordingId})
        .sort({"lastUpdated":-1})
        .exec(function(err, playbacksession){
            if (err) {
                deferred.reject(errors.json(errors.codes.DATABASE_ERROR, err));
            } else {
                deferred.resolve(playbacksession);
            }
        });
        return deferred.promise;
    };


    /**
     * Gets an array with all the channel packages for the subscriber
     * It will return null for any channel package that was unable to be retrieved
     */
    var getChannelPackagesBySubscriber = function() {
        var promises = [];
        if(sessionData.subscriber && sessionData.subscriber.channelPackages && !_.isEmpty(sessionData.subscriber.channelPackages)) {
            var channelPackages = sessionData.subscriber.channelPackages;
            channelPackages.forEach(function(channelPackage) {
                var id = channelPackage.id;
                var promise = smsClient.getChannelPackageById(id);
                promises.push(promise);
            });
        }
        return Promise.all(promises);
    };

    function computeStartFromTheBeginningValue(startFromTheBeginningIncomingValue, sessionData) {
        var startFromTheBeginning = false;
        if (startFromTheBeginningIncomingValue) {
            var enabledInChannel = _.get(sessionData, "channel.startFromTheBeginning");
            var enabledInServicePackage = _.get(sessionData, "servicePackage.isStartFromTheBeginning");
            // TODO: Check also in program (currently not provided by CS)
            startFromTheBeginning = enabledInChannel && enabledInServicePackage;
        }
        return startFromTheBeginning;
    }

    // Get Subscriber + Recording Id
    smsClient.getSubscriberById(sessionData.subscriberId)
        .then(function(subscriber) {
            sessionData.subscriber = subscriber;
            return getChannelPackagesBySubscriber();
        })
        .then(function(channelPackages) {
            sessionData.channels = [];
            channelPackages.forEach(function(channelPackage) {
                if(channelPackage && channelPackage.channels && !_.isEmpty(channelPackage.channels)) {
                    channelPackage.channels.forEach(function(channel) {
                        sessionData.channels.push(channel);
                    });
                }
            });
            return csClient.getSubscriberRecordingById(sessionData.subscriberId, sessionData.subscriberRecordingId);
        })
        .then(function(recording) {
            sessionData.recording = recording;
            return csClient.getChannelById(recording.channelId);
        })
        .then(function(channel) {
            sessionData.channel = channel;
            return getActivePlaybackSessionsBySubscriberId();
        })
        .then(function(sessionsCount) {
            sessionData.activeSessions = sessionsCount;
            var servicePackageId = _.get(sessionData, "subscriber.servicePackage.id");
            return smsClient.getServicePackageById(servicePackageId);
        })
        .then(function(servicePackage) {
            sessionData.servicePackage = servicePackage;
            return getLastPlaybacksessionBySubscriber();
        }).then(function(lastPlaybackSession){
            if(lastPlaybackSession && lastPlaybackSession._doc.offset){
                sessionData.offset = lastPlaybackSession._doc.offset;
            }
            sessionData.startFromTheBeginning = computeStartFromTheBeginningValue(request.body.startFromTheBeginning, sessionData);
            sessionData.url = urlGenerator.generateURL(sessionData);
            return createPlaybackSession();
        })
        .catch(function(err) {
            errors.sendError(err, response);
            logger.error("PlaybackSessionController.addPlaybackSession():", { error: err });
        })
        .done();
};

module.exports.statusPlaybackSession = function(request, response) {

    var sessionData = {
        subscriberId: request.params.subscriberId,
        subscriberRecordingId: request.params.subscriberRecordingId,
        id: request.params.id
    };

    function updatePlaybackSessionStatus(playbacksessionModel, newStatus, offset) {
        var deferred = Promise.defer();
        if (playbacksessionModel) {

            var playbacksession = playbacksessionModel.toObject();
            playbacksession.lastUpdated = Date.now();
            playbacksession.status = newStatus;
            delete playbacksession._id;

            var currentStatus = playbacksessionModel._doc.status;

            // Offset should be updated when transitioning to ACTIVE or FINISHED.
            if (_.includes(["ACTIVE", "FINISHED"], newStatus)) {
                playbacksession.offset = offset;
            };

            switch(currentStatus)
            {
                case "ACTIVE":
                    if (!_.includes(["ACTIVE", "FINISHED", "TIMEDOUT"], newStatus)) {
                        deferred.reject(errors.json(errors.codes.INVALID_PLAYBACKSESSION_NEW_STATE, newStatus, sessionData.id));
                    }
                    break;

                case "TIMEDOUT":
                    if (!_.includes(["ACTIVE"], newStatus)) {
                        deferred.reject(errors.json(errors.codes.INVALID_PLAYBACKSESSION_NEW_STATE, newStatus, sessionData.id));
                    }
                    break;

                default:
                    deferred.reject(errors.json(errors.codes.INVALID_PLAYBACKSESSION_STATE, sessionData.id));
                    break;
            }
            playbacksessionModel.update(playbacksession, {_id: sessionData.id}, function(err) {
                if (err) {
                    deferred.reject(errors.json(errors.codes.UPDATE_PLAYBACKSESSION, err));
                } else {
                    deferred.resolve();
                }
            });
        }
        return deferred.promise;
    }

    function createResponsePlaybackSessionStatus(playbackSessionStatus){
        var deferred = Promise.defer();
        var result = decorateResult(playbackSessionStatus);
        response.status(errors.httpCodes.CREATED.code);
        response.json(result);
        deferred.resolve(result);
        return deferred.promise;
    }

    getPlaybacksessionById(sessionData).then(function(playbacksession){
        var status = request.body.status;
        var offset = request.body.offset;
        return updatePlaybackSessionStatus(playbacksession, status, offset);
    }).then(function(){
        return getPlaybacksessionById(sessionData);
    }).then(function(sessionUpdated){
        return createResponsePlaybackSessionStatus(sessionUpdated);
    })
    .catch(function(err) {
            errors.sendError(err, response);
            logger.error("PlaybackSessionController.statusPlaybackSession():", { error: err });
        })
        .done();
};

module.exports.getById = function(request, response) {

    var sessionData = {
        subscriberId: request.params.subscriberId,
        subscriberRecordingId: request.params.subscriberRecordingId,
        id: request.params.id
    };

    getPlaybacksessionById(sessionData).then(
        function(playbackSession) {
            var result = decorateResult(playbackSession);
            response.status(errors.httpCodes.SUCCESS.code);
            response.json(result);
        }
    ).catch(function(err) {
        errors.sendError(err, response);
        logger.error("PlaybackSessionController.getPlaybackSessionById():", { error: err });
    })
    .done();
};

module.exports.getAll = function(request, response) {

    var sessionData = {
        subscriberId: request.params.subscriberId,
        subscriberRecordingId: request.params.subscriberRecordingId,
        id: request.params.id
    };

    function getPlaybacksessions() {
        var deferred = Promise.defer();
        PlaybackSessionModel.find({"subscriberId":sessionData.subscriberId, "subscriberRecordingId":sessionData.subscriberRecordingId})
        .exec(function(err, result) {
            if (err) {
                deferred.reject(errors.json(errors.codes.DATABASE_ERROR, err));
            } else {
                response.status(errors.httpCodes.SUCCESS.code);
                response.json(_.map(result, decorateResult));
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    };

    getPlaybacksessions()
        .catch(function(err) {
            errors.sendError(err, response);
            logger.error("PlaybackSessionController.getPlaybackSessions():", { error: err });
        })
        .done();
};

function decorateResult(result) {
    var id = result._id.toString();
    result = result.toJSON();
    result.timeoutWindow = config.getTimeoutWindow();
    result.sessionId = id;
    delete result._id;
    delete result.__v;
    return result;
}

