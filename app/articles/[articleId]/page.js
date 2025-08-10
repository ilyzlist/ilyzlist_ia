'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdSearch, MdNotifications, MdSettings } from 'react-icons/md';

const ARTICLES = [
  { id: 1, category: 'Child Development', readTime: '5 min read', title: "Understanding Your Child's Drawing Stages", image: '/images/article1.jpg' },
  { id: 2, category: 'Development',        readTime: '7 min read', title: 'Developmental Stages of Drawing',        image: '/images/article2.jpg' },
  { id: 3, category: 'Psychology',         readTime: '6 min read', title: "Decoding Colors in Children\'s Art",     image: '/images/article3.jpg' },
  { id: 4, category: 'Development',        readTime: '8 min read', title: 'Encouraging Creative Expression',        image: '/images/article4.jpg' },
  { id: 5, category: 'Education',          readTime: '8 min read', title: 'Art-Based Learning Techniques',          image: '/images/article5.jpg' },
];

// ensure we always point inside /public/images and strip any stray spaces
function toPublicImage(src) {
  const clean = (src ?? '').trim();
  if (!clean) return '/images/article-placeholder.jpg';
  // remove domain if someone pasted a full URL
  const local = clean.replace(/^https?:\/\/[^/]+/i, '');
  if (local.startsWith('/images/')) return local;
  if (local.startsWith('images/')) return `/${local}`;
  // last segment + force /images
  return `/images/${local.split('/').pop()}`;
}

export default function ArticlePage({ params }) {
  const router = useRouter();
  const id = Number(params.articleId); // <-- match your folder name
  const article = useMemo(() => ARTICLES.find(a => a.id === id), [id]);

  if (!article) {
    return (
      <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
          <MdArrowBack className="text-[#3742D1] text-xl" />
        </button>
        <p className="mt-6 text-gray-700">Article not found.</p>
      </div>
    );
  }

  const computed = toPublicImage(article.image);
  const [src, setSrc] = useState(computed);

  useEffect(() => setSrc(computed), [computed]);

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-20">
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100" aria-label="Go back">
          <MdArrowBack className="text-[#3742D1] text-xl" />
        </button>
        <h1 className="text-lg font-bold text-[#3742D1]">{article.category || 'Article'}</h1>
        <div className="flex gap-4">
          <Link href="/search" className="p-2" aria-label="Search"><MdSearch className="text-[#3742D1] text-xl" /></Link>
          <Link href="/notifications" className="p-2" aria-label="Notifications"><MdNotifications className="text-[#3742D1] text-xl" /></Link>
          <Link href="/settings" className="p-2" aria-label="Settings"><MdSettings className="text-[#3742D1] text-xl" /></Link>
        </div>
      </header>

      <div className="bg-[#ECF1FF] rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-xs text-[#3742D1] mb-3">
          {article.category && <span className="px-2 py-1 bg-white/60 rounded-full">{article.category}</span>}
          {article.readTime && <span>{article.readTime}</span>}
        </div>
        <h2 className="text-xl font-bold text-gray-900">{article.title}</h2>
      </div>

      <div className="w-full bg-[#ECF1FF] rounded-xl overflow-hidden mb-6 flex items-center justify-center aspect-[16/9]">
        <img
          src={src}
          alt={article.title}
          width={1280}
          height={720}
          loading="eager"
          className="w-full h-full object-cover"
          onError={() => setSrc('/images/article-placeholder.jpg')}
        />
      </div>

      <article className="prose prose-sm max-w-none">
        <p>Article content goes here.</p>
      </article>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <Link href="/" className="flex flex-col items-center text-white"><span className="text-xs mt-1">Home</span></Link>
        <Link href="/drawings/upload" className="flex flex-col items-center text-white"><span className="text-xs mt-1">Upload</span></Link>
        <Link href="/account" className="flex flex-col items-center text-white"><span className="text-xs mt-1">Account</span></Link>
      </nav>
    </div>
  );
}
