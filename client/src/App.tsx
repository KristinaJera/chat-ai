// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { useAuth } from './hooks/useAuth';
// // import { User } from './api/users';
// import Login from './components/Login';
// import NewChatForm from './components/NewChatForm';
// import ChatPage from './pages/ChatPage';
// import ProfilePage from './pages/ProfilePage';
// import ContactsPage from './pages/ContactsPage';
// import ChatsPage from './pages/ChatsPage';

// export default function App() {
// const { user, loading } = useAuth();

//   // While we’re checking auth, render nothing (or a small spinner)
//   if (loading) return null;
//   if (!user) return <Login />;

//   return (
//     <BrowserRouter>
//         <Routes>
          
//           <Route path="/" element={<Navigate to="/chats" replace />} />
//           <Route path="/contacts" element={<ContactsPage />} />
//           <Route path="/chats" element={<ChatsPage />} />
//           <Route path="/new-chat" element={<NewChatForm />} />
//           <Route path="/profile" element={<ProfilePage />} />
//           <Route path="/chat/:id" element={<ChatPage user={user} />} />
//           {/* fallback */}
//           <Route path="*" element={<Navigate to="/chats" replace />} />
//         </Routes>
//     </BrowserRouter>
//   );
// }

// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login       from './components/Login';
import ChatsPage   from './pages/ChatsPage';
import ContactsPage from './pages/ContactsPage';
import NewChatForm from './components/NewChatForm';
import ChatPage    from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Login />;

  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/chats" replace />} />
      <Route path="/chats"    element={<ChatsPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="/new-chat" element={<NewChatForm />} />
      <Route path="/profile"  element={<ProfilePage />} />
      <Route path="/chat/:id" element={<ChatPage user={user} />} />
      <Route path="*"         element={<Navigate to="/chats" replace />} />
    </Routes>
  );
}
