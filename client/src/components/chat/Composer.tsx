
import React, { useState, useRef, useEffect } from "react";
import { rewrite } from "../../api/ai";

interface Props {
  draftPlaceholder?: string;
  onInput?(): void;
  onSend(body: string): void;
}

export const Composer: React.FC<Props> = ({
  draftPlaceholder = "Type a message...",
  onInput,
  onSend,
}) => {
  const [draft, setDraft] = useState("");
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) {
        setAiMenuOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const handleRewrite = async () => {
    if (!draft.trim()) return;
    setAiMenuOpen(false);
  
    try {
      const { suggestions } = await rewrite(draft);
      setSuggestions(suggestions);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
    setSuggestions([]);
  };

  return (
    <div ref={wrapper} className="flex items-start space-x-2 relative">
      <div className="relative flex-1">
        <input
          className="w-full border rounded p-2"
          placeholder={draftPlaceholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            onInput?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => {
            setAiMenuOpen(!aiMenuOpen);
            setSuggestions([]);
          }}
        >
          🤖
        </button>

        {aiMenuOpen && (
          <ul className="absolute bottom-full right-0 mb-2 bg-white border rounded shadow w-48 z-10">
            <li>
              <button className="block w-full px-3 py-1 hover:bg-gray-100" onClick={handleRewrite}>
                Rewrite Professionally
              </button>
            </li>
          </ul>
        )}

        {suggestions.length > 0 && (
          <ul className="absolute bottom-full right-0 mb-2 bg-white border rounded shadow w-64 z-20">
            {suggestions.map((text, idx) => (
              <li key={idx}>
                <button
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setDraft(text);
                    setSuggestions([]);
                  }}
                >
                  {text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

