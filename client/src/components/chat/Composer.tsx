import React, { useState } from "react";

interface Props {
  draftPlaceholder?: string;
  onInput?(): void;
  onSend(body: string): void;
}

export const Composer: React.FC<Props> = ({
  draftPlaceholder = "",
  onInput,
  onSend,
}) => {
  const [draft, setDraft] = useState("");

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  return (
    <div className="flex space-x-2">
      <input
        className="flex-1 border rounded p-2"
        placeholder={draftPlaceholder}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onInput?.();
        }}
        onKeyDown={(e) => {
          onInput?.();
          if (e.key === "Enter") send();
        }}
      />
      <button
        onClick={send}
        className="bg-blue-600 text-white px-4 rounded"
      >
        Send
      </button>
    </div>
  );
};
