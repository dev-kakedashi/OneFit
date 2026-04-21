import { createBrowserRouter } from 'react-router';
import { Layout } from './shared/ui/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { BodySettingsPage } from './pages/BodySettingsPage';
import { BodyMakePage } from './pages/BodyMakePage';
import { MealLogPage } from './pages/MealLogPage';
import { WorkoutLogPage } from './pages/WorkoutLogPage';
import { WaterLogPage } from './pages/WaterLogPage';
import { BodyWeightLogPage } from './pages/BodyWeightLogPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'body-settings', Component: BodySettingsPage },
      { path: 'body-make', Component: BodyMakePage },
      { path: 'meals', Component: MealLogPage },
      { path: 'workouts', Component: WorkoutLogPage },
      { path: 'water-logs', Component: WaterLogPage },
      { path: 'body-weight-logs', Component: BodyWeightLogPage },
    ],
  },
]);
