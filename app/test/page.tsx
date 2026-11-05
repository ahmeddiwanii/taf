import { redirect } from "next/navigation"

/** DISC / colors assessment removed — send users to club discovery. */
export default function TestRemovedPage() {
  redirect("/organizations")
}
