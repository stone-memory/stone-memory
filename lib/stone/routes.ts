import { getArticles, getCollections, getProjects, getSettings } from '@/lib/stone/cms'
import { buildPaths } from '@/lib/stone/paths'

export { staticPaths } from '@/lib/stone/paths'

/** Усі публічні шляхи з поточного контенту CMS (див. lib/paths.ts). */
export async function getAllPaths(): Promise<string[]> {
  const [collections, projects, articles, settings] = await Promise.all([
    getCollections(),
    getProjects(),
    getArticles(),
    getSettings(),
  ])
  return buildPaths({ collections, projects, articles, settings })
}

export async function getKnownPaths(): Promise<Set<string>> {
  return new Set(['/', ...(await getAllPaths())])
}
