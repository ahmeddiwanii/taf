import { redirect } from "next/navigation"

/** DISC results removed — profile is the home for identity. */
export default function MemberResultsRemovedPage() {
  redirect("/dashboard/member/profile")
}
