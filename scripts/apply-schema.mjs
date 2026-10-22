// Creates the database schema automatically, so a fresh Supabase project (for example one made by
// the Vercel Supabase integration) works from the first deploy without running any SQL by hand.
//
// Runs before every build. It is safe to run repeatedly:
//   - no tables yet          -> runs supabase/schema_from_scratch.sql (everything)
//   - older schema, no partners -> runs only the partner migration
//   - up to date             -> does nothing
// Without a database URL (local builds) it does nothing at all.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rawUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!rawUrl) {
  console.log("[schema] No POSTGRES_URL_NON_POOLING / POSTGRES_URL / DATABASE_URL set, skipping.");
  process.exit(0);
}

// Supabase's own certificate chain is not in Node's trust store, so TLS is used without chain
// verification. Local databases (tests) are used without TLS.
const url = new URL(rawUrl);
url.searchParams.delete("sslmode");
const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
const client = new pg.Client({
  connectionString: url.toString(),
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function run(file) {
  const sql = readFileSync(join(root, file), "utf8");
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

try {
  await client.connect();
  const { rows } = await client.query(
    "select to_regclass('public.estimates') as estimates, to_regclass('public.partners') as partners",
  );
  const { estimates, partners } = rows[0];
  if (!estimates) {
    console.log("[schema] Empty database: creating the full schema ...");
    await run("supabase/schema_from_scratch.sql");
    console.log("[schema] Done.");
  } else if (!partners) {
    console.log("[schema] Adding the partner tables ...");
    await run("supabase/migrations/20261013090000_partner_directory_and_quote_requests.sql");
    console.log("[schema] Done.");
  } else {
    console.log("[schema] Database is up to date.");
  }
} catch (error) {
  console.error("[schema] Failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
