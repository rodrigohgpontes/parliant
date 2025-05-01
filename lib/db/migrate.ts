import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { migrate } from "drizzle-orm/neon-http/migrator"

// This script is meant to be run from the command line to apply migrations
async function main() {
  const sql = neon(process.env.POSTGRES_URL!)
  const db = drizzle(sql)

  console.log("Running migrations...")

  await migrate(db, { migrationsFolder: "drizzle" })

  console.log("Migrations completed!")

  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed!")
  console.error(err)
  process.exit(1)
})
