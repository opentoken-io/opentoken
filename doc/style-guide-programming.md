Style Guide for General Programming
===================================

These are general rules that typically apply regardless of the language.  For more specific rules, see the full [Style Guide](style-guide.md).

* Files, Encoding, Formats
    * Use UTF-8 in all files.
    * Files are not to have BOMs (byte order marks).
    * Newlines shall be Unix-style.
    * JavaScript files will be named in all lowercase with a `.js` extension.  When a word separator is required, a hyphen will be used instead of a space or underscore.
        * Exceptions are known files:  `README.md`, `INSTALL`, `COPYING`, `LICENSE`, `Makefile` and the like.  When possible, lowercase the file.
    * Directory names will be all lowercase.  When a word separator is required, a hyphen will be used (just like filenames).
    * Files contain one class or one feature.
    * For hyphenation purposes, acronyms and initialisms are treated as single words.  Your file that parses HTML may be called `html-parser.c`.
* Indentation and Whitespace (mostly handled with [EditorConfig](http://editorconfig.org/)
    * 4 spaces per each level.
    * No spaces at the end of a line.
    * No tabs anywhere.  If you wish to use a tab, use `"\t"` instead.
    * The last line in a file shall have a newline after it.
* Ordering
    * Properties in objects will be ordered alphabetically.
    * Class methods will be ordered alphabetically.
    * When there are no other dependencies on other functions, individual functions in a file will be ordered alphabetically.  When your functions in a module call each other, the dependent ones must be placed earlier.
    * When using dependency injection, the parameters will be alphabetized.
