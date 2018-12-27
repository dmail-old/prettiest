import path from "path"
import { assert } from "@dmail/assert"
import { checkFormat } from "./index.js"

const localRoot = path.resolve(__dirname, "../") // because runned from dist

const test = async () => {
  const ressources = [`index.js`]
  const report = await checkFormat({ localRoot, ressources })

  assert({
    actual: report,
    expected: {
      [`index.js`]: { pretty: true, ignored: false },
    },
  })
}
test()
