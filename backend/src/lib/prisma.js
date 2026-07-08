import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCurrentOrgId } from "./tenantContext.js";
import ApiError from "../utils/apiError.js";

const { PrismaClient } = pkg;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Model có cột organizationId trực tiếp
const TENANT_MODELS = new Set(["User", "Program", "Course", "Class", "Enrollment", "Lecture", "ImportJob"]);

// Model con: scope gián tiếp qua đường quan hệ tới organizationId.
// filter: điều kiện where được tự chèn vào các query dạng danh sách.
// select/get: đường lấy organizationId để tiền kiểm các thao tác theo unique key.
const CHILD_MODELS = {
  Module: {
    filter: (orgId) => ({ lecture: { organizationId: orgId } }),
    select: { lecture: { select: { organizationId: true } } },
    get: (r) => r.lecture?.organizationId,
  },
  Content: {
    filter: (orgId) => ({ module: { lecture: { organizationId: orgId } } }),
    select: { module: { select: { lecture: { select: { organizationId: true } } } } },
    get: (r) => r.module?.lecture?.organizationId,
  },
  Video: {
    filter: (orgId) => ({ content: { module: { lecture: { organizationId: orgId } } } }),
    select: { content: { select: { module: { select: { lecture: { select: { organizationId: true } } } } } } },
    get: (r) => r.content?.module?.lecture?.organizationId,
  },
  Document: {
    filter: (orgId) => ({ content: { module: { lecture: { organizationId: orgId } } } }),
    select: { content: { select: { module: { select: { lecture: { select: { organizationId: true } } } } } } },
    get: (r) => r.content?.module?.lecture?.organizationId,
  },
  Quiz: {
    filter: (orgId) => ({ content: { module: { lecture: { organizationId: orgId } } } }),
    select: { content: { select: { module: { select: { lecture: { select: { organizationId: true } } } } } } },
    get: (r) => r.content?.module?.lecture?.organizationId,
  },
  Question: {
    filter: (orgId) => ({ quiz: { content: { module: { lecture: { organizationId: orgId } } } } }),
    select: { quiz: { select: { content: { select: { module: { select: { lecture: { select: { organizationId: true } } } } } } } } },
    get: (r) => r.quiz?.content?.module?.lecture?.organizationId,
  },
  Answer: {
    filter: (orgId) => ({ question: { quiz: { content: { module: { lecture: { organizationId: orgId } } } } } }),
    select: { question: { select: { quiz: { select: { content: { select: { module: { select: { lecture: { select: { organizationId: true } } } } } } } } } } },
    get: (r) => r.question?.quiz?.content?.module?.lecture?.organizationId,
  },
  LiveSession: {
    filter: (orgId) => ({ class: { organizationId: orgId } }),
    select: { class: { select: { organizationId: true } } },
    get: (r) => r.class?.organizationId,
  },
  SessionAttendance: {
    filter: (orgId) => ({ liveSession: { class: { organizationId: orgId } } }),
    select: { liveSession: { select: { class: { select: { organizationId: true } } } } },
    get: (r) => r.liveSession?.class?.organizationId,
  },
  TeacherCourse: {
    filter: (orgId) => ({ course: { organizationId: orgId } }),
    select: { course: { select: { organizationId: true } } },
    get: (r) => r.course?.organizationId,
  },
  ImportRow: {
    filter: (orgId) => ({ job: { organizationId: orgId } }),
    select: { job: { select: { organizationId: true } } },
    get: (r) => r.job?.organizationId,
  },
};

const WHERE_OPS = new Set([
  "findMany", "findFirst", "findFirstOrThrow",
  "count", "aggregate", "groupBy",
  "updateMany", "deleteMany",
]);

const UNIQUE_OPS = new Set(["update", "delete", "upsert", "findUnique", "findUniqueOrThrow"]);

const basePrisma = new PrismaClient({ adapter });

const delegateOf = (model) => basePrisma[model[0].toLowerCase() + model.slice(1)];

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const orgId = getCurrentOrgId();

        // Không có tenant context (Super Admin, login, job nền, seed) → không scope
        if (!orgId) return query(args);

        const isTenant = TENANT_MODELS.has(model);
        const child = CHILD_MODELS[model];
        if (!isTenant && !child) return query(args);

        const orgFilter = isTenant ? { organizationId: orgId } : child.filter(orgId);

        if (WHERE_OPS.has(operation)) {
          args.where = { AND: [orgFilter, args.where ?? {}] };
          return query(args);
        }

        if (operation === "create" || operation === "createMany") {
          // Chỉ model tenant có cột để gán; model con được service xác thực qua cha
          if (isTenant) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((d) => ({ ...d, organizationId: orgId }));
            } else {
              args.data = { ...args.data, organizationId: orgId };
            }
          }
          return query(args);
        }

        if (UNIQUE_OPS.has(operation)) {
          // Tiền kiểm ownership trước khi cho thao tác theo unique key
          const existing = await delegateOf(model).findUnique({
            where: args.where,
            select: isTenant ? { organizationId: true } : child.select,
          });
          const existingOrgId = existing
            ? (isTenant ? existing.organizationId : child.get(existing))
            : null;
          if (existing && existingOrgId !== orgId) {
            if (operation === "findUnique") return null;
            throw new ApiError(404, "Resource not found");
          }
          if (operation === "upsert" && isTenant) {
            args.create = { ...args.create, organizationId: orgId };
          }
          return query(args);
        }

        return query(args);
      },
    },
  },
});

export default prisma;                 // client đã scope theo tenant — dùng mặc định
export { basePrisma as prismaAdmin };  // KHÔNG scope — chỉ dùng cho auth & module platform
