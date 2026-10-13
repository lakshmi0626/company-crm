#!/usr/bin/env bash
# Builds a branch-per-piece Git history from the project files.
# Run from the project root in a folder that is not yet a git repository.
set -euo pipefail

if [ -d .git ] && git rev-parse HEAD >/dev/null 2>&1; then
  echo "This repository already has commits. Run the script in a fresh copy." >&2
  exit 1
fi

git init -q -b main
git config user.name >/dev/null || { echo "Set git user.name and user.email first." >&2; exit 1; }

# 1. Project foundation on main
git add .gitignore README.md package.json docker-compose.yml
git commit -q -m "chore: initialise project with readme, scripts and docker setup"
git checkout -q -b develop

describe() { # path -> "type(scope): message"
  local f="$1" base; base=$(basename "$f")
  case "$f" in
    backend/src/modules/*/*) local m; m=$(echo "$f" | cut -d/ -f4); echo "feat($m): add $base" ;;
    backend/src/middleware/*) echo "feat(api): add $base middleware" ;;
    backend/src/utils/*) echo "feat(api): add $base utility" ;;
    backend/src/config/*) echo "chore(api): add $base config" ;;
    backend/src/*) echo "feat(api): add $base" ;;
    backend/db/*) echo "feat(db): add $base" ;;
    backend/test/*) echo "test(api): add $base" ;;
    backend/*) echo "chore(api): add $base" ;;
    frontend/src/pages/*) echo "feat(ui): add ${base%.jsx} page" ;;
    frontend/src/components/*) echo "feat(ui): add ${base%.jsx} component" ;;
    frontend/src/*) echo "feat(ui): add $base" ;;
    frontend/*) echo "chore(ui): add $base" ;;
    docs/*) echo "docs: add $base" ;;
    *) echo "chore: add $base" ;;
  esac
}

branch_for() { echo "$1" | sed -E 's#^(backend|frontend)/##; s#^src/##; s#[^A-Za-z0-9]+#-#g; s#-+$##' | tr 'A-Z' 'a-z'; }

count=0
while IFS= read -r f; do
  case "$f" in .gitignore|README.md|package.json|docker-compose.yml|scripts/git-history.sh) continue ;; esac
  prefix="feature"; case "$f" in docs/*) prefix="docs" ;; *test*) prefix="test" ;; esac
  case "$f" in backend/*) area=api ;; frontend/*) area=ui ;; *) area=repo ;; esac
  branch="$prefix/$area-$(branch_for "$f")"
  git checkout -q -b "$branch" develop
  git add "$f"
  git commit -q -m "$(describe "$f")"
  git checkout -q develop
  git merge -q --no-ff "$branch" -m "Merge $branch into develop"
  count=$((count + 1))
done < <(find backend frontend docs -type f -not -path '*/node_modules/*' | sort)

git add scripts/git-history.sh
git commit -q -m "chore: add git history script"
git checkout -q main
git merge -q --no-ff develop -m "Release 1.0.0"
git tag v1.0.0
echo "Created $count feature branches. Branches: $(git branch | wc -l), commits: $(git rev-list --count HEAD)"
