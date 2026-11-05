const { loadEnvConfig } = require("@next/env")
const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcryptjs")
const { randomBytes } = require("node:crypto")
const { writeFile } = require("node:fs/promises")
const path = require("node:path")

loadEnvConfig(process.cwd())

const prisma = new PrismaClient()
const projectRef = "qzrxeytutiwizzlhybgq"
const organizationId = "demo-organization-20261030"
const users = [
  {
    id: "demo-hr-20261030",
    email: "demo.hr@tafsula.example",
    name: "Demo HR Manager",
    role: "HR",
    avatarId: 3,
    headline: "People and Operations",
    roleTitle: "HR Manager",
  },
  {
    id: "demo-member-ava-20261030",
    email: "ava.morgan@tafsula.example",
    name: "Ava Morgan",
    role: "MEMBER",
    avatarId: 5,
    headline: "Product designer",
    roleTitle: "UX Designer",
  },
  {
    id: "demo-member-liam-20261030",
    email: "liam.chen@tafsula.example",
    name: "Liam Chen",
    role: "MEMBER",
    avatarId: 2,
    headline: "Full-stack developer",
    roleTitle: "Software Engineer",
  },
  {
    id: "demo-member-noor-20261030",
    email: "noor.haddad@tafsula.example",
    name: "Noor Haddad",
    role: "MEMBER",
    avatarId: 7,
    headline: "Growth and partnerships",
    roleTitle: "Growth Lead",
  },
]

function assertTargetDatabase() {
  for (const variable of ["DATABASE_URL", "DIRECT_URL"]) {
    if (!process.env[variable]) {
      throw new Error(`${variable} is missing from the project .env file`)
    }
  }

  const applicationUrl = new URL(process.env.DATABASE_URL)
  const migrationUrl = new URL(process.env.DIRECT_URL)
  const isSupabaseHost = (hostname) =>
    hostname.endsWith(".supabase.com") || hostname.endsWith(".supabase.co")
  const identifiesProject = [applicationUrl, migrationUrl].some(
    (url) =>
      url.hostname.includes(projectRef) ||
      decodeURIComponent(url.username).includes(projectRef),
  )

  if (
    !isSupabaseHost(applicationUrl.hostname) ||
    !isSupabaseHost(migrationUrl.hostname) ||
    !identifiesProject
  ) {
    throw new Error("Database URLs do not identify the confirmed Supabase project")
  }
}

async function main() {
  assertTargetDatabase()

  const existingOrganization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  })
  if (existingOrganization) {
    throw new Error(
      "Demo organization already exists; refusing to alter existing Production data",
    )
  }

  const existingUsers = await prisma.user.findMany({
    where: { email: { in: users.map(({ email }) => email) } },
    select: { email: true },
  })
  if (existingUsers.length) {
    throw new Error(
      `Demo account email already exists (${existingUsers[0].email}); no data was inserted`,
    )
  }

  const credentials = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: randomBytes(24).toString("base64url"),
    })),
  )
  const passwordHashes = await Promise.all(
    credentials.map(({ password }) => hash(password, 12)),
  )
  const now = new Date()
  const credentialDocument = [
    "# Local demo login credentials",
    "",
    "These unique demo passwords were generated for this database seed. This file is ignored by Git; do not commit or share it.",
    "",
    "| Role | Email | Password |",
    "| --- | --- | --- |",
    ...credentials.map(
      (user) => `| ${user.role} | ${user.email} | \`${user.password}\` |`,
    ),
    "",
    "These accounts contain fictional demo data only. Rotate or delete them before exposing the deployment publicly.",
    "",
  ].join("\n")

  await prisma.$transaction(async (tx) => {
    await tx.organization.create({
      data: {
        id: organizationId,
        name: "Tafsula Demo Team",
        createdById: users[0].id,
        createdAt: now,
        updatedAt: now,
      },
    })

    for (const [index, user] of credentials.entries()) {
      await tx.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: passwordHashes[index],
          role: user.role,
          avatarId: user.avatarId,
          organizationId,
          invitedById: user.role === "HR" ? null : users[0].id,
          memberStatus: "ACCEPTED",
          createdAt: now,
          updatedAt: now,
        },
      })

      await tx.profile.create({
        data: {
          userId: user.id,
          headline: user.headline,
          bio: `Fictional demo profile for ${user.name}.`,
          location: "Remote",
          roleTitle: user.roleTitle,
          createdAt: now,
          updatedAt: now,
        },
      })
    }

    const projectId = "demo-project-20261030"
    await tx.project.create({
      data: {
        id: projectId,
        organizationId,
        title: "Team Collaboration Demo",
        description:
          "A sample project for exploring team planning and collaboration.",
        type: "internal",
        status: "in-progress",
        visibility: "ORG",
        createdById: users[0].id,
        createdAt: now,
        updatedAt: now,
      },
    })

    const teamId = "demo-team-20261030"
    await tx.team.create({
      data: {
        id: teamId,
        organizationId,
        name: "Product Launch Team",
        purpose: "Coordinate the sample product launch.",
        description: "Fictional team for demonstrating collaboration features.",
        status: "active",
        visibility: "ORG",
        createdById: users[0].id,
        projectId,
        createdAt: now,
        updatedAt: now,
      },
    })

    await tx.teamMember.createMany({
      data: users.map((user, index) => ({
        id: `demo-team-member-${index + 1}-20261030`,
        teamId,
        userId: user.id,
        roleInTeam: user.role === "HR" ? "Lead" : user.roleTitle,
        status: "ACCEPTED",
        createdAt: now,
      })),
    })

    await tx.task.createMany({
      data: [
        {
          id: "demo-task-research-20261030",
          projectId,
          title: "Gather customer feedback",
          description: "Collect and summarize feedback for the demo project.",
          status: "in-progress",
          priority: "high",
          assigneeId: users[1].id,
          createdById: users[0].id,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "demo-task-prototype-20261030",
          projectId,
          title: "Prepare a launch prototype",
          description: "Create a sample prototype for the team review.",
          status: "todo",
          priority: "medium",
          assigneeId: users[2].id,
          createdById: users[0].id,
          createdAt: now,
          updatedAt: now,
        },
      ],
    })
  })

  await writeFile(
    path.join(process.cwd(), "credentials.md"),
    credentialDocument,
    { encoding: "utf8", mode: 0o600 },
  )

  console.log(
    "Inserted 1 demo organization, 4 demo users/profiles, 1 team, 1 project, and 2 tasks.",
  )
  console.log("Generated demo login credentials in the ignored local credentials.md.")
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
