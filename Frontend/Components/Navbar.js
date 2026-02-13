import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/');
  };

  const getHomeRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'agency_admin') return '/agency-admin';
    return '/dashboard';
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-lg cursor-pointer" onClick={() => router.push(getHomeRoute())}>
        SourcePay Portal
      </div>
      <div className="flex space-x-4 items-center">
        {user?.role === 'contractor' && (
          <>
            <button className="hover:underline" onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button className="hover:underline" onClick={() => router.push('/documents')}>Documents</button>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <button className="hover:underline" onClick={() => router.push('/admin')}>Admin Panel</button>
            <button className="hover:underline" onClick={() => router.push('/agency-admin')}>Agency Admin</button>
          </>
        )}
        {user?.role === 'agency_admin' && (
          <>
            <button className="hover:underline" onClick={() => router.push('/agency-admin')}>Agency Portal</button>
          </>
        )}
        {user && (
          <>
            <NotificationCenter userId={user.id} />
            <button className="hover:underline" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
