#!/usr/bin/env node
"use strict";

var config, container, data, options, path, template, util;

/**
 * Resolves a path and loads a file with require()
 *
 * @param {string} filePath
 * @return {*} whatever is returned from require()
 */
function loadFile(filePath) {
    var resultPath;

    resultPath = path.resolve(process.cwd(), filePath);
    console.error(`Loading file: ${resultPath}`);

    return require(resultPath);
}


options = process.argv.slice(2);

if (options.length < 3) {
    console.log(`Render a template

Usage: ./render-template pathBase templateName dataFile [override.json]

pathBase: Group of templates to use.
templateName: Name of template email to process.
dataFile: JSON file to read for template processing.  Use "-" for no data.
override.json: Optional path to an override config to load.

Sample:

    # Render the template for the HTML portion of a registration email.
    ./render-template ../template/email registration-html \\
        email-data-samples/registration.json

Renders the template to stdout.  Status messages go to stderr.`);

    return;
}

console.error("Setting up...");
container = require("../lib/container");
path = require("path");
util = container.resolve("util");
console.error("Loading config: ../config.json");
config = require("../config.json");

if (options.length > 3) {
    console.error(`Loading override: ${options[3]}`);
    config = util.deepMerge(config, loadFile(options[3]));
}

if (options.length > 2 && options[2] !== "-") {
    console.error(`Loading data: ${options[2]}`);
    data = loadFile(options[2]);
    console.error("Data:");
    console.error(data);
}

container.register("config", config);
container.resolve("bootstrap")().then(() => {
    console.error("Bootstrapped.");
    template = container.resolve("template");
    template.processTemplateAsync(data, options[0], options[1]).then((result) => {
        console.log(result);
    }, (err) => {
        console.log("An error occurred.  Sorry.");
        console.log(err);
    });
});
