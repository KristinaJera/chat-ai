import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiMessageCircle, FiUser, FiLogOut } from 'react-icons/fi';
import { logout } from '../api/auth';

interface NavBarProps {
  userName: string;
}

export function NavBar({ userName }: NavBarProps) {
 const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();                     
    navigate('/', { replace: true });  
  };

  return (
    <div className="relative h-44 bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden">
      {[
        { cls: 'wave-slower', fill: 'rgba(255,255,255,0.2)' },
        { cls: 'wave-medium', fill: 'rgba(255,255,255,0.4)' },
        { cls: 'wave-slow',   fill: 'rgba(255,255,255,0.6)' },
        { cls: 'wave-fast',   fill: 'white' }
      ].map(({ cls, fill }, i) => (
        <svg
          key={i}
          className={`absolute left-0 w-[200%] bottom-[-52px] h-36 ${cls}`}
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
         <path
    d="M0,160 C360,320 720,0 1080,160 C1320,240 1440,120 1440,120 L1440,320 L0,320 Z"
    fill={fill}
  />

        </svg>
      ))}
      <div className="absolute inset-x-0 top-10 text-center z-10">
        <span className="text-white text-lg font-semibold">
          Welcome to Chat AI, {userName}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-12 flex justify-around z-10 px-8">
        <Link
          to="/contacts"
          className="bg-white p-2 rounded-full shadow-lg text-cyan-500 hover:scale-110 transition"
          title="Contacts"
        >
          <FiUsers size={24} />
        </Link>

        <Link
          to="/chats"
          className="bg-white p-2 rounded-full shadow-lg text-cyan-500 hover:scale-110 transition"
          title="Chats"
        >
          <FiMessageCircle size={24} />
        </Link>

        <Link
          to="/profile"
          className="bg-white p-2 rounded-full shadow-lg text-cyan-500 hover:scale-110 transition"
          title="Profile"
        >
          <FiUser size={24} />
        </Link>

        <button
         onClick={handleLogout}
          className="bg-white p-2 rounded-full shadow-lg text-red-500 hover:scale-110 transition"
          title="Logout"
        >
          <FiLogOut size={24} />
        </button>
      </div>
    </div>
);
}
