"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";

import {
  Home as HomeIcon,
  Upload as UploadIcon,
  AccountCircle as AccountCircleIcon,
  ArrowBack as ArrowBackIcon,
  NotificationsActive as NotificationsActiveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";

function relTime(ts) {
  try {
    const d = typeof ts === "string" ? new Date(ts) : ts;
    const diff = (Date.now() - d.getTime()) / 1000;
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (abs < 60) return rtf.format(-Math.round(diff), "second");
    if (abs < 3600) return rtf.format(-Math.round(diff / 60), "minute");
    if (abs < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
    return rtf.format(-Math.round(diff / 86400), "day");
  } catch {
    return "";
  }
}

export default function NotificationsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [enabled, setEnabled] = useState(true); // profiles.notifications_enabled
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState([]); // {id,type,title,message,time,action}
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const channelsRef = useRef([]);

  // Load user + notifications flag (do not redirect to Home if empty)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      if (!u || error) {
        router.push("/login");
        return;
      }
      if (!isMounted) return;
      setUser(u);

      const { data: profile } = await supabase
        .from("profiles")
        .select("notifications_enabled")
        .eq("id", u.id)
        .maybeSingle();

      if (isMounted) {
        setEnabled(profile?.notifications_enabled ?? true);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Subscribe to realtime events when enabled
  useEffect(() => {
    if (!user || !enabled) return;

    const chans = [];

    // drawings INSERT => "Drawing uploaded"
    chans.push(
      supabase
        .channel("rt-drawings")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "drawings", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const row = payload.new;
            addNotification({
              type: "info",
              title: "Drawing uploaded",
              message: `A new drawing was uploaded${row?.file_name ? ` (${row.file_name})` : ""}.`,
              time: new Date().toISOString(),
              action: row?.id ? `/drawings/analysis/${row.id}?start=1` : null,
            });
          }
        )
        .subscribe()
    );

    // children INSERT => "Child added"
    chans.push(
      supabase
        .channel("rt-children")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "children", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const row = payload.new;
            addNotification({
              type: "success",
              title: "Child profile added",
              message: `${row?.name ? row.name : "A child"} was added to your account.`,
              time: new Date().toISOString(),
              action: "/children-profiles",
            });
          }
        )
        .subscribe()
    );

    // analyses UPDATE => status becomes completed
    chans.push(
      supabase
        .channel("rt-analyses")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "analyses" },
          (payload) => {
            const before = payload.old || {};
            const after = payload.new || {};
            if (after.user_id && after.user_id !== user.id) return;

            if (before.status !== "completed" && after.status === "completed") {
              addNotification({
                type: "success",
                title: "Analysis complete",
                message: "Your drawing analysis is ready.",
                time: new Date().toISOString(),
                action: after?.id ? `/drawings/analysis/${after.id}` : null,
              });
            }
          }
        )
        .subscribe()
    );

    channelsRef.current = chans;

    return () => {
      channelsRef.current.forEach((c) => {
        try {
          supabase.removeChannel(c);
        } catch {}
      });
      channelsRef.current = [];
    };
  }, [user, enabled]);

  const addNotification = (n) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...n,
    };
    setNotifications((prev) => [item, ...prev].slice(0, 100));
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
    );
  }, [notifications, searchQuery]);

  const handleNotificationClick = (n) => {
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
    if (n.action) router.push(n.action);
  };

  const clearAll = () => setNotifications([]);

  if (loading) {
    return (
      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3742D1]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1">
            <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
            Notifications
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch((s) => !s)}
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

      {/* Info about toggle */}
      {!enabled && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
          Notifications are disabled in Settings.
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="search-bar mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-[#3742D1]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </span>
        {filtered.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-[#3742D1] hover:underline flex items-center gap-1"
          >
            <DeleteIcon fontSize="small" /> Clear all
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl bg-[#ECF1FF] shadow-sm cursor-pointer hover:bg-[#d9e1fa] transition-colors"
              onClick={() => handleNotificationClick(n)}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  {n.type === "success" && (
                    <CheckCircleIcon className="text-[#7BDCB5] w-5 h-5" />
                  )}
                  {n.type === "warning" && (
                    <WarningIcon className="text-[#FFB800] w-5 h-5" />
                  )}
                  {n.type === "info" && (
                    <InfoIcon className="text-[#3742D1] w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#3742D1] font-league-spartan">
                    {n.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-0.5 font-league-spartan">
                    {n.message}
                  </p>
                  {n.time && (
                    <p className="text-[#809CFF] text-xs mt-2 font-league-spartan">
                      {relTime(n.time)}
                    </p>
                  )}
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
              All caught up! You’ll see new notifications here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg pb-[max(env(safe-area-inset-bottom),0px)]">
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
          src: url("/fonts/league-spartan.woff2") format("woff2"),
               url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        .font-league-spartan { font-family: "League Spartan", sans-serif; }
      `}</style>
    </div>
  );
}
