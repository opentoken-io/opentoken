"use strict";

module.exports = (server, path, options) => {
    return options.container.call((registrationManager) => {
        return {
            get(req, res, next) {
                registrationManager.qrCodeImageAsync(req.params.id).then((pngData) => {
                    res.contentType = "image/png";
                    res.links({
                        item: {
                            href: server.router.render("registration-secure", {
                                id: req.params.id
                            }),
                            title: "registration-secure"
                        }
                    });
                    res.send(pngData);
                }).then(next, next);
            },
            name: "registration-secure-qr"
        };
    });
};
