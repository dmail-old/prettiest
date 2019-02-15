import fs from "fs"

const { resolveConfig, getFileInfo, check } = require("prettier")

export const checkFormat = async ({ folder, filenameRelativeArray, afterFormat = () => {} }) => {
  const report = {}

  await Promise.all(
    filenameRelativeArray.map(async (filenameRelative) => {
      const filename = `${folder}/${filenameRelative}`
      const [source, options, info] = await Promise.all([
        getFileContentAsString(filename),
        resolveConfig(filename),
        getFileInfo(filename),
      ])

      const { ignored } = info
      const pretty = ignored ? undefined : check(source, { ...options, filepath: filename })
      afterFormat({ filenameRelative, pretty, ignored })
      report[filenameRelative] = { pretty, ignored }
    }),
  )

  return report
}

const getFileContentAsString = (pathname) =>
  new Promise((resolve, reject) => {
    fs.readFile(pathname, (error, buffer) => {
      if (error) {
        reject(error)
      } else {
        resolve(buffer.toString())
      }
    })
  })
