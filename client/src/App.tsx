import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import NewChatForm from './components/NewChatForm';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import ContactsPage from './pages/ContactsPage';
import ChatsPage from './pages/ChatsPage';

function AuthFallback() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  return <Navigate to={user ? "/chats" : "/"} replace />;
}
// ProtectedRoute stays the same
function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Login />} />

      {/* protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/new-chat" element={<NewChatForm />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Route>

      {/* fallback */}
       <Route path="*" element={<AuthFallback />} />
    </Routes>
  );
}
