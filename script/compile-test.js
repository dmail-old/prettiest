const { generateCommonJSFile } = require("./generateCommonJSFile.js")
const { projectFolder } = require("./util.js")

generateCommonJSFile({
  projectFolder,
  source: "index.test.js",
  destination: "dist/index.test.js",
  plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-transform-spread"],
})
