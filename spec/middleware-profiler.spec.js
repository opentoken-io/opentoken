"use strict";

describe("MiddlewareProfiler", () => {
    var mp, setIntervalFn;

    beforeEach(() => {
        var MiddlewareProfiler;

        MiddlewareProfiler = require("../lib/middleware-profiler");
        setIntervalFn = jasmine.createSpy("setIntervalFn");
        mp = new MiddlewareProfiler(setIntervalFn);
    });
    it("exposes known public methods", () => {
        expect(mp.displayAtInterval).toEqual(jasmine.any(Function));
        expect(mp.profileServer).toEqual(jasmine.any(Function));
    });
    describe("displayAtInterval()", () => {
        it("sets up the interval function", () => {
            var args, callback;

            callback = jasmine.createSpy("callback");
            expect(setIntervalFn.callCount).toBe(0);
            mp.displayAtInterval(callback, 1234);
            expect(setIntervalFn.callCount).toBe(1);
            args = setIntervalFn.mostRecentCall.args;
            expect(args.length).toBe(2);
            expect(args[1]).toBe(1234);
            expect(args[0]).toEqual(jasmine.any(Function));
            expect(function () {
                args[0]();
            }).not.toThrow();
        });
    });
    describe("getProfiles()", () => {
        it("returns an empty object initially", () => {
            expect(mp.getProfiles()).toEqual({});
        });
        // Subsequent tests are in profileServer()
    });
    describe("profileServer()", () => {
        var usePatched, useSpy;

        beforeEach(() => {
            var server;

            server = jasmine.createSpyObj("server", [
                "use"
            ]);
            useSpy = server.use;
            mp.profileServer(server);
            usePatched = server.use;
        });
        it("patched use()", () => {
            expect(usePatched).not.toEqual(useSpy);
            expect(usePatched).toEqual(jasmine.any(Function));
        });
        describe("with profiled middleware", () => {
            var args1, args2, middle1, middle2, wrap1;

            beforeEach(() => {
                function fakeMiddleware(req, res, next) {
                    var i, start;

                    start = new Date();
                    i = 0;

                    // A little delay and fake work
                    while (start == (new Date())) {
                        i += 1;
                    }

                    next();
                }

                // No route
                middle1 = jasmine.createSpy("middle1");
                usePatched(middle1);
                args1 = useSpy.mostRecentCall.args;
                wrap1 = args1[0];
                middle1.andCallFake(fakeMiddleware);

                // With a route
                middle2 = jasmine.createSpy("middle2");
                usePatched("/middle2", middle2);
                args2 = useSpy.mostRecentCall.args;
                middle2.andCallFake(fakeMiddleware);
            });
            it("used no route for the first middleware", () => {
                expect(args1.length).toEqual(1);
                expect(args1[0]).toEqual(jasmine.any(Function));
            });
            it("used a route for the second middleware", () => {
                expect(args2.length).toEqual(2);
                expect(args2[0]).toBe("/middle2");
                expect(args2[1]).toEqual(jasmine.any(Function));
            });
            it("initialized the profiles and deals with conflicting function names", () => {
                expect(mp.getProfiles()).toEqual({
                    "": {
                        hits: 0,
                        elapsed: 0
                    },
                    "_": {
                        hits: 0,
                        elapsed: 0
                    }
                });
            });
            it("times the function and counts hits", () => {
                var oldTime, profiles;

                wrap1(1, 2, () => {});
                profiles = mp.getProfiles();
                expect(profiles[""].hits).toBe(1);
                oldTime = profiles[""].elapsed;
                expect(profiles[""].elapsed).toBeGreaterThan(0);
                wrap1(1, 2, () => {});
                profiles = mp.getProfiles();
                expect(profiles[""].hits).toBe(2);
                expect(profiles[""].elapsed).toBeGreaterThan(oldTime);
            });
            it("passes along req and res", () => {
                var args, next, req, res;

                req = {};
                res = {};
                next = () => {};
                wrap1(req, res, next);
                expect(middle1.callCount).toBe(1);
                args = middle1.mostRecentCall.args;
                expect(args[0]).toBe(req);
                expect(args[1]).toBe(res);
                expect(args[2]).toEqual(jasmine.any(Function));
                expect(args[2]).not.toBe(next);
                expect(args.length).toBe(3);
            });
        });
    });
    describe("toString()", () => {
        it("returns an empty string with no profiling information", () => {
            expect(mp.toString()).toEqual("");
        });
        it("returns a couple fake values", () => {
            var profiles;

            profiles = mp.getProfiles();
            profiles["fake"] = {
                elapsed: 0,
                hits: 0
            };
            profiles["fake2"] = {
                elapsed: .3333,
                hits: 3
            };
            expect(mp.toString()).toEqual("fake, 0 hits, 0 ms, NaN avg\nfake2, 3 hits, 333 ms, 111 avg");
        });
    });
});
