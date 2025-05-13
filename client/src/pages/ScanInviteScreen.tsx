// src/pages/ScanInviteScreen.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { createChat } from '../api/chats';
import { FiX } from 'react-icons/fi';

export function ScanInviteScreen() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-scanner');
    scannerRef.current = scanner;

   scanner
      .start(
        { facingMode: 'environment' },          
        { fps: 10, qrbox: 250 },                
        async decodedText => {                 
          await scanner.stop();
          try {
            const chat = await createChat([decodedText]);
            navigate(`/chat/${chat._id}`);
          } catch {
            alert('Could not start chat with that user.');
            navigate('/contacts');
          }
        },
      () => {
        // ignore decode-fail errors to avoid console spam
      }
      )
      .catch(() => {                           // camera access failure
        alert('Unable to access camera');
        navigate('/contacts');
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div id="qr-scanner" className="w-full h-full" />
      <button
        onClick={() => {
          scannerRef.current?.stop();
          navigate('/contacts');
        }}
        className="absolute top-4 left-4 p-2 bg-white rounded-full"
      >
        <FiX size={24} />
      </button>
    </div>
  );
}
