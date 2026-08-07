import { fetchProjects, fetchHiddenProjectCategories } from "@/lib/data-source"
import { categoryLabels, type ProjectCategory } from "@/lib/data/projects"
import { ProjectsPageClient } from "@/components/projects-page-client"

export const revalidate = 60

export default async function ProjectsPage() {
  const [projects, hidden] = await Promise.all([
    fetchProjects(),
    fetchHiddenProjectCategories(),
  ])

  const visibleCategories = (Object.keys(categoryLabels) as ProjectCategory[]).filter(
    (c) => !hidden.includes(c)
  )

  return (
    <ProjectsPageClient initialProjects={projects} initialVisibleCategories={visibleCategories} />
  )
}
