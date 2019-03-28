const { cover, generateCoverageLog, generateCoverageHTML } = require("@jsenv/core")
const { fileWrite } = require("@dmail/helper")
const {
  importMap,
  projectFolder,
  compileInto,
  babelPluginDescription,
} = require("../../jsenv.config.js")
const { testDescription } = require("../test/test.config.js")

const coverageFile = `${projectFolder}/coverage/coverage-final.json`

const coverDescription = {
  "/index.js": true,
  "/src/**/*.js": true,
  "/**/*.test.*": false, // contains .test. -> nope
  "/**/test/": false, // inside a test folder -> nope
}

const generateLog = true

const generateHTMLFiles = true

;(async () => {
  const { coverageMap } = await cover({
    importMap,
    projectFolder,
    compileInto,
    babelPluginDescription,
    coverDescription,
    executeDescription: testDescription,
  })

  fileWrite(coverageFile, JSON.stringify(coverageMap, null, "  "))
  if (generateLog) {
    generateCoverageLog(coverageMap)
  }
  if (generateHTMLFiles) {
    generateCoverageHTML(coverageMap)
  }
})()
