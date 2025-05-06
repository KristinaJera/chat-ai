// frontend/src/pages/ChatPage.tsx

import React, { useState } from "react";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";
import { MessageList } from "../components/chat/MessageList";
import { Composer } from "../components/chat/Composer";
import { TypingFooter } from "../components/chat/TypingFooter";
import { User } from "../hooks/useAuth";  // make sure this matches where you defined the User interface

interface ChatPageProps {
  user: User;
}

export default function ChatPage({ user }: ChatPageProps) {
  const roomId = "room1";
  // now pull username from the user prop
  const username = user.name;

  const { messages, send, edit, remove } = useMessages(roomId, username);
  const { typingUsers, onInput } = useTyping(roomId, username);

  // Edit handler
  const handleEdit = (id: string) => {
    const orig = messages.find((m) => m._id === id)?.body ?? "";
    const body = prompt("Edit message:", orig);
    if (body !== null) edit(id, body);
  };

  // Delete handler
  const handleDelete = (id: string) => {
    if (confirm("Delete this message?")) remove(id);
  };

  // Translate via Google Translate
  const handleTranslate = (id: string) => {
    const msg = messages.find((m) => m._id === id);
    if (!msg) return;
    const url =
      "https://translate.google.com/?sl=auto&tl=en&text=" +
      encodeURIComponent(msg.body);
    window.open(url, "_blank");
  };

  // Reply handler
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const handleReply = (id: string) => setReplyTo(id);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="p-4 bg-white shadow text-xl font-bold">
        🗨️ Chat — {username}
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
