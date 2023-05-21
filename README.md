# `git switch-branch` & `git prune-branches` commands

## Installation

```
npm install -g git-switch-branch

git config --global alias.switch-branch '!git-switch-branch'
git config --global alias.prune-branches '!git-prune-branches'
git config --global alias.builds '!git-builds'
```

## Usage

Interactive switch local GIT branch:

```
git swtich-branch
```

Interactive prune unused local GIT branches:

```
git prune-branches
```

Show builds for local GIT branch:

```
git builds
```
