const { patternGroupToMetaMap, forEachRessourceMatching } = require("@dmail/project-structure")
const { prettiest } = require("../dist/index.js")
const { localRoot } = require("./util.js")

const metaMap = patternGroupToMetaMap({
  format: {
    "**/*.js": true,
    "**/*.json": true,
    "**/*.md": true,
    node_modules: false, // eslint-disable-line camelcase
    dist: false,
    "package.json": false,
    "package-lock.json": false,
  },
})

forEachRessourceMatching({
  localRoot,
  metaMap,
  predicate: (meta) => meta.format === true,
}).then((ressources) => {
  prettiest({ localRoot, ressources })
})
