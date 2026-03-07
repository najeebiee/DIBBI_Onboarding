import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.import" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  let page = 1;
  const perPage = 1000;
  let totalDeleted = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    if (users.length === 0) break;

    const dibbiUsers = users.filter((u) => u.email?.endsWith("@dibbi.local"));

    for (const user of dibbiUsers) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) {
        console.error(`Failed to delete ${user.email}:`, deleteError.message);
      } else {
        totalDeleted += 1;
        console.log(`Deleted ${user.email}`);
      }
    }

    page += 1;
  }

  console.log(`Done. Deleted ${totalDeleted} auth users.`);
}

main().catch((err) => {
  console.error("Rollback failed:", err);
  process.exit(1);
});