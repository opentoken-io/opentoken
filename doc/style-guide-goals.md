Style Guide Goals
=================

This is a detailed description of the goals that are presented in the [Style Guide](style-guide.md).


Maintainable Code
-----------------

When you look at projects, one will immediately classify it as either "legacy" or "active".  Everyone dreads legacy code and goes in to make tiny patches but rarely will refactor modules so they work better.  Our goal is to raise the bar so high that our project will be a pleasure to update and developers will have many ways to adjust our code in the future.


### Clean and Straightforward

One big complaint about software is that the developers need months to understand each obscure trick that the application uses.  We aim for consistency in our approach.  Debuggable code should be produced.  That is why you should code plainly.  Avoid tricky parts and clever bits.  Don't manually minify code.  For example, it's far better to use an `if` statement than `||`.

In addition, following a coding standard can provide hints on how to use functions and variables.  For instance, you could be writing JavaScript and use the function `getNameAsync()` and you'd know it would return a promise.  The variable `SomethingSpecial` is a class due to the leading capital letter.

When the syntax starts to look ugly, take that as an indication that there's too much going on or that the code needs to be reworked.  When you feel like listing variables on multiple lines or splitting up your chained calls, perhaps it is better to split your code into several functions or make repeated assignments instead of the chaining.


### Consistent Writing Style

When you always deal with the same writing style, you train your mind to observe patterns and will notice problems sooner.  Code can be skimmed faster and it will provide a deeper understanding of the purpose of the code segment when it is structured the same everywhere.  Plus, using a writing style that is enforced by tools can help detect problems early.

This helps out in other ways.  For instance, merge conflicts are minimized because everyone uses the same type and amount of indentation.

The consistent writing style is usually enforced with a lint checker.  Some people really hate these tools because of how picky they are with code.  Each type of check is based on real-world experience and problems found during debugging.  Letting it find all of these problems in our code helps us become better programmers while also finding places where problems could crop out later.  Using these tools during development means we can find problems before they even exist.


Tested Correctly
----------------

We rely on tests to confirm that our code works and that we don't ever experience a bug twice.  They define how our code should be used and can be used as a reference when trying to see how things work.  Tests tell us when we are done writing a feature and confirm no future changes break our code.


### Near 100% Code Coverage

We use module systems to perform dependency injection for us.  With mocks and the use of spies, all of our code should be able to be tested.  There's almost no scenario where code would not be able to be tested.


### Test How Code Behaves

Tests are written to simulate expected inputs and outputs of the test.  We simulate inputs and check the outputs.  Do not inspect the internals of an object unless it is necessary.


Become Better Programmers
-------------------------

Really, no programmer knows everything.  New things crop up all the time.  One of our goals with having these high standards is to make better programmers out of everyone.


### Share Ideas

That's why this documentation exists.  It is to share ideas with you.  In particular, these ideas are just to save time and frustration with partially communicated emails or referencing a wiki somewhere.  Communication with your other developers, especially about the philosophy or the fundamentals of the codebase, is *essential* to gaining understanding.


### Improve the Codebase

It's never perfect.  When you see something that was not done right and it should have been done in a cleaner or more testable way, then that should be raised and possibly addressed.  Letting technical debt accumulate destroys projects.
