const ApiError = require("../../utils/apiError");
const learningRepository = require("./learning.repository");

const createProgram = (data) => learningRepository.createProgram(data);

const createCourse = (data) => learningRepository.createCourse(data);

const createClass = ({ body, user }) => {
  const data = { ...body };
  const isTeacher = user.roles.includes("TEACHER");
  if (isTeacher && data.teacherId && data.teacherId !== user.id) {
    throw new ApiError(403, "Teacher can only create class for self");
  }
  if (isTeacher) data.teacherId = user.id;
  return learningRepository.createClass(data);
};

const enrollClass = ({ classId, studentId, user }) => {
  const targetStudentId = user.roles.includes("STUDENT") ? user.id : studentId;
  if (!targetStudentId) throw new ApiError(400, "Missing studentId");
  return learningRepository.upsertEnrollment({ classId, studentId: targetStudentId });
};

module.exports = { createProgram, createCourse, createClass, enrollClass };
