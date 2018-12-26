const path = require("path")
const { configToMetaMap } = require("@dmail/project-structure")
const eslintConfig = require("@dmail/project-eslint-config").config
const prettierConfig = require("@dmail/project-prettier-config")
const structureConfig = require("./structure.config.js")

const localRoot = path.resolve(__dirname, "../")
const metaMap = configToMetaMap(structureConfig)
const plugins = ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-transform-spread"]

module.exports = {
  localRoot,
  metaMap,
  eslint: eslintConfig,
  prettier: prettierConfig,
  plugins,
}
