import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL이 .env.local에 설정되어 있지 않습니다.");
}

export const db = drizzle({ client: neon(databaseUrl), schema });
