import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  const acme = await prisma.tenant.upsert({
    where: { slug: "acme" },
    update: {},
    create: { slug: "acme", name: "Acme", plan: "free" },
  });
  const globex = await prisma.tenant.upsert({
    where: { slug: "globex" },
    update: {},
    create: { slug: "globex", name: "Globex", plan: "free" },
  });

  const hash = await bcrypt.hash("password", 10);

  await prisma.user.upsert({
    where: { email: "admin@acme.test" },
    update: {},
    create: {
      email: "admin@acme.test",
      first_name: "Admin",
      last_name: "Acme",
      password_hash: hash,
      role: "admin",
      tenant_id: acme.id,
      emailVerified: new Date(),
    },
  });
  await prisma.user.upsert({
    where: { email: "user@acme.test" },
    update: {},
    create: {
      email: "user@acme.test",
      first_name: "User",
      last_name: "Acme",
      password_hash: hash,
      role: "member",
      tenant_id: acme.id,
      emailVerified: new Date(),
    },
  });
  await prisma.user.upsert({
    where: { email: "admin@globex.test" },
    update: {},
    create: {
      email: "admin@globex.test",
      first_name: "Admin",
      last_name: "Globex",
      password_hash: hash,
      role: "admin",
      tenant_id: globex.id,
      emailVerified: new Date(),
    },
  });
  await prisma.user.upsert({
    where: { email: "user@globex.test" },
    update: {},
    create: {
      email: "user@globex.test",
      first_name: "User",
      last_name: "Globex",
      password_hash: hash,
      role: "member",
      tenant_id: globex.id,
      emailVerified: new Date(),
    },
  });

  // Get the created users to use as authors
  const acmeAdmin = await prisma.user.findUnique({
    where: { email: "admin@acme.test" },
  });
  const acmeUser = await prisma.user.findUnique({
    where: { email: "user@acme.test" },
  });
  const globexAdmin = await prisma.user.findUnique({
    where: { email: "admin@globex.test" },
  });
  const globexUser = await prisma.user.findUnique({
    where: { email: "user@globex.test" },
  });

  // Create sample notes
  if (acmeAdmin) {
    await prisma.note.upsert({
      where: { id: "acme-note-1" },
      update: {},
      create: {
        id: "acme-note-1",
        tenant_id: acme.id,
        author_id: acmeAdmin.id,
        title: "Welcome to Acme Corporation",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Welcome to the Acme Corporation notes system! This is your first note.",
                },
              ],
            },
          ],
        },
      },
    });
  }

  if (acmeUser) {
    await prisma.note.upsert({
      where: { id: "acme-note-2" },
      update: {},
      create: {
        id: "acme-note-2",
        tenant_id: acme.id,
        author_id: acmeUser.id,
        title: "Meeting Notes - Q1 Planning",
        content: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Q1 Planning Meeting" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Key discussion points for Q1 planning...",
                },
              ],
            },
          ],
        },
      },
    });
  }

  if (globexAdmin) {
    await prisma.note.upsert({
      where: { id: "globex-note-1" },
      update: {},
      create: {
        id: "globex-note-1",
        tenant_id: globex.id,
        author_id: globexAdmin.id,
        title: "Globex Company Policies",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This document contains important company policies and procedures.",
                },
              ],
            },
          ],
        },
      },
    });
  }

  console.log("Seeded database with tenants, users, and sample notes");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
