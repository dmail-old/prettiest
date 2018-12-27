import fs from "fs"

const { resolveConfig, getFileInfo, check } = require("prettier")

export const checkFormat = async ({ localRoot, ressources, afterFormat = () => {} }) => {
  const report = {}

  await Promise.all(
    ressources.map(async (ressource) => {
      const file = `${localRoot}/${ressource}`
      const [source, options, info] = await Promise.all([
        getFileContentAsString(file),
        resolveConfig(file),
        getFileInfo(file),
      ])

      const { ignored } = info
      const pretty = ignored ? undefined : check(source, { ...options, filepath: file })
      afterFormat({ ressource, pretty, ignored })
      report[ressource] = { pretty, ignored }
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
