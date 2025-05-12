import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavBar } from '../components/NavBar';
import { FiMessageCircle } from 'react-icons/fi';
import { createChat } from '../api/chats';

export default function NewChatForm() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [codes, setCodes] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const entries = codes
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (entries.length === 0) {
      alert('Please enter at least one share ID');
      return;
    }

    try {
      const chat = await createChat(entries);
      navigate(`/chat/${chat._id}`);
    } catch (err: unknown) {
      // Narrow unknown to Error
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to create chat: ${message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        {/* Navbar */}
        <NavBar userName={user.name} />

        {/* Body */}
        <div className="px-6 pt-12 pb-8 flex-1 overflow-y-auto">
          <div className="flex justify-center mb-2">
            <FiMessageCircle size={48} className="text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800">
            Start a New Chat
          </h2>
          <div className="h-1 w-20 mx-auto my-2 bg-gradient-to-r from-purple-500 to-cyan-400 rounded" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="shareIds"
              className="block text-sm font-medium text-gray-700"
            >
              Share IDs (comma-separated)
            </label>
            <input
              id="shareIds"
              type="text"
              value={codes}
              onChange={e => setCodes(e.target.value)}
              placeholder="e.g. abc123, def456"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Start Chat
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
