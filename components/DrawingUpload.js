// components/DrawingUpload.js
import { useState } from 'react';
import { MdUpload } from 'react-icons/md';

export default function DrawingUpload({ userId }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];
        
        const response = await fetch('/api/analyze-drawing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64String,
            userId: userId
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Analysis failed');
        }

        setAnalysis(data.analysis);
      };
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="upload-container">
      <input 
        type="file" 
        id="drawing-upload" 
        accept="image/*" 
        onChange={handleImageUpload}
        disabled={isAnalyzing}
        className="hidden"
      />
      <label 
        htmlFor="drawing-upload" 
        className="flex items-center justify-center bg-[#3742D1] text-white p-3 rounded-lg cursor-pointer hover:bg-[#2a35b0] transition-colors"
      >
        <MdUpload className="mr-2" />
        {isAnalyzing ? 'Analyzing...' : 'Upload Drawing'}
      </label>
      
      {error && (
        <div className="mt-4 text-red-500 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {analysis && (
        <div className="mt-6 bg-[#ECF1FF] p-4 rounded-lg">
          <h3 className="text-lg font-bold text-[#3742D1] mb-2">Analysis Results</h3>
          <p className="whitespace-pre-line">{analysis}</p>
        </div>
      )}
    </div>
  );
}
