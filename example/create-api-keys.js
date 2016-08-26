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
Example script to create a set of API keys for OpenToken.

Usage:

    create-api-keys [OPTIONS]

Options:

    --account=ID        Specifies the OpenToken account ID.  This overrides
                        the use of the OPENTOKEN_ACCOUNT environment variable.
    --api=URL           Specify the API URL.  This would override the use of
                        OPENTOKEN_API environment variable.
    --description=DESC  Set the email address for the account.
    --help, -h          Show this help message.
    --mfa=KEY           Assigns the Base32 encoded MFA key.  Using this as
                        a command-line argument is insecure.  You should prefer
                        the OPENTOKEN_MFA environment variable when possible.
    --password=PW       Use the given password.  Putting this on the command
                        line is not very secure.  You can also use
                        OPENTOKEN_PASSWORD environment variable.
`;
}


/**
 * The main program.
 */
function main() {
    var args, config, description;

    args = neodoc.run(usageHelp());
    config = exampleLib.config(args);

    if (args["--help"]) {
        console.log(usageHelp().trim());

        return;
    }

    if (args["--description"]) {
        description = args["--description"];
    } else {
        description = "";
    }

    if (!config.password || !config.api || !config.mfa || !config.account) {
        console.log("You are missing a required setting.  This needs");
        console.log(" * API URL");
        console.log(" * Account ID");
        console.log(" * Account password");
        console.log(" * MFA key (the TOTP seed, base32 encoded)");
        console.log("See --help.");

        return;
    }

    console.log("Requesting self-discovery endpoint");
    exampleLib.requestAsync("GET", config.api).then((res) => {
        var loginLink, loginRequest;

        loginLink = res.link.service.account_login;
        loginRequest = {
            accountId: config.account
        };
        console.log("Asking for login details for the account");

        return exampleLib.getLinkAsync(loginLink, loginRequest);
    }).then((res) => {
        return hash.deriveAsync(config.password, res.body.passwordHashConfig).then((passwordHash) => {
            return hash.hash(passwordHash, res.body.challengeHashConfig);
        }).then((challengeHash) => {
            return {
                challengeHash,
                mfa: {
                    totp: exampleLib.totpCode(config.mfa)
                }
            };
        }).then((loginRequest) => {
            console.log("Submitting the login request");

            return exampleLib.postLinkAsync(res.link.service.account_login, loginRequest);
        });
    }).then((res) => {
        console.log("Following link to the account resource");

        return exampleLib.getLinkAsync(res.link.up.account);
    }).then((res) => {
        var accessCodeRequest;

        accessCodeRequest = {
            description
        };
        console.log("Requesting set of API keys");

        return exampleLib.postLinkAsync(res.link.service.account_accessCode, accessCodeRequest);
    }).then((res) => {
        console.log(`OPENTOKEN_CODE=${res.body.code}`);
        console.log(`OPENTOKEN_SECRET=${res.body.secret}`);
        console.log("Expires:", res.body.expires);
        console.log("Done");
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
