"use strict";

/**
 * Serialize data into a record format that can be extended with various
 * attributes.
 *
 * Serialized:
 *     Version 0 (chunk encoding, no expiration):
 *         Version [Chunk [...]]
 *         Version = 0x00
 *         Chunks:  TypeChar Length Data
 *             Compressed Data (c): raw deflate binary data
 *     Version 1 (chunk encoding, with expiration):
 *         Version Expires [Chunk [...]]
 *         Version = 0x00
 *         Expires = 4 bytes, Unix timestamp of expiration date
 *         Chunks:  TypeChar Length Data
 *             Compressed Data (c): raw deflate binary data
 *
 * Lengths are encoded as 32 bit little endian unsigned integers.
 */


/**
 * Configuration options for serialization of data.
 *
 * @typedef {Object} serializer~options
 * @property {Date} expires Expiration date, used in serialize()
 */


module.exports = function (promise, zlib) {
    /**
     * Changes a serialized record back into the original data.  If the
     * data is expired, the data will NOT be returned.
     *
     * @param {(Buffer|string)} data Serialized data
     * @return {Promise.<Buffer>} decrypted contents, binary
     */
    function deserialize(record) {
        var chunk, dataCompressed, expiresDate, offset;

        if (typeof record === "string") {
            record = new Buffer(record, "binary");
        }

        try {
            if (record[0] != 0x00) {
                throw new Error("Invalid encrypted version identifier");
            }

            offset = 1;
            dataCompressed = null;
            expiresDate = null

            while (offset < record.length) {
                chunk = parseChunk(record, offset);

                switch (chunk.type) {
                case "c":
                    dataCompressed = chunk.data;
                    break;

                case "e":
                    expiresDate = new Date(chunk.data.toString());
                    break;

                default:
                    throw new Error("Invalid chunk at offset " + offset);
                }

                offset = chunk.offset;
            }

            if (expiresDate && expiresDate < new Date()) {
                throw new Error("Expired");
            }

            if (!dataCompressed) {
                throw new Error("No compressed data in encrypted record");
            }

            // Free memory
            record = null;

            return zlib.inflateRawAsync(dataCompressed);
        } catch (e) {
            return promise.reject(e);
        }
    }


    /**
     * Creates a Buffer chunk encoded version of some data
     *
     * @param {Array.<Buffer>} dest Where more buffers are placed
     * @param {string} typeChar A single character
     * @param {(Buffer|string)} data Buffer to encode, less than 4 GB long
     */
    function makeChunk(dest, typeChar, data) {
        var header;

        header = new Buffer(5);
        header[0] = typeChar.charCodeAt(0);
        header.writeUInt32LE(data.length, 1);
        dest.push(header);

        if (typeof data === "string") {
            dest.push(new Buffer(data, "binary"));
        } else if (data instanceof Buffer) {
            dest.push(data);
        }
    }


    /**
     * Given a buffer and a starting offset, attempt to pull off a chunk.
     *
     * This validates that the length matches.
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @return {Encryption~chunk}
     */
    function parseChunk(buffer, offset) {
        var data, len, type;

        type = String.fromCharCode(buffer[offset]);
        offset += 1;
        len = buffer.readUInt32LE(offset);
        offset += 4;
        data = buffer.slice(offset, offset + len);

        if (data.length !== len) {
            throw new Error("Corrupt " + type + " record, offset " + offset);
        }

        offset += len;

        return {
            type: type,
            data: data,
            offset: offset
        };
    }


    /**
     * Serialize data into a chunked record.
     *
     * @param {(Buffer|string)} data
     * @param {serializer~options} options
     * @return {Promise.<Buffer>} compressed, chunked contents, binary
     */
    function serialize(data, options) {
        var serializedBuffers;

        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        // First version of serialized data
        serializedBuffers = [
            new Buffer("\x00", "binary")
        ];

        // If there is an expiration date
        if (options && options.expires) {
            makeChunk(serializedBuffers, "e", options.expires.toISOString());
        }

        return zlib.deflateRawAsync(data).then((compressed) => {
            makeChunk(serializedBuffers, "c", compressed);

            return Buffer.concat(serializedBuffers);
        });
    }

    // Wrap zlib in the promises
    zlib = promise.promisifyAll(zlib);

    return {
        deserialize: deserialize,
        serialize: serialize
    };
}
