const { generateCommonJSFile } = require("./generateCommonJSFile.js")
const { projectFolder } = require("./util.js")

generateCommonJSFile({
  projectFolder,
  source: "index.js",
  destination: "dist/index.js",
  plugins: ["@babel/plugin-proposal-object-rest-spread", "@babel/plugin-transform-spread"],
})
