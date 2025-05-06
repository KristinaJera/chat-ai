// frontend/src/App.tsx
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
        <button onClick={handleLogout} className="text-red-500">
          Logout
        </button>
      </header>

      <div className="p-4">
        <Routes>
          <Route path="/new-chat" element={<NewChatForm />} />

          <Route
            path="/chat/:chatId"
            element={<ChatPage user={user} />}
          />

          <Route
            path="/"
            element={
              <>
                <ChatList />
                <div className="mt-4">
                  <a
                    href="/new-chat"
                    className="text-blue-600"
                  >
                    + New Chat
                  </a>
                </div>
              </>
            }
          />

          {/* catch-all redirects back to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
