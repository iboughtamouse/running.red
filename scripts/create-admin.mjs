import { hash } from "bcryptjs";
import pg from "pg";

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

const passwordHash = await hash(password, 12);

await client.query(
  `INSERT INTO admin_users (email, password_hash)
   VALUES ($1, $2)
   ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
  [email, passwordHash]
);

console.log(`Admin user created/updated: ${email}`);

await client.end();
