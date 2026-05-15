import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { FeedPage } from '../pages/polls/FeedPage';
import { MyPollsPage } from '../pages/polls/MyPollsPage';
import { SharedPage } from '../pages/polls/SharedPage';
import { PollDetailPage } from '../pages/polls/PollDetailPage';
import { CreatePollPage } from '../pages/polls/CreatePollPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/feed" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/feed', element: <FeedPage /> },
          { path: '/my-polls', element: <MyPollsPage /> },
          { path: '/shared', element: <SharedPage /> },
          { path: '/polls/create', element: <CreatePollPage /> },
          { path: '/polls/:id', element: <PollDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
