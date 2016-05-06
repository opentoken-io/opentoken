"use strict";

var container, dizzy;

dizzy = require("dizzy");
container = dizzy.container();

// Configuration - uses `.provide()` because there is no injection
container.register("config", "../config.json").fromModule();

// Our code is most often written as factories.
container.register("accountManager", "./account/account-manager").fromModule().asInstance().cached();
container.register("accountService", "./account/account-service").fromModule().asInstance().cached();
container.register("apiServer", "./api-server").fromModule().asFactory().cached();
container.register("base64", "./base64").fromModule();
container.register("ciphersAndHashes", "./ciphers-and-hashes").fromModule().asFactory().cached();
container.register("hotp", "./mfa/hotp").fromModule().asFactory().cached();
container.register("logger", "./logger").fromModule().asFactory().cached();
container.register("MiddlewareProfiler", "./middleware-profiler").fromModule().asFactory().cached();
container.register("OtDate", "./ot-date").fromModule().asFactory().cached();
container.register("promise", "./promise").fromModule().asFactory().cached();
container.register("random", "./random").fromModule().asFactory().cached();
container.register("restMiddleware", "./rest-middleware").fromModule().asFactory().cached();
container.register("schema", "./schema").fromModule().asFactory().cached();
container.register("secureHash", "./secure-hash").fromModule().asFactory().cached();
container.register("serialization", "./serialization").fromModule().asFactory().cached();
container.register("Storage", "./storage/s3").fromModule().asFactory().cached();
container.register("WebServer", "./web-server").fromModule().cached();

// Node modules and builtins -- all use `.provide()`
container.register("crypto", "crypto").fromModule();
container.register("fs", "fs").fromModule();
container.register("setIntervalFn", setInterval);

// 3rd party libraries -- all use `.provide()`
container.register("awsSdk", "aws-sdk").fromModule();
container.register("bluebird", "bluebird").fromModule();
container.register("glob", "glob").fromModule();
container.register("helmet", "helmet").fromModule();
container.register("moment", "moment").fromModule();
container.register("proxywrap", "findhit-proxywrap").fromModule();
container.register("restify", "restify").fromModule();
container.register("restifylinks", "restify-links").fromModule();
container.register("restifyRouterMagic", "restify-router-magic").fromModule();
container.register("tv4", "tv4").fromModule();
container.register("twofa", "2fa").fromModule();
container.register("validator", "validator").fromModule();

module.exports = container;
