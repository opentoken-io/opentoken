"use strict";

var events;

events = require("events");

module.exports = () => {
    var eventEmitter, request;

    request = jasmine.createSpyObj("request", [
        "contentType",
        "getContentLength",
        "getPath",
        "getQuery",
        "href",
        "isChunked"
    ]);
    request.body = null;
    request.contentType.andReturn(null);
    request.getContentLength.andCallFake(() => {
        return request.internalContentLength;
    });
    request.getPath.andCallFake(() => {
        return request.internalPath;
    });
    request.getQuery.andCallFake(() => {
        return request.internalQuery;
    });
    request.headers = [];
    request.href.andCallFake(() => {
        return request.internalPath;
    });
    request.isChunked.andCallFake(() => {
        return false;
    });
    request.method = "GET";
    request.params = {};

    // These things are only used by the mock
    request.internalContentLength = 0;
    request.internalPath = "/path";
    request.internalQuery = "";

    // Custom additions to the standard Restify request object
    request.cookies = {};

    // Inherit methods from EventEmitter to get "on", "emit", "once", etc.
    eventEmitter = new events.EventEmitter();
    [
        "emit",
        "on",
        "once"
    ].forEach((methodName) => {
        request[methodName] = eventEmitter[methodName].bind(eventEmitter);
        spyOn(request, methodName).andCallThrough();
    });
    request.resume = jasmine.createSpy("request.resume");

    return request;
};
