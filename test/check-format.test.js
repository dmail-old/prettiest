import path from "path"
import { hrefToPathname } from "/node_modules/@jsenv/module-resolution/index.js"
import { assert } from "/node_modules/@dmail/assert/index.js"
import { checkFormat } from "../index.js"

const projectFolder = path.resolve(hrefToPathname(import.meta.url), "../../")
const filenameRelativeArray = [`index.js`]
const actual = await checkFormat({ folder: projectFolder, filenameRelativeArray })
const expected = {
  [`index.js`]: { status: "pretty", statusDetail: undefined },
}

assert({
  actual,
  expected,
})
