# 1.2.2

- BUGFIX: reverting use of Babel's container-aware methods. They do indeed cause babel to schedule further processing of our emitted code, but unfortunately babel doesn't keep track of any intervening changes that are made by other plugins in between the time the work is scheduled and the time the work is done, meaning subsequent plugins can get handed totally invalid nodes that have already been removed from the tree.

# 1.2.1

- BUGFIX: explicitly remove all import specifiers so that babel will cancel scheduled visits on them.

# 1.2.0

- BUGFIX: use Babel's container-aware methods to manipulate the set of import declarations and import specifiers

# 1.1.0

- FEATURE: add support for side-effectful imports

# 1.0.0

- FEATURE: add support for namespace imports
- DOCS: write an actual README

# 0.2.0

- BUGFIX: don't share identifier nodes

# 0.1.0

- initial release
