import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Chat {
  _id: string;
  participants: string[];
}

type NewChatPayload =
  | { inviteCode: string }
  | { participants: string[] };

export function NewChatForm() {
  const [codes, setCodes] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const entries = codes
      .split(',')
      .map(code => code.trim())
      .filter(code => code.length > 0);

    if (entries.length === 0) {
      alert('Please enter at least one share ID');
      return;
    }

    const payload: NewChatPayload =
      entries.length === 1
        ? { inviteCode: entries[0] }
        : { participants: entries };

    try {
      const res = await fetch('http://localhost:3001/api/chats', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        const message = data.error || `HTTP ${res.status}`;
        throw new Error(message);
      }

      const chat = (await res.json()) as Chat;
      navigate(`/chat/${chat._id}`);
    } catch (err: unknown) {
      console.error('Create chat failed:', err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to create chat: ${message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <label htmlFor="shareIds" className="block text-sm font-medium">
        Share IDs (comma-separated)
      </label>
      <input
        id="shareIds"
        type="text"
        value={codes}
        onChange={e => setCodes(e.target.value)}
        placeholder="e.g. abc123, def456"
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Start Chat
      </button>
    </form>
  );
}

export default NewChatForm;
