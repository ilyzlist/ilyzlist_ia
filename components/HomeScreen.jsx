"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  MdHome,
  MdUpload,
  MdAccountCircle,
  MdNotifications,
  MdSettings,
  MdSearch,
  MdAdd,
  MdChildCare,
  MdPalette,
  MdPsychology,
  MdPerson,
  MdImage,
} from "react-icons/md";
import LoadingSpinner from "@/components/LoadingSpinner";

const articles = [
  {
    id: 1,
    category: "Child Development",
    readTime: "5 min read",
    title: "Understanding Your Child's Drawing Stages",
    image: "/images/article1.jpg",
    icon: <MdChildCare className="w-4 h-4 text-[#3742D1]" />,
  },
  {
    id: 2,
    category: "Art Therapy",
    readTime: "7 min read",
    title: "How Art Helps Emotional Expression",
    image: "/images/article2.jpg",
    icon: <MdPalette className="w-4 h-4 text-[#3742D1]" />,
  },
  {
    id: 3,
    category: "Psychology",
    readTime: "6 min read",
    title: "Decoding Colors in Children's Art",
    image: "/images/article3.jpg",
    icon: <MdPsychology className="w-4 h-4 text-[#3742D1]" />,
  },
  {
    id: 4,
    category: "Parenting",
    readTime: "4 min read",
    title: "Encouraging Creativity at Home",
    image: "/images/article4.jpg",
    icon: <MdPerson className="w-4 h-4 text-[#3742D1]" />,
  },
  {
    id: 5,
    category: "Education",
    readTime: "8 min read",
    title: "Art-Based Learning Techniques",
    image: "/images/article5.jpg",
    icon: <MdChildCare className="w-4 h-4 text-[#3742D1]" />,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [recentDrawings, setRecentDrawings] = useState([]);
  const [loadingDrawings, setLoadingDrawings] = useState(true);

  const [analysisQuota, setAnalysisQuota] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  // banner visibility control
  const [showWelcome, setShowWelcome] = useState(false);
  const [userId, setUserId] = useState(null);

  const [activeArticleIndex, setActiveArticleIndex] = useState(0);

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // ⬇️ fetch both quota and plan
      const { data: profileData } = await supabase
        .from("profiles")
        .select("analysis_quota, current_plan")
        .eq("id", user.id)
        .single();

      const quota = profileData?.analysis_quota ?? null;
      const plan = profileData?.current_plan ?? null;

      setAnalysisQuota(quota);
      setCurrentPlan(plan);

      // Show welcome banner only for FREE plan with exactly 1 credit, and only once per device.
      const lsKey = `ilyzlist:welcomeShown:${user.id}`;
      const alreadyShown =
        typeof window !== "undefined" && localStorage.getItem(lsKey) === "1";

      if (!alreadyShown && (plan === "free" || !plan) && quota === 1) {
        setShowWelcome(true);
      } else {
        setShowWelcome(false);
      }

      // Children
      const { data: childrenData } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", user.id);
      setChildren(childrenData || []);
      setLoadingChildren(false);

      // Recent Drawings
      const { data: drawingsData } = await supabase
        .from("drawings")
        .select("id, file_path, file_name, uploaded_at, children(id, name)")
        .order("uploaded_at", { ascending: false })
        .limit(2);

      const signedDrawings = await Promise.all(
        (drawingsData || []).map(async (drawing) => {
          const { data: signedUrlData } = await supabase
            .storage
            .from("drawings-bucket")
            .createSignedUrl(drawing.file_path, 3600);

          return {
            ...drawing,
            signedUrl: signedUrlData?.signedUrl || null,
          };
        })
      );

      setRecentDrawings(signedDrawings);
      setLoadingDrawings(false);
    };

    fetchData();
  }, [supabase]);

  const dismissWelcome = () => {
    if (typeof window !== "undefined" && userId) {
      try {
        localStorage.setItem(`ilyzlist:welcomeShown:${userId}`, "1");
      } catch {}
    }
    setShowWelcome(false);
  };

  const handleUploadDrawing = () => router.push("/drawings/upload");
  const handleAddChild = () => router.push("/profile/add");
  const handleViewProfiles = () => router.push("/children-profiles");
  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollLeft;
    const newIndex = Math.round(scrollPosition / 272);
    setActiveArticleIndex(Math.min(newIndex, articles.length - 1));
  };

  const ArticleImage = ({ article }) => {
    const [imageStatus, setImageStatus] = useState("loading");

    useEffect(() => {
      const img = new Image();
      img.src = article.image;
      img.onload = () => setImageStatus("loaded");
      img.onerror = () => setImageStatus("error");
    }, [article.image]);

    if (imageStatus === "loading") {
      return <div className="w-full h-28 bg-gray-100 rounded-lg animate-pulse"></div>;
    }

    if (imageStatus === "error") {
      return (
        <div className="w-full h-28 bg-[#ECF1FF] flex items-center justify-center rounded-lg">
          <MdImage className="w-8 h-8 text-[#3742D1]" />
        </div>
      );
    }

    return (
      <img
        src={article.image}
        alt={article.title}
        className="w-full h-28 object-cover rounded-lg"
      />
    );
  };

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
      <Head>
        <title>Ilyzlist - Home</title>
      </Head>

      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <Link href="/">
          <img
            src="/images/ilyzlist_logo.webp"
            alt="Ilyzlist Logo"
            className="h-10"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/ilyzlist_logo.png";
            }}
          />
        </Link>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2"
            aria-label="Search"
          >
            <MdSearch className="w-5 h-5 text-[#3742D1]" />
          </button>
          <button
            onClick={() => router.push("/notifications")}
            className="p-2"
            aria-label="Notifications"
          >
            <MdNotifications className="w-5 h-5 text-[#3742D1]" />
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="p-2"
            aria-label="Settings"
          >
            <MdSettings className="w-5 h-5 text-[#3742D1]" />
          </button>
        </div>
      </header>

      {/* Welcome one-time banner – free plan + 1 credit */}
      {showWelcome && (
        <div className="mb-6 px-4 py-3 bg-[#ECF1FF] rounded-xl text-sm text-[#3742D1] font-medium shadow-sm flex items-start justify-between gap-3">
          <span>🎁 Welcome! You’ve unlocked 1 free drawing analysis to get started.</span>
          <button onClick={dismissWelcome} className="text-[#3742D1] font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Children Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#3742D1]">My Children</h2>
          <div className="flex gap-2">
            <button
              onClick={handleViewProfiles}
              className="bg-[#ECF1FF] text-[#3742D1] px-3 py-1 rounded-full text-xs font-semibold shadow-sm hover:bg-[#d9e1fa]"
            >
              View Profiles
            </button>
            <button
              onClick={handleAddChild}
              className="bg-[#3742D1] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm hover:bg-[#2a35b0]"
            >
              Add Child
            </button>
          </div>
        </div>

        {loadingChildren ? (
          <LoadingSpinner />
        ) : children.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-[#ECF1FF] rounded-xl p-4 shadow-sm relative hover:bg-[#d9e1fa] transition-colors"
              >
                <div className="flex flex-col items-center pt-2">
                  <div className="w-16 h-16 rounded-full bg-[#3742D1] flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-md">
                    {getInitials(child.name)}
                  </div>
                  <h2 className="text-md font-semibold text-gray-800 font-league-spartan text-center">
                    {child.name}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#ECF1FF] rounded-xl p-6 text-center text-gray-800 shadow-sm">
            <p>No children added yet.</p>
            <button
              onClick={handleAddChild}
              className="mt-3 text-sm text-[#3742D1] font-semibold hover:underline"
            >
              Add your first child
            </button>
          </div>
        )}
      </section>

      {/* Recent Drawings */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#3742D1]">Recent Drawings</h2>
          <button
            onClick={
              recentDrawings.length > 0
                ? () => router.push("/drawings/gallery")
                : handleUploadDrawing
            }
            className="text-[#3742D1] text-sm font-medium hover:text-[#2a35b0]"
          >
            {recentDrawings.length > 0 ? "See All" : "Upload"}
          </button>
        </div>

        {loadingDrawings ? (
          <LoadingSpinner />
        ) : recentDrawings.length > 0 ? (
          <div className="space-y-4">
            {recentDrawings.map((drawing) => (
              <button
                key={drawing.id}
                onClick={() => router.push(`/drawings/analysis/${drawing.id}`)}
                className="w-full bg-[#ECF1FF] rounded-xl p-4 hover:bg-[#d9e1fa] transition-colors shadow-sm text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center">
                    <img
                      src={drawing.signedUrl || "/images/default-drawing.png"}
                      alt={drawing.file_name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/images/default-drawing.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {drawing.file_name}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {drawing.children?.name}
                    </p>
                    <p className="text-xs text-[#809CFF] mt-1">
                      {new Date(drawing.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={handleUploadDrawing}
            className="w-full bg-[#ECF1FF] rounded-xl p-6 hover:bg-[#d9e1fa] transition-colors flex flex-col items-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-[#7BDCB5] flex items-center justify-center mb-3 shadow-md">
              <MdPalette className="text-white w-8 h-8" />
            </div>
            <p className="text-gray-800 font-medium">No Drawings Yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Upload your first drawing for analysis
            </p>
          </button>
        )}
      </section>

      {/* Practical Guide */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#3742D1]">Practical Guide</h2>
        </div>
        <div className="relative">
          <div
            className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
            onScroll={handleScroll}
          >
            {articles.map((article) => (
              <button
                key={article.id}
                onClick={() => router.push(`/articles/${article.id}`)}
                className="flex-shrink-0 w-64 bg-[#ECF1FF] rounded-xl p-4 hover:bg-[#d9e1fa] transition-colors shadow-sm text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  {article.icon}
                  <span className="text-sm text-[#3742D1] font-medium">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    • {article.readTime}
                  </span>
                </div>
                <ArticleImage article={article} />
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  {article.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const container = document.querySelector(".overflow-x-auto");
                container.scrollTo({
                  left: index * 272,
                  behavior: "smooth",
                });
                setActiveArticleIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeArticleIndex
                  ? "bg-[#3742D1] w-4"
                  : "bg-[#D6E0FF]"
              }`}
              aria-label={`Go to article ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Add New Drawing Floating Button */}
      <button
        onClick={handleUploadDrawing}
        className="fixed bottom-24 right-6 bg-[#3742D1] text-white rounded-full p-4 shadow-lg hover:bg-[#2a35b0] transition-colors"
        aria-label="Add Drawing"
      >
        <MdAdd className="w-6 h-6" />
      </button>

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
          aria-label="Upload"
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
  );
}
