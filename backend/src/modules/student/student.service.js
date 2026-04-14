import ApiError from "../../utils/apiError.js";
import * as repo from "./student.repository.js";

export const myEnrollments = (userId) => repo.findMyEnrollments(userId);

export const joinByCode = async ({ code, userId }) => {
  const classItem = await repo.findClassByCode(code);
  if (!classItem) throw new ApiError(404, "Không tìm thấy lớp học với mã này");
  if (classItem.status === 'CLOSED' || classItem.status === 'ARCHIVED') {
    throw new ApiError(400, "Lớp học này không còn nhận thêm học viên");
  }

  const existing = await repo.findEnrollment(classItem.id, userId);
  if (existing) {
    if (existing.status === 'PENDING') throw new ApiError(400, "Bạn đã gửi yêu cầu tham gia lớp này, đang chờ phê duyệt");
    if (existing.status !== 'DROPPED') throw new ApiError(400, "Bạn đã là thành viên của lớp học này");
  }

  await repo.requestJoinClass(classItem.id, userId);
  return { message: "Yêu cầu tham gia lớp đã được gửi. Vui lòng chờ giảng viên phê duyệt.", classTitle: classItem.title };
};

export const me = (userId) => repo.findMe(userId);

export const myProgress = async (userId) => {
  const enrollments = await repo.findEnrollmentsByStudent(userId);
  return {
    kpi: {
      totalClasses: enrollments.length,
      completedClasses: enrollments.filter((e) => e.status === "COMPLETED").length,
      avgProgress: enrollments.length
        ? enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / enrollments.length : 0,
      avgScore: enrollments.length
        ? enrollments.reduce((sum, e) => sum + Number(e.avgScore), 0) / enrollments.length : 0,
    },
    enrollments,
  };
};

export const submitQuiz = async ({ body, userId }) => {
  const { quizId, classId, answers } = body;

  const quiz = await repo.findQuizWithAnswers(quizId);
  if (!quiz) throw new ApiError(404, "Quiz not found");

  const enrollment = await repo.findEnrollment(classId, userId);
  if (!enrollment) throw new ApiError(403, "You are not enrolled in this class");

  let earnedScore = 0;
  let totalScore = 0;

  for (const question of quiz.questions) {
    totalScore += Number(question.score);
    const studentAnswer = answers.find((a) => a.questionId === question.id);
    if (!studentAnswer) continue;
    const correct = question.answers.find((a) => a.id === studentAnswer.answerId && a.isCorrect);
    if (correct) earnedScore += Number(question.score);
  }

  const scorePercent = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;
  const passed = scorePercent >= Number(quiz.passScore);

  await repo.updateEnrollmentProgress(classId, userId, {
    avgScore: scorePercent,
    status: passed ? "IN_PROGRESS" : enrollment.status,
  });

  return {
    quizId, earnedScore, totalScore,
    scorePercent: Math.round(scorePercent * 100) / 100,
    passed, passScore: quiz.passScore,
  };
};

export const updateProgress = async ({ body, userId }) => {
  const { classId, progress } = body;
  const enrollment = await repo.findEnrollment(classId, userId);
  if (!enrollment) throw new ApiError(403, "You are not enrolled in this class");
  if (progress < 0 || progress > 100) throw new ApiError(400, "Progress must be between 0 and 100");
  const status = progress >= 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : enrollment.status;
  const completedAt = status === "COMPLETED" ? new Date() : null;
  return repo.updateEnrollmentProgress(classId, userId, {
    progress, status,
    ...(completedAt && { completedAt }),
  });
};
