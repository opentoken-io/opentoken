Writing High Quality Tests
==========================

The goal of a test is to ensure that some bit of code works as expected with valid or invalid input.  Testing failure paths is as important as testing successful paths.

Tests also provide a way of proving that your interface doesn't change.  People will write code that use your module in a defined way, which should mirror a test.  When you refactor code for efficiency, to split into smaller modules or to use a different method for performing the same action your tests will guarantee that everything still works.

Think of tests as a safety net for acrobats.  You'd rather be perfect and perform your art without ever needing tests, but they are there to help you when a mistake is made.


Guidelines
----------

The [style guide](style-guide.md) lists many useful tips and various requirements when writing tests.  Only a few of those are listed here for further explanation.


### Eliminate Duplicated Setup

When the code has two separate actions that it performs then you want to have the tests split into two separate `it()` calls.  These would require the same setup to achieve an identical scenario.  Move that into a `beforeEach()`.  When you have a complicated piece of code that has numerous logical branches, again you will want to split the setup into multiple `beforeEach()` calls, one for each branch.

There's examples in this document to help explain this process.


### Make it easy to expand

Let's say that your code currently does only one thing.  Perhaps it just trims whitespace.  You'd see no reason to have a `beforeEach()` that would set up some service and then a separate `it()` to test if the whitespace was removed.  You could put all of the setup and the testing together in an `it()`.

It is recommended to not do this.  The `it()` is considered the "test" portion of the code and `beforeEach()` is reserved for setup.  Think about what you would have to do in order to prove a bug was fixed properly.  If the setup was combined with the test, then you'd either have to duplicate the setup in the second test (already you know that's bad) or you'll have to refactor the test to have a `beforeEach()` and two `it()` calls.  Since the latter option is the one we'd like to see, try to make all setup happen in a `beforeEach()` even if there is only one test.  It makes the tests easier to expand.


### Test Behavior

We want to write tests to not only confirm there are no defects, but also ones that could mimic how the software is intended to be used.  By testing behavior, we are shifting our viewpoint to be from the user's point of view instead of being overly concerned with the internals of the software.  In essence, I want to make sure your code performs a specific action to produce the desired result.  I do not want to guarantee that the code does every specific step in exactly the right order.

When you test behavior, you should be able to completely rewrite the internals of how the job gets done and the tests should all pass.  Depend on inputs and outputs.  Pretend the code is opaque.

Angular directives that emit events, for instance, should have tests that listen on the parent scope.  Listening on the directive's scope is not correct because those listeners would be triggered by a `.$broadcast()` as well and we want to ensure the events are traveling the correct direction.


### Every Path, Success And Failure

We aim for 100% code coverage.  There's no real good reason for us to avoid it.  When there is a problem testing code that prevents us from achieving 100% coverage then we should correct the problem instead of skipping tests.

Every true and every false condition should be tested.  Every promise should be resolved successfully and also should be rejected.  When considering options, make sure to handle the error scenarios as well as every type of success scenario.

This may seem to contradict the "Test Behavior" section because we must be able to inspect the code to see every possible logical path that would be taken.  There is no conflict - each logical path results in outward behavior that the user might encounter.  Even if the code is later refactored to eliminate many logical paths, the tests should still pass and there would be no need to delete any of the tests that now follow a redundant path.


Sample Test
-----------

This is a sample test for a directive in Angular.  Let's pretend our directive will simply set some property on an isolated scope to the value passed into the directive.  There are many things wrong with this test.

    /*global angular, describe, expect, inject, it, module*/
    describe('myCustomDirective', function () {
        var $scope;

        beforeEach(module('app'));
        it('some property on scope', inject(function ($compile, $rootScope) {
            $scope = $rootScope.$new();
            $compile(angular.element('<div my-custom-directive="\'test\'"></div>'))($scope);
            $scope.$digest();
            expect($scope.some).toEqual('test');
        });
        it('some property on scope', inject(function ($compile, $rootScope) {
            $scope = $rootScope.$new();
            $scope.test = {
                thisIsATest: true,
                unknownThingsAreAllowed: 'Yeah, I guess some are allowed',
                yWords: [
                    'yawn',
                    'yellow',
                    'yodel',
                    'yuck'
                ]
            };
            $compile(angular.element('<div my-custom-directive="test"></div>'))($scope);
            $scope.$digest();
            expect($scope.some).toEqual({
                thisIsATest: true,
                unknownThingsAreAllowed: 'Yeah, I guess some are allowed',
                yWords: [
                    'yawn',
                    'yellow',
                    'yodel',
                    'yuck'
                ]
            });
        });
    });

What is wrong?

* The data passed in as $scope.test does not need to have a lot of data.  What the directive accomplishes is merely setting the directive's `$scope.some` to the value itself.

* Since we know the object that `$scope.some` should be, we should use `.toBe()` instead of `.toEqual()`.

* The test names are identical.

Let's rewrite it.

    /*global angular, describe, expect, inject, it, module*/
    describe('myCustomDirective', function () {
        var $scope;

        beforeEach(module('app'));
        it('some property is a string', inject(function ($compile, $rootScope) {
            $scope = $rootScope.$new();
            $compile(angular.element('<div my-custom-directive="\'test\'"></div>'))($scope);
            $scope.$digest();
            expect($scope.$$childHead.some).toEqual('test');
        });
        it('some property is an object', inject(function ($compile, $rootScope) {
            $scope = $rootScope.$new();
            $scope.test = {};
            $compile(angular.element('<div my-custom-directive="test"></div>'))($scope);
            $scope.$digest();
            expect($scope.$$childHead.some).toBe($scope.test);
        });
    });

What's still wrong?

* We are performing the same setup actions.  Let's move them to a beforeEach() so we can add dozens of additional tests.

* The `$scope` variable does not need have such a long lifetime.  It's used independently inside each test.  There's two approaches: move the variable inside the `it()` calls or perform setup on the scope in a `beforeEach()` block.

* The whole `$scope.$$childHead` part is tricky.  Tricky code is bad, especially if Angular changes how the internals work.  We want to limit how many times we use fragile code.  Also, if the directive changes to use multiple scopes or decides to not use an isolated scope, then this bit needs to change for every test.

* Using `inject()` for each test is a bit odd.  Injection is part of the setup for the test and should be restricted to `beforeEach()` calls.

* The test names do not read like a sentence.

Rewrite #2.  Don't be afraid to rewrite code to simplify or to pull out common functionality.

    /*global angular, beforeEach, describe, expect, inject, it, module*/
    describe('myCustomDirective', function () {
        var compile, $parent;

        beforeEach(module('app'));
        beforeEach(inject(function ($compile) {
            $parent = $rootScope.$new();
            compile = function () {
                $compile(angular.element('<div my-custom-directive="source"></div>'))($parent);
                $parent.$digest();
                return $parent.$$childHead;
            };
        }
        it('sets some property to a string', function () {
            $parent.source = 'test';
            expect(compile().some).toEqual('test');
        });
        it('sets some property to an object', function () {
            $parent.source = {};
            expect(compile().some).toEqual($parent.source);
        });
    });

There.  Now our variables are set up in the `beforeEach()` and the individual assertions or scenarios are handled by distinct `it()` calls.


Handling Events, Grouping Tests
-------------------------------

Events add a level of difficulty because you need to fire events either above or below the directive and see if they perform the right actions.  You may find it easier to group tests by the initial setup data and then assert that things are operating smoothly.

There's also times that complicated logic will need to get tested.  It is often easier to test every pathway by nesting your logic and setup blocks.

We shall imagine our directive performs a task like this so we can better illustrate the reason for nesting our tests.

* For initial setup
    * If there is a value passed in
        * Call a service (sending the value) that returns a promise
        * When the promise is fulfilled
            * If the promise is fulfilled with an even number
                * Set "even" on scope to true
            * If the promise is fulfilled with an odd number
                * Set "odd" on scope to true
                * Set "number" to be the fulfilled number
            * Otherwise
                * Do nothing
        * When the promise is rejected
            * Set "error" on scope to "promise rejected"
    * If there is no value passed in
        * Emit "no value"
* When receiving "update" event (we intend to be broadcasting)
    * If scope "even" is truthy
        * Do not allow the event through
    * Otherwise
        * Do nothing
* When receiving "dirty" event (we intend to be emitting)
    * If scope "number" is a multiple of seven
        * Do not allow the event through
    * Otherwise
        * Do nothing

That's pretty convoluted and will require some thought when making tests.  Here's the test.  Can you see the things that I am missing?  You'll see a lot of code in the `beforeEach()` blocks everywhere.  This test is carefully structured to allow for future updates and additional tests to be trivial to implement.

    /*global describe, inject*/
    describe('myCustomDirective', function () {
        var compile, $parent, rootScope;

        beforeEach(module('app'));
        beforeEach(inject(function ($compile, $rootScope) {
            rootScope = $rootScope;
            $parent = $rootScope.$new();
            compile = function (html) {
                $compile(angular.element(html))($parent);
                return $parent.$$childHead;
            };
        }));
        describe('initial compile', function () {
            var allowNoValueEvent;

            // By default we do not want the "no value" event emitted
            beforeEach(function () {
                allowNoValueEvent = false;
                $parent.on('no value', function () {
                    expect(allowNoValueEvent).toBe(true);
                });
            });

            describe('when passed a value', function () {
                var deferred, $scope, serviceSpy;

                beforeEach(inject(function ($provide, $q) {
                    $parent.theValue = {};
                    deferred = $q.defer();
                    serviceSpy = jasmine.createSpy('serviceSpy').andReturn(deferred.promise);
                    $provide.value('aService', serviceSpy);
                    $scope = compile('<div my-custom-directive="theValue"></div>');
                }));
                it('called the service and sent the necessary value', function () {
                    expect(serviceSpy).toHaveBeenCalledWith($parent.theValue);
                });
                describe('when fulfilled with an even number', function () {
                    beforeEach(function () {
                        deferred.resolve(6);
                        $rootScope.$apply();
                    });
                    it('sets only the "even" property', function () {
                        expect($scope.even).toBe(true);
                        expect($scope.odd).toBe(undefined);
                        expect($scope.number).toBe(undefined);
                        expect($scope.error).toBe(undefined);
                    });
                });
                describe('when fulfilled with an odd number', function () {
                    beforeEach(function () {
                        deferred.resolve(3);
                        $rootScope.$apply();
                    });
                    it('sets only the "odd" and "number" properties', function () {
                        expect($scope.even).toBe(undefined);
                        expect($scope.odd).toBe(true);
                        expect($scope.number).toBe(3);
                        expect($scope.error).toBe(undefined);
                    });
                });
                describe('when fulfilled with an object', function () {
                    beforeEach(function () {
                        deferred.resolve({});
                        $rootScope.$apply();
                    });
                    it('sets nothing', function () {
                        expect($scope.even).toBe(undefined);
                        expect($scope.odd).toBe(undefined);
                        expect($scope.number).toBe(undefined);
                        expect($scope.error).toBe(undefined);
                    });
                });
                describe('when rejected', function () {
                    beforeEach(function () {
                        deferred.reject(new Error('some error'));
                        $rootScope.$apply();
                    });
                    it('sets "error"', function () {
                        expect($scope.even).toBe(undefined);
                        expect($scope.odd).toBe(undefined);
                        expect($scope.number).toBe(undefined);
                        expect($scope.error).toBe('promise rejected');
                    });
                });
            });
            describe('no value', function () {
                var eventEmitted;

                // This allows the "no value" event to be emitted and tests it
                beforeEach(function () {
                    allowNoValueEvent = true;
                    eventsEmitted = 0;
                    $parent.on('no value', function () {
                        eventsEmitted += 1;
                    });
                    compile('<div my-custom-directive></div>');
                });
                it('emits "no value"', function () {
                    expect(eventsEmitted).toBe(1);
                });
            });
        });
        describe('update event', function () {
            var eventPassed, $scope;

            beforeEach(function () {
                $scope = compile('<div my-custom-directive></div>');
                eventPassed = false;
            });
            it('allows the number by default', function () {
                $parent.$broadcast('update');
                expect(eventPassed).toBe(true);
            });
            it('allows the number with even true', function () {
                $scope.even = true;
                $parent.$broadcast('update');
                expect(eventPassed).toBe(true);
            });
            it('disallows the number with even false', function () {
                $scope.even = false;
                $parent.$broadcast('update');
                expect(eventPassed).toBe(false);
            });
        });
        describe('dirty event', function () {
            var $child, eventPassed, $scope;

            beforeEach(function () {
                // Test events coming up from a lower scope
                $scope = compile('<div my-custom-directive></div>');
                $parent.on('dirty', function () {
                    eventPassed = true;
                });
            });
            it('allows the event by default', function () {
                $child.emit('dirty');
                expect(eventPassed).toBe(true);
            });
            it('allows the event when number is 6', function () {
                $scope.number = 6;
                $child.emit('dirty');
                expect(eventPassed).toBe(true);
            });
            it('disallows the event when number is 7', function () {
                $scope.number = 7;
                $child.emit('dirty');
                expect(eventPassed).toBe(false);
            });
        });
    });

That sure is a lengthy example, but carefully notice how anyone could add additional assertions, test cases, alternate setups and different scenarios.  The event testing code is clearly separate from the initialization code.  Promises are used for resolving values.  Events are sent in the correct way through the directive and are tested at the appropriate levels.  Data is flowing through the directive and still you don't tie yourself to any other services or code outside of your directive.


Data Sets
---------

A filter is often tested by providing a series of inputs and asserting the output is correct.

```
/*global beforeEach, describe, expect, inject, it, module*/
describe('myFilter', function () {
    var filter;

    beforeEach(module('myModule'));
    beforeEach(inject(function (myFilter) {
        filter = myFilter;
    }));

    // Define an array of scenarios to test
    [
        {
            input: undefined,
            it: 'converts undefined to empty string',
            output: ''
        },
        {
            input: 7,
            it: 'converts 7 to "7"',
            output: '7'
        },
        {
            input: 'Ian'
            it: 'adds Ian\'s last name',
            output: 'Ian Finch'
        }
    ].forEach(function (scenario) {
        it(scenario.it, function () {
            expect(myFilter(scenario.input)).toEqual(scenario.output);
        });
    });
});
```


Common Tests
============

Sometimes a directive may call an internal function that performs specific actions.  In these cases you want to ensure those things do exactly what they should do if that internal function is called.

    /*global angular, beforeEach, describe, expect, inject, it*/
    describe('myDirective', function () {
        var compile, eventData, eventList;

        function testEffectsOfInternalFunction(scope) {
            it('emits "goAhead", function () {
                expect(eventList.indexOf('goAhead')).toBe(2);  // Third event
                expect(eventList.lastIndexOf('goAhead')).toBe(2);  // Only once
            });
            it('set validValue to true', function () {
                expect(scope.validValue).toBe(true);
            });
        }

        function testNegativeEffectsOfInternalFunction(scope) {
            it('never emitted "goAhead"', function () {
                expect(eventList.indexOf('goAhead')).toBe(-1);
            });
            it('deleted or never set validValue', function () {
                expect(scope.validValue).toBe(undefined);
            });
        }

        beforeEach(module('myApp'));
        beforeEach(inject(function ($compile, $rootScope) {
            compile = function (input) {
                var scope;

                scope = $rootScope.$new();
                $compile(angular.element('<div my-directive="input"></div>'))(scope)

                // Directive makes its own isolated scope
                return scope.$$childHead;
            };
        }));
        it('allows numbers', function () {
            var scope;

            scope = compile(null);
            testEffectsOfInternalFunction(scope);
        });
        it('allows objects', function () {
            var scope;

            scope = compile(null);
            testEffectsOfInternalFunction(scope);
        });
        it('allows strings', function () {
            var scope;

            scope = compile(null);
            testEffectsOfInternalFunction(scope);
        });
        it('disallows null', function () {
            var scope;

            scope = compile(null);
            testNegativeEffectsOfInternalFunction(scope);
        });
        it('disallows undefined', function () {
            var scope;

            scope = compile(null);
            testNegativeEffectsOfInternalFunction(scope);
        });
    });

With the above example, we could combine the data sets with this example to provide even shorter code, but it may be undesirable to do so.  For instance, with this code structure I can assert additional effects happened or I can mix in several `beforeEach()` calls.  Remember that the goal is maintainable, clean and self-describing code.
