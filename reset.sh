#!/usr/bin/env bash

git=git
command -v git.exe 1>/dev/null && git=git.exe

$git config user.name "Rcrwrate"
$git config user.email "46920034+Rcrwrate@users.noreply.github.com"

[ "$1" = "pull" ] && {
    $git remote add upstream https://github.com/Rcrwrate/Crawler.git
    $git config pull.rebase true
    $git pull upstream master
    $git checkout --ours .
    $git add .
    $git commit -m "$1"
    $git rebase --continue
    exit 0
}

$git checkout --orphan latest_branch
$git rm -rf --cached .
$git add -A
$git commit -m "$1"
$git branch -D master
$git branch -m master
$git push -f origin master
