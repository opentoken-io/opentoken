Style Guide for HTML
====================

This extends the [general programming](style-guide-programming.md) portion of the [Style Guide](style-guide.md).


* Capitalization
    * Everything should be lowercase within tags: the name of the element, attributes and attribute values where appropriate.
    * Text that should be entirely uppercase should be transformed via [CSS](style-guide-css.md) (`.tt-u`).
* Comments
    * Comment anything that's useful.  Comments are stripped out in the build process.  Do not rely on them being delivered to the browser.
    * Short comments are on their own line.  Long comments have the start and end tags on separate lines with the contents indented.
    * Wrap comments at 80 characters unless it is an example or other situation where wrapping at 80 characters makes no sense.
* Elements
    * XHTML style elements: `<span class="tt-u">Test</span>`, `<br />`.
    * Attributes have spaces before them.
    * No spaces on either side of `=` nor inside the value unless necessary.
* Indentation
    * Block and inline-block elements will always have a newline and indent the content within.
    * Newline after `<br />`
    * No other newlines.

    <div>
        <!-- Here is a short comment. -->
        <span>This is not a block level element</span>
    </div>
    <!--
        This is a very long comment which explains how we are iterating over the
        child nodes.  It is wrapped at 80 characters and the tags are on separate
        lines.
    -->
    <div class="ta-c z-5 ml-12" ng-repeat="childNode in node.childNodeList index by idx" my-custom-directive="childNode">
        <div>
            {{childNode.name}}
        </div>
        <p>
            You will enjoy the <em>{{childNode.manufacturer}} {{childNode.model}}</em>!  {{childNode.description}}
        </p>
    </div>
