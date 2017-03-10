"use strict";

describe("MiddlewareProfiler", () => {
    var mp, setIntervalFn;

    beforeEach(() => {
        var MiddlewareProfiler;

        setIntervalFn = jasmine.createSpy("setIntervalFn");
        MiddlewareProfiler = require("../../lib/middleware-profiler")(setIntervalFn);
        mp = new MiddlewareProfiler();
    });
    it("exposes known public methods", () => {
        expect(mp.displayAtInterval).toEqual(jasmine.any(Function));
        expect(mp.profileServer).toEqual(jasmine.any(Function));
    });
    describe("displayAtInterval()", () => {
        it("sets up the interval function", () => {
            var args, callback;

            callback = jasmine.createSpy("callback");
            expect(setIntervalFn.calls.count()).toBe(0);
            mp.displayAtInterval(callback, 1234);
            expect(setIntervalFn.calls.count()).toBe(1);
            args = setIntervalFn.calls.mostRecent().args;
            expect(args.length).toBe(2);
            expect(args[1]).toBe(1234);
            expect(args[0]).toEqual(jasmine.any(Function));
            expect(() => {
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
                /**
                 * Create fake middleware that simply consumes time
                 *
                 * @param {Object} req Request
                 * @param {Object} res Response
                 * @param {Function} next
                 * @return {number} irrelevant
                 */
                function fakeMiddleware(req, res, next) {
                    var i, start;

                    start = new Date();
                    i = 0;

                    // A little delay and fake work
                    while (start === new Date()) {
                        i += 1;
                    }

                    next();

                    /* Returning the value so ESLint is tricked into
                     * thinking the variable is used.
                     */
                    return i;
                }

                /**
                 * Create a fake middleware spy.
                 *
                 * @param {string} spyName
                 * @return {Function}
                 */
                function createFakeMiddleware(spyName) {
                    var spy;

                    spy = jasmine.createSpy(spyName);

                    // Fix for Node 6.5 to make it act like older versions.
                    if (spy.name) {
                        delete spy.name;
                    }

                    spy.and.callFake(fakeMiddleware);

                    return spy;
                }

                // No route
                middle1 = createFakeMiddleware("middle1");
                usePatched(middle1);
                args1 = useSpy.calls.mostRecent().args;
                wrap1 = args1[0];

                // With a route
                middle2 = createFakeMiddleware("middle2");
                usePatched("/middle2", middle2);
                args2 = useSpy.calls.mostRecent().args;
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
                    _: {
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
                expect(middle1.calls.count()).toBe(1);
                args = middle1.calls.mostRecent().args;
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
            expect(mp.toString()).toEqual("--- Middleware Profiling ---");
        });
        it("returns a couple fake values", () => {
            var profiles;

            profiles = mp.getProfiles();
            profiles.fake = {
                elapsed: 0,
                hits: 0
            };
            profiles.fake2 = {
                elapsed: .3333,
                hits: 3
            };
            expect(mp.toString()).toEqual("--- Middleware Profiling ---\nfake, 0 hits, 0 ms, NaN avg\nfake2, 3 hits, 333 ms, 111 avg");
        });
    });
});
