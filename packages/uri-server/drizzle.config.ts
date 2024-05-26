import '@/drizzle/envConfig';
import { defineConfig } from 'drizzle-kit';
 
export default defineConfig({
  schema: './app/lib/db/schema/*',
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  verbose: true,
  strict: true
});