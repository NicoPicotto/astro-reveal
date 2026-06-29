# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).

When you make a change worth releasing, run `npx changeset`, pick a bump
(patch / minor / major) and write a one-line summary. Commit the generated
file. On merge to `main`, the Release workflow opens a "Version Packages" PR;
merging *that* publishes to npm.
