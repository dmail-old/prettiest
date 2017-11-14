// faire un module @dmail/prettiest
// dont dépendront les package et ils feront un npm run prettiest

const fs = require("fs")
const path = require("path")
const prettier = require("prettier")
const { glob } = require("glob-gitignore")
const ignore = require("ignore")
const { promisifyNodeCallback, promiseParallel } = require("./promise-helper.js")

const getFileContent = promisifyNodeCallback(fs.readFile)
const getFileContentAsString = path => getFileContent(path).then(String)
const getOptionalFileContentAsString = path =>
	getFileContentAsString(path).catch(e => (e && e.code === "ENOENT" ? "" : Promise.reject(e)))

const findFilesForPrettier = relativeLocation => {
	const cwd = process.cwd()
	let absoluteLocation
	if (relativeLocation === undefined) {
		absoluteLocation = cwd
	} else if (relativeLocation === cwd) {
		absoluteLocation = cwd
	} else {
		absoluteLocation = path.resolve(cwd, relativeLocation)
	}

	return getOptionalFileContentAsString(path.join(absoluteLocation, ".prettierignore"))
		.then(ignoreRules =>
			ignore()
				.add("node_modules")
				.add(ignoreRules)
		)
		.then(ignore =>
			glob(["**/*.js", "**/*.json", "**/*.md"], {
				cwd: absoluteLocation,
				ignore: ignore._rules.map(({ origin }) => origin)
			})
		)
}
exports.findFilesForPrettier = findFilesForPrettier

const ensureFileIsPretty = file =>
	Promise.all([
		getFileContentAsString(file),
		prettier.resolveConfig(file)
	]).then(([source, options]) => {
		const pretty = prettier.check(source, { ...options, filepath: file })
		return {
			file,
			pretty
		}
	})

const ensureFolderIsPretty = (location = process.cwd()) => {
	return findFilesForPrettier(location).then(files => promiseParallel(files, ensureFileIsPretty))
}
exports.ensureFolderIsPretty = ensureFolderIsPretty
