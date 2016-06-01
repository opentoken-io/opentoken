"use strict";

module.exports = () => {
    var response;

    response = {
        contentType: "auto",
        linkObjects: [],
        links: jasmine.createSpy("response.links").andCallFake((linkObj) => {
            Object.keys(linkObj).sort().forEach((rel) => {
                var linkVals;

                linkVals = [].concat(linkObj[rel]);
                linkVals.forEach((linkVal) => {
                    if (typeof linkVal === "string") {
                        linkVal = {
                            href: linkVal
                        };
                    }

                    linkVal.rel = rel;
                    response.linkObjects.push(linkVal);
                });
            });
        }),
        send: jasmine.createSpy("response.send"),
        setHeader: jasmine.createSpy("response.setHeader").andCallFake((header, value) => {
            if (header.toLowerCase() === "content-type") {
                response.contentType = value;
            }
        })
    };

    return response;
};
