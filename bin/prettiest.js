#!/usr/bin/env node

const { ensureFolderIsPretty } = require("../index.js")

const cwd = process.cwd()
const log = (...args) => console.log(...args)
const warn = (...args) => console.warn(...args)

ensureFolderIsPretty(cwd)
	.then(report => {
		const uglyFiles = report.filter(({ pretty }) => pretty === false).map(({ file }) => file)
		if (uglyFiles.length) {
			uglyFiles.forEach(file => {
				warn(`${file} is ugly (does not respect .prettier.config.js)`)
			})
			process.exit(1)
		}

		log(`everything is pretty :)`)
		process.exit(0)
	})
	.catch(error =>
		setTimeout(() => {
			throw error
		})
	)
