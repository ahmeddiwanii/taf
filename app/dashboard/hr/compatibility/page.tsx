import { redirect } from "next/navigation"

/** Team compatibility / DISC insights removed. */
export default function CompatibilityRemovedPage() {
  redirect("/dashboard/hr")
}
