"use strict";

/**
 * Fake storage object
 */
class StorageMock {
    /**
     * Sets up spies on all methods.
     */
    constructor() {
        [
            "configure",
            "delAsync",
            "getAsync",
            "putAsync"
        ].forEach((method) => {
            this[method] = jasmine.createSpy(method);
        });
        this.configure.andCallFake(() => {
            return this;
        });
        this.delAsync.andCallFake(() => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });
        this.getAsync.andCallFake((directory) => {
            var dataToReturn;

            if (directory.match("registration")) {
                dataToReturn = "{\"data\": \"thing\"}";
            }

            if (directory.match("some/place/someIdhere")) {
                dataToReturn = "{\"accountId\": \"unhashedAccountId\", \"email\": \"some.one@example.net\"}";
            }

            return new Promise((resolve) => {
                resolve(new Buffer(dataToReturn, "binary"));
            });
        });
        this.putAsync.andCallFake(() => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });
    }
}

module.exports = new StorageMock();
