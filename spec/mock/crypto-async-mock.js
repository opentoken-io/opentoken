"use strict";

var crypto, cryptoAsync, promiseMock;

promiseMock = require("./promise-mock");
crypto = require("crypto");
cryptoAsync = {};
Object.keys(crypto).forEach((name) => {
    if (name !== "createCredentials" && name !== "Credentials") {
        cryptoAsync[name] = crypto[name];
        cryptoAsync[`${name}Async`] = promiseMock.promisify(crypto[name]);
    }
});
module.exports = cryptoAsync;
