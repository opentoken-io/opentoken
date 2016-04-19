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
 *         Version = 0x01
 *         Expires = 4 bytes, Unix timestamp of expiration date UInt32LE
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


/**
 * Factory for the serialization object
 *
 * @param {Object} promise
 * @param {Object} zlib
 * @return {Object} serialization object
 */
module.exports = function (promise, zlib) {
    /**
     * Changes a serialized record back into the original data.  If the
     * data is expired, the data will NOT be returned.
     *
     * @param {(Buffer|string)} data Serialized data
     * @return {Promise.<Buffer>} Deserialized contents, binary
     */
    function deserializeAsync(record) {
        if (typeof record === "string") {
            record = new Buffer(record, "binary");
        }

        return promise.try(() => {
            switch (record[0]) {
            case 0x00:
                return deserializeAsync00(record, 1);

            case 0x01:
                return deserializeAsync01(record, 1);
            }

            throw new Error("Invalid serialized version identifier");
        });
    }


    /**
     * Deserializes version 0 records.  They are a chunked encoding
     * method and contain raw deflated data.
     *
     * @param {Buffer} record
     * @param {number} offset
     * @return {Promise.<Buffer>} Deserialized contents, binary
     */
    function deserializeAsync00(record, offset) {
        return promise.try(() => {
            var chunk, dataCompressed;

            dataCompressed = null;

            while (offset < record.length) {
                chunk = parseChunk(record, offset);

                switch (chunk.type) {
                case "c":
                    dataCompressed = chunk.data;
                    break;

                default:
                    throw new Error("Invalid chunk at offset " + offset);
                }

                offset = chunk.offset;
            }

            if (!dataCompressed) {
                throw new Error("No compressed data in encrypted record");
            }

            return zlib.inflateRawAsync(dataCompressed);
        }).then((result) => {
            // Destroy buffer contents
            record.fill(0);

            return result;
        });
    }


    /**
     * Deserializes version 1 records.  They are a chunked encoding
     * method and contain raw deflated data.  Identical to version 0
     * except these also have a 4 byte expiration date just after
     * the version code.
     *
     * @param {Buffer} record
     * @param {number} offset
     * @return {Promise.<Buffer>} Deserialized contents, binary
     */
    function deserializeAsync01(record, offset) {
        return promise.try(() => {
            var expires, expiresTime;

            expiresTime = record.readUInt32LE(offset);
            expires = new Date();
            expires.setTime(expiresTime * 1000);

            if (expires < new Date()) {
                throw new Error("Expired");
            }

            offset += 4;

            return deserializeAsync00(record, offset);
        });
    }


    /**
     * Creates a Buffer chunk encoded version of some data
     *
     * @param {string} typeChar A single character
     * @param {number} length
     * @return {Buffer}
     */
    function makeChunkHeader(typeChar, length) {
        var header;

        header = new Buffer(5);
        header[0] = typeChar.charCodeAt(0);
        header.writeUInt32LE(length, 1);

        return header;
    }


    /**
     * Given a buffer and a starting offset, attempt to pull off a chunk.
     *
     * This validates that the expected data length matches the actual
     * data length.
     *
     * @param {Buffer} buffer
     * @param {number} offset
     * @return {Encryption~chunk}
     * @throws {Error} when lengths do not match
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
    function serializeAsync(data, options) {
        var serializedBuffers, expiresTime;

        if (typeof data === "string") {
            data = new Buffer(data, "binary");
        }

        // First version of serialized data
        serializedBuffers = [
            new Buffer("\x00", "binary")
        ];

        // If there is an expiration date
        if (options && options.expires) {
            serializedBuffers[0][0] = 1;  // Version 1
            expiresTime = options.expires.getTime();
            expiresTime = Math.floor(expiresTime / 1000);
            serializedBuffers.push(new Buffer(4));
            serializedBuffers[1].writeUInt32LE(expiresTime, 0);
        }

        return zlib.deflateRawAsync(data).then((compressed) => {
            serializedBuffers.push(makeChunkHeader("c", compressed.length));
            serializedBuffers.push(compressed);

            return Buffer.concat(serializedBuffers);
        });
    }

    // Wrap zlib in the promises
    zlib = promise.promisifyAll(zlib);

    return {
        deserializeAsync: deserializeAsync,
        serializeAsync: serializeAsync
    };
}
