"use strict";

describe("storage/in-memory", () => {
    var create;

    beforeEach(() => {
        var loggerMock, promiseMock;

        loggerMock = require("../../mock/logger-mock")();
        promiseMock = require("../../mock/promise-mock")();
        create = () => {
            return require("../../../lib/storage/in-memory")(loggerMock, promiseMock);
        };
    });
    describe("on an instance", () => {
        var storage;

        beforeEach(() => {
            storage = create();
        });
        describe(".deleteAsync()", () => {
            it("reports failure if there was nothing", () => {
                return storage.deleteAsync("afile").then(jasmine.fail, () => {});
            });
            it("deletes a file", () => {
                return storage.putAsync("afile", "thing").then(() => {
                    return storage.deleteAsync("afile");
                });
            });
        });
        describe(".getAsync()", () => {
            it("reports failure if the file does not exist", () => {
                return storage.getAsync("afile").then(jasmine.fail, () => {});
            });
            it("gets an object back", () => {
                return storage.putAsync("afile", "thing").then(() => {
                    return storage.getAsync("afile");
                }).then((val) => {
                    expect(val).toEqual("thing");
                });
            });
        });

        // .putAsync() is tested above
    });
});
