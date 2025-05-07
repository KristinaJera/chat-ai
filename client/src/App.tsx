import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login }   from './components/Login';
import ChatList    from './components/ChatList';
import NewChatForm from './components/NewChatForm';
import ChatPage    from './pages/ChatPage';
import { Link } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { user, loading } = useAuth();

  const handleLogout = () => {
    fetch('http://localhost:3001/auth/logout', {
      credentials: 'include',
    }).finally(() => window.location.reload());
  };

  if (loading) return <div>Loading...</div>;
  if (!user)   return <Login />;

  return (
    <BrowserRouter>
      <header className="p-4 bg-white shadow flex justify-between">
        <span>Welcome, {user.name}</span>
        <div className="space-x-4">
          <Link to="/profile">Profile</Link>
          <button onClick={handleLogout} className="text-red-500">
            Logout
          </button>
        </div>
      </header>

      <div className="p-4">
        <Routes>
          <Route path="/new-chat" element={<NewChatForm />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat/:id" element={<ChatPage user={user} />} />
          <Route
            path="/"
            element={
              <>
                <ChatList />
                <div className="mt-4">
                  <Link to="/new-chat" className="text-blue-600">
                    + New Chat
                  </Link>
                </div>
              </>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
