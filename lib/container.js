"use strict";

var container, Dizzy, moduleDefs;

Dizzy = require("dizzy");
container = new Dizzy();

// Add the container so modules like storage can load additional dependencies
container.register("container", container);

// Configuration - uses `.provide()` because there is no injection
container.register("config", "../config.json").fromModule(__dirname);

// Our code is most often written as factories.
// Register a bunch as
// container.register(fileNameCamelCase, "file-name")
//     .fromModule(__dirname).asFactory().cached();
// The key is the name in the container, the value is the name of the file.
moduleDefs = {
    accessCodeManager: "./manager/access-code-manager",
    accountManager: "./manager/account-manager",
    apiServer: "./api-server",
    base32: "./base32",
    base64: "./base64",
    binaryBuffer: "./binary-buffer",
    binaryFormatter: "./formatter/binary-formatter",
    bootstrap: "./bootstrap",
    bufferSerializer: "./buffer-serializer",
    chainMiddleware: "./chain-middleware",
    challengeManager: "./manager/challenge-manager",
    ciphersAndHashes: "./ciphers-and-hashes",
    email: "./email",
    encoding: "./encoding",
    encryption: "./encryption",
    errorJsonFormatter: "./formatter/error-json-formatter",
    errorResponse: "./error-response",
    formatters: "./formatters",
    genericFormatter: "./formatter/generic-formatter",
    hash: "./hash",
    hex: "./hex",
    imagePngFormatter: "./formatter/image-png-formatter",
    jsonFormatter: "./formatter/json-formatter",
    jsonpFormatter: "./formatter/jsonp-formatter",
    linksMiddleware: "./middleware/links-middleware",
    logger: "./logger",
    loginCookie: "./login-cookie",
    MiddlewareProfiler: "./middleware-profiler",
    OtDate: "./ot-date",
    promise: "./promise",
    promisifier: "./promisifier",
    random: "./random",
    readBodyBufferMiddleware: "./middleware/read-body-buffer-middleware",
    record: "./record",
    registrationManager: "./manager/registration-manager",
    restMiddleware: "./rest-middleware",
    schema: "./schema",
    serialization: "./serialization",
    sessionManager: "./manager/session-manager",
    signatureOt1: "./signature-ot1",
    storage: "./storage",
    storageServiceFactory: "./storage-service-factory",
    template: "./template",
    textFormatter: "./formatter/text-formatter",
    tokenManager: "./manager/token-manager",
    totp: "./mfa/totp",
    util: "./util",
    validateRequestBodyMiddleware: "./middleware/validate-request-body-middleware",
    validateRequestQueryMiddleware: "./middleware/validate-request-query-middleware",
    validateSessionMiddleware: "./middleware/validate-session-middleware",
    validateSignatureMiddleware: "./middleware/validate-signature-middleware",
    WebServer: "./web-server"
};
Object.keys(moduleDefs).forEach((moduleKey) => {
    container.register(moduleKey, moduleDefs[moduleKey]).fromModule(__dirname).asFactory().cached();
});

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
    docopt: "docopt",
    fs: "fs",
    glob: "glob",
    helmet: "helmet",
    moment: "moment",
    mustache: "mustache",
    path: "path",
    proxywrap: "findhit-proxywrap",
    restify: "restify",
    restifyCookies: "restify-cookies",
    restifyLinks: "restify-links",
    restifyPlugins: "restify-plugins",
    restifyRouterMagic: "restify-router-magic",
    thirtyTwo: "thirty-two",
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
    "twofa",
    "zlib"
].forEach((moduleName) => {
    container.register(`${moduleName}Async`, "promisifier").fromContainer().asFactory(moduleName).cached();
});

module.exports = container;
