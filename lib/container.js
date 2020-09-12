"use strict";

var container, Dizzy;

Dizzy = require("dizzy");
require("dizzy-promisify-bluebird")(Dizzy);
container = new Dizzy();

// Add the container so modules like storage can load additional dependencies
container.register("container", container);

// Our code is most often written as factories.
// Register a bunch as
// container.register(fileNameCamelCase, "file-name")
//     .fromModule(__dirname).asFactory().cached();
// The key is the name in the container, the value is the name of the file.
container.registerBulk({
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
    ErrorResponse: "./error-response",
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
    random: "./random",
    readBodyBufferMiddleware: "./middleware/read-body-buffer-middleware",
    record: "./record",
    registrationManager: "./manager/registration-manager",
    requestLoggerMiddleware: "./middleware/request-logger-middleware",
    restMiddleware: "./rest-middleware",
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
}).fromModule(__dirname).asFactory().cached();

// Injecting a global function so we can easily override it in tests
container.register("setIntervalFn", setInterval);

// 3rd party libraries.
// The key is the name in the container, the value is the name of the module.
// Most of these are libraries, but some are node built-in modules.
container.registerBulk({
    awsSdk: "aws-sdk",
    bluebird: "bluebird",
    BufferSerializerModule: "buffer-serializer",
    crypto: "crypto",
    fs: "fs",
    glob: "glob",
    helmet: "helmet",
    moment: "moment",
    mustache: "mustache",
    neodoc: "neodoc",
    nocache: "nocache",
    path: "path",
    proxywrap: "findhit-proxywrap",
    restify: "restify",
    restifyCookies: "restify-cookies",
    restifyErrors: "restify-errors",
    restifyLinks: "restify-links",
    restifyRouterMagic: "restify-router-magic",
    thirtyTwo: "thirty-two",
    tv4Original: "tv4",
    twofa: "2fa",
    validator: "validator",
    zlib: "zlib"
}).fromModule();

// Register a modified version of the tv4 module.
container.register("tv4", "tv4-file-loader").fromModule().asFactory("tv4Original").cached();

// Promisify some of those modules
container.registerBulk({
    cryptoAsync: "crypto",
    fsAsync: "fs",
    globAsync: "glob",
    restifyRouterMagicAsync: "restifyRouterMagic",
    twofaAsync: "twofa",
    zlibAsync: "zlib"
}).fromContainer().promisified().cached();

module.exports = container;
