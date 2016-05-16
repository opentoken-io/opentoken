"use strict";

var container, moduleDefs, Dizzy;

Dizzy = require("dizzy");
container = new Dizzy();

// Providing container so we can inject other modules
// we don't want to specifically have called out here.
container.provide("container", container);

// Configuration - uses `.provide()` because there is no injection
container.register("config", "../config.json").fromModule(__dirname);

// Our code is most often written as factories.
// Register a bunch as
// container.register(fileNameCamelCase, "file-name")
//     .fromModule(__dirname).asFactory.cached();
// The key is the name in the container, the value is the name of the file.
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

// These are not converted to factories yet
container.register("accountManager", "./account/account-manager").fromModule().asInstance().cached();
container.register("accountService", "./account/account-service").fromModule().asInstance().cached();

// Injecting a global function so we can easily override it in tests
container.register("setIntervalFn", setInterval);

// 3rd party libraries.
// The key is the name in the container, the value is the name of the module.
moduleDefs = {
    awsSdk: "aws-sdk",
    bluebird: "bluebird",
    bufferSerializerModule: "buffer-serializer",
    crypto: "crypto", // node built-in
    fs: "fs", // node built-in
    glob: "glob",
    helmet: "helmet",
    moment: "moment",
    proxywrap: "findhit-proxywrap",
    restify: "restify",
    restifyLinks: "restify-links",
    restifyRouterMagic: "restify-router-magic",
    tv4: "tv4",
    twofa: "2fa",
    validator: "validator"
};
Object.keys(moduleDefs).forEach((moduleKey) => {
    container.register(moduleKey, moduleDefs[moduleKey]).fromModule();
});

module.exports = container;
