'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '@/utils/supabaseClient';
import {
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

const GreenSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#7BDCB5',
    '&:hover': { backgroundColor: 'rgba(123, 220, 181, 0.08)' },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#7BDCB5',
  },
}));

export default function SettingsPage() {
  const router = useRouter();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notifSaveMsg, setNotifSaveMsg] = useState(null); // {type:'success'|'error', msg:string}

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null); // { type: 'error'|'success', msg: string }

  const [user, setUser] = useState(null);
  const [isEmailPasswordUser, setIsEmailPasswordUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      const provider = u.app_metadata?.provider;
      setIsEmailPasswordUser(provider === 'email');

      const { data: profile } = await supabase
        .from('profiles')
        .select('notifications_enabled')
        .eq('id', u.id)
        .maybeSingle();

      setNotificationsEnabled(
        typeof profile?.notifications_enabled === 'boolean' ? profile.notifications_enabled : true
      );

      setLoading(false);
    })();
  }, [router]);

  const toggleSection = (section) => {
    setPasswordFeedback(null);
    setNotifSaveMsg(null);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleToggleNotifications = async () => {
    if (!user || savingNotifications) return;
    const next = !notificationsEnabled;

    setNotificationsEnabled(next); // optimistic
    setSavingNotifications(true);
    setNotifSaveMsg(null);

    const { error } = await supabase
      .from('profiles')
      .update({ notifications_enabled: next })
      .eq('id', user.id);

    if (error) {
      setNotificationsEnabled(!next); // rollback
      setNotifSaveMsg({ type: 'error', msg: 'Failed to save. Please try again.' });
    } else {
      setNotifSaveMsg({ type: 'success', msg: next ? 'Notifications enabled.' : 'Notifications disabled.' });
    }
    setSavingNotifications(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', msg: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', msg: 'Password must be at least 8 characters.' });
      return;
    }

    try {
      setSavingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordFeedback({ type: 'success', msg: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setExpandedSection(null);
    } catch (err) {
      setPasswordFeedback({ type: 'error', msg: err.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]" />
      </div>
    );
  }

  return (
    <>
      <Head><title>Ilyzlist - Settings</title></Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-1" aria-label="Back">
              <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">Settings</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowSearch(!showSearch)} className="p-2" aria-label="Search">
              <SearchIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <Link href="/notifications" className="p-2" aria-label="Notifications">
              <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
            </Link>
            <Link href="/settings" className="p-2" aria-label="Settings (you are here)">
              <SettingsIcon className="w-5 h-5 text-[#3742D1]" />
            </Link>
          </div>
        </header>

        {/* Search */}
        {showSearch && (
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[#3742D1]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Notifications */}
          <section className="bg-[#ECF1FF] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <NotificationsIcon className="text-[#3742D1] mr-3" />
                <span className="text-gray-800 font-medium font-league-spartan">Notifications</span>
              </div>
              <GreenSwitch
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
                disabled={savingNotifications}
                inputProps={{ 'aria-label': 'Enable notifications' }}
              />
            </div>
            <p className="text-sm text-gray-600 font-league-spartan mt-1">
              In-app updates (uploads, children added, analysis complete)
            </p>

            {notifSaveMsg && (
              <div
                className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  notifSaveMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {notifSaveMsg.type === 'success' ? <CheckCircleIcon fontSize="small" /> : <ErrorIcon fontSize="small" />}
                <span>{notifSaveMsg.msg}</span>
              </div>
            )}
          </section>

          {/* Security — only for email/password users */}
          {isEmailPasswordUser ? (
            <section className="bg-[#ECF1FF] rounded-xl shadow-sm">
              <div className="p-4 cursor-pointer hover:bg-[#d9e1fa] transition-colors" onClick={() => toggleSection('security')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SecurityIcon className="text-[#3742D1] mr-3" />
                    <span className="text-gray-800 font-medium font-league-spartan">Security</span>
                  </div>
                  {expandedSection === 'security' ? <ExpandLessIcon className="text-[#3742D1]" /> : <ExpandMoreIcon className="text-[#3742D1]" />}
                </div>
                <p className="text-sm text-gray-600 font-league-spartan mt-1">Change password and security settings</p>
              </div>

              {expandedSection === 'security' && (
                <div className="px-4 pb-4">
                  {passwordFeedback && (
                    <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${passwordFeedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {passwordFeedback.msg}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange}>
                    {[['Current Password', currentPassword, setCurrentPassword],
                      ['New Password', newPassword, setNewPassword],
                      ['Confirm New Password', confirmPassword, setConfirmPassword]].map(([label, value, setter], i) => (
                      <div key={i} className="mb-3 relative">
                        <label className="block text-sm text-gray-600 mb-1">{label}</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="w-full p-3 bg-white rounded-lg border border-[#809CFF] focus:outline-none focus:ring-2 focus:ring-[#3742D1]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-9 text-[#3742D1]"
                          tabIndex={-1}
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </button>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedSection(null)}
                        className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="flex-1 py-2 bg-[#3742D1] text-white rounded-lg font-medium hover:bg-[#2a35b8] transition-colors disabled:opacity-60"
                      >
                        {savingPassword ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          ) : (
            <section className="bg-[#ECF1FF] rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <SecurityIcon className="text-[#3742D1] mt-1" />
                <div>
                  <h3 className="text-gray-800 font-medium font-league-spartan">Security</h3>
                  <p className="text-sm text-gray-600">Your account uses Google sign-in. Password settings are not available.</p>
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 px-4 py-2 rounded-full bg-[#3742D1] text-white text-sm hover:bg-[#2a35b8]"
                  >
                    Manage Google Account
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* About */}
          <section className="bg-[#ECF1FF] rounded-xl shadow-sm">
            <div className="p-4 cursor-pointer hover:bg-[#d9e1fa] transition-colors" onClick={() => toggleSection('about')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <InfoIcon className="text-[#3742D1] mr-3" />
                  <span className="text-gray-800 font-medium font-league-spartan">About</span>
                </div>
                {expandedSection === 'about' ? <ExpandLessIcon className="text-[#3742D1]" /> : <ExpandMoreIcon className="text-[#3742D1]" />}
              </div>
              <p className="text-sm text-gray-600 font-league-spartan mt-1">App version 1.0.0 (POC)</p>
            </div>

            {expandedSection === 'about' && (
              <div className="px-4 pb-4">
                <div className="mb-3">
                  <h3 className="font-medium text-gray-800 mb-1">Ilyzlist</h3>
                  <p className="text-sm text-gray-600">This is the first version of Ilyzlist, a Proof of Concept (POC) application.</p>
                </div>
                <div className="mb-3">
                  <h3 className="font-medium text-gray-800 mb-1">Version</h3>
                  <p className="text-sm text-gray-600">1.0.0</p>
                </div>
                <button
                  onClick={() => setExpandedSection(null)}
                  className="mt-3 w-full py-2 bg-[#3742D1] text-white rounded-lg font-medium hover:bg-[#2a35b8] transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bottom Navigation – single-line className to avoid build errors */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg pb-[max(env(safe-area-inset-bottom),0px)]">
        <button onClick={() => router.push('/')} className="p-2 flex flex-col items-center" aria-label="Home">
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Home</span>
        </button>
        <button onClick={() => router.push('/drawings/upload')} className="p-2 flex flex-col items-center" aria-label="Upload">
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Upload</span>
        </button>
        <button onClick={() => router.push('/account')} className="p-2 flex flex-col items-center" aria-label="Account">
          <AccountCircleIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Account</span>
        </button>
      </nav>

      <style jsx global>{`
        @font-face {
          font-family: "League Spartan";
          src: url("/fonts/league-spartan.woff2") format("woff2"),
               url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        .font-league-spartan { font-family: "League Spartan", sans-serif; }
      `}</style>
    </>
  );
}
