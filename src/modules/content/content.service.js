import ApiError from "../../utils/apiError.js";
import * as repo from "./content.repository.js";

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

export const listLectures = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [lectures, total] = await repo.findLectures({ skip, take });
  return { data: lectures, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const createLecture = async ({ body, user }) => {
  if (!user.roles.includes("ADMIN")) {
    const assignedClass = await repo.findClassByTeacherAndCourse(user.id, body.courseId);
    if (!assignedClass) throw new ApiError(403, "You can only create lectures for courses you are assigned to teach");
  }
  return repo.createLecture({ ...body, ownerId: user.id });
};

export const createModule = async ({ body, user }) => {
  const lecture = await repo.findLectureById(body.lectureId);
  if (!lecture) throw new ApiError(404, "Lecture not found");
  if (!user.roles.includes("ADMIN") && lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture");
  }
  return repo.createModule(body);
};

export const createContent = async ({ body, user }) => {
  const { type, moduleId, title, orderIndex, payload } = body;
  const moduleItem = await repo.findModuleWithLecture(moduleId);
  if (!moduleItem) throw new ApiError(404, "Module not found");
  if (!user.roles.includes("ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture module");
  }
  return repo.createContentWithMedia({ type, moduleId, title, orderIndex, payload });
};

export const getLecture = async (id) => {
  const lecture = await repo.findLectureWithModules(id);
  if (!lecture) throw new ApiError(404, "Lecture not found");
  return lecture;
};

export const updateLecture = async ({ id, body, user }) => {
  const lecture = await repo.findLectureById(id);
  if (!lecture) throw new ApiError(404, "Lecture not found");
  if (!user.roles.includes("ADMIN") && lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture");
  }
  return repo.updateLecture(id, body);
};

export const deleteLecture = async ({ id, user }) => {
  const lecture = await repo.findLectureById(id);
  if (!lecture) throw new ApiError(404, "Lecture not found");
  if (!user.roles.includes("ADMIN") && lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only delete your own lecture");
  }
  return repo.deleteLecture(id);
};

export const getModule = async (id) => {
  const moduleItem = await repo.findModuleById(id);
  if (!moduleItem) throw new ApiError(404, "Module not found");
  return moduleItem;
};

export const updateModule = async ({ id, body, user }) => {
  const moduleItem = await repo.findModuleWithLecture(id);
  if (!moduleItem) throw new ApiError(404, "Module not found");
  if (!user.roles.includes("ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture module");
  }
  return repo.updateModule(id, body);
};

export const deleteModule = async ({ id, user }) => {
  const moduleItem = await repo.findModuleWithLecture(id);
  if (!moduleItem) throw new ApiError(404, "Module not found");
  if (!user.roles.includes("ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only delete your own lecture module");
  }
  return repo.deleteModule(id);
};

export const getContent = async (id) => {
  const content = await repo.findContentById(id);
  if (!content) throw new ApiError(404, "Content not found");
  return content;
};

export const deleteContent = async ({ id, user }) => {
  const content = await repo.findContentById(id);
  if (!content) throw new ApiError(404, "Content not found");
  const moduleItem = await repo.findModuleWithLecture(content.moduleId);
  if (!user.roles.includes("ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only delete your own lecture content");
  }
  return repo.deleteContent(id);
};
