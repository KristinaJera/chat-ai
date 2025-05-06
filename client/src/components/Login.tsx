import React from 'react';

export function Login() {
  const handleGoogleLogin = () => {
    // Redirect browser to your backend Google OAuth route
    window.location.href = 'http://localhost:3001/auth/google';
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Sign in with Google
    </button>
  );
}