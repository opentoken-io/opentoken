"use strict";

var container;

container = require("../lib/dependencies");

// Initialize the server and the health check endpoints
container.resolve("ApiServer");
container.resolve("HealthCheck");