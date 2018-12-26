import path from "path"
import { assert } from "@dmail/assert"
import { generateReport } from "./index.js"

const localRoot = path.resolve(__dirname, "../") // because runned from dist

const test = async () => {
  const files = [`${localRoot}/index.js`]
  const report = await generateReport({ files })

  assert({
    actual: report,
    expected: {
      [`${localRoot}/index.js`]: true,
    },
  })
}
test()
