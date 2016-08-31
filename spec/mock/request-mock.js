"use strict";

module.exports = () => {
    var request;

    request = jasmine.createSpyObj("request", [
        "contentType",
        "getContentLength",
        "getPath",
        "getQuery",
        "href"
    ]);
    request.body = null;
    request.contentType.andReturn(null);
    request.getContentLength.andReturn(0);
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
    request.method = "GET";
    request.params = {};

    // These things are only used by the mock
    request.internalPath = "/path";
    request.internalQuery = "";

    // Custom additions to the standard Restify request object
    request.cookies = {};

    return request;
};
