#!/usr/bin/env node
const { findFilesForPrettier } = require("../index.js")

const cwd = process.cwd()

findFilesForPrettier(cwd)
	.then((files) => {
		console.log(`${files.length} files in ${cwd}`)
		if (files.length > 0) {
			console.log(files.join("\n"))
		}
		process.exit(0)
	})
	.catch((error) =>
		setTimeout(() => {
			throw error
		}),
	)
