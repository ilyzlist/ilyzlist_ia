'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { 
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon,
  ChildFriendly as ChildFriendlyIcon,
  Settings as SettingsIcon,
  Edit as EditIcon
} from '@mui/icons-material';

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export default function ChildrenProfiles() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Error fetching children:', error);
        } else {
          const childrenWithAge = data.map(child => ({
            ...child,
            age: calculateAge(child.birth_date)
          }));
          setChildren(childrenWithAge);
        }
      }
      setLoading(false);
    };
    
    fetchChildren();
  }, [supabase]);

  const handleAddChild = () => router.push('/profile/add');
  const handleEditChild = (childId) => router.push(`/children/${childId}/edit`);
  const handleViewReports = (childId) => router.push(`/child-reports/${childId}`);
  const handleGoBack = () => router.back();

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      {/* Header with consistent icons */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleGoBack} className="p-1">
            <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
            My Children
          </h1>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2"
            aria-label="Search"
          >
            <SearchIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <Link
            href="/notifications"
            className="p-2"
            aria-label="Notifications"
          >
            <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
          <Link href="/settings" className="p-2" aria-label="Settings">
            <SettingsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="search-bar mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-[#3742D1]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search children..."
              className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
            />
          </div>
        </div>
      )}

      {/* Add Child Button */}
      <div className="flex justify-end mb-6">
        <button 
          className="bg-[#3742D1] hover:bg-[#2a36c7] text-white px-4 py-2 rounded-full text-sm font-medium font-league-spartan shadow-sm transition-colors"
          onClick={handleAddChild}
        >
          Add Child +
        </button>
      </div>
      
      {/* Children Cards */}
      {children.length === 0 ? (
        <div 
          className="text-center py-12 cursor-pointer"
          onClick={handleAddChild}
        >
          <div className="w-24 h-24 rounded-full bg-[#ECF1FF] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ChildFriendlyIcon className="text-[#3742D1] w-12 h-12" />
          </div>
          <p className="text-gray-800 mb-4 font-league-spartan">No children added yet</p>
          <button className="bg-[#3742D1] hover:bg-[#2a36c7] text-white px-6 py-2 rounded-full text-sm font-medium font-league-spartan shadow-sm">
            Add Your First Child
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map(child => (
            <div key={child.id} className="bg-[#ECF1FF] rounded-xl p-4 hover:bg-[#d9e1fa] transition-colors shadow-sm relative">
              {/* Edit Button (top-right corner) */}
              <button
                onClick={() => handleEditChild(child.id)}
                className="absolute top-3 right-3 p-1 text-[#3742D1] hover:bg-[#d9e1fa] rounded-full transition-colors"
                aria-label="Edit child"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center pt-2">
                <div className="w-20 h-20 rounded-full bg-[#3742D1] flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-md">
                  {child.name.charAt(0)}
                </div>
                
                <h2 className="text-lg font-semibold text-gray-800 font-league-spartan text-center">
                  {child.name}
                </h2>
                <p className="text-gray-600 text-sm mt-1 font-league-spartan">
                  Age: {child.age} years
                </p>
                
                <div className="mt-4 w-full">
                  <button 
                    className="w-full bg-[#3742D1] hover:bg-[#2a36c7] text-white py-2 rounded-full text-xs font-medium font-league-spartan shadow-sm transition-colors"
                    onClick={() => handleViewReports(child.id)}
                  >
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button
          onClick={() => router.push("/")}
          className="p-2 flex flex-col items-center"
          aria-label="Home"
        >
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => router.push("/drawings/upload")}
          className="p-2 flex flex-col items-center"
          aria-label="Upload Drawing"
        >
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Upload</span>
        </button>
        <button
          onClick={() => router.push("/account")}
          className="p-2 flex flex-col items-center"
          aria-label="Account"
        >
          <AccountCircleIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Account</span>
        </button>
      </nav>

      <style jsx global>{`
        @font-face {
          font-family: "League Spartan";
          src:
            url("/fonts/league-spartan.woff2") format("woff2"),
            url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        .font-league-spartan {
          font-family: "League Spartan", sans-serif;
        }
      `}</style>
    </div>
  );
}


