import fs from "fs"

const { resolveConfig, getFileInfo, check } = require("prettier")

export const STATUS_IGNORED = "ignored"
export const STATUS_PRETTY = "pretty"
export const STATUS_UGLY = "ugly"
export const STATUS_ERRORED = "errored"

export const checkFormat = async ({ folder, filenameRelativeArray, afterFormat = () => {} }) => {
  const report = {}

  await Promise.all(
    filenameRelativeArray.map(async (filenameRelative) => {
      const filename = `${folder}/${filenameRelative}`
      let status
      let statusDetail

      try {
        const [source, options, info] = await Promise.all([
          getFileContentAsString(filename),
          resolveConfig(filename),
          getFileInfo(filename),
        ])

        const { ignored } = info
        if (ignored) {
          status = STATUS_IGNORED
        } else {
          const pretty = check(source, { ...options, filepath: filename })
          status = pretty ? STATUS_PRETTY : STATUS_UGLY
        }
      } catch (e) {
        status = STATUS_ERRORED
        statusDetail = e
      }

      afterFormat({ filenameRelative, status, statusDetail })
      report[filenameRelative] = { status, statusDetail }
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
