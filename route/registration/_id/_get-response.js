"use strict";

module.exports = (server) => {
    return (secureInfoGroup, res) => {
        res.links({
            edit: {
                href: server.router.render("registration-secure", {
                    id: secureInfoGroup.id
                }),
                profile: "/schema/registration/secure-request.json",
                title: "registration-secure"
            },
            item: {
                href: server.router.render("registration-secure-qr", {
                    id: secureInfoGroup.id
                }),
                title: "registration-secure-qr"
            }
        });
        res.send(secureInfoGroup.record);
    };
};
