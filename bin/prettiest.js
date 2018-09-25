#!/usr/bin/env node

const { getReport } = require("../dist/index.js")

const cwd = process.cwd()
const log = (...args) => console.log(...args)
const warn = (...args) => console.warn(...args)

log("running prettiest on", cwd)

getReport({ root: cwd }).then((report) => {
  const uglyFiles = report.filter(({ pretty }) => pretty === false).map(({ file }) => file)
  if (uglyFiles.length) {
    warn(`${uglyFiles.length} files are ugly (does not respect prettier.config.js)`)
    warn(uglyFiles.join("\n"))
    process.exit(1)
  } else {
    log(`${report.length} files are pretty :)`)
    process.exit(0)
  }
})
