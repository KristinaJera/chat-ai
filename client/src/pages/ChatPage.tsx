import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { User } from "../api/users";
import { NavBar } from "../components/NavBar";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";
import { MessageList } from "../components/chat/MessageList";
import { Composer } from "../components/chat/Composer";
import { TypingFooter } from "../components/chat/TypingFooter";
import {
  FiTrash2,
  FiUserX,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { deleteChat, removeParticipant } from "../api/chats";
import { fetchChats, ChatSummary } from "../api/chats";

interface Participant {
  name: string;
  shareId: string;
}

export default function ChatPage({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const chatId = id ?? "";
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showList, setShowList] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { messages, send, edit, remove } = useMessages(chatId, user.id);
  const { typingUsers, onInput } = useTyping(chatId, user.id);

  useEffect(() => {
    fetchChats()
      .then((all: ChatSummary[]) => {
        const chat = all.find((c) => c._id === chatId);
        if (chat) {
          setParticipants(chat.participants);
        } else {
          console.warn("Chat not found: ", chatId);
        }
      })
      .catch(console.error);
  }, [chatId]);

  const handleRemove = async (shareId: string) => {
    if (!confirm("Remove this participant?")) return;
    await removeParticipant(chatId, shareId);
    if (shareId === user.shareId) {
      navigate("/chats");
      return;
    }
    setParticipants((ps) => ps.filter((p) => p.shareId !== shareId));
  };

  const others = participants.filter((p) => p.shareId !== user.shareId);
  const collapsedTitle =
    participants.length > 2
      ? `${others.slice(0, 2).map((p) => p.name).join(", ")}, …`
      : others.map((p) => p.name).join(", ");
  const title = collapsedTitle;

  const handleDeleteChat = async () => {
    if (!confirm("Delete this chat?")) return;
    await deleteChat(chatId);
    navigate("/chats");
  };

  if (!chatId) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500 text-[100%] md:text-sm">
      <div className="relative bg-white w-full h-screen overflow-hidden md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        <NavBar userName={user.name}/>

        {/* participants header */}
        <div className="p-4 bg-white">
          <div className="flex justify-between items-center">
            <div className="flex-1 flex items-center space-x-2">
              <button
                onClick={() => navigate("/chats")}
                className="text-gray-600 hover:text-gray-900"
              >
                <FiArrowLeft size={20} />
              </button>
              <button
                onClick={() => setShowList((prev) => !prev)}
                className="text-xl md:text-base font-semibold text-gray-900 truncate flex items-center space-x-1"
              >
                <span>{title || "No participants"}</span>
                {participants.length > 2 && (showList ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />)}
              </button>
            </div>
            <button
              onClick={handleDeleteChat}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              <FiTrash2 size={20} />
            </button>
          </div>

          {showList && (
            <ul className="mt-3 space-y-2">
              {participants.map((p) => (
                <li
                  key={p.shareId}
                  className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100"
                >
                  <span className="text-gray-800 text-lg md:text-sm">
                    {p.name} {p.shareId === user.shareId && "(YOU)"}
                  </span>
                  <button
                    onClick={() => handleRemove(p.shareId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiUserX />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* messages */}
        <main className="flex-1 space-y-2 overflow-y-auto  bg-gradient-to-b from-white to-sky-300">
          <MessageList
            messages={messages}
            currentUser={user.id}
            onEdit={(msgId) => {
              const orig = messages.find((m) => m._id === msgId)?.body || "";
              const body = prompt("Edit message:", orig);
              if (body !== null) edit(msgId, body);
            }}
            onDelete={(msgId) => {
              if (confirm("Delete this message?")) remove(msgId);
            }}
            onTranslate={(msgId) => {
              const m = messages.find((m) => m._id === msgId);
              if (!m) return;
              window.open(
                "https://translate.google.com/?sl=auto&tl=en&text=" +
                  encodeURIComponent(m.body),
                "_blank"
              );
            }}
            onReply={setReplyTo}
          />
        </main>

        <TypingFooter typingUsers={typingUsers} />

        <footer className="p-4 bg-white shadow">
          {replyTo && (
            <div className="mb-2 p-2 bg-yellow-100 rounded flex justify-between items-center text-sm">
              <span className="truncate">
                Replying to: {messages.find((m) => m._id === replyTo)?.body}
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
            draftPlaceholder={replyTo ? "Type your reply…" : "Type a message…"}
            onInput={onInput}
            onSend={(body) => {
              send(body, replyTo ?? undefined);
              setReplyTo(null);
            }}
            onAttach={(file) => console.log("Attach:", file)}
          />
        </footer>
      </div>
    </div>
  );
}
