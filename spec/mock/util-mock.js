"use strict";

module.exports = () => {
    var mock;

    mock = jasmine.createSpyObj("utilMock", [
        "arrayRequireItems",
        "clone",
        "deepMerge"
    ]);
    mock.arrayRequireItems.andCallFake((haystack, needles) => {
        return needles.filter((item) => {
            return haystack.indexOf(item) === -1;
        });
    });
    mock.clone.andCallFake((input) => {
        if (typeof input !== "object") {
            return input;
        }

        return JSON.parse(JSON.stringify(input));
    });
    mock.deepMerge.andReturn({
        deep: "merge"
    });

    return mock;
};
