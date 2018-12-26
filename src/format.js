import { forEachRessourceMatching } from "@dmail/project-structure"
import { prettiest } from "./prettiest.js"

export const format = async ({ localRoot, metaMap }) => {
  const ressources = await forEachRessourceMatching(
    localRoot,
    metaMap,
    ({ prettify }) => prettify,
    (ressource) => ressource,
  )
  const files = ressources.map((ressource) => `${localRoot}/${ressource}`)
  return prettiest({ files })
}
