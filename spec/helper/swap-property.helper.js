"use strict";


/**
 * This mimics what jasmine.spyOn() does, but will not replace the
 * object's property's value with a spy.  It lets you replace it with
 * anything you like and Jasmine will restore the original value whe
 * the test is done.
 *
 * @param {Object} obj
 * @param {string} propName
 * @param {*} newValue
 */
function swapProperty(obj, propName, newValue) {
    var spy;

    // Build a spy just like how spyOn() does
    spy = jasmine.createSpy(propName);
    spy.baseObj = obj;
    spy.methodName = propName;
    spy.originalValue = obj[propName];

    // Assign the new value to the object, not the spy.  This is different
    // from spyOn and is the primary reason we can't use that built-in
    // function in Jasmine.
    obj[propName] = newValue;

    // Add to spy list so it is reset automatically
    // eslint-disable-next-line no-underscore-dangle
    jasmine.getEnv().currentSpec.spies_.push(spy);
}


jasmine.swapProperty = swapProperty;
