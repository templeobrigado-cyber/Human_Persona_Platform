import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // CLI（migrate/db push）はプール接続だと張れないセッションを使うため、直接接続(DIRECT_URL)を使う。
  // アプリ実行時の接続(src/lib/db.ts)は引き続きプール接続(DATABASE_URL)を使う。
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
