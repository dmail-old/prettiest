const { bundleNode } = require("@jsenv/core")
const { importMap, projectFolder, babelPluginDescription } = require("../../jsenv.config.js")

bundleNode({
  importMap,
  projectFolder,
  into: "dist/node",
  entryPointsDescription: {
    main: "index.js",
  },
  babelPluginDescription,
  verbose: true,
  // here can add usageMap, compileGroupCount
})
