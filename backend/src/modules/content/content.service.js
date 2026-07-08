import ApiError from "../../utils/apiError.js";
import * as repo from "./content.repository.js";

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

export const listLectures = async (query, user) => {
  const { skip, take, page, limit } = parsePagination(query);
  const where = {};
  if (query.courseId) where.courseId = query.courseId;
  if (query.classId) where.classId = query.classId;
  if (query.ownerId) where.ownerId = query.ownerId;

  const isAdmin = user && user.roles.includes("ORG_ADMIN");
  const isTeacher = user && user.roles.includes("TEACHER");
  const isPureStudent = user && user.roles.includes("STUDENT") && !isAdmin && !isTeacher;

  if (isPureStudent) {
    if (!query.classId) throw new ApiError(400, "classId là bắt buộc");
    const enrollment = await repo.findStudentEnrollmentByClass(user.id, query.classId);
    if (!enrollment) throw new ApiError(403, "Bạn không có quyền xem bài giảng của lớp này");
    where.isPublished = true;
  } else if (isTeacher && !isAdmin) {
    // Giảng viên chỉ thấy bài giảng của chính mình
    where.ownerId = user.id;
  }

  const [lectures, total] = await repo.findLectures({ skip, take, where });
  return { data: lectures, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const createLecture = async ({ body, user }) => {
  const { classId, title, description, isPublished } = body;
  if (!classId) throw new ApiError(400, "classId là bắt buộc");
  const classItem = await repo.findClassById(classId);
  if (!classItem) throw new ApiError(404, "Class not found");
  if (!user.roles.includes("ORG_ADMIN") && classItem.teacherId !== user.id) {
    throw new ApiError(403, "Bạn chỉ có thể tạo bài giảng cho lớp mình phụ trách");
  }
  return repo.createLecture({
    classId,
    courseId: classItem.courseId,
    title,
    description,
    isPublished,
    ownerId: user.id,
  });
};

export const createModule = async ({ body, user }) => {
  const lecture = await repo.findLectureById(body.lectureId);
  if (!lecture) throw new ApiError(404, "Lecture not found");
  if (!user.roles.includes("ORG_ADMIN") && lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture");
  }
  return repo.createModule(body);
};

export const createContent = async ({ body, user }) => {
  const { type, moduleId, title, orderIndex, payload } = body;
  const moduleItem = await repo.findModuleWithLecture(moduleId);
  if (!moduleItem) throw new ApiError(404, "Module not found");
  if (!user.roles.includes("ORG_ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture module");
  }
  return repo.createContentWithMedia({ type, moduleId, title, orderIndex, payload });
};

export const getLecture = async (id, user) => {
  const lecture = await repo.findLectureWithModules(id);
  if (!lecture) throw new ApiError(404, "Lecture not found");

  if (user && user.roles.includes("STUDENT") && !user.roles.includes("ORG_ADMIN") && !user.roles.includes("TEACHER")) {
    const enrollment = lecture.classId
      ? await repo.findStudentEnrollmentByClass(user.id, lecture.classId)
      : null;
    if (!enrollment) throw new ApiError(403, "Bạn không có quyền xem bài giảng này");
  }

  return lecture;
};

export const updateLecture = async ({ id, body, user }) => {
  const lecture = await repo.findLectureById(id);
  if (!lecture) throw new ApiError(404, "Lecture not found");
  if (!user.roles.includes("ORG_ADMIN") && lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture");
  }
  return repo.updateLecture(id, body);
};

export const deleteLecture = async ({ id, user }) => {
  const lecture = await repo.findLectureById(id);
  if (!lecture) throw new ApiError(404, "Lecture not found");
  if (!user.roles.includes("ORG_ADMIN") && lecture.ownerId !== user.id) {
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
  if (!user.roles.includes("ORG_ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture module");
  }
  return repo.updateModule(id, body);
};

export const deleteModule = async ({ id, user }) => {
  const moduleItem = await repo.findModuleWithLecture(id);
  if (!moduleItem) throw new ApiError(404, "Module not found");
  if (!user.roles.includes("ORG_ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only delete your own lecture module");
  }
  return repo.deleteModule(id);
};

export const getContent = async (id) => {
  const content = await repo.findContentById(id);
  if (!content) throw new ApiError(404, "Content not found");
  return content;
};

export const updateContent = async ({ id, body, user }) => {
  const content = await repo.findContentById(id);
  if (!content) throw new ApiError(404, "Content not found");
  const moduleItem = await repo.findModuleWithLecture(content.moduleId);
  if (!user.roles.includes("ORG_ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture content");
  }
  const { title, orderIndex, payload } = body;
  return repo.updateContentWithMedia({ id, type: content.type, title, orderIndex, payload });
};

export const deleteContent = async ({ id, user }) => {
  const content = await repo.findContentById(id);
  if (!content) throw new ApiError(404, "Content not found");
  const moduleItem = await repo.findModuleWithLecture(content.moduleId);
  if (!user.roles.includes("ORG_ADMIN") && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only delete your own lecture content");
  }
  return repo.deleteContent(id);
};
