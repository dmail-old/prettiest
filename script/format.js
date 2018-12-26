const { localRoot, metaMap } = require("../config/project.config.js")
const { format } = require("../dist/index.js")

format({
  localRoot,
  metaMap,
})
