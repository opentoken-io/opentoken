"use strict";

var container, moduleDefs, Dizzy;

Dizzy = require("dizzy");
container = new Dizzy();

// Configuration - uses `.provide()` because there is no injection
container.register("config", "../config.json").fromModule(__dirname);

// Our code is most often written as factories.
// Register a bunch as
// container.register(fileNameCamelCase, "file-name")
//     .fromModule(__dirname).asFactory.cached();
moduleDefs = {
    apiServer: "./api-server",
    base64: "./base64",
    bufferSerializer: "./buffer-serializer",
    ciphersAndHashes: "./ciphers-and-hashes",
    hotp: "./mfa/hotp",
    logger: "./logger",
    MiddlewareProfiler: "./middleware-profiler",
    OtDate: "./ot-date",
    promise: "./promise",
    random: "./random",
    restMiddleware: "./rest-middleware",
    schema: "./schema",
    secureHash: "./secure-hash",
    serialization: "./serialization",
    Storage: "./storage/s3",
    WebServer: "./web-server"
};
Object.keys(moduleDefs).forEach((moduleKey) => {
    container.register(moduleKey, moduleDefs[moduleKey]).fromModule(__dirname).asFactory().cached();
});

container.register("accountManager", "./account/account-manager").fromModule().asInstance().cached();
container.register("accountService", "./account/account-service").fromModule().asInstance().cached();

// Node modules and builtins -- all use `.provide()`
container.register("crypto", "crypto").fromModule();
container.register("fs", "fs").fromModule();
container.register("setIntervalFn", setInterval);

// 3rd party libraries -- all use `.provide()`
container.register("awsSdk", "aws-sdk").fromModule();
container.register("bluebird", "bluebird").fromModule();
container.register("bufferSerializerModule", "buffer-serializer").fromModule();
container.register("glob", "glob").fromModule();
container.register("helmet", "helmet").fromModule();
container.register("moment", "moment").fromModule();
container.register("proxywrap", "findhit-proxywrap").fromModule();
container.register("restify", "restify").fromModule();
container.register("restifyLinks", "restify-links").fromModule();
container.register("restifyRouterMagic", "restify-router-magic").fromModule();
container.register("tv4", "tv4").fromModule();
container.register("twofa", "2fa").fromModule();
container.register("validator", "validator").fromModule();

module.exports = container;
