'use client'
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  MdHome,
  MdUpload,
  MdAccountCircle,
  MdSearch,
  MdNotifications,
  MdArrowBack,
  MdSettings,
  MdExpandMore,
  MdExpandLess,
  MdAddPhotoAlternate
} from 'react-icons/md'

export default function ChildReportsPage() {
  const router = useRouter()
  const { childId } = useParams()
  const [child, setChild] = useState(null)
  const [drawings, setDrawings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedDrawing, setExpandedDrawing] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .single()

        if (childError) throw childError
        if (!childData) throw new Error('Child not found')

        const { data: drawingsData, error: drawingsError } = await supabase
          .from('drawings')
          .select('id, file_path, file_name, uploaded_at, child_id')
          .eq('child_id', childId)
          .order('uploaded_at', { ascending: false })

        if (drawingsError) throw drawingsError

        setChild(childData)
        setDrawings(drawingsData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        if (err.message.includes('Child not found')) {
          router.push('/children-profiles')
        }
      } finally {
        setLoading(false)
      }
    }

    if (childId) fetchData()
  }, [childId, router, supabase])

  const toggleDrawing = (drawingId) => {
    setExpandedDrawing(expandedDrawing === drawingId ? null : drawingId);
  };

  const handleGoBack = () => router.back();
  const handleUploadDrawing = () => router.push(`/drawings/upload?childId=${childId}`);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]"></div>
    </div>
  );

  if (!child) return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
      <p className="text-red-500 mb-4">Child not found</p>
      <button 
        onClick={() => router.push('/children-profiles')}
        className="bg-[#3742D1] hover:bg-[#2a36c7] text-white px-6 py-2 rounded-full text-sm font-medium shadow-sm"
      >
        Back to Children Profiles
      </button>
    </div>
  );

  return (
    <>
      <Head>
        <title>Ilyzlist - {child.name}'s Reports</title>
      </Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={handleGoBack} className="p-1">
              <MdArrowBack className="w-5 h-5 text-[#3742D1]" />
            </button>
            <h1 className="text-xl font-bold text-[#3742D1]">
              {child.name}'s Reports
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2"
              aria-label="Search"
            >
              <MdSearch className="w-5 h-5 text-[#3742D1]" />
            </button>
            <Link
              href="/notifications"
              className="p-2"
              aria-label="Notifications"
            >
              <MdNotifications className="w-5 h-5 text-[#3742D1]" />
            </Link>
            <Link href="/settings" className="p-2" aria-label="Settings">
              <MdSettings className="w-5 h-5 text-[#3742D1]" />
            </Link>
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <div className="search-bar mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="h-5 w-5 text-[#3742D1]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
              />
            </div>
          </div>
        )}

        {/* Drawings List */}
        <div className="space-y-4">
          {drawings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-32 h-32 rounded-full bg-[#ECF1FF] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MdAddPhotoAlternate className="text-[#3742D1] w-16 h-16" />
              </div>
              <h2 className="text-2xl font-bold text-[#3742D1] mb-3">
                No Drawings Yet
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                Your child {child.name} doesn't have any drawings analyzed yet. Upload their first drawing to get started with insights!
              </p>
              <button
                onClick={handleUploadDrawing}
                className="bg-[#3742D1] hover:bg-[#2a36c7] text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg transition-all transform hover:scale-105"
              >
                Upload First Drawing
              </button>
            </div>
          ) : (
            drawings.map(drawing => (
              <div key={drawing.id} className="bg-[#ECF1FF] rounded-xl overflow-hidden shadow-sm">
                <button
                  className="w-full flex justify-between items-center p-4 hover:bg-[#d9e1fa] transition-colors"
                  onClick={() => toggleDrawing(drawing.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border-2 border-[#ECF1FF]">
                      <img
                        src={supabase.storage
                          .from("drawings-bucket")
                          .getPublicUrl(drawing.file_path).data.publicUrl}
                        alt={drawing.file_name || 'Child drawing'}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-drawing.png';
                        }}
                      />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-800">
                        {drawing.file_name || 'Untitled Drawing'}
                      </h3>
                      <p className="text-xs text-[#809CFF]">
                        {new Date(drawing.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {expandedDrawing === drawing.id ? (
                    <MdExpandLess className="text-[#3742D1]" />
                  ) : (
                    <MdExpandMore className="text-[#3742D1]" />
                  )}
                </button>

                {expandedDrawing === drawing.id && (
                  <div className="p-4 border-t border-[#d9e1fa]">
                    <button
                      onClick={() => router.push(`/drawings/analysis/${drawing.id}`)}
                      className="w-full bg-[#3742D1] hover:bg-[#2a36c7] text-white py-2 rounded-full text-sm font-medium shadow-sm transition-colors"
                    >
                      View Full Analysis
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
          <button
            onClick={() => router.push("/")}
            className="p-2 flex flex-col items-center"
            aria-label="Home"
          >
            <MdHome className="w-6 h-6 text-white" />
            <span className="text-white text-xs mt-1">Home</span>
          </button>
          <button
            onClick={handleUploadDrawing}
            className="p-2 flex flex-col items-center"
            aria-label="Upload Drawing"
          >
            <MdUpload className="w-6 h-6 text-white" />
            <span className="text-white text-xs mt-1">Upload</span>
          </button>
          <button
            onClick={() => router.push("/account")}
            className="p-2 flex flex-col items-center"
            aria-label="Account"
          >
            <MdAccountCircle className="w-6 h-6 text-white" />
            <span className="text-white text-xs mt-1">Account</span>
          </button>
        </nav>
      </div>
    </>
  );
}