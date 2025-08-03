'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { articles } from '@/data/articles';
import { 
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Article as ArticleIcon,
  Psychology as PsychologyIcon,
  ChildFriendly as ChildFriendlyIcon,
  AccountCircle as AccountCircleIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

export default function PracticalGuide() {
  const [filter, setFilter] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredArticles = filter === "all" 
    ? articles 
    : articles.filter(article => 
        article.category.toLowerCase() === filter.toLowerCase() &&
        (article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case "psychology": return <PsychologyIcon className="text-[#3742D1]" />;
      case "development": return <ChildFriendlyIcon className="text-[#3742D1]" />;
      default: return <ArticleIcon className="text-[#3742D1]" />;
    }
  };

  return (
    <>
      <Head>
        <title>Ilyzlist - Practical Guide</title>
      </Head>

      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-1">
              <ArrowBackIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">
              Practical Guide
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowSearch(!showSearch)} 
              className="p-1"
              aria-label="Search"
            >
              <SearchIcon className="w-5 h-5 text-[#3742D1]" />
            </button>
            <Link
              href="/notifications"
              className="p-1"
              aria-label="Notifications"
            >
              <NotificationsIcon className="w-5 h-5 text-[#3742D1]" />
            </Link>
            <Link
              href="/settings"
              className="p-1"
              aria-label="Settings"
            >
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
                placeholder="Search articles..."
                className="block w-full pl-10 pr-3 py-3 bg-[#ECF1FF] rounded-xl font-league-spartan text-gray-800 placeholder-[#809CFF] focus:outline-none border-none focus:ring-2 focus:ring-[#3742D1]"
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Psychology', 'Development'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap font-league-spartan ${
                  filter === cat.toLowerCase() ? 'bg-[#3742D1] text-white' : 'bg-[#ECF1FF] text-[#3742D1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <Link 
                key={article.id} 
                href={`/articles/${article.id}`}
                className="block"
              >
                <div className="bg-[#ECF1FF] rounded-xl p-4 hover:bg-[#d9e1fa] transition-colors shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-xs">
                      {getCategoryIcon(article.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 font-league-spartan">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 font-league-spartan">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center">
                          <span className="text-xs bg-[#3742D1] text-white px-2 py-1 rounded-full font-league-spartan">
                            {article.category}
                          </span>
                          <span className="text-xs text-[#809CFF] ml-2 font-league-spartan">
                            {article.readTime}
                          </span>
                        </div>
                        <span className="text-xs text-[#3742D1] font-medium font-league-spartan">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ECF1FF] flex items-center justify-center">
                <ArticleIcon className="text-[#3742D1] w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-[#3742D1] mb-2 font-league-spartan">
                {searchQuery ? 'No matching articles' : 'No articles found'}
              </h3>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#3742D1] text-sm font-league-spartan"
                >
                  Clear search
                </button>
              ) : (
                <p className="text-gray-600 text-sm font-league-spartan">
                  No articles available
                </p>
              )}
            </div>
          )}
        </div>
      </div>

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

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}

