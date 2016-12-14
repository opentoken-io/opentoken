"use strict";

var promise;

promise = require("./promise-mock")();

module.exports = () => {
    var factory, instance;

    // This does not return a real factory.  It just returns a provider for
    // an instance.
    instance = jasmine.createSpyObj("storageServiceFactory", [
        "deleteAsync",
        "getAsync",
        "putAsync"
    ]);
    instance.deleteAsync.andCallFake(() => {
        return promise.resolve();
    });
    instance.getAsync.andCallFake(() => {
        return promise.reject(new Error("Not configured to be successful"));
    });
    instance.putAsync.andCallFake(() => {
        return promise.resolve();
    });
    factory = jasmine.createSpy("storageServiceFactoryMock").andCallFake((idHash, lifetime, storagePrefix) => {
        expect(idHash).toEqual(jasmine.any(Object));
        expect(lifetime).toEqual(jasmine.any(Object));
        expect(typeof storagePrefix).toBe("string");

        return factory.instance;
    });
    factory.instance = instance;

    return factory;
};
