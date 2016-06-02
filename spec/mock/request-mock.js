"use strict";

module.exports = () => {
    var request;

    request = jasmine.createSpyObj("request", [
        "contentType",
        "getContentLength",
        "href"
    ]);
    request.body = null;
    request.contentType.andReturn(null);
    request.getContentLength.andReturn(0);
    request.headers = [];
    request.href.andReturn("/path");
    request.method = "GET";
    request.params = {};

    return request;
};
