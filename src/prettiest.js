// faire un module @dmail/prettiest
// dont dépendront les package et ils feront un npm run prettiest

const fs = require("fs")
const path = require("path")
const prettier = require("prettier")
const { glob } = require("glob-gitignore")
const ignore = require("ignore")
const { promisifyNodeCallback, promiseParallel } = require("./promise-helper.js")

const getFileContent = promisifyNodeCallback(fs.readFile)

const findFilesForPrettier = (location = process.cwd()) => {
	const absoluteLocation = path.resolve(process.cwd(), location)
	return getFileContent(path.join(absoluteLocation, ".prettierignore"))
		.then(String)
		.then(ignoreRules =>
			glob(["**/*.js", "**/*.json"], {
				cwd: absoluteLocation,
				ignore: ignore().add(ignoreRules)
			})
		)
}

const ensureFileIsPretty = file =>
	Promise.all([getFileContent(file), prettier.resolveConfig(file)]).then(([source, options]) => {
		return {
			file,
			pretty: prettier.check(source, { ...options, filepath: file })
		}
	})

const ensureFolderIsPretty = (location = process.cwd()) =>
	findFilesForPrettier(location).then(files => promiseParallel(files, ensureFileIsPretty))
exports.ensureFolderIsPretty = ensureFolderIsPretty
