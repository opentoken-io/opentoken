Style Guide for CSS / LESS
==========================

This extends the [general programming](style-guide-programming.md) portion of the [Style Guide](style-guide.md).  You may also be interested in the [HTML Style Guide](style-guide-html.md).


* Capitalization
    * Everything should be lowercase except when necessary.
* Comments
    * CSS spec allows comments only *between* things, not within a property definition.  Add them before or after properties or rules.
    * CSS spec only allows `/* comment */` style comments.
    * Multi-line comments use lined-up asterisks at the beginning of all lines and finish with a line that looks like `*/`.
* Indentation
    * Newlines after open braces ('{') and increase indent level.
    * Newlines before and decrease indent level with close braces ('}').
    * There shall be a newline before comments unless the line before is a property.
    * Comments are always on their own line.
    * No other newlines
* Properties
    * No space before a colon, one space after.
    * Semicolon after each property, followed by a newline.
* Rules and Selectors
    * Newline between two rules at the same level.
    * Use an Atomic CSS styles like [my.yahoo.com](my.yahoo.com) and it is detailed by [Smashing Magazine](http://www.smashingmagazine.com/2013/10/21/challenging-css-best-practices-atomic-approach/).
    * Class names are based off of the Zen Coding standard for CSS.  The value is part of the class name and the unit (except `px`) is included.  The name is still lowercase.
    * Class names use hyphens, not camel case.
    * Rules are alphabetized by the class name.  Alphabetize numbers (including negative numbers) in a "human sort" (by their value) so "neg2" comes before "1".
    * Be *very careful* with specificity.  We aim to have rules with very low specificities.
* Namespacing
    * Typically, atomic rules will not require any namespacing beyond "body".
    * If you have special CSS for a particular template make sure to namespace it with the following rules:
        * In your template (eg. "template.html") give the top level element a class that matches your template (eg. `<div class="template">`).
        * Create a new file ("template.less") that will nest all of the special rules under the `.template` class.

    /* This is a sample of some valid LESS.
     * This multi-line comment illustrates the necessary formatting.
     */
    body {
        /* This is how you specify a negative number */
        .ml-neg2 {
            margin-left: -2px;
        }

        /* Note that "px" is dropped from the class name */
        .ml-12 {
            margin-left: 12px;
        }

        .m-3em {
            /* The unit is "em" so that's included in the class name */
            margin: 3em;
            /* No comment allowed on the same line as a property */
        }

        .ta-c {
            text-align: center;
        }

        .z-5 {
            z-index: 5;
        }
    }
