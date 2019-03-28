const {
  babelPluginDescription,
} = require("./node_modules/@jsenv/babel-plugin-description/index.js")
const importMap = require("./importMap.json")

exports.importMap = importMap

const projectFolder = __dirname
exports.projectFolder = projectFolder

const compileInto = ".dist"
exports.compileInto = compileInto

exports.babelPluginDescription = babelPluginDescription
