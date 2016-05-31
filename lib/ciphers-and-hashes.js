/**
 * Listing of ciphers and hashes.  This maps codes to names and vice versa.
 *
 * Never delete anything from this file.  Only append new codes, otherwise
 * secrets that are locked away may not ever work again.
 */
"use strict";

var ciphers, hashes;

/**
 * Ciphers can be known by several names in OpenSSL.  The duplicates are not
 * listed here.  Also, ciphers that do not work for us are not listed, though
 * there are comments about them.
 *
 * The cipher selection affects encrypting and decrypting information.
 *
 * You can find out about the duplicated ciphers and what they map to if you
 * run `openssl list-cipher-algorithms`.  More information about the minimum
 * and maximum IV and key size can be found by running `debug/cipher-info.js`.
 *
 * Ciphers that do not support IVs are dropped.
 *
 * Ensure this list matches the encryption-method schema.
 */
ciphers = {
    "aes-128-cbc": {
        code: 0,
        ivBytes: 16,
        keyBytes: 16
    },
    "aes-128-cfb": {
        code: 1,
        ivBytes: 16,
        keyBytes: 16
    },
    "aes-128-cfb1": {
        code: 2,
        ivBytes: 16,
        keyBytes: 16
    },
    "aes-128-cfb8": {
        code: 3,
        ivBytes: 16,
        keyBytes: 16
    },
    "aes-128-ctr": {
        code: 4,
        ivBytes: 16,
        keyBytes: 16
    },
    "aes-128-ecb": {
        code: 5,
        ivBytes: 0,
        keyBytes: 16
    },
    "aes-128-xts": {
        code: 6,
        ivBytes: 16,
        keyBytes: 32
    },
    "aes-192-cbc": {
        code: 7,
        ivBytes: 16,
        keyBytes: 24
    },
    "aes-192-cfb": {
        code: 8,
        ivBytes: 16,
        keyBytes: 24
    },
    "aes-192-cfb1": {
        code: 9,
        ivBytes: 16,
        keyBytes: 24
    },
    "aes-192-cfb8": {
        code: 10,
        ivBytes: 16,
        keyBytes: 24
    },
    "aes-192-ctr": {
        code: 11,
        ivBytes: 16,
        keyBytes: 24
    },
    "aes-192-ofb": {
        code: 12,
        ivBytes: 16,
        keyBytes: 24
    },
    "aes-256-cbc": {
        code: 13,
        ivBytes: 16,
        keyBytes: 32
    },
    "aes-256-cfb": {
        code: 14,
        ivBytes: 16,
        keyBytes: 32
    },
    "aes-256-cfb1": {
        code: 15,
        ivBytes: 16,
        keyBytes: 32
    },
    "aes-256-cfb8": {
        code: 16,
        ivBytes: 16,
        keyBytes: 32
    },
    "aes-256-ctr": {
        code: 17,
        ivBytes: 16,
        keyBytes: 32
    },
    "aes-256-ofb": {
        code: 18,
        ivBytes: 16,
        keyBytes: 32
    },
    "aes-256-xts": {
        code: 19,
        ivBytes: 16,
        keyBytes: 64
    },
    "bf-cbc": {
        code: 20,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "bf-cfb": {
        code: 21,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "bf-ofb": {
        code: 22,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "camellia-128-cbc": {
        code: 23,
        ivBytes: 16,
        keyBytes: 16
    },
    "camellia-128-cfb": {
        code: 24,
        ivBytes: 16,
        keyBytes: 16
    },
    "camellia-128-cfb1": {
        code: 25,
        ivBytes: 16,
        keyBytes: 16
    },
    "camellia-128-cfb8": {
        code: 26,
        ivBytes: 16,
        keyBytes: 16
    },
    "camellia-128-ofb": {
        code: 27,
        ivBytes: 16,
        keyBytes: 16
    },
    "camellia-192-cbc": {
        code: 28,
        ivBytes: 16,
        keyBytes: 24
    },
    "camellia-192-cfb": {
        code: 29,
        ivBytes: 16,
        keyBytes: 24
    },
    "camellia-192-cfb1": {
        code: 30,
        ivBytes: 16,
        keyBytes: 24
    },
    "camellia-192-cfb8": {
        code: 31,
        ivBytes: 16,
        keyBytes: 24
    },
    "camellia-192-ofb": {
        code: 32,
        ivBytes: 16,
        keyBytes: 24
    },
    "camellia-256-cbc": {
        code: 33,
        ivBytes: 16,
        keyBytes: 32
    },
    "camellia-256-cfb": {
        code: 34,
        ivBytes: 16,
        keyBytes: 32
    },
    "camellia-256-cfb1": {
        code: 35,
        ivBytes: 16,
        keyBytes: 32
    },
    "camellia-256-cfb8": {
        code: 36,
        ivBytes: 16,
        keyBytes: 32
    },
    "camellia-256-ofb": {
        code: 37,
        ivBytes: 16,
        keyBytes: 32
    },
    "cast5-cbc": {
        code: 38,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "cast5-cfb": {
        code: 39,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "cast5-ofb": {
        code: 40,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "des-cbc": {
        code: 41,
        ivBytes: 8,
        keyBytes: 8
    },
    "des-cfb": {
        code: 42,
        ivBytes: 8,
        keyBytes: 8
    },
    "des-cfb1": {
        code: 43,
        ivBytes: 8,
        keyBytes: 8
    },
    "des-cfb8": {
        code: 44,
        ivBytes: 8,
        keyBytes: 8
    },
    "des-ede-cbc": {
        code: 45,
        ivBytes: 8,
        keyBytes: 16
    },
    "des-ede-cfb": {
        code: 46,
        ivBytes: 8,
        keyBytes: 16
    },
    "des-ede-ofb": {
        code: 47,
        ivBytes: 8,
        keyBytes: 16
    },
    "des-ede3-cbc": {
        code: 48,
        ivBytes: 8,
        keyBytes: 24
    },
    "des-ede3-cfb": {
        code: 49,
        ivBytes: 8,
        keyBytes: 24
    },
    "des-ede3-cfb1": {
        code: 50,
        ivBytes: 8,
        keyBytes: 24
    },
    "des-ede3-cfb8": {
        code: 51,
        ivBytes: 8,
        keyBytes: 24
    },
    "des-ede3-ofb": {
        code: 52,
        ivBytes: 8,
        keyBytes: 24
    },
    "des-ofb": {
        code: 53,
        ivBytes: 8,
        keyBytes: 8
    },
    "desx-cbc": {
        code: 54,
        ivBytes: 8,
        keyBytes: 24
    },
    "idea-cbc": {
        code: 55,
        ivBytes: 8,
        keyBytes: 16
    },
    "idea-cfb": {
        code: 56,
        ivBytes: 8,
        keyBytes: 16
    },
    "idea-ofb": {
        code: 57,
        ivBytes: 8,
        keyBytes: 16
    },
    "rc2-40-cbc": {
        code: 58,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "rc2-64-cbc": {
        code: 59,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "rc2-cbc": {
        code: 60,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "rc2-cfb": {
        code: 61,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "rc2-ofb": {
        code: 62,
        ivBytes: 8,
        keyBytes: 128
        // keyBytes is an arbitrary number, anything greater than 0 works
    },
    "seed-cbc": {
        code: 63,
        ivBytes: 16,
        keyBytes: 16
    },
    "seed-cfb": {
        code: 64,
        ivBytes: 16,
        keyBytes: 16
    },
    "seed-ofb": {
        code: 65,
        ivBytes: 16,
        keyBytes: 16
    }
};


/**
 * Hashes can go by several names.  The duplicate names are not
 * represented in this list intentionally.
 *
 * Hashes are used for HMAC and pbkdf2 functions.
 *
 * You can see more about the duplicated hashes by running
 * `openssl list-message-digest-algorithms` and even more information can be
 * learned from `debug/test-hmac.js`, `debug/test-pbkdf2.js` and other
 * programs in there.
 *
 * Ensure this list matches the hash-method schema.
 */
hashes = {
    md4: {
        code: 0,
        hashLength: 16
    },
    md5: {
        code: 1,
        hashLength: 16
    },
    mdc2: {
        code: 2,
        hashLength: 16
    },
    ripemd: {
        code: 3,
        hashLength: 20
    },
    sha: {
        code: 4,
        hashLength: 20
    },
    sha1: {
        code: 5,
        hashLength: 20
    },
    sha224: {
        code: 6,
        hashLength: 28
    },
    sha256: {
        code: 7,
        hashLength: 32
    },
    sha384: {
        code: 8,
        hashLength: 48
    },
    sha512: {
        code: 9,
        hashLength: 64
    },
    whirlpool: {
        code: 10,
        hashLength: 64
    }
};


/**
 * Flip the codes and names around so we can instantly know the algorithm
 * when decrypting.
 *
 * Scan through an object.  Copy the object's property name to the value,
 * something like this:
 *     source[name].name = name
 *
 * Next, copy the value to a second object that will be indexed by the
 * value's code.
 *     dest[source[name].code] = source[name]
 *
 * @param {Object.<Object>} source
 * @return {Object.<Object>}
 */
function assignNameAndIndexByCode(source) {
    var dest;

    dest = {};
    Object.keys(source).forEach((name) => {
        var valueObject;

        valueObject = source[name];

        // Assign the "name" property from the object's property name
        valueObject.name = name;

        // Copy the valueObject to the destination's "code" property.
        dest[valueObject.code] = valueObject;
    });

    return dest;
}


module.exports = () => {
    return {
        ciphers,
        ciphersByCode: assignNameAndIndexByCode(ciphers),
        hashes,
        hashesByCode: assignNameAndIndexByCode(hashes)
    };
};
