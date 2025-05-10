// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NavBar } from '../components/NavBar';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiKey, FiEyeOff } from 'react-icons/fi';
import { logout } from '../api/auth';
import { getProfile, User } from '../api/users';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [showId, setShowId] = useState(false);
  const handleLogout = () => logout();

  useEffect(() => {
    if ( user) {
      getProfile()
        .then(setProfile)
        .catch(console.error);
    }
  }, [ user]);
  if (!user)   return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen overflow-hidden
                      md:w-80 md:h-[600px] md:rounded-3xl md:shadow-xl flex flex-col">
        {/* Navbar on top */}
        <NavBar userName={user.name} onLogout={handleLogout} />

        {/* Body */}
        <div className="px-6 pt-20 pb-8 space-y-6 flex-1 overflow-y-auto">
          {/* Floating profile icon */}
          <div className="flex justify-center -mt-16">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <FiUser className="text-purple-500" size={36} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800">
            {profile?.name}
          </h2>

          {/* Email */}
          <div className="flex items-center space-x-3">
            <FiMail className="text-gray-400" size={20} />
            <span className="text-gray-700">{profile?.email}</span>
          </div>

          {/* Share ID toggle */}
          <div className="flex items-center space-x-3">
            {showId
              ? <FiEyeOff className="text-gray-400" size={20} />
              : <FiKey className="text-gray-400" size={20} />
            }
            <button
              onClick={() => setShowId(s => !s)}
              className="flex-1 text-left text-indigo-600 hover:underline"
            >
              {showId ? 'Hide' : 'Show'} Share ID
            </button>
          </div>
          {showId && (
            <div className="bg-gray-100 p-2 rounded text-sm break-words">
              {profile?.shareId}
            </div>
          )}

          {/* Back Home */}
          <button
            onClick={() => navigate('/chats')}
            className="w-full py-2 bg-indigo-500 text-white rounded-full shadow hover:bg-indigo-600 transition"
          >
            Back to Chats
          </button>
        </div>
      </div>
    </div>
  );
}
