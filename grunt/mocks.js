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

/// <reference path="../../typings/node/node.d.ts"/>

"use strict";

var child = require("child_process");

module.exports = function(grunt) {

    var reactiveMockExecCallback = function(err, stdout, stderr, callback) {
        if (err) {
            if (process.platform !== "win32") {
                grunt.log.error("\nMock server could not be started. To kill any mock instance currently running use this command:");
                grunt.log.error("ps aux | grep pact-mock-reactive | grep -v grep | awk '{ print $2}' | xargs kill\n");
            }
            grunt.fail.fatal("Mock server could not be started!");
        };
        callback();
    };

    grunt.config.set("shell.reactive_mock", {
        command: "meteor run",
        options: {
            callback: reactiveMockExecCallback,
            execOptions: {
                cwd: 'node_modules/pact-mock-reactive'
            }
        }
    });

    grunt.config.set("waitServer.server", {
        options: {
            url: 'http://<%= config.mocks.cs.host %>:<%= config.mocks.cs.port %>',
            fail: function () {grunt.fail.fatal("Server did not start at the expected time");},
            timeout: 180 * 1000,
            isforce: true,
            interval: 800,
            print: true
        }
    });

    grunt.config.set("waitServer.check", {
        options: {
            url: 'http://<%= config.mocks.cs.host %>:<%= config.mocks.cs.port %>',
            fail: function () {grunt.fail.fatal("Server did not start at the expected time");},
            timeout: 3 * 1000,
            isforce: true,
            interval: 800,
            print: true
        }
    });

    /**
     * Kills Reactive Mock Pact Server. Shell:kill is not working, so plain old kill commands are used.
     */
    var killMock = function() {
        if (process.platform === "win32") {
            try {
                child.execSync("wmic Path win32_process Where \"CommandLine Like '%pact-mock-reactive%'\" Call Terminate", { timeout: 1500 });
            } catch (error) {
                grunt.log.warn("Error killing Mocks: " + error);
            }
        } else {
            try {
                child.execSync("ps aux | grep pact-mock-reactive | grep -v grep | awk '{ print $2}' | xargs kill", { timeout: 1500 });
            } catch (error) {
                grunt.log.warn("Error killing Mocks: " + error);
            }
        }
    };

    /**
     * Verify Pacts
     */
    var verifyPacts = function() {
        grunt.log.writeln("Running WritePacts");
        var result = child.spawnSync("node", ["tests/scripts/writepacts.js"]);
        grunt.log.writeln(result.stdout);
        if (result.stderr.toString()) {
            grunt.log.writeln(result.stderr);
        }

        if (result.status) {
            killMock();
            grunt.log.error("Pacts verification failed");
            grunt.fail.warn("Pacts verification error: " + result.error.code);
        } else {
            grunt.log.ok("Pacts Verification Successful");
        }
    };

    // Register Tasks
    grunt.registerTask("verifyPacts", "Verify Pacts generated with pact-reactive.", verifyPacts);
    grunt.registerTask("killMock", "Kills Reactive Mock Server", killMock);
    grunt.registerTask("startMock", "Starts Mock Server", [ "shell:reactive_mock" ]);
};