const { generateCommonJSFile } = require("./generateCommonJSFile.js")
const { localRoot } = require("./util.js")

generateCommonJSFile({
  source: "index.js",
  destination: "dist/index.js",
  plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-transform-spread"],
  localRoot,
})
