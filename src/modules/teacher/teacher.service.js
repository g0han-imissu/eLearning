const ApiError = require("../../utils/apiError");
const teacherRepository = require("./teacher.repository");

const listMyTeachingClasses = (userId) => teacherRepository.findClassesByTeacher(userId);

const listStudentsByClass = async ({ classId, userId }) => {
  const classItem = await teacherRepository.findAssignedClass(classId, userId);
  if (!classItem) throw new ApiError(404, "Class not found or not assigned");

  const enrollments = await teacherRepository.findEnrollmentsByClass(classId);
  return {
    classId,
    metrics: {
      totalStudents: enrollments.length,
      completedStudents: enrollments.filter((e) => e.status === "COMPLETED").length,
      inProgressStudents: enrollments.filter((e) => e.status === "IN_PROGRESS").length,
      avgProgress: enrollments.length
        ? enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / enrollments.length
        : 0,
      avgScore: enrollments.length
        ? enrollments.reduce((sum, e) => sum + Number(e.avgScore), 0) / enrollments.length
        : 0,
    },
    enrollments,
  };
};

module.exports = { listMyTeachingClasses, listStudentsByClass };
