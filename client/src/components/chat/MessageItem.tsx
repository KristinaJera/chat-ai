import React, { useState, useRef, useEffect } from "react";
import type { Message } from "../../types/message";

interface Props {
  message: Message;
  original?: Message;
  currentUser: string;
  onEdit(id: string): void;
  onDelete(id: string): void;
  onTranslate(id: string): void;
  onReply(id: string): void;
}

export const MessageItem: React.FC<Props> = ({
  message,
  original,
  currentUser,
  onEdit,
  onDelete,
  onTranslate,
  onReply,
}) => {
  const isMine = message.authorId === currentUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuOpen && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      ref={wrapperRef}
      className={`relative flex px-3 py-1 ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        onClick={() => setMenuOpen((o) => !o)}
        className={`relative group max-w-[75%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm font-medium transition
          ${isMine
            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-none"
            : "bg-gradient-to-br from-cyan-100 to-cyan-300 text-gray-800 rounded-bl-none"
        } shadow-md hover:shadow-lg cursor-pointer`}
      >
        {original && (
          <div className="mb-2 px-2 py-1 bg-white bg-opacity-30 text-xs italic rounded-xl">
            ↳ {original.body}
          </div>
        )}

        <div>
          {message.status === "deleted" ? (
            <em className="italic text-gray-300">[deleted]</em>
          ) : (
            message.body
          )}
        </div>

        {message.status === "edited" && (
          <div className="text-[10px] text-white text-opacity-60 mt-1">(edited)</div>
        )}
      </div>

      {menuOpen && (
        <ul className="absolute z-30 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-md w-36 text-sm">
          {isMine && message.status !== "deleted" && (
            <>
              <li>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(message._id);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl"
                >
                  ✏️ Edit
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(message._id);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                >
                  🗑️ Delete
                </button>
              </li>
            </>
          )}
          <li>
            <button
              onClick={() => {
                setMenuOpen(false);
                onTranslate(message._id);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              🌐 Translate
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setMenuOpen(false);
                onReply(message._id);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-xl"
            >
              💬 Reply
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};
