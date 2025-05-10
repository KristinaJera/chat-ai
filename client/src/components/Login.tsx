import React,{ useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import {
  FiMessageCircle,
  FiSmile,
  FiThumbsUp,
  FiStar,
  FiZap,
  FiCoffee,
  FiHeart,
  FiBell,
  FiSend,
} from 'react-icons/fi';
import { loginWithGoogle } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
 const handleGoogleLogin = () => loginWithGoogle();
  const { user } = useAuth();
 const navigate = useNavigate();

   useEffect(() => {
    if (user) {
      navigate('/chats', { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;
  return (
    <div
      className="
        min-h-screen flex items-center justify-center
        bg-white
        md:bg-gradient-to-br md:from-cyan-400 md:to-blue-500
      "
    >
      <div
        className="
          relative bg-white overflow-hidden
          w-full h-screen
          md:w-80 md:h-[600px] md:rounded-2xl md:shadow-xl
        "
      >
        {/* Top half gradient + animated waves */}
        <div className="relative h-3/5 bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden">
          {[ 
            { cls: 'wave-slower', fill: 'rgba(255,255,255,0.2)' },
            { cls: 'wave-medium', fill: 'rgba(255,255,255,0.4)' },
            { cls: 'wave-slow',   fill: 'rgba(255,255,255,0.6)' },
            { cls: 'wave-fast',   fill: 'white' },
          ].map(({ cls, fill }, i) => (
            <svg
              key={i}
              className={`absolute bottom-[-3px] left-0 w-[200%] ${cls} h-26`}
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
            >
              <path
                d="M0,160 C360,320 720,0 1080,160 C1320,240 1440,120 1440,120 L1440,320 L0,320 Z"
                fill={fill}
              />
            </svg>
          ))}

          {/* Title + icons */}
          <div className="absolute inset-x-0 top-[30%] text-center">
            <div className="relative inline-block">
              <h1 className="text-white text-5xl md:text-4xl font-bold">
                Chat AI
              </h1>
              <FiMessageCircle
                size={28}
                className="absolute -left-16 -top-8 text-white opacity-75 fade-1"
              />
              <FiSmile
                size={24}
                className="absolute -right-10 -top-6 text-white opacity-75 fade-2"
              />
              <FiThumbsUp
                size={24}
                className="absolute -left-10 bottom-[-4rem] text-white opacity-75 fade-3"
              />
              <FiStar
                size={23}
                className="absolute -right-12 bottom-[-3rem] text-white opacity-75 fade-4"
              />
              <FiZap
                size={20}
                className="absolute -left-6 top-[-4rem] text-white opacity-75 fade-5"
              />
              <FiCoffee
                size={20}
                className="absolute right-2 top-[-3rem] text-white opacity-75 fade-6"
              />
              <FiHeart
                size={22}
                className="absolute left-[20%] bottom-[-7rem] text-white opacity-75 fade-7"
              />
              <FiBell
                size={20}
                className="absolute right-[20%] bottom-[-5rem] text-white opacity-75 fade-8"
              />
              <FiSend
                size={20}
                className="absolute left-[45%] top-[-5rem] text-white opacity-75 fade-9"
              />
            </div>
          </div>
        </div>

        {/* Sign‑up pill */}
        <div className="absolute inset-x-0 top-[65%] flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-purple-300 opacity-30 blur-xl" />
            <button
              onClick={handleGoogleLogin}
              className="relative flex items-center space-x-3 px-7 py-4 md:px-4 md:py-3
                         bg-gradient-to-r from-purple-500 to-cyan-400
                         text-white text-lg md:text-sm font-medium rounded-full shadow-lg
                         hover:scale-105 transition btn-hop"
            >
              <FcGoogle size={20} />
              <span>Sign up with Google</span>
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="absolute inset-x-0 bottom-6 text-center text-xs text-gray-400">
          Read User License Agreement
        </p>
      </div>
    </div>
  );
}
