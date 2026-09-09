import { fetchProjects, fetchHiddenProjectCategories, fetchStones } from "@/lib/data-source"
import { categoryLabels, type ProjectCategory } from "@/lib/data/projects"
import { ProjectsPageClient } from "@/components/projects-page-client"
import { PortfolioFallback } from "@/components/portfolio-fallback"

export const revalidate = 60

export default async function ProjectsPage() {
  const [projects, hidden] = await Promise.all([
    fetchProjects(),
    fetchHiddenProjectCategories(),
  ])

  const visibleCategories = (Object.keys(categoryLabels) as ProjectCategory[]).filter(
    (c) => !hidden.includes(c)
  )
  const visibleProjects = projects.filter((p) => visibleCategories.includes(p.category))

  // Порожнє портфоліо — показуємо виконані роботи з каталогу, а не прочерк.
  if (visibleProjects.length === 0) {
    const stones = await fetchStones()
    return <PortfolioFallback stones={stones} />
  }

  return (
    <ProjectsPageClient initialProjects={projects} initialVisibleCategories={visibleCategories} />
  )
}
