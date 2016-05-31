"use strict";

var crypto, promiseMock;

promiseMock = require("./promise-mock")();
crypto = require("crypto");
module.exports = () => {
    var cryptoAsync;

    cryptoAsync = {};
    Object.keys(crypto).forEach((name) => {
        if (name !== "createCredentials" && name !== "Credentials") {
            cryptoAsync[name] = crypto[name];
            spyOn(cryptoAsync, name).andCallThrough();
            cryptoAsync[`${name}Async`] = promiseMock.promisify(crypto[name]);
            spyOn(cryptoAsync, `${name}Async`).andCallThrough();
        }
    });

    return cryptoAsync;
};
