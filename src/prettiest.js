import { checkFormat } from "./checkFormat.js"
import {
  prettyStyle,
  uglyStyle,
  ignoredStyle,
  prettyStyleWithIcon,
  uglyStyleWithIcon,
  ignoredStyleWithIcon,
} from "./style.js"

export const prettiest = async ({ localRoot, ressources }) => {
  const report = await checkFormat({
    localRoot,
    ressources,
    afterFormat: ({ ressource, pretty, ignored }) => {
      if (ignored) {
        console.log(`${ressource} -> ${ignoredStyleWithIcon("ignored")}`)
        return
      }
      if (pretty) {
        console.log(`${ressource} -> ${prettyStyleWithIcon("pretty")}`)
        return
      }
      console.log(`${ressource} -> ${uglyStyleWithIcon("ugly")}`)
    },
  })

  const prettyArray = ressources.filter((ressource) => {
    return !report[ressource].ignored && report[ressource].pretty
  })
  const uglyArray = ressources.filter((ressource) => {
    return !report[ressource].ignored && !report[ressource].pretty
  })
  const ignoredArray = ressources.filter((ressource) => {
    return report[ressource].ignored
  })

  console.log(
    `${ressources.length} files:
- ${prettyStyle(`${prettyArray.length} pretty`)}
- ${uglyStyle(`${uglyArray.length} ugly`)}
- ${ignoredStyle(`${ignoredArray.length} ignored`)}`,
  )

  if (uglyArray.length) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}
