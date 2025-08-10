"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Close as CloseIcon,
  DriveFileRenameOutline as RenameIcon,
} from "@mui/icons-material";

// ✅ set your bucket here (env first, fallback to 'drawings')
const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_DRAWINGS_BUCKET?.trim() || "drawings";

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

  // Editable file name (base) + extension
  const [fileBaseName, setFileBaseName] = useState("");
  const [fileExt, setFileExt] = useState("png");

  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("analysis_quota")
        .eq("id", user.id)
        .single();
      setAnalysisQuota(profileData?.analysis_quota ?? 0);

      const { data: childrenData } = await supabase
        .from("children")
        .select("id, name")
        .eq("user_id", user.id);

      setChildren(childrenData || []);
      if (childrenData?.length) setSelectedChild(childrenData[0].id);
    };
    fetchData();
  }, [router]);

  // ---------- name helpers ----------
  const extFromName = (name) => {
    const dot = (name || "").lastIndexOf(".");
    return dot > -1 ? name.slice(dot + 1).toLowerCase() : "png";
  };

  const baseFromName = (name) => {
    const dot = (name || "").lastIndexOf(".");
    const raw = dot > -1 ? name.slice(0, dot) : name || "";
    return raw;
  };

  const sanitizeBase = (s) =>
    (s || "")
      .replace(/[^a-zA-Z0-9 _-]/g, "") // allow letters, numbers, space, _ and -
      .trim()
      .slice(0, 80);

  const slugify = (s) =>
    (sanitizeBase(s) || "drawing")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
  // ----------------------------------

  const isNameValid = useMemo(
    () => sanitizeBase(fileBaseName).length > 0,
    [fileBaseName]
  );

  const canSubmit = useMemo(
    () =>
      !!currentUser &&
      !!selectedChild &&
      !!file &&
      analysisQuota > 0 &&
      !isUploading &&
      isNameValid,
    [currentUser, selectedChild, file, analysisQuota, isUploading, isNameValid]
  );

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setFileBaseName("");
    setFileExt("png");
    setError("");
  };

  // pick from device
  const onPickFromDevice = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setFileExt(extFromName(f.name || "png"));
    setFileBaseName(sanitizeBase(baseFromName(f.name) || "drawing"));
  };

  // ---- camera handling ----
  const openCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        // fallback to system picker on old browsers
        document.getElementById("pick-camera-fallback")?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(
        "Could not access the camera. Please allow permission or use the device picker."
      );
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const captured = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setFile(captured);
        setPreview(URL.createObjectURL(captured));
        setFileExt("jpg");
        setFileBaseName("drawing"); // default; user can edit
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const onCameraFallbackPicked = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setFileExt(extFromName(f.name || "jpg"));
    setFileBaseName(sanitizeBase(baseFromName(f.name) || "drawing"));
  };
  // -------------------------

  const handleUploadThenGoToAnalysis = async () => {
    if (!canSubmit) return;
    setIsUploading(true);
    setError("");

    try {
      const safeBase = sanitizeBase(fileBaseName) || "drawing";
      const ext = (fileExt || extFromName(file?.name || "png")).toLowerCase();
      const slug = slugify(safeBase);

      // nice, stable storage path
      const path = `user-${currentUser.id}/child-${selectedChild}/${Date.now()}-${slug}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file?.type || `image/${ext}`,
          upsert: false,
        });

      if (upErr) {
        if (
          String(upErr.message || "").toLowerCase().includes("bucket not found")
        ) {
          throw new Error(
            `Bucket "${BUCKET}" not found. Set NEXT_PUBLIC_SUPABASE_DRAWINGS_BUCKET to your real bucket name (e.g., "drawings-bucket").`
          );
        }
        throw upErr;
      }

      const { data: row, error: insErr } = await supabase
        .from("drawings")
        .insert({
          user_id: currentUser.id,
          child_id: selectedChild,
          file_path: path,
          file_name: `${safeBase}.${ext}`, // save the edited name
          file_type: file?.type || `image/${ext}`,
          file_size: file?.size ?? null,
          uploaded_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

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
          <Link href="/notifications">
            <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
          <Link href="/settings">
            <SettingsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
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
            <label className="block text-[#3742D1] font-medium">
              Select Child
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
            >
              {children.length ? (
                children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
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

            {/* Take a photo (real camera) */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 text-center">
              <CameraIcon className="text-[#3742D1] w-10 h-10 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Take a photo</p>
              <button
                onClick={openCamera}
                className="inline-block px-3 py-2 mt-3 rounded-full bg-[#3742D1] text-white text-sm hover:bg-[#2a36c7]"
              >
                Open camera
              </button>

              {/* Fallback: system camera/file picker */}
              <input
                type="file"
                id="pick-camera-fallback"
                onChange={onCameraFallbackPicked}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>
          </div>

          {/* PREVIEW + RENAME */}
          {preview && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-72 w-auto mx-auto rounded-xl shadow-sm"
              />

              {/* Rename input */}
              <div className="mt-4">
                <label className="block text-[#3742D1] font-medium mb-2">
                  File name
                </label>
                <div className="flex">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={fileBaseName}
                      onChange={(e) =>
                        setFileBaseName(sanitizeBase(e.target.value))
                      }
                      placeholder="e.g. Zoo Drawing"
                      className="w-full p-3 pr-20 border border-[#809CFF] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#3742D1]"
                    />
                    <RenameIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3742D1]" />
                  </div>
                  <div className="px-3 py-3 border border-l-0 border-[#809CFF] rounded-r-lg bg-[#ECF1FF] text-gray-700">
                    .{fileExt}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Allowed: letters, numbers, spaces, “-” and “_” (max 80 chars)
                </p>
              </div>

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
                    canSubmit
                      ? "bg-[#3742D1] hover:bg-[#2a36c7]"
                      : "bg-[#9aa3ff] cursor-not-allowed"
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

      {/* CAMERA OVERLAY */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 relative">
            <button
              onClick={closeCamera}
              className="absolute right-3 top-3 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close camera"
            >
              <CloseIcon className="text-gray-600" />
            </button>

            <h2 className="text-lg font-semibold text-[#3742D1] mb-3">
              Camera
            </h2>

            {cameraError ? (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {cameraError}
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full rounded-xl bg-black"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={takePhoto}
                    className="px-4 py-2 rounded-full bg-[#3742D1] text-white hover:bg-[#2a36c7] flex items-center gap-2"
                  >
                    <CameraIcon fontSize="small" />
                    Take photo
                  </button>
                  <button
                    onClick={closeCamera}
                    className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button onClick={() => router.push("/")} className="flex flex-col items-center">
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-xs text-white mt-1">Home</span>
        </button>
        <button
          onClick={() => router.push("/drawings/upload")}
          className="flex flex-col items-center"
        >
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
