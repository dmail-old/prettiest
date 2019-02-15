import path from "path"
import { assert } from "@dmail/assert"
import { checkFormat } from "./index.js"

const projectFolder = path.resolve(__dirname, "../") // because runned from dist

;(async () => {
  const filenameRelativeArray = [`index.js`]
  const report = await checkFormat({ folder: projectFolder, filenameRelativeArray })

  assert({
    actual: report,
    expected: {
      [`index.js`]: { pretty: true, ignored: false },
    },
  })
})()
