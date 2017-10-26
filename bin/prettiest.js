#!/usr/bin/env node
const { ensureFolderIsPretty } = require("../index.js")

const cwd = process.cwd()
const log = (...args) => console.log(...args)
const warn = (...args) => console.warn(...args)

console.log("running prettiest on", cwd)
ensureFolderIsPretty(cwd)
	.then(report => {
		const uglyFiles = report.filter(({ pretty }) => pretty === false).map(({ file }) => file)
		if (uglyFiles.length) {
			warn(`${uglyFiles.length} files are ugly (does not respect prettier.config.js)`)
			warn(uglyFiles.join("\n"))
			process.exit(1)
		}

		log(`${report.length} files are pretty :)`)
		process.exit(0)
	})
	.catch(error =>
		setTimeout(() => {
			throw error
		})
	)
