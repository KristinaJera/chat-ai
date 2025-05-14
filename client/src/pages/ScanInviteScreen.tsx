import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { createChat } from '../api/chats';
import { createContact } from '../api/contacts';
import { getUserByShare, User } from '../api/users';
import { FiX, FiUserPlus, FiMessageCircle } from 'react-icons/fi';

export function ScanInviteScreen() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [pending, setPending] = useState<{ shareId: string; name: string } | null>(null);
  const [contactAdded, setContactAdded] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-scanner');
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then(cameras => {
        if (!cameras.length) {
          alert('No camera found');
          navigate('/new-chat', { replace: true });
          return;
        }

        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
        const backCamera = cameras.find(c => /back|rear/i.test(c.label));
        const deviceId = backCamera?.id || cameras[0].id;
        const cameraSource: string | MediaTrackConstraints = isMobile
          ? { facingMode: { exact: 'environment' } }
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
          .start(
            cameraSource,
            config,
            async decodedText => {
              try { scanner.stop(); } catch { /* empty */ }
              try { scanner.clear(); } catch {/* empty */}

              try {
                const user: User = await getUserByShare(decodedText);
                setPending({ shareId: decodedText, name: user.name });
              } catch {
                alert('Scanned ID not recognized.');
                navigate('/new-chat', { replace: true });
              }
            },
            errorMessage => {
              console.warn('QR decode error:', errorMessage);
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
        try { s.stop(); } catch {/* empty */}
        try { s.clear(); } catch {/* empty */}
        scannerRef.current = null;
      }
    };
  }, [navigate]);

  const clearScanner = () => {
    const s = scannerRef.current;
    if (s) {
      try { s.stop(); } catch {/* empty */}
      try { s.clear(); } catch {/* empty */}
      scannerRef.current = null;
    }
  };

  if (pending && contactAdded) {
    setTimeout(() => navigate('/contacts'), 2000);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center">
          <p className="text-lg font-medium">Contact added!</p>
        </div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center space-y-6">
          <h2 className="text-xl font-semibold">You scanned</h2>
          <p className="text-lg font-medium">"{pending.name}"</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={async () => {
                clearScanner();
                try {
                  const chat = await createChat([pending.shareId]);
                  navigate(`/chat/${chat._id}`);
                } catch {
                  alert('Failed to start chat.');
                  navigate('/new-chat', { replace: true });
                }
              }}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiMessageCircle className="mr-2" /> Chat Now
            </button>
            <button
              onClick={async () => {
                clearScanner();
                try {
                  await createContact({ shareId: pending.shareId, name: pending.name });
                  setContactAdded(true);
                } catch {
                  alert('Failed to add contact.');
                }
              }}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FiUserPlus className="mr-2" /> Add to Contacts
            </button>
            <button
              onClick={() => {
                clearScanner();
                navigate('/new-chat', { replace: true });
              }}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <div id="qr-scanner" className="absolute inset-0 w-full h-full" />
      <button
        onClick={() => {
          clearScanner();
          navigate('/new-chat', { replace: true });
        }}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow z-10"
      >
        <FiX size={24} />
      </button>
    </div>
  );
}
