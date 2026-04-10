const ApiError = require("../../utils/apiError");
const contentRepository = require("./content.repository");

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

const listLectures = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [lectures, total] = await contentRepository.findLectures({ skip, take });
  return { data: lectures, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const createLecture = ({ body, user }) =>
  contentRepository.createLecture({ ...body, ownerId: user.id });

const createModule = async ({ body, user }) => {
  const lecture = await contentRepository.findLectureById(body.lectureId);
  if (!lecture) throw new ApiError(404, "Lecture not found");

  const isAdmin = user.roles.includes("ADMIN");
  if (!isAdmin && lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture");
  }
  return contentRepository.createModule(body);
};

const createContent = async ({ body, user }) => {
  const { type, moduleId, title, orderIndex, payload } = body;

  const moduleItem = await contentRepository.findModuleWithLecture(moduleId);
  if (!moduleItem) throw new ApiError(404, "Module not found");

  const isAdmin = user.roles.includes("ADMIN");
  if (!isAdmin && moduleItem.lecture.ownerId !== user.id) {
    throw new ApiError(403, "You can only edit your own lecture module");
  }

  return contentRepository.createContentWithMedia({ type, moduleId, title, orderIndex, payload });
};

module.exports = { listLectures, createLecture, createModule, createContent };
