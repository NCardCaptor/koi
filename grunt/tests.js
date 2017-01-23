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

var _ = require("lodash");
var fs = require("fs");
var glob = require("glob");
var http = require("http");
var child = require("child_process");

module.exports = function(grunt) {

    var testsFolder = "tests";

    /**
     * Kills Reactive Mock Pact Server. Shell:kill is not working, so plain old kill commands are used.
     */
    function killMock() {
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
     * Runs Tests
     */
    var runTests = function() {

        // Instruct this task to wait until we call the done() method to continue
        var done = this.async();

        var filter = grunt.option("filter");
        var fileList = "";

        if (filter) {
            var files = grunt.file.expand(testsFolder + "/**/" + filter + "_spec.js");
            files.forEach(function(file) {
                fileList += " " + file;
            });
            grunt.log.writeln("Running tests: " + fileList);
        } else {
            grunt.log.writeln("Running all tests in folder: " + testsFolder);
            fileList = testsFolder;
        }

        if (fileList === "") {
            grunt.fail.fatal("There are no tests that match filter '" + filter + "'");
        }

        var junit = "--captureExceptions --junitreport --output build/tests  ";
        var tests = child.exec("jasmine-node " + junit + fileList);
        tests.stdout.on("data", function(data) {
            grunt.log.write("" + data);
        });
        tests.stderr.on("data", function(data) {
            grunt.log.write("" + data);
        });
        tests.on("close", function(code) {
            if (code) {
                grunt.log.error("Tests Failed!");
                killMock();
                grunt.fail.fatal("Tests didn't run correctly.");
            }
            grunt.log.ok("Tests Passed!");
            done();
        });
    };

    var testMap = {};
    var testIdsMap = {};

    /**
     * Loads Test Cases Mapping and warns if there are duplicates.
     */
    function loadTestMaps()
    {
        var duplicates = [];
        var testFiles = glob.sync("tests/**/*_spec.js");
        _.forEach(testFiles, function(file) {
            var data = fs.readFileSync(file, "utf-8");

            // Get Frisby Tests
            var regex = new RegExp("frisby.create\\(\"([^\"]+)\"|describe\\(\"([^\"]+)\"", "g");
            var match = regex.exec(data);
            while (match) {
                var testName = match[1] || match[2];
                if (testMap[testName] !== undefined) {
                    duplicates.push(file + ": " + testName + "\n  Previously used in: " + testMap[testName]);
                }
                testMap[testName] = file;
                match = regex.exec(data);
            }

            // Get Test IDs
            // @TCName: Configuration_001
            regex = new RegExp("@TCName:\\s+([^\\s]+)", "g");
            match = regex.exec(data);
            while (match) {
                var testId = match[1];
                if (testIdsMap[testId] !== undefined) {
                    duplicates.push(file + ": Test Name [" + testId + "]\n  Previously used in: " + testIdsMap[testId]);
                }
                testIdsMap[testId] = file;
                match = regex.exec(data);
            }
        });

        if (duplicates.length > 0) {
            grunt.log.warn("There are duplicate test case names:");
            _.forEach(duplicates, function(duplicate) {
                grunt.log.warn(duplicate);
            });
            grunt.fail.warn("Duplicate Tests Exist!");
        }
    }

    /**
     * Fixes Classname in test reports so that they can be imported correctly in sonar.
     */
    var fixTestReports = function() {
        loadTestMaps();
        var reports = glob.sync("build/tests/*.xml");
        _.forEach(reports, function(report) {
            var content = fs.readFileSync(report, "utf-8");
            _.forEach(Object.keys(testMap), function(key) {
                var newValue = testMap[key].replace(new RegExp("/", "g"), ".").replace(".js", "").replace("tests.", "tests/");
                content = content.replace(new RegExp("classname=\"Frisby Test: " + key + "\"", "g"), "classname=\"" + newValue + "\"");
                content = content.replace(new RegExp("classname=\"" + key + "\"", "g"), "classname=\"" + newValue + "\"");
            });
            fs.writeFileSync(report, content, { encoding: "utf-8" });
        });
    };

    /**
     * Populates Database on the Application.
     */
    var initDatabase = function() {
        var done = this.async();
        var httpOptions = {
            method: "PUT",
            host: process.env.APP_HOST || "localhost",
            port: process.env.APP_PORT || 3500,
            path: "/fm/v3/test/initdb"
        };

        var req = http.request(httpOptions, function(response) {
            if (response.statusCode !== 200)
            {
                grunt.log.error("Error initializing Db!");
                grunt.fail.warn("Db could not be initialized");
            }
            done();
        });
        req.on("error", grunt.log.error);
        req.end();
    };

    var verifyLogs = function() {
        var logContent = fs.readFileSync("logs/nDVR-FM.log", "utf-8").split("\n");
        var correlationExclusionLines = [
            "FM Service Started",
            "Using CS Service",
            "Using SMS Service",
            "Hooking Coverage",
            "DB Connected",
            "DB Connecting to",
            "DB Connection error",
            "Instrumenting Database",
            "Adding Testing Routes",
            "Reading configuration from Database"
        ];

        _.forEach(logContent, function(line) {
            // Verify Correlation ID
            var lineRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[-+]\d{4}) \[(\d+\.\d+\.\d+)\] \[FM\] ([^\s]+) \[([^\s\]]*)\] \[([^\s\]]*)\] \[([^\s\]]*)\] \[([^\s\]]*)\] (.+)/;
            var result = line.match(lineRegex);
            if (result) {
                // Verify Correlation Id:
                if (!result[4]) {
                    var excludes = false;
                    _.forEach(correlationExclusionLines, function (exclusion) {
                        if (line.match(exclusion)) {
                            excludes = true;
                        }
                    });
                    if (!excludes) {
                        grunt.log.warn("Invalid Correlation Id: " + line);
                    }
                }

                // Verify Log Levels
                if (!_.includes(["ERROR", "WARN", "TRANSACTION", "INFO", "DEBUG", "TRACE"], result[3])) {
                    grunt.log.warn("Invalid Log Level: " + result[3] + " in: " + line);
                }

                // Verify Warn/Error Level Format
                if (result[3] === "ERROR" || result[3] === "WARN") {
                    var errorFormat = /[^\.\s]+\.[^\.\s]+\(\): .*/;
                    if (!result[8].match(errorFormat)) {
                        grunt.fail.warn("Invalid error format in log: " + result[8]);
                    }
                }

            } else if (line !== "") {
                // Could be broken lines
                grunt.log.warn("Invalid Log Line: " + line);
            }
        });
    };

    // Register Tasks
    grunt.registerTask("runTests", "Actually runs tests", runTests);
    grunt.registerTask("fixReports", "Fix Test Reports", fixTestReports);
    grunt.registerTask("verifyLog", "Runs checks on logs", verifyLogs);
    grunt.registerTask("initDatabase", "Populates FM Database", initDatabase);
    grunt.registerTask("tests", "Run Jasmine Tests", ["initDatabase", "runTests", "verifyLog", "fixReports"]);
};