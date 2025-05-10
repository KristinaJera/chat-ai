// src/pages/ContactsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NavBar } from '../components/NavBar';
import { fetchChats, ChatSummary, createChat } from '../api/chats';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { logout } from '../api/auth';

interface Contact {
  name: string;
  shareId: string;
}

export default function ContactsPage() {
  const { user} = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => logout();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchChats()
      .then((chats: ChatSummary[]) => {
        const others = chats
          .flatMap(c => c.participants)
          .filter(p => p.shareId !== user?.shareId);
        const unique = Array.from(
          new Map(others.map(p => [p.shareId, p])).values()
        );
        setContacts(unique);
      })
      .catch(e => console.error('Failed to load chats:', e));
  }, [user]);

  if (!user)    return <Navigate to="/login" replace />;

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const openChat = async (shareId: string) => {
    try {
      const chat = await createChat([shareId]);
      navigate(`/chat/${chat._id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert('Could not open chat: ' + msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden
                      md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        <NavBar userName={user.name} onLogout={handleLogout} />

        <div className="flex-1 px-5 py-4 md:px-3 md:py-2 overflow-y-auto">
          <h1 className="text-3xl md:text-2xl font-bold mb-6 md:mb-4 text-gray-800">
            Your Contacts
          </h1>

          <div className="relative mb-6 md:mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2
                                text-gray-400 text-lg md:text-base" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search contacts…"
              className="w-full pl-12 pr-4 py-3 md:pl-10 md:py-2 bg-gray-100 rounded-full
                         focus:outline-none focus:ring-2 focus:ring-cyan-300
                         text-base md:text-sm"
            />
          </div>

          <ul className="space-y-4 md:space-y-3">
            {filtered.map(c => (
              <li
                key={c.shareId}
                onClick={() => openChat(c.shareId)}
                className="flex items-center justify-between px-5 py-4
                           md:px-3 md:py-2 bg-white rounded-xl shadow-md
                           md:shadow hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center space-x-4 md:space-x-3">
                  <div
                    className="h-12 w-12 md:h-8 md:w-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#' + c.shareId.slice(-6) }}
                  />
                  <div className="flex-1">
                    <div
                      className="text-lg md:text-base font-semibold text-gray-900 truncate"
                      title={c.name}
                    >
                      {c.name}
                    </div>
                  </div>
                </div>
                <div className="text-2xl md:text-base text-gray-400">›</div>
              </li>
            ))}
          </ul>

          <div className="flex justify-center mt-8 md:mt-6">
            <button
              onClick={() => navigate('/new-chat')}
              className="p-4 md:p-2 bg-blue-500 text-white rounded-full
                         shadow-lg hover:bg-blue-600 transition"
            >
              <FiPlus size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
