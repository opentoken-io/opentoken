"use strict";

var container, dizzy;

dizzy = require("dizzy");
container = dizzy.container();

// Configuration
container.provide("config", require("../config.json"));

// Our code, written in a way that it expects the container to be passed
// into a registration function.
container.instance("apiServer", require("./api-server"));
container.register("base64", require("./base64.js"));
container.singleton("logger", require("./logger"));
container.instance("middlewareProfiler", require("./middleware-profiler"));
container.register("promise", require("./promise"));
container.register("restMiddleware", require("./rest-middleware"));
container.register("serialization", require("./serialization"));
container.instance("webServer", require("./web-server"));

// Node modules and builtins
container.provide("fs", require("fs"));
container.provide("setIntervalFn", setInterval);

// 3rd party libraries
container.provide("bluebird", require("bluebird"));
container.provide("helmet", require("helmet"));
container.provide("proxywrap", require("findhit-proxywrap"));
container.provide("restify", require("restify"));
container.provide("restifyLinks", require("restify-links"));

module.exports = container;
