"use strict";

module.exports = () => {
    /**
     * Blindly decode everything from Base64.
     *
     * @param {string} input base64 encoded
     * @return {string}
     */
    function decodeFake(input) {
        return new Buffer(input.toString("binary"), "base64");
    }


    /**
     * Blindly encode everything to Base64.
     *
     * @param {(string|Buffer)} input
     * @return {string} base64 of input
     */
    function encodeFake(input) {
        return new Buffer(input.toString("binary"), "binary").toString("base64");
    }

    return {
        decode: jasmine.createSpy("encoding.decode").andCallFake(decodeFake),
        encode: jasmine.createSpy("encoding.encode").andCallFake(encodeFake)
    };
};
