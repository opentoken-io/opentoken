#!/usr/bin/env node
"use strict";

var container, exampleLib, hash, neodoc;

/**
 * Returns the usage instructions
 *
 * @return {string}
 */
function usageHelp() {
    return `
Example script to create an OpenToken account.

Usage:

    create-login [OPTIONS]

Options:

    --api=URL      Specify the API URL.  This would override the use of
                   OPENTOKEN_API environment variable.
    --help, -h     Show this help message.
    --email=EMAIL  Set the email address for the account.
    --password=PW  Use the given password.  Putting this on the command line
                   is not very secure.  You can also use OPENTOKEN_PASSWORD
                   environment variable.
`;
}


/**
 * The main program.
 */
function main() {
    var args, config;

    args = neodoc.run(usageHelp());
    config = exampleLib.config(args);

    if (args["--help"]) {
        console.log(usageHelp().trim());

        return;
    }

    if (!args["--email"]) {
        console.log("Email is required.  See --help.");

        return;
    }

    if (!config.password) {
        console.log("Password is required.  See --help.");

        return;
    }

    if (!config.api) {
        console.log("You must specify an API URL.  See --help.");

        return;
    }

    console.log("Requesting self-discovery endpoint");
    exampleLib.requestAsync("GET", config.api).then((res) => {
        var registerLink, registerRequest;

        registerLink = res.link.service.registration_register;
        registerRequest = {
            email: args["--email"]
        };
        console.log("Submitting registration information");

        return exampleLib.postLinkAsync(registerLink, registerRequest);
    }).then((res) => {
        var mfaKeyBase32, registrationSecureLink;

        mfaKeyBase32 = res.body.mfa.totp.keyBase32;
        registrationSecureLink = res.link.edit.registration_secure;
        console.log(`OPENTOKEN_MFA=${mfaKeyBase32}`);

        return hash.deriveAsync(config.password, res.body.passwordHashConfig).then((passwordHash) => {
            var secureRequest;

            secureRequest = {
                mfa: {
                    totp: {
                        current: exampleLib.totpCode(mfaKeyBase32),
                        previous: exampleLib.totpCode(mfaKeyBase32, -1)
                    }
                },
                passwordHash
            };
            console.log("Submitting additional information to secure the account");

            return exampleLib.postLinkAsync(registrationSecureLink, secureRequest);
        });
    }).then(() => {
        console.log("Done - The email validation step is done manually.");
        console.log("The response from the email validation will provide an account ID.");
    }, (err) => {
        console.log("err");
        console.log(err.toString());
    });
}

container = require("../lib/dependencies.js");
exampleLib = require("./example-lib");
hash = container.resolve("hash");
neodoc = require("neodoc");

main();
