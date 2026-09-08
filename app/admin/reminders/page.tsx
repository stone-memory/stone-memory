import { redirect } from "next/navigation"

// «Нагадування» обʼєднано з «Особистими задачами» в один розділ /admin/tasks.
export default function RemindersRedirect() {
  redirect("/admin/tasks")
}
