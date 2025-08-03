'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { 
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  Analytics as AnalyticsIcon,
  ChildFriendly as ChildFriendlyIcon
} from '@mui/icons-material';
import { supabase } from '@/utils/supabaseClient';

export default function AllDrawingsGallery() {
  // Only one supabase client declaration here
  const router = useRouter();
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchDrawings = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: drawingsError } = await supabase
          .from('drawings')
          .select(`
            id, 
            file_path, 
            file_name, 
            uploaded_at, 
            child_id,
            children (id, name)
          `)
          .order('uploaded_at', { ascending: false });

        if (!isMounted) return;

        if (drawingsError) throw drawingsError;
        
        setDrawings(data || []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching drawings:', err);
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDrawings();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  const handleUploadDrawing = () => router.push('/drawings/upload');
  const handleGoBack = () => router.back();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]"></div>
        <p className="mt-4 text-[#3742D1] font-league-spartan">Loading drawings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 font-league-spartan">Error loading data</h2>
        <p className="text-gray-600 mb-6 text-center font-league-spartan">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3742D1] text-white px-6 py-2 rounded-full font-league-spartan"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-[#3742D1] border border-[#3742D1] px-6 py-2 rounded-full font-league-spartan"
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Ilyzlist - All Drawings Gallery</title>
      </Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={handleGoBack} className="p-1">
              <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
              All Drawings
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1"
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <Link
              href="/notifications"
              className="p-1"
              aria-label="Notifications"
            >
              <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
            </Link>
            <Link href="/settings" className="p-1" aria-label="Settings">
              <SettingsIcon className="w-5 h-5 text-[#3742D1]" />
            </Link>
          </div>
        </header>

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
                placeholder="Search drawings..."
                className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
              />
            </div>
          </div>
        )}

        {drawings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-[#ECF1FF] flex items-center justify-center mb-6 shadow-md">
              <AddPhotoAlternateIcon className="text-[#3742D1] w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 font-league-spartan">No Drawings Yet</h2>
            <p className="text-gray-600 mb-6 text-center font-league-spartan">
              There are no drawings in the gallery yet.
            </p>
            <button
              onClick={handleUploadDrawing}
              className="bg-[#3742D1] hover:bg-[#2a36c7] text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg transition-transform hover:scale-105 font-league-spartan"
            >
              Upload First Drawing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {drawings.map((drawing) => (
              <div
                key={drawing.id}
                onClick={() => router.push(`/drawings/analysis/${drawing.id}`)}
                className="bg-[#ECF1FF] rounded-xl p-4 cursor-pointer hover:bg-[#d9e1fa] transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border-2 border-[#ECF1FF]">
                    <img
                      src={supabase.storage
                        .from("drawings-bucket")
                        .getPublicUrl(drawing.file_path).data.publicUrl}
                      alt={drawing.file_name || 'Child drawing'}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-drawing.png';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 font-league-spartan">
                      {drawing.file_name || 'Untitled Drawing'}
                    </p>
                    <p className="text-sm text-gray-600 font-league-spartan">
                      {drawing.children?.name || 'Unknown child'}
                    </p>
                    <p className="text-xs text-[#809CFF] mt-1 font-league-spartan">
                      {new Date(drawing.uploaded_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <AnalyticsIcon className="text-[#3742D1] w-4 h-4" />
                      <span className="text-xs text-[#3742D1] font-league-spartan">
                        View Analysis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button
          onClick={() => router.push("/")}
          className="p-2 flex flex-col items-center"
          aria-label="Home"
        >
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Home</span>
        </button>
        <button
          onClick={handleUploadDrawing}
          className="p-2 flex flex-col items-center"
          aria-label="Upload Drawing"
        >
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Upload</span>
        </button>
        <button
          onClick={() => router.push("/account")}
          className="p-2 flex flex-col items-center"
          aria-label="Account"
        >
          <AccountCircleIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Account</span>
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}