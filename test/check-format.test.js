import { hrefToPathname } from "/node_modules/@jsenv/module-resolution/index.js"
import { assert } from "/node_modules/@dmail/assert/index.js"
import { checkFormat } from "../index.js"

const { resolve } = import.meta.require("path")

const projectFolder = resolve(hrefToPathname(import.meta.url), "../../")
const filenameRelativeArray = [`index.js`]
const actual = await checkFormat({ folder: projectFolder, filenameRelativeArray })
const expected = {
  [`index.js`]: { status: "pretty", statusDetail: undefined },
}

assert({
  actual,
  expected,
})
