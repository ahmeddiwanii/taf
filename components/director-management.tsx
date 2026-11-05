import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface Director {
  id: string
  type: "project" | "event" | "team"
  resourceId: string
  resourceName: string
  director: {
    id: string
    name: string
    email: string
  }
  role: string
  assignedAt: string
}

interface DirectorManagementProps {
  type: "project" | "event" | "team"
  resourceId: string
  resourceName: string
}

export function DirectorManagement({
  type,
  resourceId,
  resourceName,
}: DirectorManagementProps) {
  const { toast } = useToast()
  const [directors, setDirectors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [role, setRole] = useState("DIRECTOR")
  const [members, setMembers] = useState<any[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Fetch directors
  useEffect(() => {
    fetchDirectors()
    fetchMembers()
  }, [resourceId, type])

  const fetchDirectors = async () => {
    try {
      const res = await fetch(
        `/api/${type === "project" ? "projects" : type === "event" ? "events" : "teams"}/${resourceId}/directors`
      )
      const data = await res.json()
      setDirectors(data.directors || [])
    } catch (error) {
      console.error("Error fetching directors:", error)
    }
  }

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true)
      const res = await fetch("/api/members")
      const data = await res.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleAssignDirector = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select an member",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const res = await fetch(
        `/api/${type === "project" ? "projects" : type === "event" ? "events" : "teams"}/${resourceId}/directors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUserId,
            role,
          }),
        }
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error)
      }

      toast({
        title: "Success",
        description: "Director assigned successfully",
      })

      setSelectedUserId("")
      setRole("DIRECTOR")
      fetchDirectors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveDirector = async (directorId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this director?")) return

    try {
      const res = await fetch(
        `/api/${type === "project" ? "projects" : type === "event" ? "events" : "teams"}/${resourceId}/directors`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      )

      if (!res.ok) {
        throw new Error("Failed to remove director")
      }

      toast({
        title: "Success",
        description: "Director removed successfully",
      })

      fetchDirectors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Director Management</CardTitle>
        <CardDescription>
          {resourceName} - Manage directors and managers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assign Director Form */}
        <form onSubmit={handleAssignDirector} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIRECTOR">Director</SelectItem>
                <SelectItem value="CO_DIRECTOR">Co-Director</SelectItem>
                <SelectItem value="LEAD">Lead</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" disabled={loading || !selectedUserId}>
              {loading ? "Assigning..." : "Assign Director"}
            </Button>
          </div>
        </form>

        {/* Directors List */}
        <div className="space-y-2">
          <h3 className="font-semibold">Assigned Directors</h3>
          {directors.length === 0 ? (
            <p className="text-sm text-gray-500">
              No directors assigned yet
            </p>
          ) : (
            <div className="space-y-2">
              {directors.map((director) => (
                <div
                  key={director.id}
                  className="flex items-center justify-between rounded border p-3 bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{director.user.name}</p>
                    <p className="text-sm text-gray-600">{director.user.email}</p>
                    <p className="text-xs text-gray-500">
                      Role: {director.role}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleRemoveDirector(director.id, director.user.id)
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
