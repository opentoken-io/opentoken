"use strict";

class StorageMock {
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
        this.delAsync.andCallFake((directory) => {
            return new Promise((resolve, reject) => {
                resolve();
            });
        });
        this.getAsync.andCallFake((directory) => {
            var dataToReturn;

            if (directory.match("account")) {
                dataToReturn = '{"data": "thing"}';
            }

            if (directory.match("registration")) {
                dataToReturn = '{"data": "thing"}';
            }

            if (directory.match("some/place/someIdhere")) {
                dataToReturn = '{"accountId": "unhashedAccountId", "email": "some.one@example.net"}';
            }

            return new Promise((resolve, reject) => {
                resolve(new Buffer(dataToReturn, "binary"));
            });
        });
        this.putAsync.andCallFake(() => {
            return new Promise((resolve, reject) => {
                resolve(true);
            });
        });
    }
};

module.exports = new StorageMock();
