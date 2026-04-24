import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AuthGuard from './components/auth/AuthGuard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ClubProfilePage from './pages/ClubProfilePage';
import ClubEditorPage from './pages/ClubEditorPage';
import MemberListPage from './pages/MemberListPage';
import ForumHomePage from './pages/ForumHomePage';
import ThreadDetailPage from './pages/ThreadDetailPage';
import CreateThreadPage from './pages/CreateThreadPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotificationsPage from './pages/NotificationsPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'clubs/:slug',
        element: <ClubProfilePage />,
      },
      {
        path: 'clubs/:slug/edit',
        element: <ClubEditorPage />,
      },
      {
        path: 'clubs/:slug/members',
        element: <MemberListPage />,
      },
      {
        path: 'clubs/new',
        element: <ClubEditorPage />,
      },
      {
        path: 'forum',
        element: <ForumHomePage />,
      },
      {
        path: 'forum/new',
        element: <CreateThreadPage />,
      },
      {
        path: 'forum/:threadId',
        element: <ThreadDetailPage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
    ],
  },
]);

export default router;
