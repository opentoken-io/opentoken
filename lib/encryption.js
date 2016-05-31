"use strict";

/**
 * Encryption/decryption library
 *
 * Encrypted Record:
 *     Version 0:
 *         00   : Version number of encryption record (0x00)
 *         01   : HMAC algorithm (code for the hash)
 *         02   : HMAC key digest (code for the hash)
 *         03-06: HMAC key iterations (UInt32LE)
 *         07   : Cipher algorithm (code for the cipher)
 *         08   : Cipher key digest (code for the hash)
 *         09-12: Cipher key iterations (UInt32LE)
 *         13-16: Data length (UInt32LE)
 *         vari : HMAC hash (binary), length determined by hash algorithm
 *         vari : IV (binary), length determine by cipher algorithm
 *         vari : Data (binary)
 */


/**
 * Configuration for the HMAC or encryption algorithm
 *
 * @typedef {Object} encryption~methodConfig
 * @property {string} algorithm Cipher algorithm or HMAC digest identifier
 * @property {string} digest Hashing digest for secure key generator
 * @property {number} iterations Number of iterations for secure key generator
 */


/**
 * Encryption related information
 *
 * @typedef {Object} encryption~parameters
 * @property {Object} cipher Settings for how the encryption works
 * @property {number} cipher.code For use in the encryption header
 * @property {number} cipher.ivBytes Necessary for salting the encryption
 * @property {string} cipher.name Used in calls to Node functions
 * @property {Object} cipherKey Used to generate the encryption key
 * @property {number} cipherKey.bytes Size of the buffer we should generate
 * @property {number} cipherKey.code For use in the encryption header
 * @property {number} cipherKey.iterations How many rounds to perform
 * @property {string} cipherKey.name Used in calls to Node functions
 * @property {Object} hmac Settings for the secure hash function
 * @property {number} hmac.code For use in the encryption header
 * @property {string} hmac.name Used in calls to Node functions
 * @property {Object} hmacKey Used to generate the HMAC key
 * @property {number} hmacKey.bytes Size of the buffer we should generate
 * @property {number} hmacKey.code For use in the encryption header
 * @property {number} hmacKey.iterations How many rounds to perform
 * @property {string} hmacKey.name Used in calls to Node functions
 */


/**
 * Header information as loaded from an encrypted record
 *
 * @typedef {Object} encryption~header
 * @property {number} cipherAlgorithmCode
 * @property {number} cipherKeyDigest
 * @property {number} cipherKeyIterations
 * @property {number} encryptedDataLength
 * @property {number} headerLength
 * @property {number} hmacAlgorithmCode
 * @property {number} hmacKeyDigest
 * @property {number} hmacKeyIterations
 */


/**
 * Encryption module factory
 *
 * @param {Object} ciphersAndHashes
 * @param {Object} cryptoAsync
 * @param {Object} promise
 * @param {Object} random
 * @return {Object}
 */
module.exports = (ciphersAndHashes, cryptoAsync, promise, random) => {
    /**
     * Take in the objects from ciphersAndHashes and a couple numbers and
     * return an object with lots of values pulled out and placed in more
     * convenient places.
     *
     * @param {Object} hmac HMAC algorithm's object from ciphersAndHashes
     * @param {Object} hmacKey Hash algorithm to use for key generation
     * @param {number} hmacIterations Number for secure key generation
     * @param {Object} cipher Cipher algorithm object from ciphersAndHashes
     * @param {Object} cipherKey Hash algorithm for key generation
     * @param {number} cipherIterations Number for secure key generation
     * @return {encryption~parameters}
     */
    function buildParameters(hmac, hmacKey, hmacIterations, cipher, cipherKey, cipherIterations) {
        return {
            cipher: {
                code: cipher.code,
                ivBytes: cipher.ivBytes,
                name: cipher.name
            },
            cipherKey: {
                // Note: not cipherKey.keyBytes!
                bytes: cipher.keyBytes,
                code: cipherKey.code,
                iterations: Math.min(cipherIterations, 1000),
                name: cipherKey.name
            },
            hmac: {
                code: hmac.code,
                hmacBytes: hmac.hashLength,
                name: hmac.name
            },
            hmacKey: {
                // Arbitrary number of bytes
                bytes: 32,
                code: hmacKey.code,
                iterations: Math.min(hmacIterations, 1000),
                name: hmacKey.name
            }
        };
    }


    /**
     * Reads a header and generates the parameters from the data
     *
     * @param {Buffer} data
     * @return {Promise.<encryption~header>}
     */
    function readHeaderAsync(data) {
        return promise.try(() => {
            if (data[0] !== 0) {
                throw new Error("Invalid header version");
            }

            // Version 0 = 17 byte header
            return {
                headerLength: 17,
                hmacAlgorithmCode: data[1],
                hmacKeyDigest: data[2],
                hmacKeyIterations: data.readUInt32LE(3),
                cipherAlgorithmCode: data[7],
                cipherKeyDigest: data[8],
                cipherKeyIterations: data.readUInt32LE(9),
                encryptedDataLength: data.readUInt32LE(13)
            };
        });
    }


    /**
     * Gets a parameters object from the fields in a header.
     *
     * @param {encryption~header} header
     * @return {encryption~parameters}
     */
    function parametersFromHeader(header) {
        var cipher, cipherKey, hmac, hmacKey;

        /**
         * Looks up a cipher or hmac by name.  When it does not exist,
         * this throws an exception.
         *
         * @param {number} code
         * @param {Object} obj
         * @param {string} humanReadable What we're seeking
         * @return {*} obj[name]
         * @throws {Error} when [name] does not exist on object
         */
        function lookup(code, obj, humanReadable) {
            if (!obj[code]) {
                throw new Error(`Invalid ${humanReadable} code: ${code}`);
            }

            return obj[code];
        }

        // Lookup algorithm definitions
        hmac = lookup(header.hmacAlgorithmCode, ciphersAndHashes.hashesByCode, "HMAC Algorithm");
        hmacKey = lookup(header.hmacKeyDigest, ciphersAndHashes.hashesByCode, "HMAC Key Digest");
        cipher = lookup(header.cipherAlgorithmCode, ciphersAndHashes.ciphersByCode, "Cipher Algorithm");
        cipherKey = lookup(header.cipherKeyDigest, ciphersAndHashes.hashesByCode, "Cipher Key Digest");

        return buildParameters(hmac, hmacKey, header.hmacKeyIterations, cipher, cipherKey, header.cipherKeyIterations);
    }


    /**
     * Decrypts data
     *
     * @param {(Buffer|string)} data
     * @param {(Buffer|string)} keySource
     * @return {Promise.<Buffer>}
     */
    function decryptAsync(data, keySource) {
        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        if (typeof keySource === "string") {
            keySource = new Buffer(keySource, "binary");
        }

        return readHeaderAsync(data).then((header) => {
            var parameters, posEncrypted, posEnd, posHmac, posIv;

            parameters = parametersFromHeader(header);

            // Assign position variables to the first byte of that spot
            posHmac = header.headerLength;
            posIv = posHmac + parameters.hmac.hmacBytes;
            posEncrypted = posIv + parameters.cipher.ivBytes;
            posEnd = posEncrypted + header.encryptedDataLength;

            return promise.props({
                cipherKey: cryptoAsync.pbkdf2Async(keySource, new Buffer(0), parameters.cipherKey.iterations, parameters.cipherKey.bytes, parameters.cipherKey.name),
                hmacKey: cryptoAsync.pbkdf2Async(keySource, new Buffer(0), parameters.hmacKey.iterations, parameters.hmacKey.bytes, parameters.hmacKey.name)
            }).then((bits) => {
                var decipher, encrypted, hmac, hmacDigest, hmacExpected, iv;

                // Extract the embedded record fields
                hmacExpected = data.slice(posHmac, posIv);
                iv = data.slice(posIv, posEncrypted);
                encrypted = data.slice(posEncrypted, posEnd);

                // Create a new HMAC object
                hmac = cryptoAsync.createHmac(parameters.hmac.name, bits.hmacKey);

                // Add the record header, iv and the encrypted message
                hmac.update(data.slice(0, posHmac));
                hmac.update(iv);
                hmac.update(encrypted);
                hmacDigest = hmac.digest();

                // Double check - NOTE: the result of 0 means they are the same
                if (Buffer.compare(hmacExpected, hmacDigest)) {
                    throw new Error("HMAC invalid");
                }

                decipher = cryptoAsync.createDecipheriv(parameters.cipher.name, bits.cipherKey, iv);

                return Buffer.concat([
                    decipher.update(encrypted),
                    decipher.final()
                ]);
            });
        });
    }


    /**
     * Generate a buffer describing the encryption record.
     *
     * @param {encryption~parameters} parameters
     * @param {number} encryptedDataLength
     * @return {Buffer}
     */
    function encryptionHeader(parameters, encryptedDataLength) {
        var buff;

        buff = new Buffer(17);

        // Version
        buff[0] = 0;
        buff[1] = parameters.hmac.code;
        buff[2] = parameters.hmacKey.code;
        buff.writeUInt32LE(parameters.hmacKey.iterations, 3);
        buff[7] = parameters.cipher.code;
        buff[8] = parameters.cipherKey.code;
        buff.writeUInt32LE(parameters.cipherKey.iterations, 9);
        buff.writeUInt32LE(encryptedDataLength, 13);

        return buff;
    }


    /**
     * Looks up encryption-related objects.  This creates an object with
     * all of the necessary settings to generate headers and perform the
     * encryption / decryption.
     *
     * @param {encryption~methodConfig} hmacConfig
     * @param {encryption~methodConfig} cipherConfig
     * @return {Promise.<encryption~parameters>}
     */
    function parametersFromConfigAsync(hmacConfig, cipherConfig) {
        return promise.try(() => {
            var cipher, cipherKey, hmac, hmacKey;

            /**
             * Looks up a cipher or hmac by name.  When it does not exist,
             * this throws an exception.
             *
             * @param {string} name
             * @param {Object} obj
             * @param {string} humanReadable What we're seeking
             * @return {*} obj[name]
             * @throws Error when [name] does not exist on object
             */
            function lookup(name, obj, humanReadable) {
                if (!obj[name]) {
                    throw new Error(`Invalid ${humanReadable} name: ${name}`);
                }

                return obj[name];
            }

            // Lookup algorithm definitions
            hmac = lookup(hmacConfig.algorithm, ciphersAndHashes.hashes, "HMAC Algorithm");
            hmacKey = lookup(hmacConfig.digest, ciphersAndHashes.hashes, "HMAC Key Digest");
            cipher = lookup(cipherConfig.algorithm, ciphersAndHashes.ciphers, "Cipher Algorithm");
            cipherKey = lookup(cipherConfig.digest, ciphersAndHashes.hashes, "Cipher Key Digest");

            return buildParameters(hmac, hmacKey, hmacConfig.iterations, cipher, cipherKey, cipherConfig.iterations);
        });
    }


    /**
     * Builds a record that looks like this:
     *
     *   HEADER HMAC IV ENCRYPTED
     *
     * The HMAC validates a buffer that looks like this:
     *
     *   HEADER IV ENCRYPTED
     *
     * The header is first so we know the HMAC length, but we also want to
     * hash the header to make sure the header was not modified.  Because
     * of those conderns, it was decided to encode and process in the
     * above described method.
     *
     * Zero byte salts are used because there is nowhere to store the salt
     * safely that is separate from the keys that will be used for
     * encryption and decryption.  Also, the generated keys are randomly
     * generated, so we shouldn't need to worry about the strength here.
     * The key derivation algorithm is mostly used to generate a key of the
     * right length and to slow down attacks with the number of iterations.
     *
     * @param {(Buffer|string)} data
     * @param {(Buffer|string)} keySource
     * @param {encryption~methodConfig} hmacConfig
     * @param {encryption~methodConfig} cipherConfig
     * @return {Promise.<Buffer>}
     */
    function encryptAsync(data, keySource, hmacConfig, cipherConfig) {
        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        if (typeof keySource === "string") {
            keySource = new Buffer(keySource, "binary");
        }

        return parametersFromConfigAsync(hmacConfig, cipherConfig).then((parameters) => {
            return promise.props({
                cipherKey: cryptoAsync.pbkdf2Async(keySource, new Buffer(0), parameters.cipherKey.iterations, parameters.cipherKey.bytes, parameters.cipherKey.name),
                iv: random.bufferAsync(parameters.cipher.ivBytes),
                hmacKey: cryptoAsync.pbkdf2Async(keySource, new Buffer(0), parameters.hmacKey.iterations, parameters.hmacKey.bytes, parameters.hmacKey.name)
            }).then((bits) => {
                var bufferList, cipher, encryptedDataLength, hmac;

                // Encrypt and store into the buffer.  Also add IV to buffer.
                cipher = cryptoAsync.createCipheriv(parameters.cipher.name, bits.cipherKey, bits.iv);
                bufferList = [
                    // Header goes here
                    null,

                    // HMAC goes here
                    null,
                    bits.iv,
                    cipher.update(data),
                    cipher.final()
                ];

                // Attempt to destroy original data
                data.fill(0);
                encryptedDataLength = bufferList[3].length + bufferList[4].length;

                // The header can now be created
                bufferList[0] = encryptionHeader(parameters, encryptedDataLength);

                // Create the secure hash and insert it into the buffer list
                hmac = cryptoAsync.createHmac(parameters.hmac.name, bits.hmacKey);

                // Header
                hmac.update(bufferList[0]);

                // IV
                hmac.update(bufferList[2]);

                // Some/most encrypted data
                hmac.update(bufferList[3]);

                // Remaining encrypted data
                hmac.update(bufferList[4]);
                bufferList[1] = hmac.digest();

                return Buffer.concat(bufferList);
            });
        });
    }


    return {
        decryptAsync,
        encryptAsync
    };
};
