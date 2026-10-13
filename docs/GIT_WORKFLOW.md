# Git workflow

- `main`: releasable code. `develop`: integration branch.
- One short-lived branch per task, named `feature/<area>-<task>` (also `fix/`, `chore/`, `docs/`, `test/`).
- Commit messages follow Conventional Commits: `feat(contacts): add company filter`.
- Merge into `develop` with a pull request (`--no-ff`), then release `develop` to `main`.

`scripts/git-history.sh` initialises a repository and commits this project one piece at a time,
each on its own branch merged into `develop`. Run it once in a fresh clone.
