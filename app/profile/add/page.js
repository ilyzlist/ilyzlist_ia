"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Head from "next/head";
import Link from "next/link";
import { 
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

export default function AddChildPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    birth_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");
      if (!formData.name) throw new Error("Name is required");

      const { error } = await supabase.from("children").insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;

      router.push("/child-profile-added");
    } catch (err) {
      console.error("Error adding child:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ilyzlist - Add Child</title>
      </Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
        {/* Header with Logo and Navigation */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4"
              aria-label="Go back"
            >
              <ArrowBackIcon className="text-[#3742D1]" />
            </button>
            <h1 className="text-2xl font-bold text-[#3742D1] font-league-spartan">
              Add a child
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
                placeholder="Search across account..."
                className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
              />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="block text-black font-league-spartan font-medium text-xl">
              Full name
            </label>
            <div className="bg-[#ECF1FF] rounded-xl p-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full bg-transparent font-league-spartan text-[#809CFF] text-xl focus:outline-none border-none"
                required
              />
            </div>
          </div>

          {/* Gender Field */}
          <div className="space-y-2">
            <label className="block text-black font-league-spartan font-medium text-xl">
              Gender
            </label>
            <div className="bg-[#ECF1FF] rounded-xl p-4">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-transparent font-league-spartan text-[#809CFF] text-xl focus:outline-none border-none appearance-none"
              >
                <option value="">Male, Female, Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <label className="block text-black font-league-spartan font-medium text-xl">
              Date of birth
            </label>
            <div className="bg-[#ECF1FF] rounded-xl p-4">
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full bg-transparent font-league-spartan text-[#809CFF] text-xl focus:outline-none border-none"
                placeholder="DD / MM /YYYY"
              />
            </div>
          </div>

          {/* Terms and Privacy */}
          <p className="text-[#070707] text-xs font-league-spartan text-center">
            By continuing, you agree to{" "}
            <Link href="/privacy-policy" className="text-[#3742D1] font-medium">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-[#3742D1] font-medium">
              Privacy Policy
            </Link>
          </p>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className={`w-full py-4 rounded-[30px] font-league-spartan font-medium text-2xl ${isSubmitting || !formData.name ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#3742D1] text-white hover:bg-[#2a35b8]"}`}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Bottom Navigation */}
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
            aria-label="Upload"
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
      </div>

      <style jsx global>{`
        @font-face {
          font-family: "League Spartan";
          src:
            url("/fonts/league-spartan.woff2") format("woff2"),
            url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
        }

        .font-league-spartan {
          font-family: "League Spartan", sans-serif;
        }
        
        input, select {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%23809CFF'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1.5em;
          padding-right: 2.5rem;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(68%) sepia(44%) saturate(7485%) hue-rotate(209deg) brightness(101%) contrast(101%);
        }
      `}</style>
    </>
  );
}

