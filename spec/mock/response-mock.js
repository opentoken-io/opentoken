"use strict";

module.exports = () => {
    var response;

    /**
     * Sets a header on this response mock
     *
     * @param {string} key
     * @param {string} value
     */
    function headerSetter(key, value) {
        key = key.toLowerCase();
        response.headers[key] = value;

        if (key === "content-type") {
            response.contentType = value;
        }
    }

    response = jasmine.createSpyObj("response", [
        "links",
        "header",
        "send",
        "setHeader",
        "write",

        // Custom extensions to Restify response object
        "setCookie"
    ]);
    response.contentType = "auto";
    response.header.andCallFake(headerSetter);
    response.headers = {};
    response.linkObjects = [];
    response.links.andCallFake((linkObj) => {
        Object.keys(linkObj).sort().forEach((rel) => {
            var linkVals;

            linkVals = [].concat(linkObj[rel]);
            linkVals.forEach((linkVal) => {
                if (typeof linkVal === "string") {
                    linkVal = {
                        href: linkVal
                    };
                }

                if (typeof linkVal !== "object" || !linkVal) {
                    console.log("Invalid link value!", linkVal);
                }

                linkVal.rel = rel;
                response.linkObjects.push(linkVal);
            });
        });
    });
    response.setHeader.andCallFake(headerSetter);

    return response;
};
