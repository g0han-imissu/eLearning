const studentRepository = require("./student.repository");

const me = (userId) => studentRepository.findMe(userId);

const myProgress = async (userId) => {
  const enrollments = await studentRepository.findEnrollmentsByStudent(userId);
  return {
    kpi: {
      totalClasses: enrollments.length,
      completedClasses: enrollments.filter((e) => e.status === "COMPLETED").length,
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

module.exports = { me, myProgress };
