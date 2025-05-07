import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteChat } from '../api/chats';
import type { ChatSummary } from '../hooks/useChats';
import { useChats } from '../hooks/useChats';

export function ChatList() {
  const { chats, loading, setChats } = useChats();
  const navigate = useNavigate();

  if (loading) return <div>Loading chats…</div>;
  if (chats.length === 0)
    return (
      <div>
        No chats yet.{' '}
        <Link to="/new-chat" className="text-blue-600">
          Start one
        </Link>
      </div>
    );

  // Handler to delete and refresh local state
  const handleDelete = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    try {
      await deleteChat(chatId);
      // Remove from local state
      setChats((prev: ChatSummary[]) => prev.filter((c) => c._id !== chatId));
      // Redirect if viewing the deleted chat
      navigate('/');
    } catch (err) {
      alert(`Delete failed: ${err instanceof Error ? err.message : err}`);
    }
  };

  return (
    <ul className="space-y-2">
      {chats.map((chat) => {
        const names = chat.participants.map((p) => p.name).join(', ');
        return (
          <li key={chat._id} className="flex items-center justify-between">
            <Link
              to={`/chat/${chat._id}`}
              className="flex-1 block p-2 border rounded hover:bg-gray-100"
            >
              {names}
            </Link>
            <button
              onClick={() => handleDelete(chat._id)}
              className="ml-2 px-2 py-1 text-red-600 hover:bg-red-100 rounded"
              title="Delete chat"
            >
              🗑️
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ChatList;
