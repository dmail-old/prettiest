import { checkFormat } from "./checkFormat.js"
import {
  prettyStyle,
  uglyStyle,
  ignoredStyle,
  prettyStyleWithIcon,
  uglyStyleWithIcon,
  ignoredStyleWithIcon,
} from "./style.js"

export const prettiest = async ({ folder, filenameRelativeArray }) => {
  console.log(`
-------------- format check start -----------------
`)

  const report = await checkFormat({
    folder,
    filenameRelativeArray,
    afterFormat: ({ filenameRelative, pretty, ignored }) => {
      if (ignored) {
        console.log(`${filenameRelative} -> ${ignoredStyleWithIcon("ignored")}`)
        return
      }
      if (pretty) {
        console.log(`${filenameRelative} -> ${prettyStyleWithIcon("pretty")}`)
        return
      }
      console.log(`${filenameRelative} -> ${uglyStyleWithIcon("ugly")}`)
    },
  })

  const prettyArray = filenameRelativeArray.filter(
    (filenameRelativeArray) =>
      !report[filenameRelativeArray].ignored && report[filenameRelativeArray].pretty,
  )
  const uglyArray = filenameRelativeArray.filter(
    (filenameRelativeArray) =>
      !report[filenameRelativeArray].ignored && !report[filenameRelativeArray].pretty,
  )
  const ignoredArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].ignored,
  )

  console.log(`
-------------- format check result ----------------
${filenameRelativeArray.length} files format checked
- ${prettyStyle(`${prettyArray.length} pretty`)}
- ${uglyStyle(`${uglyArray.length} ugly`)}
- ${ignoredStyle(`${ignoredArray.length} ignored`)}
---------------------------------------------------`)

  if (uglyArray.length) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}
