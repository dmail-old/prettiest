const { checkFormat } = require("@jsenv/core")
const { projectFolder } = require("../../jsenv.config.js")

const formattableDescription = {
  // js
  "/index.js": true,
  "/src/**/*.js": true,
  "/test/**/*.js": true,
  "/script/**/*.js": true,
  // json
  "/src/**/*.json": true,
  "/test/**/*.json": true,
  "/script/**/*.json": true,
  // md
  "/readme.md": true,
  "/doc/**.md": true,
  "/src/**/*.md": true,
  "/test/**/*.md": true,
  "/script/**/*.md": true,
}

checkFormat({
  projectFolder,
  formattableDescription,
})
