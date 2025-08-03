'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { analyzeDrawing } from '@/utils/drawinganalysis';
import LoadingSpinner from '@/components/LoadingSpinner'; // ✅ FIXED

export default function AnalysisResult({ 
  drawingId, 
  imageUrl, 
  childAge, 
  userId,
  initialData = null,
  childName = ''
}) {
  const [analysis, setAnalysis] = useState(initialData?.analysis || initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    emotional: true,
    cognitive: true,
    creative: true,
    recommendations: true
  });

  useEffect(() => {
    if (!initialData && drawingId && imageUrl && childAge) {
      startAnalysis();
    }
  }, [drawingId, imageUrl, childAge]);

  const startAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzeDrawing(imageUrl, childAge, userId, drawingId);
      setAnalysis(result.analysis || result);
    } catch (err) {
      setError(err.message);
      console.error("Analysis failed:", err);

      if (err.message.includes("quota")) {
        alert("You've used all your analyses. Please upgrade your plan!");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderSection = (title, content, sectionKey) => {
    if (!content) return null;

    return (
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection(sectionKey)}
        >
          <h3 className="text-lg font-semibold text-[#3742D1]">{title}</h3>
          <svg
            className={`w-5 h-5 text-[#3742D1] transform transition-transform ${
              expandedSections[sectionKey] ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {expandedSections[sectionKey] && (
          <div className="mt-2">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="text-gray-800 whitespace-pre-line mb-3" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-black" {...props} />,
                li: ({ node, ...props }) => <li className="ml-4 list-disc text-gray-800 mb-1" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1" {...props} />
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Analyzing drawing...</p>
        <p className="text-sm text-gray-500">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-100">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={startAnalysis}
          className="bg-[#3742D1] text-white px-4 py-2 rounded-full flex items-center justify-center"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Analysis Available</h3>
        <p className="text-yellow-700 mb-4">This drawing hasn't been analyzed yet.</p>
        <button
          onClick={startAnalysis}
          className="bg-[#3742D1] text-white px-4 py-2 rounded-full w-full"
        >
          Run Analysis Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {childName && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Child Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{childName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-medium">{childAge} years</p>
            </div>
          </div>
        </div>
      )}

      {renderSection('Emotional Indicators', analysis.emotional?.analysis || analysis.emotional, 'emotional')}
      {renderSection('Cognitive Development', analysis.cognitive?.analysis || analysis.cognitive, 'cognitive')}
      {renderSection('Creative Expression', analysis.creative?.analysis || analysis.creative, 'creative')}

      {analysis.recommendations?.actions?.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection('recommendations')}
          >
            <h3 className="text-lg font-semibold text-green-800">Recommendations</h3>
            <svg
              className={`w-5 h-5 text-green-800 transform transition-transform ${
                expandedSections.recommendations ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {expandedSections.recommendations && (
            <ul className="mt-3 list-disc pl-5 space-y-2">
              {analysis.recommendations.actions.map((item, idx) => (
                <li key={idx} className="text-gray-800">
                  <ReactMarkdown
                    components={{
                      strong: ({ node, ...props }) => <strong className="font-semibold text-black" {...props} />,
                      p: ({ node, ...props }) => <p className="inline" {...props} />,
                    }}
                  >
                    {item}
                  </ReactMarkdown>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
