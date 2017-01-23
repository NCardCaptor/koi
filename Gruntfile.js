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

/// <reference path="../typings/node/node.d.ts"/>

"use strict";

module.exports = function(grunt) {

    // Resolve configuration file
    var configFile = grunt.option("env") || "local" + ".config.json";
    if (configFile === "local.config.json" && !grunt.file.exists(configFile)) {
        configFile = configFile + ".default";
    }
    grunt.log.writeln("Configuration file: " + configFile);

    grunt.initConfig({
        // Properties
        lint_files: [ "server.js", "app/**/*.js", "tests/**/*.js", "!app/swagger/**/*" ],
        lint_path: "build/lint/",
        tests_path: "build/tests/",
        coverage_path: "build/coverage/",
        pacts_path: "build/pacts/",
        tests_script_db: "tests/scripts/",

        package: grunt.file.readJSON("package.json"),
        config: grunt.file.readJSON(configFile),

        // Tasks
        clean: {
            logs: {
                src: [ "logs/", "build/logs/" ],
            },
            test: {
                src: [ "<%= tests_path %>", "<%= pacts_path %>", "<%= coverage_path %>" ],
            },
            lint: {
                src: [ "<%= lint_path %>" ],
            },
        },
        jshint: {
            build: {
                options: {
                    force: true,
                    jshintrc: true,
                    reporter: "checkstyle",
                    reporterOutput: "<%= lint_path %>/jslint.xml",
                },
                src: "<%= lint_files %>",
            },
            dev: {
                options: {
                    force: true,
                    jshintrc: true,
                    reporter: null,
                    reporterOutput: null,
                },
                src: "<%= lint_files %>",
            },
        },
        jscs: {
            dev: {
                options: {
                    force: true,
                    reporter: "console",
                    reporterOutput: null,
                },
                files: { src: "<%= lint_files %>" },
            },
            build: {
                options: {
                    force: true,
                    reporter: "checkstyle",
                    reporterOutput: "<%= lint_path %>/jscs.xml",
                },
                files: { src: "<%= lint_files %>" },
            },
        },
        bump: {
            options: {
                files: [ "package.json" ],
                commit: false,
                push: false,
                createTag: false
            }
        },
        mkdir: {
            all: {
                options: {
                    create: [ "build/logs", "logs", "<%= pacts_path %>" ],
                },
            },
        },
        env: {
            options: {
                CS_PORT_25100_TCP_ADDR: "<%= config.mocks.cs.host %>",
                CS_PORT_25100_TCP_PORT: "<%= config.mocks.cs.port %>",
                SMS_PORT_25130_TCP_ADDR: "<%= config.mocks.sms.host %>",
                SMS_PORT_25130_TCP_PORT: "<%= config.mocks.sms.port %>",
                MDB_PORT_27017_TCP_ADDR: process.env.MDB_PORT_27017_TCP_ADDR || "<%= config.db.host %>",
                MDB_PORT_27017_TCP_PORT: process.env.MDB_PORT_27017_TCP_PORT || "<%= config.db.port %>",
                APP_PORT: "<%= config.app.port %>",
                APP_HOST: "<%= config.app.host %>",
                PACTS_DIR: __dirname + "/<%= pacts_path %>",
                FM_LOG_LEVEL: process.env.FM_LOG_LEVEL || "<%= config.app.logLevel %>",
                FM_LOG_TRANSACTION_ENABLED: process.env.FM_LOG_TRANSACTION_ENABLED || "<%= config.app.logTransactionEnabled %>"
            },
            test: {
                FM_TEST: "true",
                FM_COVERAGE: "true"
            },
        },
        express: {
            options: {
                script: "server.js",
                output: ".+FM Service Started.+",
                logs: { out: "build/logs/server.log", err: "build/logs/server.log" },
            },
            test: { },
            run: {
                options: {
                    background: false,
                }
            },
        },
        shell: {
            options: {
                stdout: true,
                stderr: true,
                failOnError: true,
                async: true,
            },
        },
        curl: {
            test: {
                src: "http://<%= config.app.host %>:<%= config.app.port %>/coverage/download",
                dest: "<%= coverage_path %>/coverage.zip",
            },
        },
        unzip: {
            test: {
                src: "<%= coverage_path %>/coverage.zip",
                dest: "<%= coverage_path %>",
            },
        },
    });

    // Load Custom Tasks
    require("./grunt/mocks")(grunt);
    require("./grunt/tests")(grunt);
    require("./grunt/docs")(grunt);

    // Load Grunt Tasks
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-express-server");
    grunt.loadNpmTasks("grunt-curl");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-shell-spawn");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-zip");
    grunt.loadNpmTasks("grunt-mkdir");
    grunt.loadNpmTasks("grunt-bump");
    grunt.loadNpmTasks('grunt-wait-server');

    // Lint Tasks
    grunt.registerTask("lint", "Lints the application", [ "clean:lint", "jshint:build", "jscs:build" ]);
    grunt.registerTask("lint:dev", "Lints the application", [ "clean:lint", "jshint:dev", "jscs:dev" ]);

    // Mock Server Tasks
    grunt.registerTask("mock", "Starts Pact Mock Server", ["env:test", "startMock", "waitServer"]);

    // Run application
    grunt.registerTask("run", "Runs application", [ "env:test", "express:run", ]);
    grunt.registerTask("run:test", "Runs application", [ "env:test", "express:test", ]);

    // Test Tasks
    grunt.registerTask("test", [
        "env:test", "killMock", "clean:test", "mkdir", "mock", "run:test",
        "tests", "verifyPacts", "killMock", "curl", "unzip"
    ]);
    grunt.registerTask("testWithoutMock", [
        "env:test", "clean:test", "mkdir", "waitServer:check",
        "run:test", "tests", "verifyPacts"
    ]);

    // Default Task
    grunt.registerTask("default", [ "lint:dev" ]);
};