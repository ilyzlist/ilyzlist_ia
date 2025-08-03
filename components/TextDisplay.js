// components/TranslatedText.js
'use client';

export default function TextDisplay({ text, className = '' }) {
  return <span className={className}>{text}</span>;
}
