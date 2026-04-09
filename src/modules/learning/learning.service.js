const ApiError = require("../../utils/apiError");
const learningRepository = require("./learning.repository");

// Hàm tính skip và take từ page + limit mà client gửi lên
// Ví dụ: page=2, limit=10 → skip=10 (bỏ qua 10 bản ghi đầu), take=10
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { skip: (page - 1) * limit, take: limit, page, limit };
};

// Đóng gói kết quả trả về theo cấu trúc chuẩn để frontend dễ dùng
const paginatedResult = (data, total, page, limit) => ({
  data,
  meta: {
    total,          // tổng số bản ghi
    page,           // trang hiện tại
    limit,          // số bản ghi mỗi trang
    totalPages: Math.ceil(total / limit),
  },
});

const listPrograms = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [programs, total] = await learningRepository.findPrograms({ skip, take });
  return paginatedResult(programs, total, page, limit);
};

const listCourses = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [courses, total] = await learningRepository.findCourses({ skip, take });
  return paginatedResult(courses, total, page, limit);
};

const listClasses = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const [classes, total] = await learningRepository.findClasses({ skip, take });
  return paginatedResult(classes, total, page, limit);
};

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

module.exports = { listPrograms, listCourses, listClasses, createProgram, createCourse, createClass, enrollClass };
