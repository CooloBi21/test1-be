import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRoles() {
  const roles = [
    {
      name: 'renter',
      description: 'Người thuê phòng',
    },
    {
      name: 'landlord',
      description: 'Chủ phòng trọ',
    },
    {
      name: 'admin',
      description: 'Quản trị viên',
    },
    {
      name: 'super_admin',
      description: 'Quản trị viên cấp cao',
    },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  console.log('RBAC roles seeded successfully.');
}

async function seedPermissions() {
  const permissions = [
    {
      name: 'user.read',
      description: 'Xem danh sách người dùng',
    },
    {
      name: 'user.ban',
      description: 'Khóa hoặc mở khóa người dùng',
    },
    {
      name: 'room.read.admin',
      description: 'Xem danh sách phòng trọ trong khu vực quản trị',
    },
    {
      name: 'room.status.update',
      description: 'Cập nhật trạng thái phòng trọ',
    },
    {
      name: 'report.read',
      description: 'Xem danh sách báo cáo',
    },
    {
      name: 'report.status.update',
      description: 'Cập nhật trạng thái báo cáo',
    },
    {
      name: 'support.read',
      description: 'Xem danh sách yêu cầu hỗ trợ',
    },
    {
      name: 'support.update',
      description: 'Xử lý yêu cầu hỗ trợ',
    },
    {
      name: 'user.role.update',
      description: 'Thay đổi vai trò người dùng',
    },
  ];

  for (const permission of permissions) {
    await prisma.permissions.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  console.log('RBAC permissions seeded successfully.');
}

async function seedRolePermissions() {
  const adminRole = await prisma.roles.findUnique({
    where: { name: 'admin' },
  });

  const superAdminRole = await prisma.roles.findUnique({
    where: { name: 'super_admin' },
  });

  if (!adminRole || !superAdminRole) {
    throw new Error('RBAC roles must be seeded before role permissions.');
  }

  const permissions = await prisma.permissions.findMany({
    where: {
      name: {
        in: [
          'user.read',
          'user.ban',
          'room.read.admin',
          'room.status.update',
          'report.read',
          'report.status.update',
          'support.read',
          'support.update',
          'user.role.update',
        ],
      },
    },
  });

  const permissionMap = new Map(
    permissions.map((permission) => [permission.name, permission.id]),
  );

  const adminPermissionNames = [
    'user.read',
    'user.ban',
    'room.read.admin',
    'room.status.update',
    'report.read',
    'report.status.update',
    'support.read',
    'support.update',
  ];

  const superAdminPermissionNames = [
    ...adminPermissionNames,
    'user.role.update',
  ];

  for (const permissionName of adminPermissionNames) {
    const permissionId = permissionMap.get(permissionName);

    if (!permissionId) {
      throw new Error(`Permission not found: ${permissionName}`);
    }

    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: permissionId,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: permissionId,
      },
    });
  }

  for (const permissionName of superAdminPermissionNames) {
    const permissionId = permissionMap.get(permissionName);

    if (!permissionId) {
      throw new Error(`Permission not found: ${permissionName}`);
    }

    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: superAdminRole.id,
          permission_id: permissionId,
        },
      },
      update: {},
      create: {
        role_id: superAdminRole.id,
        permission_id: permissionId,
      },
    });
  }

  console.log('RBAC role permissions seeded successfully.');
}

async function main() {
  await seedRoles();
  await seedPermissions();
  await seedRolePermissions();

  console.log('RBAC seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Failed to seed RBAC:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  }
);
