"use strict";

var container, dizzy;

dizzy = require("dizzy");
container = dizzy.container();

// Configuration
container.provide("config", require("../config.json"));

// Our code, written in a way that it expects the container to be passed
// into a registration function.
container.instance("apiServer", require("./api-server"));
container.instance("httpsConfig", require("./https-config"));
container.singleton("logger", require("./logger"));
container.instance("webServer", require("./web-server"));

// Node modules
container.provide("fs", require("fs"));
container.provide("http", require("http"));
container.provide("https", require("https"));

// 3rd party libraries
container.provide("express", require("express"));
container.provide("proxywrap", require("findhit-proxywrap"));

module.exports = container;