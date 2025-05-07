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
  const isMine = message.authorName === currentUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div
      ref={wrapperRef}
      className={`relative flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      {/* Bubble (click to open menu) */}
      <div
        className={`max-w-xs p-2 rounded-lg cursor-pointer ${
          isMine
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none"
        }`}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {original && (
          <div className="mb-1 p-1 bg-gray-200 text-xs italic rounded">
            ↳ {original.body}
          </div>
        )}
        <div className="font-semibold">
          {isMine ? "You" : message.authorName}
        </div>
        <div>
          {message.status === "deleted" ? (
            <em className="italic text-gray-300">[deleted]</em>
          ) : (
            message.body
          )}
        </div>
        {message.status === "edited" && (
          <div className="text-xxs text-gray-300 mt-1">(edited)</div>
        )}
      </div>

      {/* Pop-up menu */}
      {menuOpen && (
        <ul className="absolute z-20 top-0 left-0 mt-12 bg-white border rounded shadow-lg w-32">
          {isMine && message.status !== "deleted" && (
            <>
              <li>
                <button
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(message._id);
                  }}
                >
                  Edit
                </button>
              </li>
              <li>
                <button
                  className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(message._id);
                  }}
                >
                  Delete
                </button>
              </li>
            </>
          )}
          <li>
            <button
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false);
                onTranslate(message._id);
              }}
            >
              Translate
            </button>
          </li>
          <li>
            <button
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false);
                onReply(message._id);
              }}
            >
              Reply
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};
