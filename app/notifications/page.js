"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js"; // ✅ Added import
import {
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";

export default function NotificationsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ); // ✅ Proper initialization

  const router = useRouter();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Analysis Complete",
      message: "Your drawing analysis for Emma's artwork is ready",
      time: "2 hours ago",
      action: "/drawings/analysis/123",
    },
    {
      id: 2,
      type: "info",
      title: "New Feature",
      message: "Try our new developmental milestones tracker",
      time: "1 day ago",
      action: "/features/milestones",
    },
    {
      id: 3,
      type: "warning",
      title: "Subscription Reminder",
      message: "Your premium plan renews in 3 days",
      time: "2 days ago",
      action: "/account/subscription",
    },
  ]);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleGoBack = () => router.back();

  const handleNotificationClick = (notification) => {
    setNotifications(notifications.filter((n) => n.id !== notification.id));
    if (notification.action) {
      router.push(notification.action);
    }
  };

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleGoBack} className="p-1">
            <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
            Notifications
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
              placeholder="Search notifications..."
              className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none focus:ring-2 focus:ring-[#3742D1]"
            />
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 rounded-xl bg-[#ECF1FF] shadow-sm cursor-pointer hover:bg-[#d9e1fa] transition-colors"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  {notification.type === "success" && (
                    <CheckCircleIcon className="text-[#7BDCB5] w-5 h-5" />
                  )}
                  {notification.type === "info" && (
                    <NotificationsActiveIcon className="text-[#3742D1] w-5 h-5" />
                  )}
                  {notification.type === "warning" && (
                    <WarningIcon className="text-[#FFB800] w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#3742D1] font-league-spartan">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1 font-league-spartan">
                    {notification.message}
                  </p>
                  <p className="text-[#809CFF] text-xs mt-2 font-league-spartan">
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ECF1FF] flex items-center justify-center shadow-sm">
              <NotificationsActiveIcon className="text-[#3742D1] w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-[#3742D1] mb-2 font-league-spartan">
              No notifications
            </h3>
            <p className="text-gray-600 text-sm font-league-spartan">
              All caught up! You'll see new notifications here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button
          onClick={() => router.push("/")}
          className="p-2 flex flex-col items-center"
          aria-label="Home"
        >
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => router.push("/drawings/upload")}
          className="p-2 flex flex-col items-center"
          aria-label="Upload Drawing"
        >
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Upload</span>
        </button>
        <button
          onClick={() => router.push("/account")}
          className="p-2 flex flex-col items-center"
          aria-label="Account"
        >
          <AccountCircleIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1">Account</span>
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
