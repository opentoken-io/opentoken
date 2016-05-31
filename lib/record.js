"use strict";

/**
 * Lets you "freeze" and "thaw" arbitrary data structures into our double-
 * encrypted record format.
 *
 * 1.  Serialize the data to a buffer.
 * 2.  Compress the buffer.
 * 3.  Encrypt using the inner key.  This one should not be under our
 *     control when possible.
 * 4.  Serialize into a buffer again, preserving the expiration date.
 * 5.  Encrypt using the outer key, which is the key used by OpenToken.
 */

/**
 * @typedef {Object} record~options
 * @property {OtDate} expires Desired expiration date
 */

module.exports = (bufferSerializer, config, encryption, fsAsync, OtDate, promise, zlibAsync) => {
    var encryptionKeyBufferPromise;


    /**
     * Freeze data using the technique described above.
     *
     * @param {*} data
     * @param {(Buffer|string)} innerKey  Hashed by the encryption module
     * @param {record~options} options
     * @return {Promise.<Buffer>}
     */
    function freezeAsync(data, innerKey, options) {
        var dataBuffer, expires;

        options = options || {};
        expires = OtDate.now().plus(config.record.expirationMaximum);

        if (options.expires && options.expires.isBefore(expires)) {
            expires = options.expires;
        }

        dataBuffer = bufferSerializer.toBuffer(data);

        return zlibAsync.deflateRawAsync(dataBuffer).then((deflated) => {
            return promise.props({
                encryptedOnce: encryption.encryptAsync(deflated, innerKey, config.encryption.secondary.hmac, config.encryption.secondary.cipher),
                outerKey: encryptionKeyBufferPromise
            });
        }).then((bits) => {
            var buffer;

            buffer = bufferSerializer.toBuffer({
                data: bits.encryptedOnce,
                expires
            });

            return encryption.encryptAsync(buffer, bits.outerKey, config.encryption.primary.hmac, config.encryption.primary.cipher);
        });
    }


    /**
     * Returns a frozen record to the raw data.  This will not thaw data
     * that has been expired.
     *
     * @param {Buffer} data
     * @param {(Buffer|string)} innerKey
     * @return {Promise.<*>} Original data
     * @throws {Error} if expired
     */
    function thawAsync(data, innerKey) {
        return encryptionKeyBufferPromise.then((outerKey) => {
            return encryption.decryptAsync(data, outerKey);
        }).then((serialized) => {
            var deserialized;

            deserialized = bufferSerializer.fromBuffer(serialized);

            if (deserialized.expires && deserialized.expires.isBefore(OtDate.now())) {
                throw new Error("Expired");
            }

            return encryption.decryptAsync(deserialized.data, innerKey);
        }).then((compressed) => {
            return zlibAsync.inflateRawAsync(compressed);
        }).then((serialized) => {
            return bufferSerializer.fromBuffer(serialized);
        });
    }

    // Move this to an async config validation module
    encryptionKeyBufferPromise = fsAsync.readFileAsync(config.record.encryptionKeyFile, "binary");

    return {
        freezeAsync,
        thawAsync
    };
};
