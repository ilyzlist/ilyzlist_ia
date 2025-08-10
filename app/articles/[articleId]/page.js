"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { articles } from "@/data/articles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import ArticleIcon from "@mui/icons-material/Article";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import UploadIcon from "@mui/icons-material/Upload";

function getCategoryIcon(category) {
  const c = (category || "").toLowerCase();
  if (c === "psychology") return <PsychologyIcon className="text-[#3742D1]" />;
  if (c === "development") return <ChildFriendlyIcon className="text-[#3742D1]" />;
  return <ArticleIcon className="text-[#3742D1]" />;
}

function resolveImageSrc(article) {
  // accept multiple potential keys (depending on how the data was created)
  const raw =
    article.image ||
    article.imageUrl ||
    article.image_url ||
    article.thumbnail ||
    article.cover ||
    "";

  const s = String(raw).trim();
  if (!s) return null;

  // already absolute or data URL
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;

  // ensure it points to /public
  // e.g. "images/article1.jpg" -> "/images/article1.jpg"
  return s.startsWith("/") ? s : `/${s}`;
}

export default function ArticlePage() {
  const router = useRouter();
  const { articleId } = useParams();

  // find article by id (be tolerant about numeric/string)
  const article = articles.find((a) => String(a.id) === String(articleId));

  if (!article) {
    return (
      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#ECF1FF] rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <div className="flex gap-4">
            <button className="p-2" aria-label="Search">
              <SearchIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <Link href="/notifications" className="p-2" aria-label="Notifications">
              <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
            </Link>
            <Link href="/settings" className="p-2" aria-label="Settings">
              <SettingsIcon className="w-5 h-5 text-[#3742D1]" />
            </Link>
          </div>
        </header>

        {/* Empty/Error state */}
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="bg-[#ECF1FF] p-6 rounded-full mb-6">
            <ArticleIcon className="w-12 h-12 text-[#3742D1]" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-4 font-league-spartan">Article Not Available</h2>
          <p className="text-black mb-8 max-w-md font-league-spartan">
            The article you requested doesn't exist or may have been removed.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-[#3742D1] text-white rounded-full font-league-spartan hover:bg-[#2a35b0] transition-colors"
            >
              Go Back
            </button>
            <Link
              href="/practical-guide"
              className="px-6 py-2 bg-[#3742D1] text-white rounded-full font-league-spartan hover:bg-[#2a35b0] transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </div>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
          <button onClick={() => router.push("/")} className="p-2 flex flex-col items-center" aria-label="Home">
            <HomeIcon className="w-6 h-6 text-white" />
            <span className="text-white text-xs mt-1 font-league-spartan">Home</span>
          </button>
          <button
            onClick={() => router.push("/drawings/gallery")}
            className="p-2 flex flex-col items-center"
            aria-label="Drawings"
          >
            <UploadIcon className="w-6 h-6 text-white" />
            <span className="text-white text-xs mt-1 font-league-spartan">Drawings</span>
          </button>
          <button onClick={() => router.push("/account")} className="p-2 flex flex-col items-center" aria-label="Account">
            <AccountCircleIcon className="w-6 h-6 text-white" />
            <span className="text-white text-xs mt-1 font-league-spartan">Account</span>
          </button>
        </nav>
      </div>
    );
  }

  const imageSrc = resolveImageSrc(article);

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#ECF1FF] rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
        </button>
        <div className="flex gap-4">
          <button className="p-2" aria-label="Search">
            <SearchIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <Link href="/notifications" className="p-2" aria-label="Notifications">
            <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
          <Link href="/settings" className="p-2" aria-label="Settings">
            <SettingsIcon className="w-5 h-5 text-[#3742D1]" />
          </Link>
        </div>
      </header>

      {/* Article header */}
      <div className="bg-[#ECF1FF] rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white p-2 rounded-lg shadow-xs">{getCategoryIcon(article.category)}</div>
          <div>
            <span className="text-xs bg-[#3742D1] text-white px-2 py-1 rounded-full font-league-spartan">
              {article.category}
            </span>
            <span className="text-xs text-black ml-2 font-league-spartan">{article.readTime || ""}</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-black font-league-spartan">{article.title}</h2>
      </div>

      {/* Image (with robust fallback) */}
      <div className="aspect-video bg-[#ECF1FF] rounded-xl overflow-hidden shadow-sm">
        <img
          src={imageSrc || "/images/article-placeholder.jpg"}
          alt={article.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/article-placeholder.jpg";
          }}
        />
      </div>

      {/* Body */}
      <div className="space-y-4 mt-6">
        {(article.content || []).map((section, index) => {
          if (section.type === "heading")
            return (
              <h3 key={index} className="text-lg font-bold text-black mt-6 mb-3 font-league-spartan">
                {section.text}
              </h3>
            );
        if (section.type === "list")
            return (
              <ul key={index} className="list-disc pl-5 space-y-2 text-black font-league-spartan">
                {(section.items || []).map((item, i) => (
                  <li key={i} className="pl-2">
                    {item}
                  </li>
                ))}
              </ul>
            );
          return (
            <p key={index} className="text-black font-league-spartan leading-relaxed">
              {section.text}
            </p>
          );
        })}
      </div>

      {/* Tips */}
      {Array.isArray(article.tips) && article.tips.length > 0 && (
        <div className="bg-[#ECF1FF] rounded-xl p-4 mt-6 shadow-sm">
          <h3 className="font-bold text-[#3742D1] mb-3 font-league-spartan">Key Takeaways</h3>
          <ul className="space-y-3">
            {article.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-[#3742D1] mt-1">•</span>
                <span className="text-black font-league-spartan flex-1">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button onClick={() => router.push("/")} className="p-2 flex flex-col items-center" aria-label="Home">
          <HomeIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Home</span>
        </button>
        <button
          onClick={() => router.push("/drawings/gallery")}
          className="p-2 flex flex-col items-center"
          aria-label="Drawings"
        >
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Drawings</span>
        </button>
        <button onClick={() => router.push("/account")} className="p-2 flex flex-col items-center" aria-label="Account">
          <AccountCircleIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Account</span>
        </button>
      </nav>

      <style jsx global>{`
        @font-face {
          font-family: "League Spartan";
          src: url("/fonts/league-spartan.woff2") format("woff2"),
            url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
        }
        .font-league-spartan {
          font-family: "League Spartan", sans-serif;
        }
      `}</style>
    </div>
  );
}
