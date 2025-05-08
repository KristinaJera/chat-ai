// // src/components/NavBar.tsx
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FiUsers, FiUser, FiLogOut } from 'react-icons/fi';

// interface NavBarProps {
//   userName: string;
//   onLogout(): void;
// }

// export function NavBar({ userName, onLogout }: NavBarProps) {
//   return (
//     <div className="relative h-40 bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden">
//       {/* Waves */}
//       {[
//         { cls: 'wave-slower', fill: 'rgba(255,255,255,0.2)' },
//         { cls: 'wave-medium', fill: 'rgba(255,255,255,0.4)' },
//         { cls: 'wave-slow',   fill: 'rgba(255,255,255,0.6)' },
//         { cls: 'wave-fast',   fill: 'white' }
//       ].map(({ cls, fill }, i) => (
//         <svg
//           key={i}
//           className={`absolute bottom-0 left-0 w-[200%] ${cls}`}
//           style={{ height: '6rem' }}
//           viewBox="0 0 1440 320"
//           preserveAspectRatio="none"
//         >
//           <path
//             d="M0,160 C360,320 720,0 1080,160 C1320,240 1440,120 1440,120 L1440,320 L0,320 Z"
//             fill={fill}
//           />
//         </svg>
//       ))}

//       {/* Nav content */}
//       <nav className="relative flex items-center justify-between px-4 pt-4 text-white">
//         <div className="flex items-center space-x-4">
//           <Link to="/contacts" className="flex items-center space-x-1 hover:text-gray-200">
//             <FiUsers /> <span>Contacts</span>
//           </Link>
//           <Link to="/profile" className="flex items-center space-x-1 hover:text-gray-200">
//             <FiUser /> <span>Profile</span>
//           </Link>
//         </div>
//         <div className="flex items-center space-x-4">
//           <span className="font-medium">Hello, {userName}</span>
//           <button onClick={onLogout} className="flex items-center space-x-1 hover:text-red-200">
//             <FiLogOut /> <span>Logout</span>
//           </button>
//         </div>
//       </nav>
//     </div>
// );
// }

// src/components/NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiMessageCircle, FiUser, FiLogOut } from 'react-icons/fi';

interface NavBarProps {
  userName: string;
  onLogout(): void;
}

export function NavBar({ userName, onLogout }: NavBarProps) {
  return (
    <div className="relative h-44 bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden">
      {/* Four waves, each exactly 6rem tall, bottom‑aligned */}
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

      {/* Centered greeting, up in that solid-blue area */}
      <div className="absolute inset-x-0 top-10 text-center z-10">
        <span className="text-white text-lg font-semibold">
          Welcome to Chat AI, {userName}
        </span>
      </div>

      {/* Icon bar floated just above the waves */}
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
          onClick={onLogout}
          className="bg-white p-2 rounded-full shadow-lg text-red-500 hover:scale-110 transition"
          title="Logout"
        >
          <FiLogOut size={24} />
        </button>
      </div>
    </div>
);
}
