'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Loader2, Check } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  displayName: string | null;
  phone: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json() as { user: UserData };
        setUser(data.user);
        setDisplayName(data.user.displayName || '');
        setPhone(data.user.phone || '');
      } catch { router.push('/login'); }
      finally { setLoading(false); }
    };
    fetchUser();
  }, [router]);

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, phone }),
      });
      if (res.ok) setProfileSaved(true);
    } finally { setSavingProfile(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password.' });
      } else {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'Something went wrong.' });
    } finally { setSavingPassword(false); }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 tracking-tight">Account settings</h1>
        <p className="mt-1 text-gray-400">Manage your profile and security.</p>
      </div>

      {/* Profile */}
      <div>
        <h2 className="text-sm font-semibold text-gray-950 mb-4">Profile</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
            <Input value={user.email} disabled className="bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-300 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Display name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977-..." />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveProfile} disabled={savingProfile}
              className="h-9 px-4 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-colors flex items-center gap-2">
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </button>
            {profileSaved && <span className="text-sm text-green-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Saved</span>}
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Change password */}
      <div>
        <h2 className="text-sm font-semibold text-gray-950 mb-4">Change password</h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Current password</label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">New password</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm new password</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{passwordMessage.text}</p>
          )}
          <button type="submit" disabled={savingPassword}
            className="h-9 px-4 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-colors flex items-center gap-2">
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
