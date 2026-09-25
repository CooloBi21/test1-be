import 'dotenv/config';

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillUserRoles() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!superAdminEmail) {
    throw new Error(
      'SUPER_ADMIN_EMAIL must be configured before backfilling user roles.',
    );
  }

  const roles = await prisma.roles.findMany({
    where: {
      name: {
        in: ['renter', 'landlord', 'admin', 'super_admin'],
      },
    },
  });

  const roleMap = new Map(
    roles.map((role) => [role.name, role.id]),
  );

  const requiredRoles = [
    'renter',
    'landlord',
    'admin',
    'super_admin',
  ];

  for (const roleName of requiredRoles) {
    if (!roleMap.has(roleName)) {
      throw new Error(`RBAC role not found: ${roleName}`);
    }
  }

  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      role_id: true,
    },
  });

  for (const user of users) {
    const roleName =
      user.email === superAdminEmail
        ? 'super_admin'
        : (user.role as Role);

    const roleId = roleMap.get(roleName);

    if (!roleId) {
      throw new Error(
        `Cannot map user ${user.id} to RBAC role: ${roleName}`,
      );
    }

    await prisma.users.update({
      where: { id: user.id },
      data: {
        role_id: roleId,
      },
    });
  }

  console.log(`Backfilled ${users.length} users successfully.`);
}

backfillUserRoles()
  .catch((error) => {
    console.error('Failed to backfill user roles:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });