import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavBar } from '../components/NavBar';
import { getProfile, type User } from '../api/users';
import { FiUser, FiMail, FiKey, FiCode } from 'react-icons/fi';
import QRCode from 'react-qr-code';
import { logout } from '../api/auth';

export default function ProfilePage() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);

  // independent toggles
  const [showId, setShowId] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (user) {
      getProfile().then(setProfile).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading…</div>;
  if (!user)  return <Navigate to="/" replace />;

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500">
      <div className="relative bg-white w-full h-screen md:w-80 md:h-[600px] rounded-3xl shadow-xl flex flex-col">
        <NavBar userName={user.name} onLogout={handleLogout} />

        <div className="px-6 pt-20 pb-8 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-center -mt-16">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <FiUser className="text-purple-500" size={36} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800">
            {profile?.name}
          </h2>
          <div className="flex items-center space-x-3">
            <FiMail className="text-gray-400" size={20} />
            <span className="text-gray-700">{profile?.email}</span>
          </div>

          {/* Share ID toggle */}
          <div className="flex items-center space-x-3">
            <FiKey className="text-gray-400" size={20} />
            <button
              onClick={() => setShowId(id => !id)}
              className="flex-1 text-left text-indigo-600 hover:underline"
            >
              {showId ? 'Hide Share ID' : 'Show Share ID'}
            </button>
          </div>
          {showId && (
            <div className="bg-gray-100 p-2 rounded text-sm break-words">
              {profile?.shareId}
            </div>
          )}

          {/* QR Code toggle */}
          <div className="flex items-center space-x-3">
            <FiCode className="text-gray-400" size={20} />
            <button
              onClick={() => setShowQr(q => !q)}
              className="flex-1 text-left text-indigo-600 hover:underline"
            >
              {showQr ? 'Hide QR Code' : 'Show QR Code'}
            </button>
          </div>
          {showQr && (
            <div className="flex justify-center mt-2">
              <QRCode value={profile!.shareId} size={180} />
            </div>
          )}

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
