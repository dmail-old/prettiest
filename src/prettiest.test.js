const assert = require("assert")
const mock = require("mock-fs")
const { findFilesForPrettier } = require("./prettiest.js")

const abstractFileSystem = {
	".prettierignore": `package-lock.json
package.json
dist
coverage`,
	"package.json": "",
	"package-lock.json": "",
	// eslint-disable-next-line camelcase
	node_modules: {
		"file.js": "",
		module: {
			"file.js": "",
		},
	},
	coverage: {
		"file.js": "",
	},
	dist: {
		"file.js": "",
	},
	"index.js": "",
	src: {
		"file.js": "",
		"file.json": "",
	},
}

mock(abstractFileSystem)
findFilesForPrettier()
	.then((files) => {
		assert.deepEqual(files.sort(), ["index.js", "src/file.js", "src/file.json"].sort())
		mock.restore()
		console.log("passed")
	})
	.catch((e) =>
		setTimeout(() => {
			throw e
		}),
	)
