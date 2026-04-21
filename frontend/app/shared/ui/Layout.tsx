import { Link, Outlet, useLocation } from 'react-router';
import {
  Droplets,
  Dumbbell,
  Home,
  Scale,
  Target,
  User,
  UtensilsCrossed,
} from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">OneFit</h1>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap gap-x-1">
            <Link
              to="/"
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                isActive('/')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Home size={20} />
              <span>ダッシュボード</span>
            </Link>

            <Link
              to="/body-settings"
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                isActive('/body-settings')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <User size={20} />
              <span>身体設定</span>
            </Link>

            <Link
              to="/body-make"
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                isActive('/body-make')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Target size={20} />
              <span>ボディメイク</span>
            </Link>

            <Link
              to="/meals"
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                isActive('/meals')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <UtensilsCrossed size={20} />
              <span>食事記録</span>
            </Link>

            <Link
              to="/workouts"
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                isActive('/workouts')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Dumbbell size={20} />
              <span>トレーニング記録</span>
            </Link>

            <Link
              to="/water-logs"
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                isActive('/water-logs')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Droplets size={20} />
              <span>水分記録</span>
            </Link>

            <Link
              to="/body-weight-logs"
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                isActive('/body-weight-logs')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Scale size={20} />
              <span>体重記録</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
