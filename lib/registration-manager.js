"use strict";

/**
 * Manages the business logic for registration of a new account.
 *
 * The process the client follows:
 *
 * 1. Collect data for createRequest, then send it to this module's "register"
 * function.  This generates the registration record and sends the client the
 * necessary information so they can generate a password hash and MFA codes.
 * This registration record will only exist for a very limited amount of time.
 *
 * 2. The client generates the necessary information to secure the account and
 * sends it to the "secure" function.  This simply will send a URL via an email
 * message.  The registration record could still expire soon.  The MFA codes
 * are validated at this point.  Failure to validate will not send an email nor
 * will it accept the password hash.
 *
 * 3. The user retrieves the email, clicks the link and the registration is
 * converted into an account.  The confirmation code is sent to the
 * "confirmEmail" function.  A new account is generated, whose ID is unreleated
 * to the registration ID.
 */

/**
 * Creation of a registration record.
 *
 * @typedef {Object} registrationManager~registerRequest
 * @property {string} email
 * @see {@link ../../schema/registration/register-request.json}
 */

/**
 * Necessary information for securing the account.  This is returned
 * in order to perform step 2 of registration.  It is a filtered version
 * of the registration record.
 *
 * @typedef {Object} registrationManager~recordResponse
 * @property {string} id
 * @property {Object} record.mfa
 * @property {Object} record.mfa.totp
 * @property {string} record.mfa.totp.key Base-32 encoded secret
 * @property {accountManager~passwordHashConfig} record.passwordHash
 * @property {Object} record
 */

/**
 * What the user sends us to secure the registration.  When this is sent in,
 * the registration record is deleted and the account record is created.
 *
 * @typedef {Object} registrationManager~secureRequest
 * @property {string} passwordHash
 * @property {Object} mfa
 * @property {Object} mfa.totp
 * @property {string} mfa.totp.current
 * @property {string} mfa.totp.previous
 * @see {@link ../../schema/registration/secure-request.json}
 */

/**
 * The returned information from confirming the email address.  This is
 * everything needed to hash the password and generate MFA codes.
 *
 * @typedef {Object} registrationManager~confirmEmailResponse
 * @property {accountManager~passwordHashConfig} passwordHash
 * @property {Object} mfa
 * @property {Object} mfa.totp
 * @property {string} mfa.totp.key Base-32 encoded secret
 */

/**
 * A registration record that's stored in OpenToken.  It's different from
 * registrationManager~recordResponse because this one is unfiltered.
 *
 * @typedef {Object} registrationManager~record
 * @property {string} confirmationCode
 * @property {string} email Email address for account verification.
 * @property {string} passwordHash
 * @property {accountManager~passwordHashConfig} passwordHashConfig
 * @property {Object} mfa
 * @property {Object} mfa.totp
 * @property {boolean} mfa.totp.confirmed If true, this was confirmed
 * @property {string} mfa.totp.key Buffer, raw binary TOTP key
 */

module.exports = (accountManager, config, email, encoding, promise, random, storageServiceFactory, totp) => {
    var confirmationCodeLength, idLength, storageService;


    /**
     * Verifies that a registration ID is not empty.
     *
     * @param {string} registrationId
     * @return {Promise.<*>}
     */
    function checkRegistrationIdAsync(registrationId) {
        if (registrationId) {
            return promise.resolve();
        }

        return promise.reject(new Error("Registration ID must not be empty"));
    }


    /**
     * Returns the information necessary for securing the account (step 2 of
     * registration).
     *
     * @param {string} registrationId
     * @param {Object} record
     * @return {registrationManager~recordResponse}
     */
    function recordResponse(registrationId, record) {
        var response;

        response = {
            id: registrationId,
            record: {
                passwordHashConfig: record.passwordHashConfig
            }
        };

        if (!record.mfa.totp.confirmed) {
            response.record.mfa = {
                totp: {
                    keyBase32: encoding.encode(record.mfa.totp.key, "base32-uri"),
                    keyHex: encoding.encode(record.mfa.totp.key, "hex"),
                    keyUri: totp.generateUrl(record.mfa.totp.key, record.email)
                }
            };
        }

        return response;
    }


    /**
     * Confirm the email address.  It compares the confirmation code.  If it
     * matches, the account is created, otherwise an error is thrown.
     *
     * @param {string} registrationId
     * @param {string} confirmationCode
     * @return {Promise.<string>} accountId
     */
    function confirmEmailAsync(registrationId, confirmationCode) {
        return checkRegistrationIdAsync(registrationId).then(() => {
            if (!confirmationCode) {
                throw new Error("Confirmation code must not be empty");
            }

            return storageService.getAsync(registrationId);
        }).then((record) => {
            if (!record.passwordHash || !record.mfa.totp.confirmed) {
                throw new Error("Registration not secured");
            }

            if (record.confirmationCode !== confirmationCode) {
                throw new Error("Confirmation code does not match");
            }

            // Convert the record
            return accountManager.createAsync({
                email: record.email,
                mfa: {
                    totp: record.mfa.totp
                },
                passwordHash: record.passwordHash,
                passwordHashConfig: record.passwordHashConfig
            });
        }).then((accountId) => {
            return storageService.deleteAsync(registrationId).then(() => {
                return accountId;
            });
        });
    }


    /**
     * Return a Buffer that's the contents of a QR Code image in PNG format.
     *
     * @param {string} registrationId
     * @return {Promise.<Buffer>}
     */
    function qrCodeImageAsync(registrationId) {
        return checkRegistrationIdAsync(registrationId).then(() => {
            return storageService.getAsync(registrationId);
        }).then((record) => {
            if (record.mfa.totp.confirmed) {
                throw new Error("Already confirmed");
            }

            return totp.generateQrCodeAsync(record.mfa.totp.key, record.email);
        });
    }


    /**
     * Begin a registration.
     *
     * @param {registrationManager~registerRequest} request
     * @return {Promise.<registrationManager~recordResponse>} registration ID and info
     */
    function registerAsync(request) {
        return promise.props({
            confirmationCode: random.idAsync(confirmationCodeLength),
            passwordHashConfig: accountManager.passwordHashConfigAsync(),
            registrationId: random.idAsync(idLength),
            totpKey: totp.generateSecretAsync()
        }).then((bits) => {
            // Build a lot of the registration record
            // @see {registrationManager~record}
            var record;

            if (!request.email) {
                throw new Error("Email is required");
            }

            record = {
                confirmationCode: bits.confirmationCode,
                email: request.email,
                mfa: {
                    totp: {
                        confirmed: false,
                        key: bits.totpKey
                    }
                },
                passwordHashConfig: bits.passwordHashConfig
            };

            return storageService.putAsync(bits.registrationId, record).then(() => {
                return recordResponse(bits.registrationId, record);
            });
        });
    }


    /**
     * Secure the registration with MFA and password.
     *
     * Note:  the request object must have some properties defined otherwise
     * this code will fail.
     *
     * @param {string} registrationId
     * @param {secureRequest} request
     * @param {restify} server
     * @return {Promise.<*>}
     */
    function secureAsync(registrationId, request, server) {
        return checkRegistrationIdAsync(registrationId).then(() => {
            // Even if `request` is not an object, this will properly reject
            // the promise because of the error being thrown when we attempt
            // to access properties on a non-object.
            if (!request.mfa.totp.current || !request.mfa.totp.previous) {
                throw new Error("MFA current and previous are both required.");
            }

            if (!request.passwordHash) {
                throw new Error("Password hash is required.");
            }

            return storageService.getAsync(registrationId);
        }).then((record) => {
            if (!totp.verifyCurrentAndPrevious(record.mfa.totp.key, request.mfa.totp.current, request.mfa.totp.previous)) {
                // This returns 500 instead of saying it is a bad request.
                // It also logs a ton (stack and all)
                // https://github.com/opentoken-io/opentoken/issues/96
                throw new Error("TOTP validation failed");
            }

            record.passwordHash = request.passwordHash;
            record.mfa.totp.confirmed = true;

            return storageService.putAsync(registrationId, record).then(() => {
                email.sendTemplate(record.email, "registration", {
                    // URL is not fully qualified - template needs more info
                    // https://github.com/opentoken-io/opentoken/issues/96
                    confirmUrl: server.router.render("registration-confirm", {
                        code: record.confirmationCode,
                        id: registrationId
                    })
                });

                return recordResponse(registrationId, record);
            });
        });
    }


    /**
     * Retrieve the secure info data
     *
     * @param {string} registrationId
     * @return {Promise.<accountManager~recordResponse>}
     */
    function getRecordAsync(registrationId) {
        return checkRegistrationIdAsync(registrationId).then(() => {
            return storageService.getAsync(registrationId);
        }).then((record) => {
            return recordResponse(registrationId, record);
        });
    }


    confirmationCodeLength = config.registration.confirmationCodeLength;
    idLength = config.registration.idLength;
    storageService = storageServiceFactory(config.registration.idHash, config.registration.lifetime, config.registration.storagePrefix);

    return {
        confirmEmailAsync,
        getRecordAsync,
        qrCodeImageAsync,
        registerAsync,
        secureAsync
    };
};
