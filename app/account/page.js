'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Head from 'next/head';
import { 
  MdHome, 
  MdUpload, 
  MdAccountCircle, 
  MdEdit, 
  MdPerson, 
  MdPayment, 
  MdPrivacyTip, 
  MdHelp, 
  MdLogout, 
  MdArrowBack, 
  MdNotifications, 
  MdSearch, 
  MdSettings,
  MdChildCare
} from 'react-icons/md';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AccountScreen() {
  const router = useRouter();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);
        setEmail(user.email || '');
        setTempEmail(user.email || '');
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, supabase]);

  const handleEditEmail = () => {
    if (isEditingEmail) {
      setEmail(tempEmail);
      // Here you would typically update the email in Supabase
      // await supabase.auth.updateUser({ email: tempEmail });
    }
    setIsEditingEmail(!isEditingEmail);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleUploadDrawing = () => {
    router.push('/drawings/upload');
  };

  const navigateToChildrenProfiles = () => {
    router.push('/children-profiles');
  };

  if (loading || isLoggingOut) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // or redirect to login
  }

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
      <Head>
        <title>Ilyzlist - Account</title>
      </Head>

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1">
            <MdArrowBack className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1]">Account</h1>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2"
            aria-label="Search"
          >
            <MdSearch className="w-5 h-5 text-[#3742D1]" />
          </button>
          <button 
            onClick={() => router.push('/settings')}
            className="p-2" 
            aria-label="Settings"
          >
            <MdSettings className="w-5 h-5 text-[#3742D1]" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search account..."
            className="w-full p-3 bg-[#ECF1FF] rounded-lg"
          />
        </div>
      )}

      {/* Profile Section */}
      <section className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#3742D1] flex items-center justify-center text-white text-2xl">
            {user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.email}</h2>
            <p className="text-sm text-gray-500">Free Account</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Children Profiles */}
          <button 
            onClick={navigateToChildrenProfiles}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdChildCare className="text-[#3742D1]" />
              <span>Children Profiles</span>
            </div>
            <span className="text-sm text-gray-500">Manage children</span>
          </button>

          {/* Email Address */}
          <div className="flex justify-between items-center p-3 border-b border-[#ECF1FF]">
            <div className="flex items-center gap-3">
              <MdPerson className="text-[#3742D1]" />
              <span>Email Address</span>
            </div>
            {isEditingEmail ? (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="border-b border-[#3742D1] px-1"
                />
                <button onClick={handleEditEmail} className="text-[#3742D1]">
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{email}</span>
                <button onClick={handleEditEmail} className="text-[#3742D1]">
                  <MdEdit />
                </button>
              </div>
            )}
          </div>

          {/* Subscription */}
          <button 
            onClick={() => router.push('/payment-method')}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdPayment className="text-[#3742D1]" />
              <span>Subscription</span>
            </div>
            <span className="text-sm text-gray-500">Free Plan</span>
          </button>

          {/* Privacy */}
          <button 
            onClick={() => router.push('/privacy-policy')}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdPrivacyTip className="text-[#3742D1]" />
              <span>Privacy</span>
            </div>
          </button>

          {/* Help & Support */}
          <button 
            onClick={() => router.push('/help-center')}
            className="w-full flex justify-between items-center p-3 border-b border-[#ECF1FF] hover:bg-[#ECF1FF]"
          >
            <div className="flex items-center gap-3">
              <MdHelp className="text-[#3742D1]" />
              <span>Help & Support</span>
            </div>
          </button>
        </div>
      </section>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3 px-4 flex items-center gap-3 text-red-500 hover:bg-red-50 rounded-lg"
      >
        <MdLogout className="text-red-500" />
        <span>Log Out</span>
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button
          onClick={() => router.push('/')}
          className="p-2 flex flex-col items-center"
          aria-label="Home"
        >
          <MdHome className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Home</span>
        </button>
        <button
          onClick={handleUploadDrawing}
          className="p-2 flex flex-col items-center"
          aria-label="Upload"
        >
          <MdUpload className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Upload</span>
        </button>
        <button
          onClick={() => router.push('/account')}
          className="p-2 flex flex-col items-center"
          aria-label="Account"
        >
          <MdAccountCircle className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}