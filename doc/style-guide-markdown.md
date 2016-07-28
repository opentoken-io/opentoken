Style Guide for Markdown
========================

This extends the [general programming](style-guide-programming.md) portion of the [Style Guide](style-guide.md).


* Markdown Formatting
    * Follow GitHub Flavored Markup.
    * Paragraphs should be all on one long line.
    * Avoid HTML markup.
    * Prefer to use indentation instead of code fences.
* Headings and Subheadings
    * Documents start with a heading.  No other place uses a first level heading.
    * Prefer `====` and `----` for first and second level headings.
* Whitespace
    * Indent 4 spaces whenever there's indentation.
    * Two blank lines before any headings unless they are at the top of a file.
    * One blank line after headings.
    * One blank line before and after lists.
* Attention to Detail
    * Spell check and attempt to grammar check your work.

    My Sample Document
    ==================

    This is my sample document.  It's a single line because that is what GitHub Flavored Markup likes.

    * My list item 1
    * My list item 2
        * Sublist item 1
        * These are indented with four spaces


    Section 1
    ---------

    This section had two blank lines before the title.  Below is an example bit of code, so it is indented by four spaces.

        #!/bin/bash
        echo "This is a fake shell script"

    And back to normal.
