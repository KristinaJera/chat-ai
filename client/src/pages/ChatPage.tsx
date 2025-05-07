// src/pages/ChatPage.tsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";
import { MessageList } from "../components/chat/MessageList";
import { Composer } from "../components/chat/Composer";
import { TypingFooter } from "../components/chat/TypingFooter";
import { User } from "../hooks/useAuth";
import { deleteChat } from "../api/chats";

interface ChatPageProps {
  user: User;
}

export default function ChatPage({ user }: ChatPageProps) {
  const { id: chatIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chatId = chatIdParam ?? "";
  const username = user.name;

  // Initialize hooks with chatId
  const { messages, send, edit, remove } = useMessages(chatId, username);
  const { typingUsers, onInput } = useTyping(chatId, username);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  if (!chatIdParam) {
    return <div>Loading chat...</div>;
  }

  const handleEdit = (id: string) => {
    const orig = messages.find((m) => m._id === id)?.body ?? "";
    const body = prompt("Edit message:", orig);
    if (body !== null) edit(id, body);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this message?")) remove(id);
  };

  const handleTranslate = (id: string) => {
    const msg = messages.find((m) => m._id === id);
    if (!msg) return;
    const url =
      "https://translate.google.com/?sl=auto&tl=en&text=" +
      encodeURIComponent(msg.body);
    window.open(url, "_blank");
  };

  const handleReply = (id: string) => setReplyTo(id);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
<header className="p-4 bg-white shadow flex justify-between items-center">
  <h3 className="text-xl font-bold">🗨️ Chat — {username}</h3>
  <button
    onClick={async () => {
      if (!confirm('Delete this chat for everyone?')) return;
      try {
        await deleteChat(chatId);
        navigate('/');
      } catch (e) {
        alert(`Error: ${e instanceof Error ? e.message : e}`);
      }
    }}
    className="text-red-600 hover:text-red-800"
  >
    Delete Chat
  </button>
</header>


      <main className="flex-1 p-4 space-y-2 overflow-y-auto">
        <MessageList
          messages={messages}
          currentUser={username}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTranslate={handleTranslate}
          onReply={handleReply}
        />
      </main>

      <TypingFooter typingUsers={typingUsers} />

      <footer className="p-4 bg-white shadow">
        {replyTo && (
          <div className="mb-2 p-2 bg-yellow-200 rounded flex justify-between items-center">
            <span>
              Replying to:{" "}
              {messages.find((m) => m._id === replyTo)?.body}
            </span>
            <button
              className="ml-2 text-red-500"
              onClick={() => setReplyTo(null)}
            >
              ✕
            </button>
          </div>
        )}
        <Composer
          draftPlaceholder={
            replyTo ? "Type your reply…" : "Type a message…"
          }
          onInput={onInput}
          onSend={(body) => {
            send(body, replyTo ?? undefined);
            setReplyTo(null);
          }}
        />
      </footer>
    </div>
  );
}
