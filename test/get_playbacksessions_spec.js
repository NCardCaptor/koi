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
var request = require("request");
var providers = require("../providers");

/**
 * @TCName: GetPlaybackSession_001
 * @Description: Get a PlaybackSession.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 248565
 */
frisby.create("Get a PlaybackSession")
    .get(providers.appHostUrl + "/fm/v3/subscribers/102/recordings/7363/playbacksessions/557060daec17710405592910")
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON({
        "status": "FINISHED",
        "type": "DVR",
        "playbackUri": "http://jitp-hls.clouddvr.org:18081/11223344-8002-aaaa-bbbb-88990000.m3u8",
        "subscriberRecordingId": "7363",
        "subscriberId": "102",
        "offset": 5999,
        "sessionId": "557060daec17710405592910"
    })
    .toss();

/**
 * @TCName: GetPlaybackSession_002
 * @Description: Get All PlaybackSessions by subcriber and recording.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 248565
 */
frisby.create("Get All PlaybackSession by subcriber and recording.")
    .get(providers.appHostUrl + "/fm/v3/subscribers/102/recordings/7363/playbacksessions")
    .expectStatus(200)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([
        {
            "status": "FINISHED",
            "type": "DVR",
            "playbackUri": "http://jitp-hls.clouddvr.org:18081/11223344-8002-aaaa-bbbb-88990000.m3u8",
            "subscriberRecordingId": "7363",
            "subscriberId": "102",
            "offset": 5999,
            "sessionId": "557060daec17710405592910"
        },
        {
            "status": "ACTIVE",
            "type": "DVR",
            "playbackUri": "http://jitp-hls.clouddvr.org:18081/11223344-8002-aaaa-bbbb-88990000.m3u8",
            "subscriberRecordingId": "7363",
            "subscriberId": "102",
            "offset": 800,
            "sessionId": "557060daec17710405592911"
        }
    ])
    .toss();

/**
 * @TCName: GetPlaybackSession_003
 * @Description: Get an inexistent PlaybackSession.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 248565
 */
frisby.create("Get an inexistent PlaybackSession.")
    .get(providers.appHostUrl + "/fm/v3/subscribers/102/recordings/4550/playbacksessions/558060daec17710405593554")
    .expectStatus(404)
    .expectHeaderContains("Content-Type", "application/json")
    .expectJSON([{
      "code": 1033,
      "description": "Could not find any Playbacksession with id '558060daec17710405593554'."
    }])
    .toss();

/**
 * @TCName: GetPlaybackSession_004
 * @Description: Verify Get All PlaybackSessions fail when db is down.
 * @Priority: High
 * @Service: FM
 * @FunctionalArea: playback session
 * @Link: 248565
 */
describe("Simulate error getting PlaybackSessions", function () {
    it("Verify Get All PlaybackSessions fail when db is down", function(done) {
        // Simulate DB Down
        request(providers.appHostUrl + "/fm/v3/test/db/down", function(error, response, body){
            expect(response.statusCode).toEqual(200);

            // Query All Playback Sessions
            request(providers.appHostUrl + "/fm/v3/subscribers/102/recordings/989898/playbacksessions", function(error, response, body){
                expect(response.statusCode).toEqual(500);

                // Simulate DB Back Up
                request(providers.appHostUrl + "/fm/v3/test/db/up", function(error, response, body){
                    expect(response.statusCode).toEqual(200);
                    done();
                });
            });
        });
    });
});
