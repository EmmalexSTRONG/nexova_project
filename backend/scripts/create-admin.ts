// One-off/ops utility: provisions an ADMIN user directly in the database,
// bypassing the public registration endpoints (which don't expose an admin
// role). Usage:
//   npx tsx scripts/create-admin.ts <email> <password> [name] [phone]
import { prisma } from "../utils/prisma";
import { hashPassword } from "../utils/password";

async function main() {
  const [email, password, name = "Admin", phone] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts <email> <password> [name] [phone]");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", status: "ACTIVE", emailVerified: new Date(), phone },
    create: {
      email,
      phone,
      name,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, permissions: [] },
  });

  console.log(`Admin ready: ${user.email} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
