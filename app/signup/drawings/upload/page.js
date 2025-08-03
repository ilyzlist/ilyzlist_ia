// app/drawings/upload/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js"; // ✅ Import fixed
import UploadIcon from "@mui/icons-material/Upload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LinearProgress from "@mui/material/LinearProgress";

export default function UploadDrawing() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ); // ✅ Proper initialization
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");

  // Fetch children profiles
  useEffect(() => {
    const fetchChildren = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("children")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching children:", error);
        } else {
          setChildren(data);
          if (data.length > 0) setSelectedChild(data[0].id);
        }
      }
    };

    fetchChildren();
  }, [supabase]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedChild) {
      setError("Please select both a file and a child profile");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedChild}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("drawings")
        .upload(`uploads/${fileName}`, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("drawings").insert({
        child_id: selectedChild,
        file_path: uploadData.path,
        uploaded_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      router.push("/");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-4"
          aria-label="Go back"
        >
          <ArrowBackIcon className="text-[#3742D1]" />
        </button>
        <h1 className="text-2xl font-bold text-[#3742D1]">Upload Drawing</h1>
      </div>

      <div className="space-y-6">
        {/* Child Selection */}
        <div>
          <label className="block text-gray-700 mb-2">Select Child</label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            disabled={isUploading || children.length === 0}
          >
            {children.length === 0 ? (
              <option value="">No children available</option>
            ) : (
              children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))
            )}
          </select>
          {children.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Please add a child profile first
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-gray-700 mb-2">Select Drawing</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {preview ? (
              <img
                src={preview}
                alt="Drawing preview"
                className="max-h-64 mx-auto mb-4"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <UploadIcon className="text-gray-400 w-12 h-12 mb-2" />
                <p className="text-gray-500">
                  Click to select or drag an image
                </p>
              </div>
            )}
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className={`inline-block px-4 py-2 rounded-lg cursor-pointer ${
                isUploading
                  ? "bg-gray-200 text-gray-500"
                  : "bg-[#ECF1FF] text-[#3742D1] hover:bg-[#d9e1fa]"
              }`}
            >
              {file ? "Change File" : "Select File"}
            </label>
            {file && <p className="text-sm text-gray-500 mt-2">{file.name}</p>}
          </div>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="space-y-2">
            <LinearProgress variant="determinate" value={uploadProgress} />
            <p className="text-sm text-gray-500 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={
            isUploading || !file || !selectedChild || children.length === 0
          }
          className={`w-full py-3 rounded-lg font-medium ${
            !file || !selectedChild || children.length === 0 || isUploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#3742D1] text-white hover:bg-[#2a35b8]"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload Drawing"}
        </button>
      </div>
    </div>
  );
}
