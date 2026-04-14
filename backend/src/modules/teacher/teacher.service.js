import ApiError from "../../utils/apiError.js";
import * as repo from "./teacher.repository.js";

export const listMyTeachingClasses = (userId) => repo.findClassesByTeacher(userId);

export const getPendingRequests = async ({ classId, userId }) => {
  const classItem = await repo.findAssignedClass(classId, userId);
  if (!classItem) throw new ApiError(404, "Class not found or not assigned");
  return repo.findPendingRequests(classId);
};

export const approveOrRejectRequest = async ({ classId, studentId, action, userId }) => {
  const classItem = await repo.findAssignedClass(classId, userId);
  if (!classItem) throw new ApiError(404, "Class not found or not assigned");
  if (action !== 'approve' && action !== 'reject') throw new ApiError(400, "Action must be approve or reject");
  const status = action === 'approve' ? 'ENROLLED' : 'DROPPED';
  return repo.updateEnrollmentStatus(classId, studentId, status);
};

export const listStudentsByClass = async ({ classId, userId }) => {
  const classItem = await repo.findAssignedClass(classId, userId);
  if (!classItem) throw new ApiError(404, "Class not found or not assigned");

  const enrollments = await repo.findEnrollmentsByClass(classId);
  return {
    classId,
    metrics: {
      totalStudents: enrollments.length,
      completedStudents: enrollments.filter((e) => e.status === "COMPLETED").length,
      inProgressStudents: enrollments.filter((e) => e.status === "IN_PROGRESS").length,
      avgProgress: enrollments.length
        ? enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / enrollments.length : 0,
      avgScore: enrollments.length
        ? enrollments.reduce((sum, e) => sum + Number(e.avgScore), 0) / enrollments.length : 0,
    },
    enrollments,
  };
};
