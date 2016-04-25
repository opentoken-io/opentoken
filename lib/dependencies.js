"use strict";

var container, dizzy;

dizzy = require("dizzy");
container = dizzy.container();

// Configuration - uses `.provide()` because there is no injection
container.provide("config", require("../config.json"));

// Our code, written in a way that it expects the container to be passed
// into a registration function.
//
// `.register()` = Factory function
// `.provide()` = Uses a value directly, no injection
// `.instance()` = Returns a new instance for everywhere it is injected
// `.singleton()` = Injects the same instance to all dependencies
container.instance("apiServer", require("./api-server"));
container.register("base64", require("./base64"));
container.register("ciphersAndHashes", require("./ciphers-and-hashes"));
container.singleton("logger", require("./logger"));
container.instance("middlewareProfiler", require("./middleware-profiler"));
container.register("otDate", require("./ot-date"));
container.register("promise", require("./promise"));
container.register("random", require("./random"));
container.register("restMiddleware", require("./rest-middleware"));
container.register("serialization", require("./serialization"));
container.register("schema", require("./schema"));
container.instance("storage", require("./storage/s3"));
container.instance("webServer", require("./web-server"));

// Node modules and builtins -- all use `.provide()`
container.provide("fs", require("fs"));
container.provide("setIntervalFn", setInterval);

// 3rd party libraries -- all use `.provide()`
container.provide("awsSdk", require("aws-sdk"));
container.provide("bluebird", require("bluebird"));
container.provide("helmet", require("helmet"));
container.provide("moment", require("moment"));
container.provide("proxywrap", require("findhit-proxywrap"));
container.provide("restify", require("restify"));
container.provide("restifyLinks", require("restify-links"));
container.provide("tv4", require("tv4"));
container.provide("nodeValidator", require("validator"));

module.exports = container;
