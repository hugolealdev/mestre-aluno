import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../app/layout';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';
import { LandingPage } from '../pages/landing-page';
import { DiscoveryPage } from '../pages/public/discovery-page';
import { TeacherProfilePage } from '../pages/public/teacher-profile-page';
import { ProtectedRoute } from './protected-route';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'auth',
        element: <AuthPage />
      },
      {
        path: 'painel',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'descobrir',
        element: <DiscoveryPage />
      },
      {
        path: 'professores/:publicSlug',
        element: <TeacherProfilePage />
      }
    ]
  }
]);
