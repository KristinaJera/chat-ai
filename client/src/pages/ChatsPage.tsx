
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import { FiPlus, FiSearch, FiX, FiCheck, FiTrash } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useChats } from '../hooks/useChats';
import { NavBar } from '../components/NavBar';
import { deleteChat, type ChatSummary } from '../api/chats';
import { logout } from '../api/auth';

export default function ChatsPage() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const { chats, loading: chatsLoading, setChats } = useChats();
  const [query, setQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const longPressTimers = useRef<Record<string, number>>({});

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/', { replace: true });
  };

  if (loading || chatsLoading) {
    return <div className="h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const filtered = chats.filter(c => {
    const names = c.participants
      .filter(p => p.shareId !== user.shareId)
      .map(p => p.name)
      .join(', ');
    return names.toLowerCase().includes(query.toLowerCase());
  });

  function startLongPress(id: string) {
    longPressTimers.current[id] = window.setTimeout(() => {
      setSelectionMode(true);
      setSelected(prev => new Set(prev).add(id));
    }, 600);
  }
  function endLongPress(id: string) {
    clearTimeout(longPressTimers.current[id]);
    delete longPressTimers.current[id];
  }
  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectionMode(next.size > 0);
      return next;
    });
  }

  async function confirmBatchDelete() {
    const ids = Array.from(selected);
    await Promise.all(ids.map(id => deleteChat(id)));
    setChats(prev => prev.filter(c => !ids.includes(c._id)));
    setSelected(new Set());
    setSelectionMode(false);
    setShowBatchDeleteModal(false);
  }

  const handleBatchDeleteClick = () => {
    setShowBatchDeleteModal(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        <NavBar userName={user.name} onLogout={handleLogout} />

        {selectionMode && (
          <div className="flex items-center justify-between px-5 py-3 bg-red-50">
            <button
              onClick={() => { setSelectionMode(false); setSelected(new Set()); }}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <FiX size={20} className="text-gray-600" />
            </button>
            <span className="font-medium text-gray-700">{selected.size} selected</span>
            <button
              onClick={handleBatchDeleteClick}
              className="p-2 rounded-full hover:bg-red-100"
            >
              <FiTrash size={20} className="text-red-600" />
            </button>
          </div>
        )}

        <div className="flex-1 px-5 py-4 md:px-3 md:py-2 overflow-y-auto">
          <h1 className="text-3xl md:text-2xl font-bold mb-6 md:mb-4 text-gray-800">Your Chats</h1>
          <div className="relative mb-6 md:mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search chat"
              className="w-full pl-12 pr-4 py-3 md:pl-10 md:py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-300 text-base md:text-sm"
            />
          </div>

          <ul className="space-y-4 md:space-y-3">
            {filtered.map(chat => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isSelected={selected.has(chat._id)}
                selectionMode={selectionMode}
                onNavigate={() => navigate(`/chat/${chat._id}`)}
                onLongPress={() => startLongPress(chat._id)}
                onLongPressEnd={() => endLongPress(chat._id)}
                onSelect={() => toggleSelect(chat._id)}
                onSwipeComplete={() => setDeleteTarget(chat._id)}
              />
            ))}
          </ul>

          {!selectionMode && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => navigate('/new-chat')}
                className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
              >
                <FiPlus size={24} />
              </button>
            </div>
          )}
        </div>

        {(deleteTarget || showBatchDeleteModal) && (
          <ConfirmationModal
            onCancel={() => { setDeleteTarget(null); setShowBatchDeleteModal(false); }}
            onConfirm={() => {
              if (showBatchDeleteModal) confirmBatchDelete();
              else if (deleteTarget) {
                deleteChat(deleteTarget).then(() => {
                  setChats(prev => prev.filter(c => c._id !== deleteTarget));
                  setDeleteTarget(null);
                });
              }
            }}
            message={showBatchDeleteModal ?
              'Delete selected chats? This action cannot be undone.' :
              'Delete this chat? This action cannot be undone.'}
          />
        )}
      </div>
    </div>
  );
}

interface ChatListItemProps {
  chat: ChatSummary;
  isSelected: boolean;
  selectionMode: boolean;
  onNavigate(): void;
  onLongPress(): void;
  onLongPressEnd(): void;
  onSelect(): void;
  onSwipeComplete(): void;
}

function ChatListItem({ chat, isSelected, selectionMode, onNavigate, onLongPress, onLongPressEnd, onSelect, onSwipeComplete, }: ChatListItemProps) {
  // Always call hooks first
  const { user } = useAuth();
  const [swiping, setSwiping] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers: SwipeableHandlers = useSwipeable({
    onSwipedRight: () => {
      if (!selectionMode && !isDesktop) {
        setSwiping(true);
        setTimeout(() => { onSwipeComplete(); setSwiping(false); }, 300);
      }
    },
    onSwipedLeft: () => setSwiping(false),
    delta: 50,
    trackTouch: true,
    trackMouse: false,
  });

  // Now it's safe to bail
  if (!user) return null;

  // Compute title
  const others = chat.participants.filter(p => p.shareId !== user.shareId).map(p => p.name);
  const title = others.length === 0 ? 'Unknown' : others.slice(0, 2).join(', ') + (others.length > 2 ? ', …' : '');

  return (
    <li
      {...handlers}
      onMouseDown={isDesktop ? onLongPress : undefined}
      onMouseUp={isDesktop ? onLongPressEnd : undefined}
      onTouchStart={isDesktop ? onLongPress : undefined}
      onTouchEnd={isDesktop ? onLongPressEnd : undefined}
      onClick={() => (selectionMode ? onSelect() : onNavigate())}
      className={`relative overflow-hidden flex items-center justify-between px-5 py-4 md:px-3 md:py-2 bg-white rounded-xl shadow-md hover:bg-gray-100 cursor-pointer ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className={`absolute inset-0 bg-red-500 transition-opacity duration-300 ${swiping ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`flex items-center space-x-4 flex-1 transition-transform duration-300 ease-in-out ${swiping ? 'translate-x-full' : 'translate-x-0'}`}>
        <div className="h-12 w-12 rounded-full" style={{ backgroundColor: `#${chat._id.slice(-6)}` }} />
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-900 truncate" title={title}>{title}</div>
          <div className="text-sm text-gray-500">{selectionMode ? (isSelected ? 'Selected' : 'Tap to select') : 'Tap to open'}</div>
        </div>
      </div>
      {isSelected && !swiping && isDesktop && <FiCheck className="text-blue-400" size={24} />}
    </li>
  );
}

interface ConfirmationModalProps { onCancel(): void; onConfirm(): void; message: string; }
function ConfirmationModal({ onCancel, onConfirm, message }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-sm">
        <div className="flex justify-end"><button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200"><FiX size={18} /></button></div>
        <h2 className="text-xl font-semibold mb-4">Confirm delete</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4"><button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button></div>
      </div>
    </div>
  );
}
