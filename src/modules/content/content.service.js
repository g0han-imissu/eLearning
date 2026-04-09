const ApiError = require("../../utils/apiError");
const contentRepository = require("./content.repository");

const createLecture = ({ body, user }) => contentRepository.createLecture({ ...body, ownerId: user.id });

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

  const content = await contentRepository.createContent({ type, moduleId, title, orderIndex });
  if (type === "VIDEO") await contentRepository.createVideo({ contentId: content.id, ...payload });
  if (type === "DOCUMENT") await contentRepository.createDocument({ contentId: content.id, ...payload });
  if (type === "QUIZ") await contentRepository.createQuiz({ contentId: content.id, title: payload.title });
  return content;
};

module.exports = { createLecture, createModule, createContent };
