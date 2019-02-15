const {
  namedValueDescriptionToMetaDescription,
  selectAllFileInsideFolder,
} = require("@dmail/project-structure")
const { prettiest } = require("../dist/index.js")
const { projectFolder } = require("./util.js")

const metaDescription = namedValueDescriptionToMetaDescription({
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

selectAllFileInsideFolder({
  pathname: projectFolder,
  metaDescription,
  predicate: (meta) => meta.format === true,
  transformFile: ({ filenameRelative }) => filenameRelative,
}).then((filenameRelativeArray) => {
  prettiest({ folder: projectFolder, filenameRelativeArray })
})
