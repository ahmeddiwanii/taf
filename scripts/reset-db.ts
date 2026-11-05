import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/mysql"
    }
  }
})

async function main() {
  console.log("Dropping and recreating the tafs database to fix engine corruption...")
  await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS tafs;`)
  await prisma.$executeRawUnsafe(`CREATE DATABASE tafs;`)
  console.log("Database reset successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
