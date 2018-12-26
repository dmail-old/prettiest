import fs from "fs"

const { resolveConfig, getFileInfo, check } = require("prettier")

export const generateReport = async ({ files }) => {
  const report = {}

  await Promise.all(
    files.map(async (file) => {
      const [source, options, info] = await Promise.all([
        getFileContentAsString(file),
        resolveConfig(file),
        getFileInfo(file),
      ])

      if (info.ignored) return
      const pretty = check(source, { ...options, filepath: file })
      report[file] = pretty
    }),
  )

  return report
}

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
