import { AsyncLocalStorage } from "node:async_hooks";

// Lưu organizationId của request hiện tại; Prisma extension đọc từ đây
// để tự động scope mọi truy vấn theo tenant.
export const tenantContext = new AsyncLocalStorage();

export const getCurrentOrgId = () => tenantContext.getStore()?.organizationId ?? null;

// Đặt SAU authMiddleware trên các route nghiệp vụ
export const tenantMiddleware = (req, _res, next) => {
  tenantContext.run({ organizationId: req.user?.organizationId ?? null }, next);
};

// Cho socket handler / job nền: chạy fn trong context của một org cụ thể
export const runAsOrg = (organizationId, fn) =>
  tenantContext.run({ organizationId }, fn);
