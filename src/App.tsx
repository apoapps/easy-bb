'use client';

import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { TopBar, type RouteKey } from './components/TopBar';
import { ToastHost } from './components/Toast';
import { pushToast } from './components/toastBus';
import { LoginPage } from './views/LoginPage';
import { DashboardPage } from './views/DashboardPage';
import { CoursesPage } from './views/CoursesPage';
import { CourseDetailPage } from './views/CourseDetailPage';
import { SearchPage } from './views/SearchPage';
import { CalendarPage } from './views/CalendarPage';
import { ProfilePage } from './views/ProfilePage';
import { api, getSession, getDemoMode, type Session } from './lib/api';
import type { User } from './types';
import { ShellSkeleton, DashboardSkeleton } from './components/Skeleton';

function useRouteKey(): RouteKey {
  const { pathname } = useLocation();
  if (pathname === '/' || pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'dashboard';
}

function AppShell() {
  const [session, setSess] = useState<Session | null>(getSession());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const routeKey = useRouteKey();
  const isLogin = location.pathname === '/login';

  // Re-read session when localStorage changes
  useEffect(() => {
    const onStorage = () => setSess(getSession());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (isLogin) {
      return;
    }
    if (!session) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      try {
        const r = await api.dashboard();
        if (!active) return;
        setUser(r.user);
      } catch (e) {
        if (!active) return;
        console.error('Session invalid', e);
        api.logout();
        setSess(null);
        navigate('/login');
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [session, isLogin, navigate]);

  useEffect(() => {
    if (getDemoMode() && !isLogin && session) {
      pushToast('Demo mode is active', 'info');
    }
  }, [session, isLogin]);

  async function onLogout() {
    await api.logout();
    setSess(null);
    setUser(null);
    pushToast('Signed out', 'info');
    navigate('/login');
  }

  function onNavigate(route: RouteKey) {
    if (route === 'dashboard') navigate('/dashboard');
    else if (route === 'courses') navigate('/courses');
    else if (route === 'search') navigate('/search');
    else if (route === 'calendar') navigate('/calendar');
    else if (route === 'profile') navigate('/profile');
  }

  if (loading) {
    return <ShellSkeleton />;
  }

  // Gate: if no session and not on /login, redirect to /login
  if (!session && !isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (isLogin) {
    return <LoginPage onLogin={() => setSess(getSession())} />;
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <TopBar
        currentRoute={routeKey}
        onNavigate={onNavigate}
        user={user ? { name: user.name || user.userName || user.id, email: user.email } : null}
        onLogout={onLogout}
      />
      <main className="max-w-7xl mx-auto w-full overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/profile" element={user ? <ProfilePage user={user} onLogout={onLogout} /> : <DashboardSkeleton />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <ToastHost />
    </div>
  );
}

export default function App() {
  // HashRouter works on any host (no server-side routing needed)
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
