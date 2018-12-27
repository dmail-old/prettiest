const { generateCommonJSFile } = require("./generateCommonJSFile.js")
const { localRoot } = require("./util.js")

generateCommonJSFile({
  source: "index.test.js",
  destination: "dist/index.test.js",
  plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-transform-spread"],
  localRoot,
})
