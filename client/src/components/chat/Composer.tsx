import React, { useState, useRef, useEffect } from "react";
import { rewrite } from "../../api/ai";
import { FiPaperclip, FiSend, FiEdit2, FiX, FiLoader } from "react-icons/fi";

interface Props {
  draftPlaceholder?: string;
  onInput?(): void;
  onSend(body: string, attachments?: File[]): void;
}

export const Composer: React.FC<Props> = ({
  draftPlaceholder = "Type a message...",
  onInput,
  onSend,
}) => {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const composerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) {
        setAiModalOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments);
    setDraft("");
    setAttachments([]);
    setSuggestions([]);
    setAiModalOpen(false);
  };

  const handleRewrite = async () => {
    if (!draft.trim()) return;
    setLoadingRewrite(true);
    try {
      const { suggestions: aiSuggestions } = await rewrite(draft);
      setSuggestions(aiSuggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingRewrite(false);
    }
  };

  return (
    <div ref={composerRef} className="relative flex flex-col space-y-2 w-full">
      {/* Attachment preview grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {attachments.map((file, idx) => {
            const url = URL.createObjectURL(file);
            const isImage = file.type.startsWith("image/");
            return (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden border border-gray-200"
              >
                {isImage ? (
                  <img
                    src={url}
                    alt={file.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-24 bg-gray-100">
                    <FiPaperclip className="text-2xl text-gray-500" />
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                >
                  <FiX className="text-gray-600" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FiPaperclip className="text-gray-600 text-xl" />
        </button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          type="text"
          className="flex-1 min-w-0 w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={draftPlaceholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onInput?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          onClick={() => { setAiModalOpen(true); handleRewrite(); }}
          className="p-2 rounded-full hover:bg-gray-100 relative"
        >
          {loadingRewrite ? (
            <FiLoader className="animate-spin text-gray-600 text-xl" />
          ) : (
            <FiEdit2 className="text-gray-600 text-xl" />
          )}
        </button>

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
        >
          <FiSend className="text-xl" />
        </button>
      </div>

      {/* Modal under input with AI answers */}
      {aiModalOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-80 bg-white border rounded-lg shadow-lg z-30">
          <div className="px-4 py-2 border-b flex justify-between items-center">
            <h3 className="text-md font-semibold">Rewrite Suggestions</h3>
            <button onClick={() => setAiModalOpen(false)}>
              <FiX />
            </button>
          </div>
          <div className="p-4 max-h-60 overflow-y-auto">
            {loadingRewrite && <p className="text-gray-500">Generating...</p>}
            {!loadingRewrite && suggestions.length === 0 && <p className="text-gray-500">No suggestions</p>}
            {suggestions.map((text, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDraft(text);
                  setSuggestions([]);
                  setAiModalOpen(false);
                }}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};