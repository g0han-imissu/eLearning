import ApiError from "../../utils/apiError.js";
import * as repo from "./learning.repository.js";

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

const paginatedResult = (data, total, page, limit) => ({
  data,
  meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
});

export const listPrograms = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [programs, total] = await repo.findPrograms({ skip, take });
  return paginatedResult(programs, total, page, limit);
};

export const listCourses = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [courses, total] = await repo.findCourses({ skip, take });
  return paginatedResult(courses, total, page, limit);
};

export const listClasses = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [classes, total] = await repo.findClasses({ skip, take });
  return paginatedResult(classes, total, page, limit);
};

export const createProgram = (data) => repo.createProgram(data);
export const createCourse = (data) => repo.createCourse(data);

export const createClass = ({ body, user }) => {
  const data = { ...body };
  const isTeacher = user.roles.includes("TEACHER");
  if (isTeacher && data.teacherId && data.teacherId !== user.id) {
    throw new ApiError(403, "Teacher can only create class for self");
  }
  if (isTeacher) data.teacherId = user.id;
  return repo.createClass(data);
};

export const enrollClass = ({ classId, studentId, user }) => {
  const targetStudentId = user.roles.includes("STUDENT") ? user.id : studentId;
  if (!targetStudentId) throw new ApiError(400, "Missing studentId");
  return repo.upsertEnrollment({ classId, studentId: targetStudentId });
};

export const getProgram = async (id) => {
  const program = await repo.findProgramById(id);
  if (!program) throw new ApiError(404, "Program not found");
  return program;
};

export const updateProgram = async (id, data) => {
  await getProgram(id);
  return repo.updateProgram(id, data);
};

export const deleteProgram = async (id) => {
  await getProgram(id);
  return repo.deleteProgram(id);
};

export const getCourse = async (id) => {
  const course = await repo.findCourseById(id);
  if (!course) throw new ApiError(404, "Course not found");
  return course;
};

export const updateCourse = async (id, data) => {
  await getCourse(id);
  return repo.updateCourse(id, data);
};

export const deleteCourse = async (id) => {
  await getCourse(id);
  return repo.deleteCourse(id);
};

export const getClass = async (id) => {
  const classItem = await repo.findClassById(id);
  if (!classItem) throw new ApiError(404, "Class not found");
  return classItem;
};

export const updateClass = async (id, data) => {
  await getClass(id);
  return repo.updateClass(id, data);
};

export const deleteClass = async (id) => {
  await getClass(id);
  return repo.deleteClass(id);
};
