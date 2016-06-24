"use strict";

var base64Mock;

base64Mock = require("./base64-mock")();

module.exports = () => {
    /**
     * Blindly decode everything from Base64.
     *
     * @param {string} input base64 encoded
     * @return {string}
     */
    function decodeFake(input) {
        return base64Mock.decode(input);
    }


    /**
     * Blindly encode everything to Base64.
     *
     * @param {(string|Buffer)} input
     * @return {string} base64 of input
     */
    function encodeFake(input) {
        return base64Mock.encode(input);
    }

    return {
        decode: jasmine.createSpy("encoding.decode").andCallFake(decodeFake),
        encode: jasmine.createSpy("encoding.encode").andCallFake(encodeFake)
    };
};
