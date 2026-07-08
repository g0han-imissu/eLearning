import { z } from "zod";
import * as platformService from "./platform.service.js";

const registrationSchema = z.object({
  orgName: z.string().min(2, "Tên tổ chức tối thiểu 2 ký tự"),
  contactName: z.string().min(2, "Tên người đại diện tối thiểu 2 ký tự"),
  email: z.email(),
  phone: z.string().optional(),
  expectedUsers: z.coerce.number().int().positive().optional(),
  note: z.string().max(2000).optional(),
});

// Public — trường/doanh nghiệp gửi yêu cầu đăng ký
export const submitRegistration = async (req, res, next) => {
  try {
    const data = registrationSchema.parse(req.body);
    return res.status(201).json(await platformService.submitRegistration(data));
  } catch (e) { return next(e); }
};

export const listRegistrationRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    return res.json(await platformService.listRegistrationRequests({ status }));
  } catch (e) { return next(e); }
};

export const getRegistrationRequest = async (req, res, next) => {
  try { return res.json(await platformService.getRegistrationRequest(req.params.id)); }
  catch (e) { return next(e); }
};

export const approveRegistration = async (req, res, next) => {
  try {
    return res.json(await platformService.approveRegistration({
      requestId: req.params.id,
      reviewerId: req.user.id,
    }));
  } catch (e) { return next(e); }
};

const rejectSchema = z.object({ rejectReason: z.string().max(1000).optional() });

export const rejectRegistration = async (req, res, next) => {
  try {
    const { rejectReason } = rejectSchema.parse(req.body ?? {});
    return res.json(await platformService.rejectRegistration({
      requestId: req.params.id,
      reviewerId: req.user.id,
      rejectReason,
    }));
  } catch (e) { return next(e); }
};

export const listOrganizations = async (_req, res, next) => {
  try { return res.json(await platformService.listOrganizations()); }
  catch (e) { return next(e); }
};

export const getOrganization = async (req, res, next) => {
  try { return res.json(await platformService.getOrganization(req.params.id)); }
  catch (e) { return next(e); }
};

export const suspendOrganization = async (req, res, next) => {
  try { return res.json(await platformService.suspendOrganization(req.params.id)); }
  catch (e) { return next(e); }
};

export const activateOrganization = async (req, res, next) => {
  try { return res.json(await platformService.activateOrganization(req.params.id)); }
  catch (e) { return next(e); }
};

export const getPlatformStats = async (_req, res, next) => {
  try { return res.json(await platformService.getPlatformStats()); }
  catch (e) { return next(e); }
};
