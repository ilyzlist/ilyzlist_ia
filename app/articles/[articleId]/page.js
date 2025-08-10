'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdSearch, MdNotifications, MdSettings } from 'react-icons/md';

// If you already import your articles from a data file, keep that import.
// Here we assume you pass/find the article by ID like before.

function normalizeImagePath(src) {
  if (!src) return '/images/article-placeholder.jpg';
  // allow absolute and /public paths; otherwise prefix with /images/
  if (src.startsWith('http') || src.startsWith('/')) return src;
  return `/images/${src}`;
}

export default function ArticleDetailPage({ params }) {
  const router = useRouter();
  const id = Number(params.articleId);

  // ⬇️ Replace this with however you fetch the article today
  // (from local array, CMS, etc.). Keep object shape: { title, category, readTime, image, content... }
  const article = useMemo(() => {
    // example lookup you already had:
    // return ARTICLES.find(a => a.id === id);
    return null;
  }, [id]);

  if (!article) {
    return (
      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6">
        <header className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-1">
            <MdArrowBack className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1]">Article</h1>
        </header>
        <p className="text-gray-600">Article not found.</p>
      </div>
    );
  }

  const imgSrc = normalizeImagePath(article.image);

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-20">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
          <MdArrowBack className="text-[#3742D1] text-xl" />
        </button>
        <h1 className="text-lg font-bold text-[#3742D1]">{article.category || 'Article'}</h1>
        <div className="flex gap-4">
          <Link href="/search" className="p-2" aria-label="Search">
            <MdSearch className="text-[#3742D1] text-xl" />
          </Link>
          <Link href="/notifications" className="p-2" aria-label="Notifications">
            <MdNotifications className="text-[#3742D1] text-xl" />
          </Link>
          <Link href="/settings" className="p-2" aria-label="Settings">
            <MdSettings className="text-[#3742D1] text-xl" />
          </Link>
        </div>
      </header>

      {/* Title/meta */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-xs text-[#3742D1]">
          {article.category && (
            <span className="px-2 py-1 bg-[#ECF1FF] rounded-full">{article.category}</span>
          )}
          {article.readTime && <span>{article.readTime}</span>}
        </div>
        <h2 className="text-2xl font-extrabold mt-2">{article.title}</h2>
      </div>

      {/* HERO IMAGE — plain <img> with robust fallback */}
      <div className="w-full rounded-xl overflow-hidden bg-[#ECF1FF] aspect-[16/9] mb-6">
        <img
          src={imgSrc}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/article-placeholder.jpg';
          }}
          // If you want to avoid CLS you can add width/height attributes that match your aspect ratio
        />
      </div>

      {/* Content (keep your existing rich text) */}
      <article className="prose prose-sm max-w-none">
        {Array.isArray(article.paragraphs)
          ? article.paragraphs.map((p, i) => <p key={i}>{p}</p>)
          : <p>{article.content}</p>}
      </article>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <Link href="/" className="flex flex-col items-center text-white">
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/drawings/upload" className="flex flex-col items-center text-white">
          <span className="text-xs mt-1">Upload</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center text-white">
          <span className="text-xs mt-1">Account</span>
        </Link>
      </nav>
    </div>
  );
}
