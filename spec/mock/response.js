"use strict";

var response;

response = jasmine.createSpyObj("response", [
    "send",
    "setHeader"
]);
response.contentType = "auto";
response.setHeader.andCallFake((header, value) => {
    if (header.toLowerCase() == "content-type") {
        response.contentType = value;
    }
});
module.exports = response;
