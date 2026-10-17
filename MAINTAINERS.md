# Maintainers

Steel Shield is owned by the steel-and-code GitHub organization, not by any one
person, and is maintained jointly by:

- **Steel & Code**
- **Blackbox Entertainment**

Both have admin rights on this repository and can merge and release.

## Keeping Steel Shield alive

Steel Shield must not quietly stop working because the people behind it are
busy. These rules exist for that:

1. **Two maintainers at all times.** If either maintainer steps away, the other
   names a replacement within 90 days and records it here.
2. **Tests run every week, even with no changes.** The scheduled test run
   checks Steel Shield against the newest Fedora and Ubuntu ClamAV packages and
   the real virus definitions. A failure opens an issue automatically.
3. **Steel OS depends on it.** Every Steel OS image build runs the Steel Shield
   self-test, and the build fails if it does not pass. As long as Steel OS is
   maintained, a broken Steel Shield cannot ship unnoticed.
4. **Honest status for users.** If definitions stop updating or a part stops
   running, Steel Shield says so on its dashboard instead of showing a green
   tick. Users are never told they are protected when they are not.
5. **Anyone can carry it on.** The code is Apache 2.0. If this project is ever
   unmaintained for 12 months, the maintainers will hand the repository to a
   willing successor or say clearly in the README that it is no longer
   maintained, so nobody relies on it by mistake.

See [MAINTAINING.md](MAINTAINING.md) for how releases and weekly checks work.
