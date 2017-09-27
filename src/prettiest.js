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

const findFilesForPrettier = (location = process.cwd()) => {
	const absoluteLocation = path.resolve(process.cwd(), location)
	return getOptionalFileContentAsString(
		path.join(absoluteLocation, ".prettierignore")
	).then(ignoreRules =>
		glob(["**/*.js", "**/*.json"], {
			cwd: absoluteLocation,
			ignore: ignore()
				.add("node_modules")
				.add(ignoreRules)
		})
	)
}

const ensureFileIsPretty = file =>
	Promise.all([
		getFileContentAsString(file),
		prettier.resolveConfig(file)
	]).then(([source, options]) => {
		console.log(`prettier.check ${file}`)
		const pretty = prettier.check(source, { ...options, filepath: file })
		return {
			file,
			pretty
		}
	})

const ensureFolderIsPretty = (location = process.cwd()) =>
	findFilesForPrettier(location).then(files => promiseParallel(files, ensureFileIsPretty))
exports.ensureFolderIsPretty = ensureFolderIsPretty
