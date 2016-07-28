Style Guide for JavaScript
==========================

This extends the [general programming](style-guide-programming.md) portion of the [Style Guide](style-guide.md).


* Filenames
    * Tests for `*.js` files are named `*.spec.js`.
    * Tests live either with the JavaScript being developed or within a `spec/` folder.  If the folder exists, all tests must be within it.
    * Angular directives, services, etc. have their type after the name (eg `some-directive-service.js` and `datepicker-directive.js`).
    * Related files should be named similarly (eg `response-template-service.js`, `response-template-service.css`, `response-template-service-declined.html`, `response-template-service-approved.html`).
* Capitalization and Naming
    * Variables and methods should use `camelCase` style formatting.
    * Only constructors should use `UpperCamelCase` formatting, such as `Date` and `Promise`.
    * No underscore before, within, nor after variables, functions, or properties.
    * Functions shall be named (eg. `function MyFunc()`) only if they are not ever supposed to be overridden.  Anonymous functions don't need a name.
    * We use arrow functions for unnamed anonymous functions unless you need to use a different context (`this`) or `arguments`.
    * `Array` and `array` are two different things.  The former is an object and the latter is a basic data type.  It's more prominent if you are using `String` vs `string` or `Boolean` vs `boolean`.
    * When declaring multiple variables, they should be declared alphabetically and any symbols at the front of variable names should be ignored. Where there is a conflict between two matching variable names, capitalised variable names should be listed first (but that's often indicating you could have a problem).
* Comments
    * Use `//` style comments for single lines.
    * Use `/* eslint some-feature:"off" */` style comments for eslint flags.  Disable the check for as little as possible.
    * Use `/* global beforeEach, describe */` style after the file's JSDoc header for defining global variables for eslint.
    * Use `/* comment */` style comments for multiple lines.
    * JSDoc comments are required before every function and at the top of a file to explain the purpose/usage of the file.
        * Use `/** comment */` style comments for JSDoc comment blocks.
        * First line should be a single-line quick description and be followed by an empty line.
        * An optional description can be entered.
        * [Markdown](style-guide-markdown.md) formatting is encouraged.
        * A newline separates the parameters or other annotations.
        * Use `@param`, `@return`.
        * When documenting a `Promise`, indicate the value that will be provided if the promise is resolved.
    * Multiple line comments end with `*/` and have leading `*` on each line.  The stars all line up throughout the comment.
    * Wrap comments at 80 characters except when using a code block as an example in the JSDoc.
    * Do not comment code unless it's an example.  We're using a version control system for a reason.
    * Comment any tricky bits of code or rewrite them to be not tricky.
* Indentation and Spacing
    * Newlines after open braces and open brackets (both `{` and `[`) and increase indent level.
    * Newlines before and decrease indent level with closing braces and brackets (both `}` and `]`).
    * Spaces before and after most operators (`=`, `+`, etc.).
    * Single line comments on a line of their own should have a newline above them.
    * Multi-line comments will be on their own line and have a newline above them.
    * New lines should separate any control structures (`if`, `while`, `for`, `switch`) from other code.  They should not be separated if the next/previous line is a brace.
    * New lines after commas in object literals and array literals.
    * There shouldn't be any other newlines.
    * Spaces before `{`, `[`, `(` unless preceded by another one of those symbols.  Same goes for a space after the closing `}`, `]` and `)`.  Do not add a space before `(` when calling a function or defining a named function.
    * ESLint forces `case` statements and the `default` case in switches to be un-indented (just that line).  There must be a blank line after `break;` as well.
* Inline Objects and Arrays, Defining Objects
    * No trailing comma after the last property or element.
    * Property names shall be in alphabetical order, followed immediately by a colon, a space, and the property's value.
    * Property names should be unquoted unless it is necessary to wrap it in quotes.
    * When defining a class, its methods are all alphabetized.
* Order of items within a function
    * ESLint flags (only if necessary)
    * `var` declarations:
        * One declaration only.
        * Variables will be alphabetized.
        * No assignments.
        * One line.
    * Functions, sorted alphabetically when possible.
    * Your code.
* Specific Constructs
    * Nothing that's displayable to the user should be sourced from JavaScript.  It should come from an HTML template, a JSON file from a server or API calls.
    * Use double-quoted strings.
    * We code for ECMA Script 6.
    * All control structures, like `if` statements, require braces.
    * Ternary statements should be avoided.
    * Avoid manual minification - let a minifier do it.
        * Ternary statements should be expanded into `if` blocks.
        * While `!!~haystack.indexOf(needle)` is tricky and neat, write `str.indexOf(needle) !== -1` so all programmers on the project immediatly know what the code does.
        * At most, you can use these really minor things:
            * `+num` to cast to a number or `NaN`
            * `+num || 0` to cast to a number (`NaN` becomes 0)
            * `!!bool` to cast to a boolean
            * `[].concat(arrayVar)` to cast to an Array
    * Understand the difference between `null`, `undefined` and falsy values.
        * ESLint forces us to use `===` and `!==` so the actual value matters greatly.
        * `null` is an empty value and it's a "known" empty value.  Not an error.
        * `undefined` is an empty value that usually signifies a missing return value, parameter or unsent data.  If we assign it to something it should be considered some sort of error.
        * Most conditional logic should be fine using `if (cond)` instead of `if (cond === true)`.  Avoid `if (!cond === false)`.
    * JavaScript that is expected to work outside of Angular is written using a module loading syntax.  Angular-specific code uses a module syntax.
* Testing
    * Tests should be written for all JavaScript code to ensure it works as expected.  100% test coverage, including testing all branches, is possible.
    * We wish to perform behavioral testing.  Test every intended way we will be using objects and all exposed functions.
    * All tests should pass before merging code to a parent branch.
    * Tests should be grammatically correct and read like a sentence.  The descriptions should describe the observable behavior, not what is going on in the code.

    /**
     * This is a JSDoc formatted comment that describes the file.  Not much is
     * expected here as far as annotations.  The lines all fit within 80
     * characters and the asterisks on the left all line up.  Markdown is
     * expected to be used for code examples, but that's pretty easy.  Just
     * indent some code with four spaces and keep it a line away from text.
     *
     *     // Sample usage
     *     var test;
     *     test = new FakeTestClass();
     *     test.run('something');
     *
     * This next "global" part flags `window` as a global variable.  That's
     * because nothing in this first function accesses any globals.
     */
    /*global window*/
    (function (global, wind) {
        /**
         * This is a fake class for illustration purposes.
         *
         * The class gets a capital letter at the beginning because it is a
         * constructor.
         *
         * @class FakeTestClass
         */
        function FakeTestClass() {
            // In case the user forgot to use `new`, return a new instance
            if (!(this instanceof FakeTestClass)) {
                return new FakeTestClass();
            }

            this.callCount = 0;
        }

        /**
         * Sample event handler
         *
         * @param {Event} event Unused
         * @param {AnotherClass~speciallyFormattedObject} data Checks for callCount
         */
        FakeTestClass.prototype.onClick = function (event, data) {
            var lastClickData;

            /**
             * Copy a property from incoming data into the lastClickData
             *
             * This is a function, thus it's split out here and documented.
             *
             * @param {string} name
             */
            function copyProperty(name) {
                if (data[name]) {
                    lastClickData[name] = data[name];
                }
            }

            if (typeof data === "object" && data.callCount) {
                this.callCount = +data.callCount || 0;
            }

            lastClickData = {};
            [
                'mouseX',
                'mouseY'
            ].forEach(copyProperty);
            lastClickData.fakeTestData = {
                callCount: this.callCount,
                instance: this
            };
            this.lastClickData = lastClickData;
        }

        /**
         * Run a test, display a message.
         *
         * The method's added to the prototype this way for cleanliness, but
         * using Object.create() is also an options.  The return value is "this"
         * so we are not specifying a type - it is possible that the context is
         * anything and we're returning whatever the context is.
         *
         * @param {string} [message] Show this message via an alert
         * @return this
         */
        FakeTestClass.prototype.run = function (message) {
            if (message) {
                wind.alert(message);
            }

            this.callCount += 1;
        };

        // Export to UMD or the global object - standard boilerplate
        if (module && module.exports) {
            module.exports = FakeTestClass;
        } else {
            global.FakeTestClass = FakeTestClass;
        }
    }(this, window))
