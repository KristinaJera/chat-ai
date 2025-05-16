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
  const [menuUp, setMenuUp] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Determine number of grid columns: up to 3 per row
  const attachmentCount = message.attachments?.length ?? 0;
  const cols =
    attachmentCount <= 3
      ? attachmentCount
      : attachmentCount <= 9
      ? 3
      : Math.ceil(attachmentCount / 3);

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

  // Close lightbox on escape
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lightboxUrl) setLightboxUrl(null);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [lightboxUrl]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const buffer = 120;
      const shouldOpenUp = rect.bottom + buffer > window.innerHeight;
      setMenuUp(shouldOpenUp);
    }
    setMenuOpen((open) => !open);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative flex px-3 py-1 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {/* Message bubble */}
      <div
        onClick={toggleMenu}
        className={`relative group max-w-[80%] p-3 rounded-2xl text-sm font-medium transition
          ${
            isMine
              ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-none"
              : "bg-gradient-to-br from-cyan-100 to-cyan-300 text-gray-800 rounded-bl-none"
          } shadow-md hover:shadow-lg cursor-pointer`}
      >
        {original && (
          <div className="mb-2 px-2 py-1 bg-white bg-opacity-30 text-xs italic rounded-xl">
            ↳ {original.body}
          </div>
        )}

        {/* Text body */}
        <div className="whitespace-pre-wrap break-words">
          {message.status === "deleted" ? (
            <em className="italic text-gray-300">[deleted]</em>
          ) : (
            message.body
          )}
        </div>

        {/* Attachments grid */}
        {attachmentCount > 0 && (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {(message.attachments ?? []).map((att, idx) => (
              <div key={idx} className="w-full">
                {att.mimeType.startsWith("image/") ? (
                  <div
                    className="cursor-pointer"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setLightboxUrl(att.url);
                    }}
                  >
                    <img
                      src={att.url}
                      alt={att.filename}
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                ) : (
                  <a
                    href={att.url}
                    download={att.filename}
                    className="text-white underline"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    {att.filename}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {message.status === "edited" && (
          <div className="text-[10px] text-white text-opacity-60 mt-1">(edited)</div>
        )}
      </div>

      {/* Context menu positioned dynamically */}
      {menuOpen && (
        <ul
          className={`absolute z-30 bg-white border border-gray-200 rounded-xl shadow-md w-36 text-sm ${
            menuUp ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
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

      {/* Lightbox modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl} alt="Preview" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()}/>
          <button className="absolute top-4 right-4 text-white text-2xl bold" onClick={() => setLightboxUrl(null)}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
};