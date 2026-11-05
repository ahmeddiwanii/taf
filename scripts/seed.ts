const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user first (without organization)
  const adminPassword = await bcryptjs.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tafsula.com" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Admin User",
      email: "admin@tafsula.com",
      password: adminPassword,
      role: "SUPERADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create organization with admin as creator
  const organization = await prisma.organization.upsert({
    where: { id: "sample-organization-001" },
    update: {},
    create: {
      id: "sample-organization-001",
      name: "Sample Organization",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: admin.id,
    },
  });

  // Create HR user
  const hrPassword = await bcryptjs.hash("hr123", 10);
  const hr = await prisma.user.upsert({
    where: { email: "hr@sampleorganization.com" },
    update: {},
    create: {
      id: uuidv4(),
      name: "HR Manager",
      email: "hr@sampleorganization.com",
      password: hrPassword,
      role: "HR",
      organizationId: organization.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create member user
  const memberPassword = await bcryptjs.hash("member123", 10);
  const member1 = await prisma.user.upsert({
    where: { email: "john@sampleorganization.com" },
    update: {},
    create: {
      id: uuidv4(),
      name: "John Doe",
      email: "john@sampleorganization.com",
      password: memberPassword,
      role: "MEMBER",
      organizationId: organization.id,
      invitedById: hr.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create another member user
  const member2Password = await bcryptjs.hash("member123", 10);
  const member2 = await prisma.user.upsert({
    where: { email: "jane@sampleorganization.com" },
    update: {},
    create: {
      id: uuidv4(),
      name: "Jane Smith",
      email: "jane@sampleorganization.com",
      password: member2Password,
      role: "MEMBER",
      organizationId: organization.id,
      invitedById: hr.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Created users: admin, hr, members`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
