import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NavBar } from '../components/NavBar';
import { fetchChats, deleteChat, ChatSummary } from '../api/chats';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiTrash, FiX } from 'react-icons/fi';
import { logout } from '../api/auth';

export default function ChatsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [query, setQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const handleLogout = () => logout();
  // track long-press timer for each item
  const timers = useRef<Record<string, number>>({});

  useEffect(() => {
    fetchChats().then(setChats).catch(console.error);
  }, []);

  if (loading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  const filtered = chats.filter(c => {
    const others = c.participants.filter(p => p.shareId !== user.shareId).map(p => p.name);
    return others.join(', ').toLowerCase().includes(query.toLowerCase());
  });

  function startPress(id: string) {
    timers.current[id] = window.setTimeout(() => {
      setSelectionMode(true);
      setSelectedChats(prev => new Set(prev).add(id));
    }, 600);
  }
  function endPress(id: string) {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }

  function toggleSelect(id: string) {
    setSelectedChats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (selectedChats.size === 1 && selectedChats.has(id)) {
      setSelectionMode(false);
    }
  }

  const confirmDelete = async () => {
    const ids = Array.from(selectedChats);
    await Promise.all(ids.map(id => deleteChat(id)));
    setChats(prev => prev.filter(c => !ids.includes(c._id)));
    setSelectedChats(new Set());
    setSelectionMode(false);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
       <NavBar userName={user.name} onLogout={handleLogout} />

        {/* Batch action bar */}
        {selectionMode && (
          <div className="flex items-center justify-between px-5 py-3 bg-red-50">
            <button
              onClick={() => { setSelectionMode(false); setSelectedChats(new Set()); }}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
            <span className="font-medium text-gray-700">{selectedChats.size} selected</span>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-full hover:bg-red-100"
            >
              <FiTrash size={20} className="text-red-600" />
            </button>
          </div>
        )}

        <div className="flex-1 px-5 py-4 md:px-3 md:py-2 overflow-y-auto">
          <h1 className="text-3xl md:text-2xl font-bold mb-6 md:mb-4 text-gray-800">
            Your Chats
          </h1>

          <div className="relative mb-6 md:mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg md:text-base" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search chat"
              className="w-full pl-12 pr-4 py-3 md:pl-10 md:py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-300 text-base md:text-sm"
            />
          </div>

          <ul className="space-y-4 md:space-y-3">
            {filtered.map(chat => {
              const others = chat.participants.filter(p => p.shareId !== user.shareId).map(p => p.name);
              const title = others.length <= 2 ? others.join(', ') : `${others.slice(0,2).join(', ')}, …`;
              const isSelected = selectedChats.has(chat._id);

              return (
                <li
                  key={chat._id}
                  onMouseDown={() => startPress(chat._id)}
                  onTouchStart={() => startPress(chat._id)}
                  onMouseUp={() => endPress(chat._id)}
                  onTouchEnd={() => endPress(chat._id)}
                  onClick={() => selectionMode ? toggleSelect(chat._id) : navigate(`/chat/${chat._id}`)}
                  className={
                    `flex items-center justify-between px-5 py-4 md:px-3 md:py-2 bg-white rounded-xl shadow-md hover:bg-gray-100 cursor-pointer
                    ${isSelected ? 'ring-2 ring-blue-400' : ''}`
                  }
                >
                  <div className="flex items-center space-x-4 md:space-x-3">
                    <div
                      className="h-12 w-12 md:h-8 md:w-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#' + chat._id.slice(-6) }}
                    />
                    <div className="flex-1">
                      <div className="text-lg md:text-base font-semibold text-gray-900 truncate" title={title}>
                        {title}
                      </div>
                      <div className="text-sm md:text-xs text-gray-500">
                        {selectionMode ? (isSelected ? 'Selected' : 'Tap to select') : 'Tap to open'}
                      </div>
                    </div>
                  </div>
                  {selectionMode && isSelected && <span className="text-blue-500">✓</span>}
                </li>
              );
            })}
          </ul>

          {!selectionMode && (
            <div className="flex justify-center mt-8 md:mt-6">
              <button
                onClick={() => navigate('/new-chat')}
                className="p-4 md:p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
              >
                <FiPlus size={24} />
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-11/12 max-w-sm">
              <div className="flex justify-end">
                <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-200">
                  <FiX size={18} className="text-gray-600" />
                </button>
              </div>
              <h2 className="text-xl font-semibold mb-4">Delete {selectedChats.size} Chat(s)?</h2>
              <p className="mb-6">Are you sure you want to delete the selected chat(s)? This action cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center space-x-1">
                  <FiX size={16} /><span>Cancel</span>
                </button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-1">
                  <FiTrash size={16} /><span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}