import { prismaAdmin as prisma } from "../../lib/prisma.js";

// Module platform là của SUPER_ADMIN — thao tác xuyên tổ chức nên dùng prismaAdmin.

export const createRegistrationRequest = (data) =>
  prisma.organizationRegistrationRequest.create({ data });

export const findPendingRequestByEmail = (email) =>
  prisma.organizationRegistrationRequest.findFirst({
    where: { email, status: "PENDING" },
  });

export const findRegistrationRequests = ({ status } = {}) =>
  prisma.organizationRegistrationRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      reviewedBy: { select: { id: true, fullName: true, email: true } },
      organization: { select: { id: true, name: true, slug: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const findRegistrationRequestById = (id) =>
  prisma.organizationRegistrationRequest.findUnique({
    where: { id },
    include: {
      reviewedBy: { select: { id: true, fullName: true, email: true } },
      organization: { select: { id: true, name: true, slug: true, status: true } },
    },
  });

export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

export const findRoleByName = (name) =>
  prisma.role.findUnique({ where: { name } });

export const findOrgBySlug = (slug) =>
  prisma.organization.findUnique({ where: { slug } });

export const findOrgByCode = (code) =>
  prisma.organization.findUnique({ where: { code } });

// Approve = 1 transaction: tạo org + org admin + token kích hoạt + cập nhật request
export const approveRequestTx = ({ requestId, reviewerId, org, admin, activationToken, tokenExpiresAt }) =>
  prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({ data: org });

    const user = await tx.user.create({
      data: {
        email: admin.email,
        passwordHash: admin.passwordHash,
        fullName: admin.fullName,
        phone: admin.phone,
        status: "PENDING",
        organizationId: organization.id,
      },
    });
    await tx.userRole.create({ data: { userId: user.id, roleId: admin.roleId } });
    await tx.emailVerification.create({
      data: { userId: user.id, token: activationToken, expiresAt: tokenExpiresAt },
    });

    const request = await tx.organizationRegistrationRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        organizationId: organization.id,
      },
    });

    return { organization, adminUser: user, request };
  });

export const rejectRequest = ({ requestId, reviewerId, rejectReason }) =>
  prisma.organizationRegistrationRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", reviewedById: reviewerId, reviewedAt: new Date(), rejectReason },
  });

export const findOrganizations = () =>
  prisma.organization.findMany({
    include: {
      _count: { select: { users: true, classes: true, courses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const findOrganizationById = (id) =>
  prisma.organization.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, classes: true, courses: true, programs: true, enrollments: true } },
      registration: { select: { id: true, contactName: true, email: true, phone: true } },
    },
  });

export const updateOrganizationStatus = (id, status) =>
  prisma.organization.update({ where: { id }, data: { status } });

export const platformStats = async () => {
  const [organizations, suspended, pendingRequests, users, classes, enrollments] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { status: "SUSPENDED" } }),
    prisma.organizationRegistrationRequest.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { organizationId: { not: null } } }),
    prisma.class.count(),
    prisma.enrollment.count(),
  ]);
  return { organizations, suspended, pendingRequests, users, classes, enrollments };
};
