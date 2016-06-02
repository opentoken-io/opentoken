"use strict";

describe("chainMiddleware", () => {
    var chainMiddleware, fakeMiddlewareCalls, requestMock, responseMock;

    /**
     * Create fake middleware that just calls the next middleware
     *
     * @param {string} name
     * @param {*} val to send to the `next` callback
     * @return {Function}
     */
    function fakeMiddleware(name, val) {
        return jasmine.createSpy(name).andCallFake((req, res, next) => {
            fakeMiddlewareCalls.push(name);
            next(val);
        });
    }

    beforeEach(() => {
        chainMiddleware = require("../../lib/chain-middleware")();
        requestMock = require("../mock/request-mock");
        responseMock = require("../mock/response-mock");
        fakeMiddlewareCalls = [];
    });
    it("works with a single bit of middleware", (done) => {
        var mw, result;

        mw = fakeMiddleware("mw");
        result = chainMiddleware(mw);
        expect(result).toEqual(jasmine.any(Function));
        result(requestMock, responseMock, (err) => {
            expect(mw).toHaveBeenCalledWith(requestMock, responseMock, jasmine.any(Function));
            expect(fakeMiddlewareCalls).toEqual([
                "mw"
            ]);
            done(err);
        });
    });
    it("skips members of a chain if next is called with an error", (done) => {
        var mw1, mw2, result;

        mw1 = fakeMiddleware("mw1", "err");
        mw2 = fakeMiddleware("mw2");
        result = chainMiddleware(mw1, mw2);
        expect(result).toEqual(jasmine.any(Function));
        result(requestMock, responseMock, (err) => {
            expect(mw1).toHaveBeenCalledWith(requestMock, responseMock, jasmine.any(Function));
            expect(mw2).not.toHaveBeenCalled();
            expect(err).toBe("err");
            done();
        });
    });
    it("skips members of a chain if next is called with false", (done) => {
        var mw1, mw2, result;

        mw1 = fakeMiddleware("mw1", false);
        mw2 = fakeMiddleware("mw2");
        result = chainMiddleware(mw1, mw2);
        expect(result).toEqual(jasmine.any(Function));
        result(requestMock, responseMock, (err) => {
            expect(mw1).toHaveBeenCalledWith(requestMock, responseMock, jasmine.any(Function));
            expect(mw2).not.toHaveBeenCalled();
            expect(err).toBe(false);
            done();
        });
    });
    it("untangles a complicated array of things", (done) => {
        var chain, mw, result;

        chain = [
            fakeMiddleware("chain1"),
            fakeMiddleware("chain2"),
            [
                [
                    fakeMiddleware("chain3"),
                    [
                        fakeMiddleware("chain4"),
                        fakeMiddleware("chain5")
                    ]
                ],
                fakeMiddleware("chain6")
            ],
            fakeMiddleware("chain7")
        ];
        mw = fakeMiddleware("mw");

        // Also tests passing multiple arguments
        result = chainMiddleware(chain, mw);
        expect(result).toEqual(jasmine.any(Function));
        result(requestMock, responseMock, (err) => {
            [
                chain[0],
                chain[1],
                chain[2][0][0],
                chain[2][0][1][0],
                chain[2][0][1][1],
                chain[2][1],
                chain[3],
                mw
            ].forEach((spy) => {
                expect(spy).toHaveBeenCalledWith(requestMock, responseMock, jasmine.any(Function));
            });
            expect(fakeMiddlewareCalls).toEqual([
                "chain1",
                "chain2",
                "chain3",
                "chain4",
                "chain5",
                "chain6",
                "chain7",
                "mw"
            ]);
            done(err);
        });
    });
});
