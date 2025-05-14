import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { createChat } from '../api/chats';
import { getUserByShare, User } from '../api/users';
import { FiX, FiCheckCircle } from 'react-icons/fi';

export function ScanInviteScreen() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [pending, setPending] = useState<{ shareId: string; name: string } | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-scanner');
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then(cameras => {
        if (!cameras.length) {
          alert('No camera found');
          return navigate('/new-chat', { replace: true });
        }

        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
        const backCamera = cameras.find(c => /back|rear/i.test(c.label));
        const deviceId = backCamera?.id || cameras[0].id;

        const cameraSource: string | MediaTrackConstraints = isMobile
          ? { facingMode: 'environment' }
          : { deviceId };

        const boxSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.7);
        const config = {
          fps: 10,
          qrbox: { width: boxSize, height: boxSize },
          aspectRatio: window.innerWidth / window.innerHeight,
          rememberLastUsedCamera: true,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          videoConstraints: isMobile
            ? {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 },
                focusMode: 'continuous'
              }
            : { deviceId }
        };

        scanner
          .start(cameraSource, config,
            async decodedText => {
              // stop & clear before acting
              try { scanner.stop(); } catch { /* empty */ }
              try { scanner.clear(); } catch { /* empty */ }

              try {
                const user: User = await getUserByShare(decodedText);
                setPending({ shareId: decodedText, name: user.name });
              } catch {
                alert('Scanned ID not recognized.');
                navigate('/new-chat', { replace: true });
              }
            },
            errorMessage => {
              console.log('QR decode error:', errorMessage);
            }
          )
          .catch(err => {
            console.error('Scanner failed to start:', err);
            alert('Cannot access camera.');
            navigate('/new-chat', { replace: true });
          });
      })
      .catch(err => {
        console.error('getCameras() failed:', err);
        alert('Cannot access camera.');
        navigate('/new-chat', { replace: true });
      });

    return () => {
      const s = scannerRef.current;
      if (s) {
        try { s.stop(); } catch { /* empty */ }
        try { s.clear(); } catch { /* empty */ }
        scannerRef.current = null;
      }
    };
  }, [navigate]);

  if (pending) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center space-y-6">
          <FiCheckCircle size={48} className="mx-auto text-green-500" />
          <h2 className="text-xl font-semibold">Start chat with</h2>
          <p className="text-lg font-medium">"{pending.name}"?</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                const s = scannerRef.current;
                if (s) {
                  try { s.stop(); } catch { /* empty */ }
                  try { s.clear(); } catch { /* empty */ }
                  scannerRef.current = null;
                }
                navigate('/new-chat', { replace: true });
              }}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              No, Go Back
            </button>
            <button
              onClick={async () => {
                const s = scannerRef.current;
                if (s) {
                  try { s.stop(); } catch { /* empty */ }
                  try { s.clear(); } catch {/* empty */ }
                  scannerRef.current = null;
                }

                try {
                  const chat = await createChat([pending.shareId]);
                  navigate(`/chat/${chat._id}`, { replace: true });
                } catch {
                  alert('Failed to start chat.');
                  navigate('/new-chat', { replace: true });
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Yes, Start Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <div id="qr-scanner" className="absolute inset-0 w-full h-full" />
      <div
        className="absolute w-96 h-96 border-4 border-white
                   top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                   pointer-events-none"
      />
      <button
        onClick={() => {
          const s = scannerRef.current;
          if (s) {
            try { s.stop(); } catch {/* empty */ }
            try { s.clear(); } catch {/* empty */ }
            scannerRef.current = null;
          }
          navigate('/new-chat', { replace: true });
        }}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow z-10"
      >
        <FiX size={24} />
      </button>
    </div>
  );
}
