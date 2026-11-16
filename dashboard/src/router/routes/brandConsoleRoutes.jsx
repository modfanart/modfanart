import BrandConsoleHome from '../../concepts/brand-console/BrandConsoleHome';
import BrandConsoleDashboard from '../../concepts/brand-console/BrandConsoleDashboard';
import BrandContestsPage from '../../concepts/brand-console/BrandContestsPage';
import BrandContestFormPage from '../../concepts/brand-console/BrandContestFormPage';
import BrandContestManagePage from '../../concepts/brand-console/BrandContestManagePage';

export const brandConsoleRoutes = [
  {
    path: '/brand-console',
    name: 'Brand Console',
    isSidebarActive: true,
    element: <BrandConsoleHome />,
  },
  {
    path: '/brand-console/:brandId',
    name: 'Brand workspace',
    isSidebarActive: true,
    element: <BrandConsoleDashboard />,
  },
  {
    path: '/brand-console/:brandId/contests',
    name: 'Brand contests',
    isSidebarActive: true,
    element: <BrandContestsPage />,
  },
  {
    path: '/brand-console/:brandId/contests/new',
    name: 'New contest',
    isSidebarActive: true,
    element: <BrandContestFormPage />,
  },
  {
    path: '/brand-console/:brandId/contests/:contestId/edit',
    name: 'Edit contest',
    isSidebarActive: true,
    element: <BrandContestFormPage />,
  },
  {
    path: '/brand-console/:brandId/contests/:contestId',
    name: 'Manage contest',
    isSidebarActive: true,
    element: <BrandContestManagePage />,
  },
];
