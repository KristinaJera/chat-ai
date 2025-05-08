import React, { useEffect, useRef, useState } from "react";
import type { Message } from "../../types/message";
import { MessageItem } from "./MessageItem";
import { FiArrowDownCircle } from "react-icons/fi";

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  onEdit(id: string): void;
  onDelete(id: string): void;
  onTranslate(id: string): void;
  onReply(id: string): void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  onEdit,
  onDelete,
  onTranslate,
  onReply,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Scroll to bottom
  const scrollToBottom = () => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Watch for new messages
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    if (isNearBottom) {
      scrollToBottom();
      setShowScrollBtn(false);
    } else {
      setShowScrollBtn(true);
    }
  }, [messages]);

  // Track user scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setShowScrollBtn(!isNearBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative h-full">
      {/* Scrollable messages */}
      <div
        ref={listRef}
        className="space-y-4 p-4 overflow-y-auto h-full rounded-lg bg-gradient-to-b from-white to-sky-300"
      >
        {messages.map((m) => (
          <MessageItem
            key={m._id}
            message={m}
            currentUser={currentUser}
            original={
              m.replyTo ? messages.find((x) => x._id === m.replyTo) : undefined
            }
            onEdit={onEdit}
            onDelete={onDelete}
            onTranslate={onTranslate}
            onReply={onReply}
          />
        ))}
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <button
  onClick={scrollToBottom}
  className="absolute right-5 bottom-6 z-10 p-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg hover:scale-110 transform transition duration-300 animate-bounce-slow"
  aria-label="Scroll to bottom"
>
  <FiArrowDownCircle className="text-white text-3xl " />
</button>

)}

    </div>
  );
};
