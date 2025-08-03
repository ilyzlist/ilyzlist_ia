'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MdHome as HomeIcon,
  MdSettings as SettingsIcon,
  MdArticle as ArticleIcon,
  MdArrowBack as ArrowBackIcon,
  MdPsychology as PsychologyIcon,
  MdChildCare as ChildFriendlyIcon,
  MdUpload as UploadIcon,
  MdAccountCircle as AccountCircleIcon,
  MdNotifications as NotificationsIcon,
  MdSearch as SearchIcon,
  MdImage as ImageIcon
} from 'react-icons/md';

export default function ArticleLayout({ article }) {
  const router = useRouter();

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case "psychology": return <PsychologyIcon className="text-[#3742D1]" />;
      case "development": return <ChildFriendlyIcon className="text-[#3742D1]" />;
      default: return <ArticleIcon className="text-[#3742D1]" />;
    }
  };

  const ArticleImage = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false);
    
    if (imageError || !src) {
      return (
        <div className="aspect-video bg-[#ECF1FF] rounded-xl flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-[#3742D1]" />
        </div>
      );
    }

    return (
      <div className="w-full aspect-video bg-[#ECF1FF] rounded-xl overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    );
  };

  if (!article) {
    return (
      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
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
        
        <div className="text-center py-10">
          <div className="bg-[#ECF1FF] p-6 rounded-full mb-6 mx-auto w-fit">
            <ArticleIcon className="w-12 h-12 text-[#3742D1]" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-4 font-league-spartan">Article Not Available</h2>
          <p className="text-black mb-8 font-league-spartan">We couldn't find the article you requested.</p>
          <div className="flex justify-center gap-4">
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
              Browse All Articles
            </Link>
          </div>
        </div>
        
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
            onClick={() => router.push("/drawings/gallery")}
            className="p-2 flex flex-col items-center"
            aria-label="Drawings"
          >
            <UploadIcon className="w-6 h-6 text-white" />
            <span className="text-white text-xs mt-1 font-league-spartan">Drawings</span>
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
    );
  }

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-[#ECF1FF] rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
            {article.category}
          </h1>
        </div>
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

      <div className="space-y-6">
        <div className="bg-[#ECF1FF] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white p-2 rounded-lg shadow-xs">
              {getCategoryIcon(article.category)}
            </div>
            <div>
              <span className="text-xs bg-[#3742D1] text-white px-2 py-1 rounded-full font-league-spartan">
                {article.category}
              </span>
              <span className="text-xs text-black ml-2 font-league-spartan">
                {article.readTime} read
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-black font-league-spartan">
            {article.title}
          </h2>
        </div>

        <ArticleImage src={article.image} alt={article.title} />

        <div className="space-y-4">
          {article.content.map((section, index) => (
            <div key={index} className="article-section">
              {section.type === "heading" && (
                <h3 className="text-lg font-bold text-black mt-6 mb-3 font-league-spartan">
                  {section.text}
                </h3>
              )}
              {section.type === "paragraph" && (
                <p className="text-black font-league-spartan leading-relaxed">
                  {section.text}
                </p>
              )}
              {section.type === "list" && (
                <ul className="list-disc pl-5 space-y-2 text-black font-league-spartan">
                  {section.items.map((item, i) => (
                    <li key={i} className="pl-2">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {article.tips && article.tips.length > 0 && (
          <div className="bg-[#ECF1FF] rounded-xl p-4 mt-6 shadow-sm">
            <h3 className="font-bold text-[#3742D1] mb-3 font-league-spartan">
              Key Takeaways
            </h3>
            <ul className="space-y-3">
              {article.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#3742D1] mt-1">•</span>
                  <span className="text-black font-league-spartan flex-1">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
          onClick={() => router.push("/drawings/gallery")}
          className="p-2 flex flex-col items-center"
          aria-label="Drawings"
        >
          <UploadIcon className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Drawings</span>
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