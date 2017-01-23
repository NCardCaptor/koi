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

var frisby = require("frisby");
var providers = require("../providers");
var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var _ = require("lodash");

var smsInteractions = require("../interactions/sms.interactions");
var csInteractions = require("../interactions/cs.interactions");

/**
 * @TCName: CreatePlaybackSession_001
 * @Description: Verifies that the creation of a playbacksession with a non-existent subscriber
 *               fails with the propper error code and description.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.INEXISTENT_SUBSCRIBER_444();
smsInteractions.SERVICE_PACKAGE_100();

frisby.create("Create a PlaybackSession with a non-existent Subscriber")
    .post(providers.appHostUrl + "/fm/v3/subscribers/444/recordings/777/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1002,
        description: "Could not find any subscriber with external id '444'."
    }])
    .toss();

/**
 * @TCName: CreatePlaybackSession_002
 * @Description: Verifies that a playbacksession with a non-existent recording fails with
 *               the proper error code and description.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.ACTIVE_SUBSCRIBER_98();
csInteractions.INEXISTENT_RECORDING_777();

frisby.create("Create a PlaybackSession with a non-existent Recording")
    .post(providers.appHostUrl + "/fm/v3/subscribers/98/recordings/777/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1007,
        description: "Could not find any recording with id '777'."
    }])
    .toss();

/**
 * @TCName: CreatePlaybackSession_003
 * @Description: Create a PlaybackSession with an INACTIVE Subscriber.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.INACTIVE_SUBSCRIBER_500();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Create a PlaybackSession with an INACTIVE Subscriber")
    .post(providers.appHostUrl + "/fm/v3/subscribers/500/recordings/7363/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 9001,
        description: "Subscriber '500' is not in ACTIVE state."
    }])
    .toss();

/**
 * @TCName: CreatePlaybackSession_004
 * @Description: Create a PlaybackSession with an ACTIVE Subscriber and a COMPLETED recording.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418, 248888, 248939
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Create a PlaybackSession with an ACTIVE Subscriber and a COMPLETED recording")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7363/playbacksessions")
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
        status: "ACTIVE",
        type: "DVR",
        playbackUri: "http://jitp-hls.clouddvr.org:18081/03adac60171b430b893172151d121657.m3u8",
        subscriberRecordingId: "7363"
    })
    .toss();

/**
 * @TCName: CreatePlaybackSession_005
 * @Description: Create a PlaybackSession with an ACTIVE Subscriber and a CAPTURING recording.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.CAPTURING_RECORDING_7400();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Create a PlaybackSession with an ACTIVE Subscriber and a CAPTURING recording")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7400/playbacksessions")
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
        status: "ACTIVE",
        type: "DVR",
        playbackUri: "http://jitp-hls.clouddvr.org:18081/0ad22b7ab5cd4d0bb3dbde542aae00ee.m3u8",
        subscriberRecordingId: "7400"
    })
.toss();

/**
 * @TCName: CreatePlaybackSession_006
 * @Description: Fail to create a PlaybackSession with an ACTIVE Subscriber and a SCHEDULED recording.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.SCHEDULED_RECORDING_7500();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Fail to create a PlaybackSession with an ACTIVE Subscriber and a SCHEDULED recording")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7500/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1029,
        description: "Recording '7500' should be in COMPLETED or CAPTURING state."
    }])
.toss();

/**
 * @TCName: CreatePlaybackSession_007
 * @Description: Fail to create a PlaybackSession with an ACTIVE Subscriber and a DELETED recording.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.DELETED_RECORDING_7600();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Fail to create a PlaybackSession with an ACTIVE Subscriber and a DELETED recording")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7600/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1029,
        description: "Recording '7600' should be in COMPLETED or CAPTURING state."
    }])
.toss();

/**
 * @TCName: CreatePlaybackSession_008
 * @Description: Fail to create a PlaybackSession with an ACTIVE Subscriber and a ERROR recording.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.ERROR_RECORDING_7700();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Fail to create a PlaybackSession with an ACTIVE Subscriber and a ERROR recording")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7700/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1029,
        description: "Recording '7700' should be in COMPLETED or CAPTURING state."
    }])
    .toss();

/**
 * @TCName: CreatePlaybackSession_010
 * @Description: Fail to create a PlaybackSession for a recording of a non playable channel.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.NON_PLAYABLE_CHANNEL_RECORDING_4444();
csInteractions.CHANNEL_WITH_NO_PLAYBACK_CMAX();

frisby.create("Fail to create a PlaybackSession for a recording of a non playable channel")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/4444/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1027,
        description: "Channel 'CMAX' is currently restricted for playback."
    }])
.toss();


/**
 * @TCName: CreatePlaybackSession_012
 * @Description: Fail to create a PlaybackSession for an inexistent service package.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.INEXISTENT_SERVICE_PACKAGE_333();
smsInteractions.ACTIVE_SUBSCRIBER_WITH_NON_EXISTENT_SERVICE_PACKAGE_300();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Fail to create a PlaybackSession for a subscriber with an inexistent service package")
    .post(providers.appHostUrl + "/fm/v3/subscribers/300/recordings/7363/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1030,
        description: "Could not find any ServicePackage with id '333'."
    }])
    .toss();

/**
 * @TCName: CreatePlaybackSession_013
 * @Description: Fail to create a PlaybackSession for a subscriber with an inexistent channel package.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.ACTIVE_SUBSCRIBER_WITH_INEXISTENT_CHANNEL_PACKAGE();
smsInteractions.INEXISTENT_CHANNEL_PACKAGE();
smsInteractions.CHANNEL_PACKAGE_FOX();
smsInteractions.SERVICE_PACKAGE_100();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Fail to create a PlaybackSession for a subscriber with an inexistent channel package")
    .post(providers.appHostUrl + "/fm/v3/subscribers/103/recordings/7363/playbacksessions")
    .expectStatus(412)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
        code: 1036,
        description: "The subscriber '103' is not subscribed to channel id: 'HBO_PLUS'"
    }])
    .toss();

/**
 * @TCName: CreatePlaybackSession_014
 * @Description: Create a PlaybackSession with Offset to Resume at.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150, 246418
 */
smsInteractions.ACTIVE_SUBSCRIBER_WITH_CHANNEL_PACKAGES();
smsInteractions.CHANNEL_PACKAGE_HBO();
smsInteractions.CHANNEL_PACKAGE_FOX();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();
smsInteractions.SERVICE_PACKAGE_100();

frisby.create("Create a PlaybackSession with Offset to Resume at")
    .post(providers.appHostUrl + "/fm/v3/subscribers/102/recordings/7363/playbacksessions")
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
        status: "ACTIVE",
        type: "DVR",
        playbackUri: "http://jitp-hls.clouddvr.org:18081/03adac60171b430b893172151d121657.m3u8",
        subscriberRecordingId: "7363",
        offset: 800
    })
    .toss();

/**
 * TEST: Create a PlaybackSession with a non-existing Subscriber
 * URL : POST /fm/v3/subscribers/444/recordings/777/playbacksessions
 *
 * @TCName: CreatePlaybackSession_015
 * @Description: Create a PlaybackSession with a non-existing Subscriber.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();
csInteractions.COMPLETED_RECORDING_7363();

/**
 * @TCName: CreatePlaybackSession_016
 * @Description: Creates a PlaybackSession.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244150
 *
 */
frisby.create("Create an PlaybackSession")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7363/playbacksessions")
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
        status: "ACTIVE",
        type: "DVR",
        subscriberRecordingId: "7363",
        playbackUri: "http://jitp-hls.clouddvr.org:18081/03adac60171b430b893172151d121657.m3u8"
    })
    .toss();

/**
 * @TCName: CreatePlaybackSession_019
 * @Description: Create a PlaybackSession with an ACTIVE Subscriber and a COMPLETED recording
 * with inexistent device, when the device Id verification is not being enforced (default behavior).
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244207
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Create a PlaybackSession with an ACTIVE Subscriber and a COMPLETED recording with inexistent device")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7363/playbacksessions",
        {deviceId: "Inexistent device"},
        {json: true})
    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
        status: "ACTIVE",
        type: "DVR",
        playbackUri: "http://jitp-hls.clouddvr.org:18081/03adac60171b430b893172151d121657.m3u8",
        subscriberRecordingId: "7363",
        deviceId: "Inexistent device"
    })
    .toss();

// NOTE: Device Id validation tests change the configuration status and
// may affect other tests, so they are executed as a single jasmine suite
// so that they do not interleave with other frisby tests.

smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

describe("Device Id validation Suite", function () {
    var configUrl = providers.appHostUrl + "/fm/v3/configurations";
    var playBackUrl = providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7363/playbacksessions";
    var originalValue = null;

    function getOriginalConfiguration() {
        return request(configUrl)
        .spread(function(response, body) {
            expect(response.statusCode).toEqual(200);
            var originalConfig = _.find(JSON.parse(body).entities, _.matchesProperty("key", "validations.registeredDevices"));
            originalValue = originalConfig.value;
        });
    }

    function enableDevicesValidation() {
        var data = { entities: [
                            {
                                key: "validations.registeredDevices",
                                value: "true"
                            }
                        ]
                    };
        return request({ url: configUrl, method: "PUT", json: data})
        .spread(function(response, body) {
            expect(response.statusCode).toEqual(200);
        });
    }

    function restoreConfiguration() {
        var data = { entities: [
                            {
                                key: "validations.registeredDevices",
                                value: originalValue
                            }
                        ]
                    };
        return request({ url: configUrl, method: "PUT", json: data})
        .spread(function(response, body) {
            expect(response.statusCode).toEqual(200);
        })
    }

    /**
     * @TCName: CreatePlaybackSession_020
     * @Description: Fail to create a playback session with no deviceId when device Id
     * verification is being enforced
     * @Priority: High
     * @Service: FM
     * @FunctionalArea: playback session
     * @Link: 244207
     */
    it("Fail to create a playback session with no deviceId", function(done) {
        // Get original deviceId validation setting for later restoration
        // and set deviceId validation to true
        getOriginalConfiguration()
        .then(enableDevicesValidation)
        .then(function() {
            // Try to create a playback session with no device
            var data = {};
            return request({ url: playBackUrl, method: "POST", json: data});
            })
        .spread(function(response, body) {
            expect(response.statusCode).toEqual(412);
            expect(body[0].code).toEqual(1001);
            expect(body[0].description).toEqual("Could not find any device with id 'undefined', for subscriber '99'.");

            // Restore configuration value
            return restoreConfiguration();
            })
        .then(done)
        .catch(function(error){
           done(error);
        });
    });


    /**
     * @TCName: CreatePlaybackSession_021
     * @Description: Fail to create a playback session with a deviceId that does not belong to the subscriber
     * when device Id verification is being enforced
     * @Priority: High
     * @Service: FM
     * @FunctionalArea: playback session
     * @Link: 244207
     */
    it("Fail to create a playback session with a deviceId that does not belong to the subscriber", function(done) {
        var configUrl = providers.appHostUrl + "/fm/v3/configurations";
        var playBackUrl = providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7363/playbacksessions";
        var originalValue = null;
        // Get original deviceId validation setting for later restoration
        // and set deviceId validation to true
        getOriginalConfiguration()
        .then(enableDevicesValidation)
        .then(function() {
            // Try to create a playback session with a not registered device
            var data = {deviceId: "Device 1234"};
            return request({ url: playBackUrl, method: "POST", json: data});
            })
        .spread(function(response, body) {
            expect(response.statusCode).toEqual(412);
            expect(body[0].code).toEqual(1001);
            expect(body[0].description).toEqual("Could not find any device with id 'Device 1234', for subscriber '99'.");

            // Restore configuration value
            return restoreConfiguration();
            })
        .then(done)
        .catch(function(error){
           done(error);
        });
    });

    /**
     * @TCName: CreatePlaybackSession_022
     * @Description: Successfully create a playback session when the deviceId belongs to the subscriber
     * and verification is being enforced
     * @Priority: High
     * @Service: FM
     * @FunctionalArea: playback session
     * @Link: 244207
     */
    it("Successfully create a playback session when the deviceId belongs to the subscriber", function(done) {
        var configUrl = providers.appHostUrl + "/fm/v3/configurations";
        var playBackUrl = providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7363/playbacksessions";
        var originalValue = null;
        // Get original deviceId validation setting for later restoration
        // and set deviceId validation to true
        getOriginalConfiguration()
        .then(enableDevicesValidation)
        .then(function() {
            // Create a playback session with a registered device
            var data = {deviceId: "Device 1"};
            return request({ url: playBackUrl, method: "POST", json: data});
            })
        .spread(function(response, body) {
            expect(response.statusCode).toEqual(201);
            expect(body.status).toEqual("ACTIVE");
            expect(body.type).toEqual("DVR");
            expect(body.playbackUri).toEqual("http://jitp-hls.clouddvr.org:18081/03adac60171b430b893172151d121657.m3u8");
            expect(body.subscriberRecordingId).toEqual("7363");
            expect(body.deviceId).toEqual("Device 1");

            // Restore configuration value
            return restoreConfiguration();
            })
        .then(done)
        .catch(function(error){
           done(error);
        });
    });
});

/**
 * @TCName: CreatePlaybackSession_023
 * @Description: Create a PlaybackSession with DASH format
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 244323
 */
smsInteractions.ACTIVE_SUBSCRIBER_99_ALL_INTERACTIONS();
csInteractions.COMPLETED_RECORDING_7363();
csInteractions.CHANNEL_WITHOUT_RESTRICTIONS_HBO_PLUS();

frisby.create("Create a PlaybackSession with DASH format")
    .post(providers.appHostUrl + "/fm/v3/subscribers/99/recordings/7363/playbacksessions",
        {playbackUriType: "dash"},
        {json: true})

    .expectStatus(201)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
        status: "ACTIVE",
        type: "DVR",
        playbackUri: "http://jitp-dash.clouddvr.org:18084/03adac60171b430b893172151d121657.mpd",
        subscriberRecordingId: "7363"
    })
    .toss();