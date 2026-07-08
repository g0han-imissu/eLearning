import { z } from "zod";
import * as importService from "./import.service.js";

const createUserSchema = z.object({
  role: z.enum(["TEACHER", "STUDENT"]),
  fullName: z.string().min(2),
  userCode: z.string().regex(/^[A-Za-z0-9._-]+$/, "Mã chỉ gồm chữ, số, dấu . _ -").optional().or(z.literal("").transform(() => undefined)),
  email: z.email().optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().optional(),
  department: z.string().optional(),
  programCode: z.string().optional().or(z.literal("").transform(() => undefined)),
  classCode: z.string().optional().or(z.literal("").transform(() => undefined)),
});

export const createUser = async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    res.status(201).json(await importService.createSingleUser({ data, reqUser: req.user }));
  } catch (e) { next(e); }
};

export const importUsers = async (req, res, next) => {
  try {
    const result = await importService.importFromFile({
      file: req.file,
      type: req.query.type,
      dryRun: req.query.dryRun === "true",
      atomic: req.query.atomic === "true",
      reqUser: req.user,
    });
    res.status(result.dryRun ? 200 : 201).json(result);
  } catch (e) { next(e); }
};

export const listImportJobs = async (_req, res, next) => {
  try { res.json(await importService.listImportJobs()); } catch (e) { next(e); }
};

export const getImportJob = async (req, res, next) => {
  try { res.json(await importService.getImportJob(req.params.id)); } catch (e) { next(e); }
};

export const downloadJobCredentials = async (req, res, next) => {
  try {
    const csv = await importService.getJobCredentialsCsv(req.params.id);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="credentials-${req.params.id}.csv"`);
    res.send(csv);
  } catch (e) { next(e); }
};

export const wipeJobCredentials = async (req, res, next) => {
  try { res.json(await importService.wipeJobCredentials(req.params.id)); } catch (e) { next(e); }
};

export const rollbackJob = async (req, res, next) => {
  try { res.json(await importService.rollbackJob(req.params.id)); } catch (e) { next(e); }
};

export const downloadTemplate = (req, res) => {
  const type = req.query.type === "STUDENT" ? "STUDENT" : "TEACHER";
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="import-${type.toLowerCase()}-template.csv"`);
  res.send(importService.getImportTemplate(type));
};
