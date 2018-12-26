import { generateReport } from "./generateReport.js"

export const prettiest = async (options) => {
  const report = await generateReport(options)
  const uglyFiles = Object.keys(report).filter((file) => {
    return report[file] === false
  })

  if (uglyFiles.length) {
    console.warn(`${uglyFiles.length} files are ugly (does not respect prettier.config.js)`)
    console.warn(uglyFiles.join("\n"))
    process.exit(1)
  } else {
    console.log(`${Object.keys(report).length} files are pretty :)`)
    process.exit(0)
  }
}
