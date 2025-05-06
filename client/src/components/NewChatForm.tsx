// frontend/src/components/NewChatForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function NewChatForm() {
  const [codes, setCodes] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const participants = codes
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const res = await fetch('/api/chats', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participants }),
    });

    if (!res.ok) {
      alert('Failed to create chat');
      return;
    }
    const chat = await res.json();
    navigate(`/chat/${chat._id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-2">
      <label>Share-IDs (comma-separated):</label>
      <input
        value={codes}
        onChange={e => setCodes(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Start Chat
      </button>
    </form>
  );
}

export default NewChatForm;
