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
 * @prop {string} email
 * @see {@link ../../schema/registration/register-request.json}
 */

/**
 * Necessary information for securing the account.  This is returned
 * in order to perform step 2 of registration.
 *
 * @typedef {Object} registrationManager~secureInfoResponse
 * @prop {string} id
 * @prop {Object} secureInfo
 * @prop {accountManager~passwordHashConfig} secureInfo.passwordHash
 * @prop {Object} secureInfo.totp
 * @prop {string} secureInfo.totp.key Base-32 encoded secret
 */

/**
 * What the user sends us to secure the registration.  When this is sent in,
 * the registration record is deleted and the account record is created.
 *
 * @typedef {Object} registrationManager~secureRequest
 * @prop {string} passwordHash
 * @prop {Object} totp
 * @prop {string} totp.current
 * @prop {string} totp.previous
 * @see {@link ../../schema/registration/secure-request.json}
 */

/**
 * The returned information from confirming the email address.  This is
 * everything needed to hash the password and generate MFA codes.
 *
 * @typedef {Object} registrationManager~confirmEmailResponse
 * @prop {accountManager~passwordHashConfig} passwordHash
 * @prop {Object} totp
 * @prop {string} totp.key Base-32 encoded secret
 */

/**
 * A registration record that's stored in OpenToken.
 *
 * @typedef {Object} registrationManager~record
 * @prop {string} confirmationCode
 * @prop {string} email Email address for account verification.
 * @prop {string} passwordHash
 * @prop {accountManager~passwordHashConfig} passwordHashConfig
 * @prop {Object} totp
 * @prop {string} totp.key Base32 encoded TOTP key
 */

module.exports = (accountManager, config, email, promise, random, registrationService, schema, totp) => {
    var confirmationCodeLength, idLength;


    /**
     * Returns the information necessary for securing the account (step 2 of
     * registration).
     *
     * @param {string} registrationId
     * @param {Object} record
     * @return {registrationManager~secureInfoResponse}
     */
    function secureInfo(registrationId, record) {
        return {
            id: registrationId,
            secureInfo: {
                passwordHash: record.passwordHash,
                totp: record.totp
            }
        };
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
        return registrationService.getAsync(registrationId).then((record) => {
            if (record.confirmationCode !== confirmationCode) {
                throw new Error("Confirmation code does not match");
            }

            return accountManager.create(record);
        }).then((accountId) => {
            return registrationService.delAsync(registrationId).then(() => {
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
        return registrationService.getAsync(registrationId).then((record) => {
            return totp.generateQrCodeAsync(record.totp.key, record.email);
        });
    }


    /**
     * Begin a registration.
     *
     * @param {registrationManager~registerRequest} request
     * @return {Promise.<registrationManager~secureInfoResponse>} registration ID and info
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

            record = {
                confirmationCode: bits.confirmationCode,
                email: request.email,
                passwordHashConfig: bits.passwordHashConfig,
                totp: {
                    key: bits.totpKey
                }
            };

            return registrationService.putAsync(bits.registrationId, record).then(() => {
                return secureInfo(bits.registrationId, record);
            });
        });
    }


    /**
     * Secure the registration with MFA and password.
     *
     * @param {string} registrationId
     * @param {secureRequest} request
     * @param {restify} server
     * @return {Promise.<accountManager~accountIdInformation>}
     */
    function secureAsync(registrationId, request, server) {
        return registrationService.getAsync(registrationId).then((record) => {
            if (!totp.verifyCurrentAndPrevious(record.totpKey, request.totp.current, request.totp.previous)) {
                throw new Error("TOTP validation failed");
            }

            record.passwordHash = request.passwordHash;

            return registrationService.putAsync(registrationId, record).then(() => {
                email.sendTemplate(record.email, "registration", {
                    confirmUrl: server.router.render("registration-confirm", {
                        code: record.confirmationCode,
                        id: registrationId
                    })
                });
            });
        });
    }


    /**
     * Retrieve the secure info data
     *
     * @param {string} registrationId
     * @return {Promise.<accountManager~secureInfoResponse>}
     */
    function secureInfoAsync(registrationId) {
        return registrationService.getAsync(registrationId).then((record) => {
            return secureInfo(registrationId, record);
        });
    }


    confirmationCodeLength = config.registration.confirmationCodeLength;
    idLength = config.registration.idLength;

    return {
        confirmEmailAsync,
        qrCodeImageAsync,
        registerAsync,
        secureAsync,
        secureInfoAsync
    };
};
