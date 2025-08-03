"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import {
  Upload as UploadIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

export default function UploadDrawingPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [analysisQuota, setAnalysisQuota] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);

      // Fetch quota
      const { data: profileData } = await supabase
        .from("profiles")
        .select("analysis_quota")
        .eq("id", user.id)
        .single();
      setAnalysisQuota(profileData?.analysis_quota ?? 0);

      // Fetch children
      const { data: childrenData } = await supabase
        .from("children")
        .select("id, name")
        .eq("user_id", user.id);

      setChildren(childrenData || []);
      if (childrenData?.length > 0) {
        setSelectedChild(childrenData[0].id);
      }
    };

    fetchData();
  }, [router]);

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
          <Link href="/notifications">
            <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
          <Link href="/settings">
            <SettingsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
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
        <div className="space-y-6">
          <label className="block text-[#3742D1] font-medium">
            Select Child
          </label>
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            {children.length === 0 ? (
              <option>No children available</option>
            ) : (
              children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))
            )}
          </select>

          <label className="block text-[#3742D1] font-medium">
            Select Drawing
          </label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto mb-4 rounded-lg"
              />
            ) : (
              <PaletteIcon className="text-[#3742D1] w-12 h-12 mb-2 mx-auto" />
            )}
            <input
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                setFile(selectedFile);
                if (selectedFile) {
                  setPreview(URL.createObjectURL(selectedFile));
                }
              }}
              accept="image/jpeg, image/png, image/gif"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 mt-2 rounded-full bg-[#3742D1] text-white cursor-pointer hover:bg-[#2a36c7]"
            >
              {file ? "Change File" : "Select File"}
            </label>
          </div>
        </div>
      )}

      {/* BOTTOM MENU */}
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
