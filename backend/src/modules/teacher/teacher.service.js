import ApiError from "../../utils/apiError.js";
import * as repo from "./teacher.repository.js";
import prisma from "../../lib/prisma.js";

export const listMyTeachingClasses = (userId) => repo.findClassesByTeacher(userId);

export const getMyProfile = (userId) => repo.findTeacherProfile(userId);

export const getMyTeacherCourses = (userId) => repo.findTeacherCourses(userId);

export const setMyTeacherCourses = async (userId, courseIds) => {
  if (!Array.isArray(courseIds)) throw new ApiError(400, "courseIds must be an array");
  const validCourses = await prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true } });
  const validIds = validCourses.map((c) => c.id);
  return repo.replaceTeacherCourses(userId, validIds);
};

export const getPendingRequests = async ({ classId, userId, roles }) => {
  const isAdmin = roles?.includes('ORG_ADMIN');
  const classItem = await repo.findAssignedClass(classId, isAdmin ? undefined : userId);
  if (!classItem) throw new ApiError(404, "Class not found or not assigned");
  return repo.findPendingRequests(classId);
};

export const approveOrRejectRequest = async ({ classId, studentId, action, userId, roles }) => {
  const isAdmin = roles?.includes('ORG_ADMIN');
  const classItem = await repo.findAssignedClass(classId, isAdmin ? undefined : userId);
  if (!classItem) throw new ApiError(404, "Class not found or not assigned");
  if (action !== 'approve' && action !== 'reject') throw new ApiError(400, "Action must be approve or reject");
  const status = action === 'approve' ? 'ENROLLED' : 'DROPPED';
  return repo.updateEnrollmentStatus(classId, studentId, status);
};

export const listStudentsByClass = async ({ classId, userId, roles }) => {
  const isAdmin = roles?.includes('ORG_ADMIN');
  const classItem = await repo.findAssignedClass(classId, isAdmin ? undefined : userId);
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
