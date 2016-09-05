"use strict";

var registrationManagerMock;

jasmine.routeTester("/registration/_id/qr", (container) => {
    registrationManagerMock = require("../../../../mock/manager/registration-manager-mock")();
    container.register("registrationManager", registrationManagerMock);
}, (routeTester) => {
    it("exports the right methods", () => {
        expect(Object.keys(routeTester.exports).sort()).toEqual([
            "get",
            "name"
        ]);
    });
    describe("GET", () => {
        it("creates a QR code", () => {
            routeTester.req.params.id = "id";

            return routeTester.get().then(() => {
                var args;

                expect(registrationManagerMock.qrCodeImageAsync).toHaveBeenCalledWith("id");
                expect(routeTester.res.contentType).toEqual("image/png");
                jasmine.checkLinks([
                    {
                        href: "rendered route: registration-secure, id:\"id\"",
                        rel: "item",
                        title: "registration-secure"
                    }
                ], routeTester.res.linkObjects);
                expect(routeTester.res.send).toHaveBeenCalled();
                args = routeTester.res.send.mostRecentCall.args;
                expect(Buffer.isBuffer(args[0])).toBe(true);
                expect(args[0].toString("binary")).toEqual("png data");
                expect(args.length).toBe(1);
            });
        });
    });
});
