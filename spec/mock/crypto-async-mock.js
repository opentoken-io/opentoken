"use strict";

var crypto, promiseMock;

promiseMock = require("./promise-mock")();
crypto = require("crypto");
module.exports = () => {
    return promiseMock.promisifyAll(crypto);
};
