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
    instance.deleteAsync.andReturn(promise.resolve());
    instance.getAsync.andReturn(promise.reject(new Error("Not configured to be successful")));
    instance.putAsync.andReturn(promise.resolve());
    factory = jasmine.createSpy("storageServiceFactoryMock").andCallFake((idHash, lifetime, storagePrefix) => {
        expect(idHash).toEqual(jasmine.any(Object));
        expect(lifetime).toEqual(jasmine.any(Object));
        expect(typeof storagePrefix).toBe("string");

        return factory.instance;
    });
    factory.instance = instance;

    return factory;
};
