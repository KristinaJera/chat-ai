import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  shareId: string;
}

interface ProfileForm {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileForm>({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    if (!authLoading && user) {
      fetch(`${API_BASE}/api/users/me`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<ProfileData>;
        })
        .then(data => {
          setProfile(data);
          setForm({ name: data.name, email: data.email });
        })
        .catch(err => console.error('Failed to load profile:', err));
    }
  }, [authLoading, user]);

  if (authLoading) return <div>Loading authentication…</div>;
  if (!user) return <div>Not authenticated</div>;
  if (!profile) return <div>Loading profile…</div>;

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProfile(prev => prev ? { ...prev, name: form.name, email: form.email } : prev);
      setEditing(false);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 relative">
      {/* Back arrow */}
      <button
        onClick={() => navigate('/')}
        className="absolute left-4 top-4 text-xl"
        aria-label="Go back"
      >
        ←
      </button>

      <h2 className="text-xl font-bold text-center">Your Profile</h2>
      <div className="text-sm text-gray-600 text-center">
        Share-ID: <code>{profile.shareId}</code>
      </div>

      {/* Edit toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setEditing(e => !e)}
          className="text-blue-600 hover:underline"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          disabled={!editing}
          className={`mt-1 block w-full border p-2 rounded ${editing ? '' : 'bg-gray-100'}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          disabled={!editing}
          className={`mt-1 block w-full border p-2 rounded ${editing ? '' : 'bg-gray-100'}`}
        />
      </div>

      {editing && (
        <button
          onClick={handleProfileSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      )}
    </div>
  );
}
