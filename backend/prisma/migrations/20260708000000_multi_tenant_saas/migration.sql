-- Multi-tenant SaaS: Organization + OrganizationRegistrationRequest
-- Dữ liệu hiện có được gán vào Organization mặc định (org_default), không mất dữ liệu.

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "maxUsers" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_registration_requests" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "expectedUsers" INTEGER,
    "note" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_registration_requests_pkey" PRIMARY KEY ("id")
);

-- Organization mặc định cho toàn bộ dữ liệu hiện có
INSERT INTO "organizations" ("id", "name", "slug", "status", "plan", "createdAt", "updatedAt")
VALUES ('org_default', 'Default Organization', 'default', 'ACTIVE', 'FREE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Thêm cột nullable rồi backfill
ALTER TABLE "users"       ADD COLUMN "organizationId" TEXT;
ALTER TABLE "programs"    ADD COLUMN "organizationId" TEXT;
ALTER TABLE "courses"     ADD COLUMN "organizationId" TEXT;
ALTER TABLE "classes"     ADD COLUMN "organizationId" TEXT;
ALTER TABLE "enrollments" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "lectures"    ADD COLUMN "organizationId" TEXT;

UPDATE "users"       SET "organizationId" = 'org_default';
UPDATE "programs"    SET "organizationId" = 'org_default';
UPDATE "courses"     SET "organizationId" = 'org_default';
UPDATE "classes"     SET "organizationId" = 'org_default';
UPDATE "enrollments" SET "organizationId" = 'org_default';
UPDATE "lectures"    SET "organizationId" = 'org_default';

-- Siết NOT NULL (users giữ nullable: NULL = SUPER_ADMIN)
ALTER TABLE "programs"    ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "courses"     ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "classes"     ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "enrollments" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "lectures"    ALTER COLUMN "organizationId" SET NOT NULL;

-- Unique code: global -> per-organization
DROP INDEX "classes_code_key";
DROP INDEX "courses_code_key";
DROP INDEX "programs_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_registration_requests_organizationId_key" ON "organization_registration_requests"("organizationId");

-- CreateIndex
CREATE INDEX "organization_registration_requests_status_createdAt_idx" ON "organization_registration_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "classes_organizationId_status_idx" ON "classes"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "classes_organizationId_code_key" ON "classes"("organizationId", "code");

-- CreateIndex
CREATE INDEX "courses_organizationId_idx" ON "courses"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_organizationId_code_key" ON "courses"("organizationId", "code");

-- CreateIndex
CREATE INDEX "enrollments_organizationId_idx" ON "enrollments"("organizationId");

-- CreateIndex
CREATE INDEX "lectures_organizationId_ownerId_idx" ON "lectures"("organizationId", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "programs_organizationId_code_key" ON "programs"("organizationId", "code");

-- CreateIndex
CREATE INDEX "users_organizationId_status_idx" ON "users"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "organization_registration_requests" ADD CONSTRAINT "organization_registration_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_registration_requests" ADD CONSTRAINT "organization_registration_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Role mới cho multi-tenant + nâng ADMIN hiện tại thành ORG_ADMIN
INSERT INTO "roles" ("id", "name", "createdAt") VALUES
  ('role_super_admin', 'SUPER_ADMIN', CURRENT_TIMESTAMP),
  ('role_org_admin',   'ORG_ADMIN',   CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "user_roles" ("userId", "roleId", "assignedAt")
SELECT ur."userId", 'role_org_admin', CURRENT_TIMESTAMP
FROM "user_roles" ur
JOIN "roles" r ON r."id" = ur."roleId"
WHERE r."name" = 'ADMIN'
ON CONFLICT DO NOTHING;
