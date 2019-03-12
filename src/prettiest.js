import {
  checkFormat,
  STATUS_ERRORED,
  STATUS_IGNORED,
  STATUS_UGLY,
  STATUS_PRETTY,
} from "./checkFormat.js"
import {
  erroredStyle,
  ignoredStyle,
  uglyStyle,
  prettyStyle,
  erroredStyleWithIcon,
  ignoredStyleWithIcon,
  uglyStyleWithIcon,
  prettyStyleWithIcon,
} from "./style.js"

export const prettiest = async ({ folder, filenameRelativeArray }) => {
  console.log(`
-------------- format check start -----------------
`)

  const report = await checkFormat({
    folder,
    filenameRelativeArray,
    afterFormat: ({ filenameRelative, status, statusDetail }) => {
      if (status === STATUS_ERRORED) {
        console.log(`${filenameRelative} -> ${erroredStyleWithIcon("errored")}`)
        console.log(statusDetail)
      }

      if (status === STATUS_IGNORED) {
        console.log(`${filenameRelative} -> ${ignoredStyleWithIcon("ignored")}`)
        return
      }

      if (status === STATUS_UGLY) {
        console.log(`${filenameRelative} -> ${uglyStyleWithIcon("ugly")}`)
        return
      }

      console.log(`${filenameRelative} -> ${prettyStyleWithIcon("pretty")}`)
    },
  })

  const erroredArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_ERRORED,
  )
  const ignoredArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_IGNORED,
  )
  const uglyArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_UGLY,
  )
  const prettyArray = filenameRelativeArray.filter(
    (filenameRelativeArray) => report[filenameRelativeArray].status === STATUS_PRETTY,
  )

  console.log(`
-------------- format check result ----------------
${filenameRelativeArray.length} files format checked
- ${erroredStyle(`${erroredArray.length} errored`)}
- ${ignoredStyle(`${ignoredArray.length} ignored`)}
- ${uglyStyle(`${uglyArray.length} ugly`)}
- ${prettyStyle(`${prettyArray.length} pretty`)}
---------------------------------------------------`)

  if (uglyArray.length || erroredArray.length) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}
