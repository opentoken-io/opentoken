"use strict";

var container, dizzy;

dizzy = require("dizzy");
container = dizzy.container();

// Configuration
container.provide("config", require("../config.json"));

// Our code, written in a way that it expects the container to be passed
// into a registration function.
container.instance("account", require("./account"));
container.instance("apiServer", require("./api-server"));
container.provide("base64", require("./base64.js"));
container.singleton("logger", require("./logger"));
container.instance("hotp", require("./hotp/two-factor-authenticator.js"));
container.instance("middlewareProfiler", require("./middleware-profiler"));
container.instance("password", require("./password"));
container.register("promise", require("./promise"));
container.register("restMiddleware", require("./rest-middleware"));
container.instance("storage", require("./storage/s3"));
container.instance("webServer", require("./web-server"));

// Node modules and builtins
container.provide("crypto", require("crypto"));
container.provide("fs", require("fs"));
container.provide("setIntervalFn", setInterval);

// 3rd party libraries
container.provide("tfa", require("2fa"));
container.provide("awsSdk", require("aws-sdk"));
container.provide("bluebird", require("bluebird"));
container.provide("helmet", require("helmet"));
container.provide("proxywrap", require("findhit-proxywrap"));
container.provide("restify", require("restify"));
container.provide("restifyLinks", require("restify-links"));

module.exports = container;
