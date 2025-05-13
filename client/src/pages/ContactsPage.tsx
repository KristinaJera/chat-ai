import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import { FiPlus, FiSearch, FiX, FiCheck, FiTrash } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getContacts, deleteContact, Contact } from '../api/contacts';
import { createChat } from '../api/chats';
import { logout } from '../api/auth';
import { NavBar } from '../components/NavBar';

export default function ContactsPage() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const longPressTimers = useRef<Record<string, number>>({});

  // load contacts on mount
  useEffect(() => {
    if (!user) return;
    getContacts()
      .then(setContacts)
      .catch(console.error);
  }, [user]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContact(deleteTarget);
      setContacts(cs => cs.filter(c => c.shareId !== deleteTarget));
    } catch {
      alert('Failed to remove contact');
    }
    setDeleteTarget(null);
    setSelected(new Set());
    setSelectionMode(false);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/', { replace: true });
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectionMode(next.size > 0);
      return next;
    });
  };

  const openChat = async (shareId: string) => {
    if (selectionMode) {
      toggleSelect(shareId);
      return;
    }
    try {
      const chat = await createChat([shareId]);
      navigate(`/chat/${chat._id}`);
    } catch {
      alert('Could not open chat');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        <NavBar userName={user.name} onLogout={handleLogout} />

        {/* batch-select toolbar */}
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
              onClick={() => setDeleteTarget(Array.from(selected)[0] || null)}
              className="p-2 rounded-full hover:bg-red-100"
            >
              <FiTrash size={20} className="text-red-600" />
            </button>
          </div>
        )}

        {/* content */}
        <div className="flex-1 px-5 py-4 md:px-3 md:py-2 overflow-y-auto">
          <h1 className="text-3xl md:text-2xl font-bold mb-6 md:mb-4 text-gray-800">Your Contacts</h1>

          {/* search */}
          <div className="relative mb-6 md:mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search contacts…"
              className="w-full pl-12 pr-4 py-3 md:pl-10 md:py-2 md:text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-300 text-base"
            />
          </div>

          {/* list */}
          <ul className="space-y-4 md:space-y-3">
            {filtered.map(c => (
              <ContactListItem
                key={c.shareId}
                contact={c}
                isSelected={selected.has(c.shareId)}
                selectionMode={selectionMode}
                onLongPressStart={id => {
                  longPressTimers.current[id] = window.setTimeout(() => {
                    setSelectionMode(true);
                    setSelected(new Set([id]));
                  }, 600);
                }}
                onLongPressEnd={id => clearTimeout(longPressTimers.current[id])}
                onSelect={() => toggleSelect(c.shareId)}
                onOpen={() => openChat(c.shareId)}
                onSwipeComplete={() => setDeleteTarget(c.shareId)}
              />
            ))}
          </ul>

          {/* new-contact button */}
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

        {/* delete confirmation */}
        {deleteTarget && (
          <ConfirmationModal
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
            message="Delete this contact?"
          />
        )}
      </div>
    </div>
  );
}

interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  selectionMode: boolean;
  onLongPressStart(id: string): void;
  onLongPressEnd(id: string): void;
  onSelect(): void;
  onOpen(): void;
  onSwipeComplete(): void;
}

function ContactListItem({ contact, isSelected, selectionMode, onLongPressStart, onLongPressEnd, onSelect, onOpen, onSwipeComplete }: ContactListItemProps) {
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
        setTimeout(() => {
          setSwiping(false);
          onSwipeComplete();
        }, 300);
      }
    },
    onSwipedLeft: () => setSwiping(false),
    delta: 50,
    trackTouch: true,
    trackMouse: false,
  });

  return (
    <li
      {...handlers}
      onMouseDown={() => isDesktop && onLongPressStart(contact.shareId)}
      onMouseUp={() => isDesktop && onLongPressEnd(contact.shareId)}
      onTouchStart={() => isDesktop && onLongPressStart(contact.shareId)}
      onTouchEnd={() => isDesktop && onLongPressEnd(contact.shareId)}
      onClick={() => (selectionMode ? onSelect() : onOpen())}
      className="relative overflow-hidden md:px-3 md:py-2 flex items-center justify-between px-5 py-4 bg-white rounded-xl shadow-md hover:bg-gray-100 cursor-pointer"
    >
      <div className={`absolute inset-0 bg-red-500 transition-opacity duration-300 ${swiping ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`flex items-center space-x-4 flex-1 transition-transform duration-300 ease-in-out ${swiping ? 'translate-x-full' : 'translate-x-0'}`}>
        <div className="h-12 w-12 rounded-full" style={{ backgroundColor: `#${contact.shareId.slice(-6)}` }} />
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-900 truncate" title={contact.name}>
            {contact.name}
          </div>
          <div className="text-sm text-gray-500">
            {selectionMode ? (isSelected ? 'Selected' : 'Tap to select') : 'Tap to message'}
          </div>
        </div>
      </div>
      {isSelected && !swiping && isDesktop && <FiCheck size={24} className="text-blue-400" />}
    </li>
  );
}

interface ConfirmationModalProps {
  onCancel(): void;
  onConfirm(): void;
  message: string;
}

function ConfirmationModal({ onCancel, onConfirm, message }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-sm">
        <div className="flex justify-end">
          <button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-200"><FiX size={18} /></button>
        </div>
        <h2 className="text-xl font-semibold mb-4">Confirm delete</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
}
