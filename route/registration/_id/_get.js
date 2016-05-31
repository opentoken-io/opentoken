"use strict";

module.exports = (server, secureInfoGroup, res) => {
    res.links({
        edit: {
            href: server.router.render("registration-secure", {
                id: secureInfoGroup.id
            }),
            profile: "/schema/registration/secure-request.json",
            title: "registration-secure"
        },
        item: {
            href: server.router.render("registration-qr", {
                id: secureInfoGroup.id
            }),
            title: "registration-qr"
        }
    });
    res.send(secureInfoGroup.secureInfo);
};
