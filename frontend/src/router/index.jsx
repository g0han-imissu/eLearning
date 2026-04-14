import { createBrowserRouter, Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

import AdminLayout from '../components/layout/AdminLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import StudentLayout from '../components/layout/StudentLayout';

import AdminDashboard from '../pages/admin/DashboardPage';
import AdminUsers from '../pages/admin/UsersPage';
import AdminPrograms from '../pages/admin/ProgramsPage';
import AdminCourses from '../pages/admin/CoursesPage';
import AdminClasses from '../pages/admin/ClassesPage';
import AdminExams from '../pages/admin/ExamsPage';

import TeacherClasses from '../pages/teacher/ClassesPage';
import TeacherLectures from '../pages/teacher/LecturesPage';
import TeacherLive from '../pages/teacher/LivePage';

import StudentClasses from '../pages/student/ClassesPage';
import StudentLecture from '../pages/student/LecturePage';
import StudentLive from '../pages/student/LivePage';

import ProfilePage from '../pages/ProfilePage';

function RequireAuth({ children }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ role, children }) {
  const user = useAuthStore((s) => s.user);
  if (!user?.roles?.includes(role)) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },

  {
    path: '/admin',
    element: <RequireAuth><RequireRole role="ADMIN"><AdminLayout /></RequireRole></RequireAuth>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'programs', element: <AdminPrograms /> },
      { path: 'courses', element: <AdminCourses /> },
      { path: 'classes', element: <AdminClasses /> },
      { path: 'exams', element: <AdminExams /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },

  {
    path: '/teacher',
    element: <RequireAuth><RequireRole role="TEACHER"><TeacherLayout /></RequireRole></RequireAuth>,
    children: [
      { index: true, element: <TeacherClasses /> },
      { path: 'lectures', element: <TeacherLectures /> },
      { path: 'live/:sessionId', element: <TeacherLive /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },

  {
    path: '/student',
    element: <RequireAuth><RequireRole role="STUDENT"><StudentLayout /></RequireRole></RequireAuth>,
    children: [
      { index: true, element: <StudentClasses /> },
      { path: 'lecture/:classId', element: <StudentLecture /> },
      { path: 'live/:sessionId', element: <StudentLive /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },

  { path: '/', element: <RootRedirect /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.roles?.includes('ADMIN')) return <Navigate to="/admin" replace />;
  if (user.roles?.includes('TEACHER')) return <Navigate to="/teacher" replace />;
  return <Navigate to="/student" replace />;
}

export default router;
