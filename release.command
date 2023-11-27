#!/bin/bash

# Your GitHub repository owner and name
OWNER="marcuzzz"
REPO=$(git config --get remote.origin.url | sed 's/.*\/\([^/]*\)\.git/\1/')

#Patch version:
if [ "$1" != "pass-patch" ]; then
    # Increment the patch version
    /opt/homebrew/bin/oc
    npm version patch --force
fi

BUNDLEID=$(plutil -extract bundleid raw -o - ./info.plist)
NAME=${BUNDLEID##*.}
VERSION=$(jq -r .version package.json)
plutil -replace version -string $VERSION info.plist
npm run package-mac

EXE=$(jq -r .name package.json)

FILENAME="$NAME.v$VERSION.alfredworkflow"
plutil -replace version -string "$VERSION" info.plist

echo "NAME: $NAME"
echo "NEW VERSION: v$VERSION"

echo "Building release..."
echo
mkdir releases 2> /dev/null
zip "releases/$FILENAME" -r "$EXE" info.plist icon.png images/*
echo

echo "Released $NAME v$VERSION"
echo " * releases/$FILENAME"

echo "Opening new release"
open "./releases/$FILENAME"

if [ "$1" != "pass-patch" ]; then
    # Create a new release...
    git tag -a "v$VERSION" -m "Released $NAME v$VERSION"
    git push origin "v$VERSION"

    # GitHub API URL for uploading a release asset
    UPLOAD_URL="https://uploads.github.com/repos/$OWNER/$REPO/releases/$(git describe --abbrev=0 --tags | tr -d '\n')/assets?name=$(basename "$FILENAME")"

    # Upload the asset
    curl -X POST -H "Authorization: token $githubpass" -H "Content-Type: application/zip" --data-binary @"./releases/$FILENAME" "$UPLOAD_URL"
fi