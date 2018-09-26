import fs from "fs"
import { createRoot } from "@dmail/project-structure"

const prettier = require("prettier")

const getFileContentAsString = (location) =>
  new Promise((resolve, reject) => {
    fs.readFile(location, (error, buffer) => {
      if (error) {
        reject(error)
      } else {
        resolve(buffer.toString())
      }
    })
  })

export const getReport = ({ root }) => {
  return createRoot({ root }).then(({ forEachFileMatching }) => {
    return forEachFileMatching(
      ({ prettify }) => prettify,
      ({ absoluteName }) => {
        return Promise.all([
          getFileContentAsString(absoluteName),
          prettier.resolveConfig(absoluteName),
        ]).then(([source, options]) => {
          const pretty = prettier.check(source, { ...options, filepath: absoluteName })
          return {
            file: absoluteName,
            pretty,
          }
        })
      },
    )
  })
}
