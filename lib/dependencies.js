"use strict";

var container, Dizzy, moduleDefs;

Dizzy = require("dizzy");
container = new Dizzy();

// Add the container so modules like storage can load additional dependencies
container.register("container", container);

// Configuration - uses `.provide()` because there is no injection
container.register("config", "../config.json").fromModule(__dirname);

// Here's a way we can promisify modules in bulk
container.register("promisifier", "./promisifier").fromModule(__dirname).asFactory().cached();

// Our code is most often written as factories.
// Register a bunch as
// container.register(fileNameCamelCase, "file-name")
//     .fromModule(__dirname).asFactory.cached();
// The key is the name in the container, the value is the name of the file.
moduleDefs = {
    apiServer: "./api-server",
    base64: "./base64",
    bootstrap: "./bootstrap",
    bufferSerializer: "./buffer-serializer",
    ciphersAndHashes: "./ciphers-and-hashes",
    encryption: "./encryption",
    logger: "./logger",
    MiddlewareProfiler: "./middleware-profiler",
    OtDate: "./ot-date",
    promise: "./promise",
    random: "./random",
    record: "./record",
    restMiddleware: "./rest-middleware",
    schema: "./schema",
    secureHash: "./secure-hash",
    serialization: "./serialization",
    storage: "./storage/s3",
    totp: "./mfa/totp",
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
// Most of these are libraries, but some are node built-in modules.
moduleDefs = {
    awsSdk: "aws-sdk",
    bluebird: "bluebird",
    bufferSerializerModule: "buffer-serializer",
    crypto: "crypto",
    fs: "fs",
    glob: "glob",
    helmet: "helmet",
    moment: "moment",
    path: "path",
    proxywrap: "findhit-proxywrap",
    restify: "restify",
    restifyLinks: "restify-links",
    restifyRouterMagic: "restify-router-magic",
    tv4: "tv4",
    twofa: "2fa",
    validator: "validator",
    zlib: "zlib"
};
Object.keys(moduleDefs).forEach((moduleKey) => {
    container.register(moduleKey, moduleDefs[moduleKey]).fromModule();
});

// Promisify some of those modules
[
    "crypto",
    "fs",
    "glob",
    "restifyRouterMagic",
    "zlib"
].forEach((moduleName) => {
    container.register(`${moduleName}Async`, "promisifier").fromContainer().asFactory(moduleName).cached();
});

module.exports = container;
