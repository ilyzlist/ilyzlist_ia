'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
  Home as HomeIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleUploadDrawing = () => {
    router.push('/drawings/upload');
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the drawing analysis work?",
      answer: "Our AI analyzes visual elements in your child's drawings to identify emotional expressions and developmental markers. It looks at factors like color usage, composition, and recurring themes."
    },
    {
      question: "Is my child's data secure?",
      answer: "Yes, we use end-to-end encryption and comply with COPPA regulations. All drawings and analysis results are stored securely and never shared without your consent."
    },
    {
      question: "Why are my analysis results different than I expected?",
      answer: "AI interpretations may vary from human perceptions. Our system identifies subtle patterns that might not be immediately obvious. You can always consult a child development specialist for a second opinion."
    },
    {
      question: "How often should I upload my child's drawings?",
      answer: "For best results, upload 1-2 drawings per month to track development over time. Frequent uploads help our AI detect patterns more accurately."
    },
    {
      question: "Can I delete drawings from the app?",
      answer: "Yes, you can permanently delete any drawing from your gallery. Go to the drawing's detail view and select 'Delete'."
    }
  ];

  return (
    <>
      <Head>
        <title>Ilyzlist - Help Center</title>
      </Head>

      <div className="help-center-container bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-20">
        {/* Header with Back Button */}
        <header className="flex items-center mb-8">
          <button 
            onClick={() => router.back()}
            className="mr-4 text-[#3742D1]"
          >
            <ArrowBackIcon />
          </button>
          <h1 className="text-2xl font-bold text-[#3742D1] font-league-spartan">
            Help Center
          </h1>
        </header>

        {/* Support Options */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#3742D1] font-league-spartan mb-4">
            Contact Support
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('mailto:support@ilyzlist.com')}
              className="w-full flex items-center p-4 bg-[#ECF1FF] rounded-lg hover:bg-[#d9e1fa] transition"
            >
              <EmailIcon className="text-[#3742D1] mr-3" />
              <span className="text-[#3742D1] font-medium font-league-spartan">
                Email Us
              </span>
            </button>

            {/* Live Chat (Coming Soon) - disabled */}
            <button
              disabled
              aria-disabled="true"
              title="Coming soon"
              className="w-full flex items-center p-4 bg-[#ECF1FF] rounded-lg opacity-60 cursor-not-allowed"
            >
              <ChatIcon className="text-[#3742D1] mr-3" />
              <div className="flex items-center">
                <span className="text-[#3742D1] font-medium font-league-spartan">
                  Live Chat
                </span>
                <span className="ml-2 text-xs uppercase tracking-wide bg-[#3742D1]/10 text-[#3742D1] px-2 py-0.5 rounded font-league-spartan">
                  Coming soon
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-lg font-semibold text-[#3742D1] font-league-spartan mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-[#ECF1FF] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-4 text-left"
                >
                  <span className="text-[#3742D1] font-medium font-league-spartan">
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <ExpandLessIcon className="text-[#3742D1]" />
                  ) : (
                    <ExpandMoreIcon className="text-[#3742D1]" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="p-4 pt-0 text-[#3742D1] font-league-spartan">
                    <p className="text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 flex justify-around max-w-md mx-auto">
        <button
          onClick={() => router.push("/")}
          className="p-2"
          aria-label="Home"
        >
          <HomeIcon className="w-6 h-6 text-[#3742D1]" />
        </button>
        <button
          onClick={handleUploadDrawing}
          className="p-2"
          aria-label="Upload Drawing"
        >
          <UploadIcon className="w-6 h-6 text-[#3742D1]" />
        </button>
        <button
          onClick={() => router.push("/account")}
          className="p-2"
          aria-label="Account"
        >
          <SettingsIcon className="w-6 h-6 text-[#3742D1]" />
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
        }

        .font-league-spartan {
          font-family: "League Spartan", sans-serif;
        }
      `}</style>
    </>
  );
}
