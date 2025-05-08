// src/pages/ChatsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NavBar } from '../components/NavBar';
import { fetchChats, ChatSummary } from '../api/chats';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';

export default function ChatsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchChats().then(setChats).catch(console.error);
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;

  const handleLogout = () =>
    fetch('http://localhost:3001/auth/logout', { credentials: 'include' })
      .finally(() => window.location.reload());

  // Filter chats by search term, only looking at *other* participants
  const filtered = chats.filter(c => {
    const others = c.participants
      .filter(p => p.shareId !== user.shareId)         // <-- ID-based filter
      .map(p => p.name);
    return others.join(', ').toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden
                      md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        <NavBar userName={user.name} onLogout={handleLogout} />

        <div className="flex-1 px-5 py-4 md:px-3 md:py-2 overflow-y-auto">
          <h1 className="text-3xl md:text-2xl font-bold mb-6 md:mb-4 text-gray-800">
            Your Chats
          </h1>

          <div className="relative mb-6 md:mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 
                                text-gray-400 text-lg md:text-base" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search chat"
              className="w-full pl-12 pr-4 py-3 md:pl-10 md:py-2 bg-gray-100 rounded-full
                         focus:outline-none focus:ring-2 focus:ring-cyan-300 text-base md:text-sm"
            />
          </div>

          <ul className="space-y-4 md:space-y-3">
            {filtered.map(chat => {
              // pull out everyone except yourself by shareId
              const others = chat.participants
                .filter(p => p.shareId !== user.shareId)
                .map(p => p.name);

              // up to two names, then "…" 
              const title =
                others.length <= 2
                  ? others.join(', ')
                  : `${others.slice(0, 2).join(', ')}, …`;

              return (
                <li
                  key={chat._id}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  className="flex items-center justify-between px-5 py-4 
                             md:px-3 md:py-2 bg-white rounded-xl shadow-md 
                             md:shadow hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center space-x-4 md:space-x-3">
                    <div
                      className="h-12 w-12 md:h-8 md:w-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#' + chat._id.slice(-6) }}
                    />
                    <div className="flex-1">
                      <div
                        className="text-lg md:text-base font-semibold text-gray-900 truncate"
                        title={title}
                      >
                        {title}
                      </div>
                      <div className="text-sm md:text-xs text-gray-500">
                        Tap to open
                      </div>
                    </div>
                  </div>
                  <div className="text-2xl md:text-base text-gray-400">›</div>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-center mt-8 md:mt-6">
            <button
              onClick={() => navigate('/new-chat')}
              className="p-4 md:p-2 bg-blue-500 text-white rounded-full shadow-lg
                         hover:bg-blue-600 transition"
            >
              <FiPlus size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
