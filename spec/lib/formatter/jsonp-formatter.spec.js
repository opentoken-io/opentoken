"use strict";

describe("formatter/jsonpFormatter", () => {
    var formatterAsync, reqMock;

    beforeEach(() => {
        reqMock = require("../../mock/request-mock")();
        formatterAsync = jasmine.formatterToPromise("jsonpFormatter", reqMock);
    });
    [
        {
            body: new Buffer("abc", "binary"),
            name: "with a Buffer",
            result: "\"YWJj\"\n"
        },
        {
            body: "a string",
            name: "with a string and a callback",
            query: {
                callback: "doTheThing"
            },
            result: ";typeof doTheThing===\"function\"&&doTheThing(\"a string\");\n"
        },
        {
            body: null,
            name: "jsonp and a null",
            query: {
                jsonp: "cb1234"
            },
            result: ";typeof cb1234===\"function\"&&cb1234(null);\n"
        },
        {
            body: null,
            name: "null without a callback",
            result: "\n"
        },
        {
            name: "jsonp and undefined",
            query: {
                jsonp: "cb1234"
            },
            result: ";typeof cb1234===\"function\"&&cb1234(null);\n"
        },
        {
            name: "undefined without a callback",
            result: "\n"
        }
    ].forEach((scenario) => {
        describe(scenario.name, () => {
            beforeEach(() => {
                if (scenario.query) {
                    reqMock.query = scenario.query;
                }
            });
            it("provides a buffer", () => {
                return formatterAsync(scenario.body).then((result) => {
                    expect(Buffer.isBuffer(result)).toBe(true);
                });
            });
            it("has a trailing newline", () => {
                return formatterAsync(scenario.body).then((result) => {
                    expect(result.toString("binary").substr(-1)).toBe("\n");
                });
            });
            it("made the right result", () => {
                return formatterAsync(scenario.body).then((result) => {
                    expect(result.toString("binary")).toBe(scenario.result);
                });
            });
        });
    });
});
