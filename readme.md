# Prettiest

[![npm](https://badge.fury.io/js/%40dmail%2Fprettiest.svg)](https://badge.fury.io/js/%40dmail%2Fprettiest)
[![build](https://travis-ci.org/dmail/prettiest.svg?branch=master)](http://travis-ci.org/dmail/prettiest)

Command line util to ensure a folder of files respects prettier config.

## Command line

- output list of files in current folder that should be pretty: `prettiest-list .`
- check current folder contains only pretty files: `prettiest .`

### findFilesForPrettier(pathToFolder)

Returns a promise resolved with a list of file paths on which prettier should be runned.
By default it includes `**/*.js, ***/*.json, **/*.md`, excludes `node_modules/**` and other exclude rules found in `${pathToFolder}/.prettierignore`.

```javascript
const { findFilesForPrettier } = require("@dmail/prettiest")

findFilesForPrettier(process.cwd()).then((files) => console.log(files))
```

### ensureFolderIsPretty(pathToFolder)

```javascript
const { ensureFolderIsPretty } = require("@dmail/prettiest")

ensureFolderIsPretty(process.cwd()).then((report) => {
  report.forEach(({ file, pretty }) => {
    console.log(`${file} is pretty: ${pretty ? 'yes' : 'no'}`)
  })
})
```

## Install

`npm install @dmail/prettiest`
