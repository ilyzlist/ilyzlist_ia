'use client';
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from 'next/navigation';
import { 
  MdHome, 
  MdUpload, 
  MdAccountCircle, 
  MdArrowBack,
  MdAdd,
  MdSearch,
  MdSettings,
  MdEdit,
  MdChildCare
} from 'react-icons/md';
import Head from 'next/head';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        const { data } = await supabase
          .from("children")
          .select("*")
          .eq("user_id", user.id);
        setChildren(data || []);
      } catch (error) {
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [router]);

  const handleUploadDrawing = () => {
    router.push('/drawings/upload');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
      <Head>
        <title>Ilyzlist - Children Profiles</title>
      </Head>

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1">
            <MdArrowBack className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1]">Children Profiles</h1>
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
            placeholder="Search children..."
            className="w-full p-3 bg-[#ECF1FF] rounded-lg"
          />
        </div>
      )}

      {/* Add Child Button */}
      <button
        onClick={() => router.push('/profile/add')}
        className="w-full mb-6 py-3 px-4 flex items-center justify-center gap-2 bg-[#3742D1] text-white rounded-lg hover:bg-[#2935C0]"
      >
        <MdAdd className="w-5 h-5" />
        <span>Add New Child</span>
      </button>

      {/* Children List */}
      <div className="space-y-4">
        {children.length === 0 ? (
          <div className="text-center py-8">
            <MdChildCare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No children added yet</p>
          </div>
        ) : (
          children.map((child) => (
            <div 
              key={child.id} 
              className="p-4 bg-[#ECF1FF] rounded-lg border border-[#D6E0FF] hover:border-[#3742D1] transition-colors"
              onClick={() => router.push(`/profile/edit/${child.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#3742D1]">{child.full_name}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm text-gray-600">
                      <strong>Gender:</strong> {child.gender}
                    </span>
                    <span className="text-sm text-gray-600">
                      <strong>Age:</strong> {calculateAge(child.date_of_birth)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>DOB:</strong> {new Date(child.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className="text-[#3742D1] p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/profile/edit/${child.id}`);
                  }}
                >
                  <MdEdit />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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

function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

