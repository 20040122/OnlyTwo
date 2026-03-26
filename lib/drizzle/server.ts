import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/drizzle/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing environment variable: DATABASE_URL");
}

// Supabase transaction poolers do not support prepared statements.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
