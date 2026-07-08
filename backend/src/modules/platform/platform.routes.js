import { Router } from "express";
import {
  listRegistrationRequests, getRegistrationRequest,
  approveRegistration, rejectRegistration,
  listOrganizations, getOrganization,
  suspendOrganization, activateOrganization,
  getPlatformStats,
} from "./platform.controller.js";

// Toàn bộ route ở đây được mount sau authMiddleware + requireRoles("SUPER_ADMIN")
const router = Router();

router.get("/organization-registrations", listRegistrationRequests);
router.get("/organization-registrations/:id", getRegistrationRequest);
router.post("/organization-registrations/:id/approve", approveRegistration);
router.post("/organization-registrations/:id/reject", rejectRegistration);

router.get("/organizations", listOrganizations);
router.get("/organizations/:id", getOrganization);
router.patch("/organizations/:id/suspend", suspendOrganization);
router.patch("/organizations/:id/activate", activateOrganization);

router.get("/stats", getPlatformStats);

export default router;
