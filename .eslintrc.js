const { createConfig } = require("@jsenv/eslint-config")
const importMap = require("./importMap.json")

const config = createConfig()
config.rules["import/no-absolute-path"] = ["off"]
config.settings["import/resolver"] = {
  [`${__dirname}/node_modules/@jsenv/eslint-import-resolver/dist/src/resolver.js`]: {
    projectFolder: __dirname,
    importMap,
    verbose: false,
  },
}

module.exports = config
