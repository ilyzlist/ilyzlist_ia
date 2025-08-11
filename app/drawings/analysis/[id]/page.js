'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AnalysisResult from '@/components/AnalysisResult';
import LoadingSpinner from '@/components/LoadingSpinner';
import { calculateAge } from '@/utils/ageCalculator';
import { analyzeDrawing } from '@/utils/drawinganalysis';
import {
  MdArrowBack as ArrowBackIcon,
  MdRefresh as RefreshIcon,
  MdHome as HomeIcon,
  MdUpload as UploadIcon,
  MdAccountCircle as AccountCircleIcon,
  MdSearch as SearchIcon,
  MdNotifications as NotificationsIcon,
  MdSettings as SettingsIcon
} from 'react-icons/md';
import Link from 'next/link';

export default function AnalysisPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [drawing, setDrawing] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setTimeoutReached(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!id) return setError('No drawing ID provided');
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: drawingData, error: drawingError } = await supabase
          .from('drawings')
          .select(`
            id, file_path, file_name, user_id,
            analysis, analysis_result,
            children(id, name, birth_date)
          `)
          .eq('id', id)
          .single();

        if (drawingError || !drawingData) {
          throw new Error(drawingError?.message || 'Drawing not found');
        }

        setDrawing(drawingData);
        const { data: signedUrlData } = await supabase.storage
          .from('drawings-bucket')
          .createSignedUrl(drawingData.file_path, 3600);

        if (!signedUrlData?.signedUrl) {
          throw new Error("Image URL couldn't be generated");
        }

        setImageUrl(signedUrlData.signedUrl);
        let parsedAnalysis = null;

        if (drawingData.analysis_result) {
          try {
            parsedAnalysis = typeof drawingData.analysis_result === 'string' 
              ? JSON.parse(drawingData.analysis_result) 
              : drawingData.analysis_result;
          } catch (e) {
            console.error('Failed to parse analysis_result:', e);
            throw new Error('Failed to parse analysis data');
          }
        }

        if (parsedAnalysis) {
          setAnalysis(parsedAnalysis);
        } else {
          const age = calculateAge(drawingData.children.birth_date);
          try {
            const aiResponse = await analyzeDrawing(
              signedUrlData.signedUrl, 
              age, 
              drawingData.user_id, 
              drawingData.id
            );
            
            await supabase
              .from('drawings')
              .update({ analysis_result: aiResponse })
              .eq('id', drawingData.id);
            
            setAnalysis(aiResponse);
          } catch (err) {
            if (err.message === 'quota-exceeded') {
              router.push('/plans');
              return;
            }
            throw err;
          }
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router, supabase]);

  const handleRetry = () => {
    setTimeoutReached(false);
    setLoading(true);
    setError(null);
    router.refresh();
  };

  const handleGoBack = () => router.back();

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      <Head>
        <title>Ilyzlist - Drawing Analysis</title>
      </Head>

      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleGoBack} className="p-1">
            <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
            Drawing Analysis
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

      <div className="bg-[#ECF1FF] rounded-[30px] p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <LoadingSpinner />
            <p className="mt-4 text-[#3742D1] text-lg font-league-spartan">
              {timeoutReached ? 'Taking longer than expected...' : 'Loading analysis...'}
            </p>
            {timeoutReached && (
              <button
                onClick={handleRetry}
                className="mt-4 bg-[#3742D1] text-white px-4 py-2 rounded-full flex items-center font-league-spartan"
              >
                <RefreshIcon className="mr-2" /> Try Again
              </button>
            )}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8 font-league-spartan">{error}</div>
        ) : (
          <div>
            {imageUrl && (
              <div className="mb-6">
                <img 
                  src={imageUrl} 
                  alt="Child Drawing" 
                  className="rounded-xl w-full max-h-96 object-contain border border-gray-200" 
                />
              </div>
            )}
            <h2 className="text-lg font-semibold text-[#3742D1] mb-2 font-league-spartan">
              {drawing?.file_name || 'Untitled Drawing'}
            </h2>
            <p className="text-sm text-gray-700 mb-6 font-league-spartan">
              {drawing?.children?.name} (Age: {calculateAge(drawing?.children?.birth_date)})
            </p>
            <AnalysisResult
              drawingId={drawing?.id}
              imageUrl={imageUrl}
              childAge={calculateAge(drawing?.children?.birth_date)}
              userId={drawing?.user_id}
              initialData={analysis}
            />
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
          onClick={() => router.push("/drawings/upload")}
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
      `}</style>
    </div>
  );
}
