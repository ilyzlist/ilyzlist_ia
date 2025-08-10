"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import {
  Upload as UploadIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  CameraAlt as CameraIcon,
  Image as ImageIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

export default function UploadDrawingPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [analysisQuota, setAnalysisQuota] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // Quota
      const { data: profileData } = await supabase
        .from("profiles")
        .select("analysis_quota")
        .eq("id", user.id)
        .single();
      setAnalysisQuota(profileData?.analysis_quota ?? 0);

      // Children
      const { data: childrenData } = await supabase
        .from("children")
        .select("id, name")
        .eq("user_id", user.id);

      setChildren(childrenData || []);
      if (childrenData?.length) setSelectedChild(childrenData[0].id);
    };
    fetchData();
  }, [router]);

  const canSubmit = useMemo(
    () => !!currentUser && !!selectedChild && !!file && analysisQuota > 0 && !isUploading,
    [currentUser, selectedChild, file, analysisQuota, isUploading]
  );

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setError("");
  };

  const onPickFromDevice = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onTakePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const extFromName = (name) => {
    const dot = name.lastIndexOf(".");
    return dot > -1 ? name.slice(dot + 1).toLowerCase() : "png";
  };

  const handleUploadThenGoToAnalysis = async () => {
    if (!canSubmit) return;
    setIsUploading(true);
    setError("");

    try {
      // 1) Upload to Supabase Storage
      const ext = extFromName(file.name || "drawing.png");
      const path = `user-${currentUser.id}/child-${selectedChild}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase
        .storage
        .from("drawings")
        .upload(path, file, {
          contentType: file.type || "image/png",
          upsert: false,
        });

      if (upErr) throw upErr;

      // 2) Insert DB row
      const { data: row, error: insErr } = await supabase
        .from("drawings")
        .insert({
          user_id: currentUser.id,
          child_id: selectedChild,
          file_path: path,
          file_name: file.name || `drawing.${ext}`,
          file_type: file.type || `image/${ext}`,
          file_size: file.size ?? null,
          uploaded_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

      // 3) Navigate to analysis page, which will run OpenAI + update the row
      router.push(`/drawings/analysis/${row.id}?start=1`);
    } catch (e) {
      console.error("Upload error:", e);
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1">
            <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
            Upload Drawing
          </h1>
        </div>
        <div className="flex gap-4">
          <Link href="/notifications"><NotificationsIcon className="w-5 h-5 text-[#3742D1]" /></Link>
          <Link href="/settings"><SettingsIcon className="w-5 h-5 text-[#3742D1]" /></Link>
        </div>
      </header>

      {/* QUOTA GATE */}
      {analysisQuota === 0 ? (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="bg-gray-100 p-6 rounded-xl shadow-sm w-full">
            <p className="text-lg font-medium text-gray-800 mb-4">
              You have no remaining drawing analyses.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Subscribe to unlock more analyses for your child’s drawings.
            </p>
            <button
              onClick={() => router.push("/plans")}
              className="w-full py-3 rounded-full bg-[#3742D1] text-white font-medium hover:bg-[#2a36c7]"
            >
              View Plans
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* CHILD SELECT */}
          <div className="space-y-2 mb-6">
            <label className="block text-[#3742D1] font-medium">Select Child</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
            >
              {children.length ? (
                children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
              ) : (
                <option>No children available</option>
              )}
            </select>
          </div>

          {/* PICKER CARDS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* From device */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 text-center">
              <ImageIcon className="text-[#3742D1] w-10 h-10 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">From device</p>
              <input
                type="file"
                id="pick-device"
                onChange={onPickFromDevice}
                accept="image/jpeg, image/png, image/gif"
                className="hidden"
              />
              <label
                htmlFor="pick-device"
                className="inline-block px-3 py-2 mt-3 rounded-full bg-[#3742D1] text-white text-sm cursor-pointer hover:bg-[#2a36c7]"
              >
                Select file
              </label>
            </div>

            {/* Take a photo */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 text-center">
              <CameraIcon className="text-[#3742D1] w-10 h-10 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Take a photo</p>
              <input
                type="file"
                id="pick-camera"
                onChange={onTakePhoto}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <label
                htmlFor="pick-camera"
                className="inline-block px-3 py-2 mt-3 rounded-full bg-[#3742D1] text-white text-sm cursor-pointer hover:bg-[#2a36c7]"
              >
                Open camera
              </label>
            </div>
          </div>

          {/* PREVIEW */}
          {preview && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-72 w-auto mx-auto rounded-xl shadow-sm"
              />
              <div className="flex justify-center gap-3 mt-3">
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Remove
                </button>
                <button
                  onClick={handleUploadThenGoToAnalysis}
                  disabled={!canSubmit}
                  className={`px-5 py-2 rounded-full text-white font-medium flex items-center gap-2 ${
                    canSubmit ? "bg-[#3742D1] hover:bg-[#2a36c7]" : "bg-[#9aa3ff] cursor-not-allowed"
                  }`}
                >
                  <UploadIcon fontSize="small" />
                  {isUploading ? "Uploading…" : "Upload & Continue"}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button onClick={() => router.push("/")} className="flex flex-col items-center">
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-xs text-white mt-1">Home</span>
        </button>
        <button onClick={() => router.push("/drawings/upload")} className="flex flex-col items-center">
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-xs text-white mt-1">Upload</span>
        </button>
        <button onClick={() => router.push("/account")} className="flex flex-col items-center">
          <AccountCircleIcon className="w-6 h-6 text-white" />
          <span className="text-xs text-white mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}
