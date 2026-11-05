const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:@localhost:3306/mysql"
    }
  }
})

async function main() {
  const result = await prisma.$queryRawUnsafe('SHOW VARIABLES LIKE "datadir";')
  console.log(JSON.stringify(result, null, 2))
}

main()
  .then(() => process.exit(0))
  // ...
