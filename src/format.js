import { forEachRessourceMatching } from "@dmail/project-structure"
import { prettiest } from "./prettiest.js"

export const format = async ({ localRoot, metaMap }) => {
  const ressources = await forEachRessourceMatching({
    localRoot,
    metaMap,
    predicate: (meta) => meta.format === true,
  })
  return prettiest({ localRoot, ressources })
}
