Style Guide for Git
===================

This extends the [general programming](style-guide-programming.md) portion of the [Style Guide](style-guide.md).


* Branches
    * We use a "git-flow" branching style.
    * `master` is the currently live production version.
    * `develop` is the well-tested version that can go next.  It should always be in a state where deployment is possible.
    * Other branches are created off of `develop` to fix bugs or add features.  If there is a bug on `master` branch off of `master` instead.
    * People are expected to maintain the branches they create.  Daily pulls from your parent branch into your feature branch are expected.
* Branch Names
    * Use lowercase letters, numbers and hyphens.
    * Branch names should describe the one feature the branch adds.
    * When dealing with a bug, the branch name should be `bug-12345` (include the bug number).
    * Use full words or well-understood shorthands.  `att-crd-check` might make sense for an AT&T optional credit check, but `att-opt-credit-check` would eliminate some confusion.  (eg. Did `crd-check` mean card check or credit check?)
* Tags
    * Tag every time we roll out a new version, or when we attempt to roll out a new version to production.
    * Environments higher than dev are always based off a tagged release.
    * Tags should be applied for every new release of software to a package management system, such as `npm`.
