import React from 'react';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import ChatPage from './pages/ChatPage';

export default function App() {
  const { user, loading } = useAuth();

  const handleLogout = () => {
    fetch('http://localhost:3001/auth/logout', {
      method: 'GET',
      credentials: 'include',
    }).finally(() => window.location.reload());
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Login />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="p-4 bg-white shadow flex justify-between">
        <span>Welcome, {user.name}</span>
        <button onClick={handleLogout} className="text-red-500">
          Logout
        </button>
      </header>
      <ChatPage user={user} />
    </div>
  );
}