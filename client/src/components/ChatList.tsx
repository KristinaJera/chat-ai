import React from 'react';
import { Link } from 'react-router-dom';
// import { useChats, ChatSummary } from '../hooks/useChats';
import { useChats, ChatSummary } from '../hooks/useChats';

export function ChatList() {
  const { chats, loading } = useChats();

  if (loading) return <div>Loading chats…</div>;
  if (chats.length === 0)
    return <div>No chats yet. <Link to="/new-chat" className="text-blue-600">Start one</Link></div>;

  return (
    <ul className="space-y-2">
      {chats.map((chat: ChatSummary) => {
        const names = chat.participants.map(p => p.name).join(', ');
        return (
          <li key={chat._id}>
            <Link
              to={`/chat/${chat._id}`}
              className="block p-2 border rounded hover:bg-gray-100"
            >
              {names}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
export default ChatList;