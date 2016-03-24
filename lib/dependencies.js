"use strict";

var container, dizzy;

dizzy = require("dizzy");
container = dizzy.container();

// Configuration
container.provide("config", require("../config.json"));

// Our code, written in a way that it expects the container to be passed
// into a registration function.
require("./api-server")(container);
require("./health-check")(container);
require("./logger")(container);
require("./web-server")(container);

// 3rd party libraries
container.provide("express", require("express"));

module.exports = container;