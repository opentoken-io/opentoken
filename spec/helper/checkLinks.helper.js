"use strict";


/**
 * Convert a list of link definition objects to a map.
 *
 * @param {Array.<Object>} ldoArray
 * @return {Map}
 */
function makeMap(ldoArray) {
    var map;

    map = new Map();
    ldoArray.forEach((item) => {
        var key;

        if (item.title) {
            key = `${item.rel}.${item.title}`;
        } else {
            key = item.rel;
        }

        // Rule:  All links should be uniquely identifiable.
        expect(map.get(key)).not.toBeDefined();
        map.set(key, item);
    });

    return map;
}


/**
 * Checks to make sure two lists of links match.  First, the links are
 * organized into a map that is keyed by rel + title.  Then each of the
 * expected links is matched against the actual links.  Differences are
 * reported and actual links are removed.  Finally, any leftover actual
 * links are each flagged as an error.
 *
 * @param {Array.<Object>} expectedArray
 * @param {Array.<Object>} actualArray
 */
jasmine.checkLinks = (expectedArray, actualArray) => {
    var actualMap, expectedMap;

    expectedMap = makeMap(expectedArray);
    actualMap = makeMap(actualArray);

    // Rule: match everything in the expected map
    expectedMap.forEach((ldo, key) => {
        expect(actualMap.get(key)).toEqual(ldo);
        actualMap.delete(key);
    });

    // Rule: No leftover links should remain.
    actualMap.forEach((ldo) => {
        expect(ldo).not.toBeDefined();
    });
};
